const router = require("express").Router()

const { requireBearerToken, requireValidFirebaseToken } = require("../middlewares/authMiddleware")
const Diet = require("../models/Diet")

// récupérer la liste des régimes
router.get("/", requireBearerToken, requireValidFirebaseToken, async (req, res) => {
    try {
        const diets = await Diet.find()
        const dietsData = diets.map(diet => {
            return diet.nom
        })

        res.status(200).json(dietsData)
    }
    catch (error)  {
        console.error(`[GET /regimesAlimentaires] ${error}`)
        res.status(500).json({ erreur: "Erreur lors de la récupération des régimes" })
    }
})

module.exports = router;
