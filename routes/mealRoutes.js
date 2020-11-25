const router = require("express").Router()

const { requireBearerToken, requireValidAccessToken } = require("../middlewares/authMiddleware")
const { requireValidNewMealData } = require("../middlewares/mealMiddleware")
const Meal = require("../models/Meal")
const User = require("../models/User")


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

router.get("/:id", requireBearerToken, requireValidAccessToken, async (req, res) => {
    const mealId = req.params.id

    try {
        const meal = await Meal.findById(mealId)
        if (meal) {
            // On test si le repas est toujours actif
            if (!meal.actif) {
                console.error(`[repas/:id] Le repas ${mealId} n'est plus actif`)
                res.status(400).json({ erreur: "Le repas n'est plus actif" })
            }
            else {
                const cook = await User.findById(meal.idCuisinier)
                if (cook) {
                    // Si on arrive ici le repas est valide -> on peut envoyer le résultat
                    const mealData = {
                        id: meal._id,
                        photoBase64: meal.photoBase64,
                        date: meal.date,
                        tarif: meal.tarif,
                        description: meal.description,
                        nbPersonnesMax: meal.nbPersonnesMax,
                        coordonneesLong: meal.coordonneesLong,
                        coordonneesLat: meal.coordonneesLat,
                        regimes: meal.regimes,
                        allergies: meal.allergies,
                        cuisinier: {
                            id: cook._id,
                            photoURL: cook.photoURL,
                            email: cook.email,
                            nom: cook.com,
                            prenom: cook.prenom
                        }
                    }

                    res.status(200).json(mealData)

                } else {
                    console.error(`[repas/:id] Le cuisinier ${meal.idCuisinier} du repas ${mealId} n'existe pas`)
                    res.status(404).json({erreur: "Le repas est invalide"})
                }
            }
        }
        else {
            console.error(`[repas/:id] Le repas ${mealId} n'existe pas`)
            res.status(404).json({ erreur: "Le repas n'existe pas" })
        }
    }
    catch (error) {
        console.error("[repas/:id] " + error)
        res.status(500).json({ erreur: "Erreur lors de la récupération des informations du repas"})
    }
})



module.exports = router;
