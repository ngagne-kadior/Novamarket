# Dossier images

Emplacement prévu pour les vraies images de NovaMarket.

| Fichier / dossier | Usage | Format conseillé |
|---|---|---|
| `favicon.svg` | Icône de l'onglet du navigateur (logo « N ») | déjà présent |
| `og-image.jpg` | Aperçu des liens partagés (WhatsApp, Facebook…) — **à ajouter** | 1200 × 630 px, JPG < 300 Ko |
| `<catégorie>/<produit>/…` | Photos de chaque produit, rangées par catégorie (ex. `electromenager/friteuse air/1.png`) | 1200 px de large, JPG < 200 Ko (+ version `-600` pour les miniatures) |
| `categories/<nom>.jpg` | Photo de la carte catégorie sur l'accueil (ex. `categories/organisation.jpg`) | 600 × 750 px, JPG |
| Bannière de catégorie | Image du haut de `categorie.html` (champ `image` de `CATEGORIES`) | 1600 × 1000 px, JPG < 300 Ko |

Chaque produit de `data/products.js` accepte deux sources d'image :

```js
// 1. URL externe (prioritaire) : adresse directe du FICHIER image (http/https)
imageUrl: "https://exemple.com/photos/air-fryer.jpg",
// 2. photo locale (utilisée si imageUrl est vide ou ne se charge pas)
image: "images/accessoire/6-600.jpg",
// optionnel, pour charger une taille adaptée à l'écran :
srcset: "images/accessoire/6-600.jpg 600w, images/accessoire/6.jpg 1200w",
```

Si aucune des deux n'est disponible (vide, lien mort, fichier absent), le site affiche un emplacement neutre « Photo à venir ». Une image locale reste plus fiable qu'une URL externe, qui peut disparaître ou être bloquée par le site d'origine.

`og:image` doit être une **URL absolue** une fois le site en ligne (voir le commentaire TODO dans le `<head>` de chaque page).
