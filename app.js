const express = require("express")
const mongoose = require("mongoose")

const mealRoutes = require("./routes/mealRoutes")
const usersRoutes = require("./routes/usersRoutes")
const dietsRoutes = require("./routes/dietRoutes")
const allergiesRoutes = require("./routes/allergyRoutes")


// sur le serveur de prod assigner une valeur à la variable d'environnement PROD
// afin de ne pas lire le fichier .env (qui n'est pas présent sur ce serveur)
// voir: https://www.npmjs.com/package/dotenv
if (!process.env.PROD)
    require("dotenv").config()

// création et paramétrisation de l'app express
const app = express()
app.use(express.json())

// connection à la bd avec mongoose
mongoose.connect(process.env.MONGODB_URI,{ useNewUrlParser: true,  useUnifiedTopology: true }, () => {
    console.log("connected to mongodb")
    // binding de l'app express sur un port
    app.listen(process.env.PORT, () => {
        console.log("listening for requests on port " + (process.env.PORT))
    })
})

// une route "test"
app.get("/", (req, res) => {
    res.send("Hello world !\nYou reached the API of Partag'Eat please use our app instead")
})

// routes d'authentification
app.use("/auth", authRoutes)

// routes liées aux repas
app.use("/repas", mealRoutes)

// routes liées aux utilisateurs
app.use("/utilisateurs", usersRoutes)

// routes liées aux régimes
app.use("/regimesAlimentaires", dietsRoutes)

// routes liées aux allergies et intolerances
app.use("/allergiesEtIntolerances", allergiesRoutes)

// not found error route
app.use( (req, res, next) => { res.status(404).json({ erreur: 'Nothing to see here...' }) });
