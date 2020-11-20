const mongoose = require("mongoose")
const Schema = mongoose.Schema


const allergySchema = new Schema({
    nom: String,
})

const Allergy = mongoose.model("allergy", allergySchema)
module.exports = Allergy
