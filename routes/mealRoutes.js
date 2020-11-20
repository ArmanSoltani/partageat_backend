const router = require("express").Router()

const { requireBearerToken, requireValidAccessToken } = require("../middlewares/authMiddleware")
const { requireValidNewMealData } = require("../middlewares/mealMiddleware")
const Meal = require("../models/Meal")


// routes
router.post("/", requireBearerToken, requireValidAccessToken, requireValidNewMealData, (req, res) => {
    // utilisateur récupéré par le middleware requireValidAccessToken
    const user = res.locals.user

    // création du nouveau repas
    new Meal({
        idCuisinier: user._id,
        intitule: req.body.intitule,
        photoBase64: req.body.photoBase64,
        date: req.body.date,
        tarif: req.body.tarif,
        description: req.body.description,
        nbPersonnesMax: req.body.nbPersonnesMax,
        coordonneesLong: req.body.coordonneesLong,
        coordonneesLat: req.body.coordonneesLat,
        regimes: req.body.regimes,
        allergies: req.body.allergies,
        actif: true
    }).save()
        .then((newMeal) => {
            console.log("[POST /repas] Nouveau repas créé: " + newMeal)
            res.status(201).json({ id: newMeal._id })
        })
        .catch((error) => {
            console.error("[POST /repas] " + error)
            res.status(500).json({ erreur: "Erreur lors de la création du repas"})
        })
})

module.exports = router;
