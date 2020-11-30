const router = require("express").Router()
const jwt = require("jsonwebtoken")

const User = require("../models/User")
const { requireBearerToken, requireValidGoogleToken } = require("../middlewares/authMiddleware")

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
        repasInscription: []
    }).save()
}

// routes
router.post("/login/google", requireBearerToken, requireValidGoogleToken, async (req, res) => {
    // récupération des info du ticket google, la récupération du tocket Google
    // est géré dans les middlewares
    const ticket = res.locals.ticket
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
                        console.log("[POST /auth/login/google] Nouvelle utilisateur créé: " + newUser)
                        const token = createToken(newUser._id, jwtAccessTokenMaxAge)
                        res.status(201).json({ jwt: token })
                    })
                    .catch((error) => {
                        console.error("[POST /auth/login/google] " + error)
                        res.status(500).json({ erreur: "Erreur lors de la création de l'utilisateur"})
                    })
            }

        })
        .catch((error) => {
            console.error("[POST /auth/login/google] " + error)
            res.status(500).json({ erreur: "Erreur lors de la création de l'utilisateur"})
        })
})

module.exports = router;
