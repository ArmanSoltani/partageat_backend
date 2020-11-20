const router = require("express").Router()
const OAuth2GoogleClient = require('google-auth-library').OAuth2Client
const jwt = require("jsonwebtoken")

const User = require("../models/User")


const googleClient = new OAuth2GoogleClient(process.env.CLIENT_ID)

// Configuration des tokens JWT
const jwtAccessTokenMaxAge = 60*60*24 * 364 // 1 jours
const createToken = (id, maxAge) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: maxAge})
}
// END Configuration des tokens JWT

const createNewUser = (nom, prenom, photoURL, googleID) => {
    return new User({
        nom: nom,
        prenom: prenom,
        photoURL: photoURL,
        googleID: googleID,
        repasInscription: [],
        repasHote: []
    }).save()
}

// récupération du bearer token via le bearerHeader (clef: Authorization ou authorization)
const getBearerToken = (bearerHeader) => {
    if (!bearerHeader) {
        throw "Authorization header introuvable"
    }
    const bearer = bearerHeader.split(' ');
    if (bearer.length !== 2 || bearer[1] === "") {
        throw "Format du Bearer Token invalide"
    }
    return bearer[1]
}

// routes
router.post("/login/google", async (req, res) => {
    // récupération du bearer token (= le token Google)
    let googleToken
    try {
        googleToken = getBearerToken(req.headers.authorization)
    }
    catch (error) {
        console.error("[/login/google] " + error)
        res.status(400).json({ erreur: error })
        return
    }

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

    // Creation du nouvelle utilisateur
    const googleUserInfo = ticket.getPayload();
    createNewUser(googleUserInfo.family_name, googleUserInfo.given_name, googleUserInfo.picture,googleUserInfo.sub)
        .then((newUser) => {
            console.log("[/login/google] Nouvelle utilisateur créé: " + newUser)
            const token = createToken(newUser._id, jwtAccessTokenMaxAge)
            res.status(201).json({ jwt: token })
        })
        .catch((error) => {
            console.error("[/login/google] " + error)
            res.status(500).json({ erreur: "Erreur lors de la création de l'utilisateur"})
        })
})

module.exports = router;
