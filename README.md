# NovaMarket — Site vitrine

Site vitrine e-commerce pour une boutique spécialisée dans les accessoires, équipements maison et cuisine. Pas de panier ni de paiement en ligne : les commandes se font via WhatsApp.

## Fichiers

- `index.html` : page d'accueil (hero, catégories, sélection de produits, à propos, contact)
- `produits.html` + `produits.js` : catalogue complet — recherche, filtre par catégorie, tri (`produits.html?cat=Cuisine&q=...&tri=prix-asc`)
- `categorie.html` + `categorie.js` : page d'une catégorie avec bannière, description et produits (`categorie.html?cat=Cuisine`)
- `produit.html` + `produit.js` : fiche produit — prix, promotion (si configurée), disponibilité, caractéristiques, quantité, commande WhatsApp, produits similaires (`produit.html?id=1`)
- `data/products.js` : **données centralisées** — configuration (WHATSAPP_NUMBER, SOCIAL_LINKS), catégories, produits
- `script.js` : code commun à toutes les pages (cartes produit, prix, emplacement photo, liens WhatsApp, réseaux sociaux, menu mobile, fil d’Ariane, bouton « Retour en haut », recherche) + affichage de l’accueil
- `style.css` : design responsive

Ordre de chargement des scripts dans chaque page : `data/products.js` → `script.js` → script de la page.

Le paramètre `cat` ne tient compte ni des majuscules ni des accents : `?cat=electromenager` fonctionne.

## Installation

1. Ouvrir ce dossier dans VS Code.
2. Ouvrir `index.html` avec Live Server ou simplement dans un navigateur.
3. Dans `data/products.js`, section « CONFIGURATION » : remplacer `221770000000` dans `WHATSAPP_NUMBER` par le vrai numéro, et renseigner les URL de `SOCIAL_LINKS` (Instagram, Facebook, TikTok). Un réseau laissé vide s’affiche comme texte non cliquable.

## Ajouter ou modifier un produit

Tout se passe dans `data/products.js` :

- copier un bloc produit existant ;
- lui donner un `id` unique (utilisé dans `produit.html?id=...`) ;
- `price` est un nombre en FCFA sans espaces (ex. `12000`), formaté automatiquement en « 12 000 FCFA » ;
- `image` : URL de la photo réelle ; laisser `""` pour afficher l’emplacement neutre « Photo à venir » ;
- `oldPrice` (optionnel, uniquement pour une promotion confirmée) : ancien prix → prix barré et badge de réduction ;
- `stock` (optionnel, uniquement si confirmé) : `"en-stock"`, `"stock-limite"` ou `"sur-commande"` ; sans ce champ, la fiche affiche « À confirmer sur WhatsApp » ;
- `category` doit correspondre à un nom de `CATEGORIES`.
- `gallery` (liste complète des photos `{ src, thumb, alt }` ; `[]` = image principale seule), `video` et `videoPoster` (`""` = pas d'onglet Vidéo) : alimentent la galerie de la fiche produit (miniatures, grande image, zoom, favori). Format détaillé en commentaire dans `data/products.js`.

Les filtres, le catalogue, la recherche et les fiches produit se mettent à jour automatiquement.

## À faire

- Ajouter les vraies photos : 7 produits affichent « Photo à venir » (ids 1, 2, 4, 5, 6, 7, 8) ; les produits 3, 9 et 10 utilisent une photo d’illustration à remplacer.
- Relire les descriptions et caractéristiques des produits (textes génériques à adapter).
- Ajouter `oldPrice` / `stock` uniquement pour les promotions et disponibilités confirmées.
- Pas d’avis clients affichés : à ajouter uniquement quand de vrais avis existeront.
- Créer les pages Livraison et FAQ (affichées « bientôt disponibles » dans le pied de page) et renseigner `SOCIAL_LINKS`.

## Prochaine étape avec Claude dans VS Code

Demander à Claude de continuer le projet sans casser la structure actuelle.

Prompt conseillé (étape 1 réalisée : catalogue, page produit et données centralisées) :

> Analyse les fichiers index.html, style.css et script.js de NovaMarket. Il s'agit actuellement d'un site vitrine, pas d'un véritable e-commerce. Conserve l'identité visuelle, la palette, la structure responsive et les composants existants. Améliore le projet progressivement. Première étape : créer une vraie page catalogue avec filtres par catégories, une page produit dynamique, une navigation propre et des données produits centralisées. Ne supprime aucune fonctionnalité existante. Avant toute modification importante, explique les fichiers qui seront modifiés et pourquoi. Le site doit rester en français, utiliser le FCFA et privilégier la commande via WhatsApp.
