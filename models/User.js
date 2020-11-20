const mongoose = require("mongoose")
const Schema = mongoose.Schema


const userSchema = new Schema({
    nom: String,
    prenom: String,
    photoURL: String,
    googleID: String,
    email: String,
    repasInscription: [String],
    repasHote: [String]
})

const User = mongoose.model("user", userSchema)
module.exports = User

