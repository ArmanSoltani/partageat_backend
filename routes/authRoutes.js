const router = require("express").Router()
const OAuth2GoogleClient = require('google-auth-library').OAuth2Client
const jwt = require("jsonwebtoken")

const User = require("../models/User")
const { requireBearerToken } = require("../middlewares/authMiddleware")


const googleClient = new OAuth2GoogleClient(process.env.CLIENT_ID)

// Configuration des tokens JWT
const jwtAccessTokenMaxAge = 60*60*24 // 1 jours
const createToken = (id, maxAge) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: maxAge})
}
// END Configuration des tokens JWT

const createNewUser = (nom, prenom, email, photoURL, googleID) => {
    return new User({
        nom: nom,
        prenom: prenom,
        email: email,
        photoURL: photoURL,
        googleID: googleID,
        repasInscription: [],
        repasHote: []
    }).save()
}

// routes
router.post("/login/google", requireBearerToken, async (req, res) => {
    // récupération du bearer token (= le token Google) extrait par le middleware requireBearerToken
    googleToken = res.locals.bearerToken

    // validation du token et récupération des info dans le ticket
    let ticket
    try {
        ticket = await googleClient.verifyIdToken({
            idToken: googleToken,
            audience: process.env.CLIENT_ID
        });
    }
    catch (error) {
        console.error("[/login/google] " + error)
        res.status(400).json({ erreur: "Token Google invalide" })
        return
    }

    // récupération des info du ticket google
    const googleUserInfo = ticket.getPayload();

    // recherche d'un utilisateur avec le même email ou le même googleID
    User.findOne().or([{ googleID: googleUserInfo.sub }, { email: googleUserInfo.email }])
        .then((user) => {
            if (user) {
                // Si l'utilisateur existe déjà alors on lui crée un token et roulez jeunesse ~
                console.log("[/login/google] Login de l'utilisateur: " + user)
                const token = createToken(user._id, jwtAccessTokenMaxAge)
                res.status(201).json({ jwt: token })
            }
            else {
                // Sinon -> creation du nouvelle utilisateur
                createNewUser(googleUserInfo.family_name, googleUserInfo.given_name, googleUserInfo.email, googleUserInfo.picture,googleUserInfo.sub)
                    .then((newUser) => {
                        console.log("[/login/google] Nouvelle utilisateur créé: " + newUser)
                        const token = createToken(newUser._id, jwtAccessTokenMaxAge)
                        res.status(201).json({ jwt: token })
                    })
                    .catch((error) => {
                        console.error("[/login/google] " + error)
                        res.status(500).json({ erreur: "Erreur lors de la création de l'utilisateur"})
                    })
            }

        })
        .catch((error) => {
            console.error("[/login/google] " + error)
            res.status(500).json({ erreur: "Erreur lors de la création de l'utilisateur"})
        })
})

module.exports = router;
