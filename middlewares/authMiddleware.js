
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

module.exports = { requireBearerToken }
