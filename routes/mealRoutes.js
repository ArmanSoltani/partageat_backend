const router = require("express").Router()

const { requireBearerToken, requireValidAccessToken } = require("../middlewares/authMiddleware")
const { requireValidNewMealData, requireValidSearchMealData } = require("../middlewares/mealMiddleware")
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

// récupérer un repas via un id
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

// on utilise https://blog.mapbox.com/fast-geodesic-approximations-with-cheap-ruler-106f229ad016 afin de trouver une distance
// aproximative en km^2 entre 2 points sur une sphere. Présision de quelques dizaines de mêtres
const getDistanceHaversine = (lat1, lon1, lat2, lon2) => {
    const meridian = 20004.146
    const parallelAtEquator = 40074.275
    const delta_y = meridian * Math.abs(lat1 - lat2) / 180
    const delta_x = parallelAtEquator * Math.cos((lat1 + lat2) / 2) * Math.abs(lon1 - lon2) / 360
    return delta_y * delta_y + delta_x * delta_x
}

// récupérer une liste d'id + coordonnées de repas satisfaisants à un ou plusieurs critères
router.get("/", requireBearerToken, requireValidAccessToken, requireValidSearchMealData, async (req, res) => {
    let query = {
        idCuisinier: { $ne: res.locals.user._id }, // on exclut les repas de l'utilisateur
    }
    if (req.query.date)
        query.date = req.query.date
    if (req.query.prixMax)
        query.tarif = { $lte: req.query.prixMax } // on sélectionne uniquement les repas avec: tarif <= prixMax
    if (req.query.regimes)
        query.regimes = { $in : req.query.regimes } // tous les régimes spécifiés doivent matcher
    if (req.query.allergies)
        query.allergies = { $in : req.query.allergies } // toutes les allergies spécifiée doivent matcher

    try {
        const meals = await Meal.find(query, ["_id", "coordonneesLong", "coordonneesLat"])
        console.log(`[GET /repas] résultats pour la query: ${JSON.stringify(req.query)} \n ${meals}`)
        if (!meals || meals === [])
            res.status(200).json([])
        else {
            let resData = []
            // filtre selon la distance
            // il faudra penser à rajouter du bucketing afin d'améliorer les perfs
            const distanceMaxSquared = req.query.distanceMax * req.query.distanceMax
            meals.forEach((m) => {
                const dist = getDistanceHaversine(m.coordonneesLat, m.coordonneesLong, req.query.coordonneesLat, req.query.coordonneesLong)
                console.log(m.coordonneesLat, m.coordonneesLong, req.query.coordonneesLat, req.query.coordonneesLong)
                if (dist <= distanceMaxSquared)
                    resData.push(m)
            })

            res.status(200).json(resData)
        }
    }
    catch (error) {
        console.error("[GET /repas] " + error)
        res.status(500).json({ erreur: "Erreur lors de la recherche de repas"})
    }
})


module.exports = router;
