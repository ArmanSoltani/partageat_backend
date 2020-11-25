const OAuth2GoogleClient = require('google-auth-library').OAuth2Client
const jwt = require("jsonwebtoken")

const User = require("../models/User")

const googleClient = new OAuth2GoogleClient(process.env.CLIENT_ID)


// récupération du bearer token via le bearerHeader (clef: Authorization ou authorization)
const requireBearerToken = (req, res, next) => {
    const bearerHeader = req.headers.authorization
    if (!bearerHeader) {
        console.error("[authMiddleware/requireBearerToken] " + "Authorization header introuvable")
        res.status(401).json({ erreur: "Authorization header introuvable" })
        return
    }
    const bearer = bearerHeader.split(' ');
    if (bearer.length !== 2 || bearer[1] === "") {
        console.error("[authMiddleware/requireBearerToken] " + "Authorization header introuvable")
        res.status(401).json({ erreur: "Format du Bearer Token invalide" })
        return
    }
    // Si le bearer token est trouvé on le place dans l'objet locals de la réponse
    // et on continue de traiter la requête
    res.locals.bearerToken = bearer[1]
    next()
}

// validation du token google et extraction du ticket
const requireValidGoogleToken = async (req, res, next) => {
    // récupération du bearer token (= le token Google) extrait par le middleware requireBearerToken
    const googleToken = res.locals.bearerToken

    // validation du token et récupération des info dans le ticket
    let ticket
    try {
        ticket = await googleClient.verifyIdToken({
            idToken: googleToken,
            audience: process.env.CLIENT_ID
        });
    }
    catch (error) {
        console.error("[authMiddleware/requireValidGoogleToken] " + error)
        res.status(401).json({ erreur: "Token Google invalide" })
        return
    }

    // Si le token Google est valid on le place dans l'objet locals de la réponse
    // et on continue de traiter la requête
    res.locals.ticket = ticket
    next()
}


// validation du token JWT de Partag'Eat
const requireValidAccessToken = (req, res, next) => {
    // récupération du bearer token extrait par le middleware requireBearerToken
    const token = res.locals.bearerToken

    // vérification du token
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err)
            res.status(401).json({ erreur: "Token JWT invalide" })
        else {
            User.findById(decodedToken.id)
                .then((user) => {
                    // Si le token est valide on place l'objet User de l'utilisateur dans l'objet res.locals
                    res.locals.user = user
                    next()
                })
                .catch((error) => {
                    console.error("[authMiddleware/requireValidAccessToken] " + error)
                    res.status(500).json({ erreur: "Erreur lors du login"})
            })
        }
    })
}


module.exports = { requireBearerToken, requireValidGoogleToken, requireValidAccessToken }
