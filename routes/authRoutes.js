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

// routes
router.post("/login/google", async (req, res) => {
    const { devName, photoURL } = req.body

    createNewUser("dev", devName, photoURL, "")
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
