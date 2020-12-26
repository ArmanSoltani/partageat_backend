const mongoose = require("mongoose")
const Schema = mongoose.Schema


const userSchema = new Schema({
    displayName: String,
    photoURL: String,
    firebaseID: String,
    email: String,
    repasInscription: [String]
})

const User = mongoose.model("user", userSchema)
module.exports = User

