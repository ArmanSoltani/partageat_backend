const mongoose = require("mongoose")
const Schema = mongoose.Schema

const mealSchema = new Schema({
    idCuisinier: String,
    intitule: String,
    photoBase64: String,
    date: String,
    tarif: Number,
    description: String,
    nbPersonnesMax: Number,
    coordonneesLong: Number,
    coordonneesLat: Number,
    regimes: [String],
    allergies: [String],
    actif: Boolean
})

const Meal = mongoose.model("meal", mealSchema)
module.exports = Meal
