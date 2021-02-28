![](logo_partageat.png)

# Partag'Eat Backend

**Préparons l’après-crise, avec plus de social et de partage.**  
Partag’Eat est une application permettant de mettre en relation des cuisiniers amateurs et des amateurs de cuisine maison.

L’application permet de proposer un repas, en y associant un nombre de personnes maximum, un type de cuisine, un tarif et une géolocalisation ainsi
que de rechercher les repas proches de soi et de s'y inscrire. 

Ce repo contient les codes du backend d'un démonstrateur de Partag'Eat. 

L'application android de ce démonstrateur de Partag'Eat a été développée par Lucas RICHARD avec Flutter.

## Stack technique

* Le backend est développé avec Express Node.js et expose une API REST. Le code est déployé sur un serveur 
Heroku.

* La base de données est MongoDB hostée sur AWS.

* L'authentification est gérée par Firebase Authentication.

## Points d'amélioration

* Les images sont pour l'instant enregistrées en base 64 dans MongoDB, cette façon de faire ne passe pas bien à l'échelle, 
il faudrait mieux mettre en place un serveur de fichiers statiques.

* La recherche des repas proches de l'utilisateur se fait naïvement en comparant la distance de l'utilisateur à tous les 
  repas dans la bd (la distance est approximée en utilisant une [formule de "fast geodesix approximation"](https://blog.mapbox.com/fast-geodesic-approximations-with-cheap-ruler-106f229ad016)). 
  Pour passer à l'échelle il serait possible de mettre un place un système de type bucketing et/ou caching afin 
  de réduire le coût de cette recherche.
  
* La liste des régimes et allergies est rentrée "à la main" dans la bd. Il serait intéressant de permettre aux utilisateurs de pouvoir
en ajouter de nouveaux.