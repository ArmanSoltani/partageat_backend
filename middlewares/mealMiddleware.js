const AJV = require("ajv")

const newMealSchema = require("../schemas/newMealSchema")

// ajv (another json validator) valide les données en se basant sur un schéma json https://github.com/ajv-validator/ajv
// les valeurs par défaut sont ajoutées automatiquement
const ajv = AJV({ allErrors: true, removeAdditional : 'all', useDefaults: true})
ajv.addSchema(newMealSchema, "newMeal")


// valide les informations permettant d'ajouter un repas à la bd vis à vis du schéma json schemas/newMealSchema
const requireValidNewMealData = (req, res, next) => {
    const valid = ajv.validate("newMeal", req.body)
    if (!valid) {
        const errors = ajv.errors.map((error) => { return error.dataPath + " " + error.message; })
        console.error("[mealMiddleware/requireValidMealPostData] " + "Erreur dans le corps de la requête :")
        console.error(errors)
        res.status(400).json({ erreurs: errors })
    }
    else
        next()
}


module.exports = { requireValidNewMealData }
