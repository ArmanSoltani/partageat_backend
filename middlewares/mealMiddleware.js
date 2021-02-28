const AJV = require("ajv")

const newMealSchema = require("../schemas/newMealSchema")
const searchMealSchema = require("../schemas/searchMealSchema")

// ajv (another json validator) valide les données en se basant sur un schéma json https://github.com/ajv-validator/ajv
// les valeurs par défaut sont ajoutées automatiquement, toutes valeurs non spécifiées dans le schéma sont supprimées
const ajv = AJV({ allErrors: true, removeAdditional : 'all', useDefaults: true})
ajv.addSchema(newMealSchema, "newMeal")
ajv.addSchema(searchMealSchema, "searchMeal")


// valide les informations permettant d'ajouter un repas à la bd vis à vis du schéma json schemas/newMealSchema
const requireValidNewMealData = (req, res, next) => {
    const valid = ajv.validate("newMeal", req.body)
    if (!valid) {
        const errors = ajv.errors.map((error) => { return error.dataPath + " " + error.message; })
        console.error("[mealMiddleware/requireValidMealPostData] " + "Erreur dans le corps de la requête :")
        console.error(errors)
        res.status(400).json({ erreurs: errors })
    }
    else {
        // contruction d'un objet Date à partir du timestamp
        req.body.date = new Date(req.body.timestamp * 1000)
        next()
    }
}

// valide les informations permettant de rechercher des repas
const requireValidSearchMealData = (req, res, next) => {
    console.log(req.query.date)

    // les paramètres get sont toujours des string, il faut donc convertir les nombres au préalable
    if (req.query.prixMax)
        req.query.prixMax = +req.query.prixMax
    if (req.query.coordonneesLong)
        req.query.coordonneesLong = +req.query.coordonneesLong
    if (req.query.coordonneesLat)
        req.query.coordonneesLat = +req.query.coordonneesLat
    if (req.query.distanceMax)
        req.query.distanceMax = +req.query.distanceMax
    if (req.query.timestamp)
        req.query.timestamp = +req.query.timestamp

    const valid = ajv.validate("searchMeal", req.query)
    if (!valid) {
        const errors = ajv.errors.map((error) => { return error.dataPath + " " + error.message; })
        console.error("[mealMiddleware/requireValidSearchMealData] " + "Erreur dans les paramètres de la requête :")
        console.error(errors)
        res.status(400).json({ erreurs: errors })
    }
    else {
        if (req.query.timestamp) {
            // contruction d'un objet Date à partir du timestamp
            req.query.date = new Date(req.query.timestamp * 1000)
        }
        next()
    }
}


module.exports = { requireValidNewMealData, requireValidSearchMealData }
