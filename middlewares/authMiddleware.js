const FirebaseAdminClient = require('firebase-admin');

const User = require("../models/User")

const firebase = FirebaseAdminClient.initializeApp({
    credential: FirebaseAdminClient.credential.applicationDefault(),
});

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
const requireValidFirebaseToken = async (req, res, next) => {
    // récupération du bearer token (= le token Google) extrait par le middleware requireBearerToken
    const firebaseIdToken = res.locals.bearerToken

    const createNewUser = (displayName, email, photoURL, firebaseID) => {
        return new User({
            displayName: displayName,
            email: email,
            photoURL: photoURL,
            firebaseID: firebaseID,
            repasInscription: []
        }).save()
    }

    const createUserIfNotInMongoThenNext = (firebaseUser) => {
        // recherche d'un utilisateur avec le même email ou le même googleID
        User.findOne().or([{ firebaseID: firebaseUser.uid }, { email: firebaseUser.email }])
            .then((user) => {
                if (!user) {
                    // Si l'utilisateur n'existe pas on le crée et on le place ensuite dans l'objet res.locals
                    createNewUser(user.displayName, user.email, user.photoURL, user.uid)
                        .then((newUser) => {
                            res.locals.user = user
                            console.log("L'utilisateur "+ newUser.email + " a bien été créé");
                            next()
                        })
                        .catch((error) => {
                            console.error("Erreur lors de la création de l'utilisateur :" + error)
                        })
                } else {
                    // Si l'utilisateur existe déjà on le place directement dans l'objet res.locals
                    res.locals.user = user
                    next()
                }
            })
            .catch((error) => {
                console.error("Erreur lors de la recherche de l'utilisateur : " + error)
            })
    }

    // validation du token et récupération des infos dans l'user
    firebase
        .auth()
        .verifyIdToken(firebaseIdToken)
        .then(async (decodedToken) => {
            const uid = decodedToken.uid;
            // Si le token Firebase est valide on le place dans l'objet locals de la réponse
            // et on continue de traiter la requête
            firebase.auth().getUser(uid)
                .then((user) => {
                    createUserIfNotInMongoThenNext(user);
                })
                .catch((error) => {
                    console.error("[authMiddleware/requireValidFirebaseToken] " + error)
                    res.status(401).json({ erreur: "L'utilisateur n'existe pas" })
                })
        })
        .catch((error) => {
            console.error("[authMiddleware/requireValidFirebaseToken] " + error)
            res.status(401).json({ erreur: "Token Firebase invalide" })
        });
}


module.exports = { requireBearerToken, requireValidFirebaseToken }
