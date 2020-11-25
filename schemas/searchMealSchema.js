module.exports = {
    "title": "rechercher repas",
    "description": "ensemble des propriétés permettant de faire une recherche de repas",
    "type": "object",
    "properties": {
        "date": {
            "type": "string",
            "format": "date-time",
            "description": "date à laquelle aura lieu le repas"
        },
        "prixMax": {
            "type": "integer",
            "minimum": 0,
            "description": "le prix maximal à payer par chaque participant du repas"
        },
        "coordonneesLong": {
            "type": "number",
            "minimum": -90,
            "maximum": 90,
            "description": "Longitude de la position actuelle de l'utilisateur"
        },
        "coordonneesLat": {
            "type": "number",
            "minimum": -90,
            "maximum": 90,
            "description": "Latitude de la position actuelle de l'utilisateur"
        },
        "distanceMax": {
            "type": "integer",
            "minimum": 0,
            "description": "La distance maximale en kilomètres du repas par rapport à la position actuelle de l'utilisateur"
        },
        "regimes": {
            "type": "array",
            "items": {
                "type": "string"
            },
            "description": "La liste des régimes que doivent prendre en compte les repas"
        },
        "allergies": {
            "type": "array",
            "items": {
                "type": "string"
            },
            "description": "La liste des allergies que doivent prendre en compte les repas"
        }
    },
    "required": ["coordonneesLong", "coordonneesLat", "distanceMax"]
}