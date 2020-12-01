const router = require("express").Router()

const { requireBearerToken, requireValidAccessToken } = require("../middlewares/authMiddleware")
const Allergy = require("../models/Allergy")

// récupérer la liste des régimes
router.get("/", requireBearerToken, requireValidAccessToken, async (req, res) => {
    try {
        const allergies = await Allergy.find()
        const allergiesData = allergies.map(allergy => {
            return allergy.nom
        })

        res.status(200).json(allergiesData)
    }
    catch (error)  {
        console.error(`[GET /allergiesEtIntolerances] ${error}`)
        res.status(500).json({ erreur: "Erreur lors de la récupération des allergies et intolérances" })
    }
})

module.exports = router;
