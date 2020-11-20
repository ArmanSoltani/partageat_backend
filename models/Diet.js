const mongoose = require("mongoose")
const Schema = mongoose.Schema


const dietSchema = new Schema({
    nom: String,
})

const Diet = mongoose.model("diet", dietSchema)
module.exports = Diet
