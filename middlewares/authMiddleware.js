const OAuth2GoogleClient = require('google-auth-library').OAuth2Client

const googleClient = new OAuth2GoogleClient(process.env.CLIENT_ID)


// récupération du bearer token via le bearerHeader (clef: Authorization ou authorization)
const requireBearerToken = (req, res, next) => {
    const bearerHeader = req.headers.authorization
    if (!bearerHeader) {
        console.error("[authMiddleware/requireBearerToken] " + "Authorization header introuvable")
        res.status(400).json({ erreur: "Authorization header introuvable" })
        return
    }
    const bearer = bearerHeader.split(' ');
    if (bearer.length !== 2 || bearer[1] === "") {
        console.error("[authMiddleware/requireBearerToken] " + "Authorization header introuvable")
        res.status(400).json({ erreur: "Format du Bearer Token invalide" })
        return
    }
    // Si le bearer token est trouvé on le place dans l'objet locals de la réponse
    // et on continue de traiter la requête
    res.locals.bearerToken = bearer[1]
    next()
}

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
        res.status(400).json({ erreur: "Token Google invalide" })
        return
    }

    // Si le token Google est valid on le place dans l'objet locals de la réponse
    // et on continue de traiter la requête
    res.locals.ticket = ticket
    next()
}

module.exports = { requireBearerToken, requireValidGoogleToken }
