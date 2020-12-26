const router = require("express").Router()

const { requireBearerToken, requireValidFirebaseToken } = require("../middlewares/authMiddleware")
const User = require("../models/User")


router.get("/moi", requireBearerToken, requireValidFirebaseToken, (req, res) => {
    // utilisateur récupéré par le middleware requireValidFirebaseToken
    const user = res.locals.user

    res.status(200).json({
        id: user._id,
        photoURL: user.photoURL,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom
    })
})

module.exports = router;