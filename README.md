# NovaMarket — Site vitrine

Site vitrine e-commerce NovaMarket — « L’innovation au service de votre quotidien. » : électronique, électroménager, soin & bien-être. Pas de paiement en ligne : le client regroupe ses articles dans un panier et envoie une **demande de commande** sur WhatsApp ; NovaMarket confirme ensuite la disponibilité et le montant total.

## Fichiers

- `index.html` : page d'accueil (hero, catégories, sélection de produits, à propos, contact)
- `produits.html` + `produits.js` : catalogue complet — recherche, filtre par catégorie, tri (`produits.html?cat=bien-etre&q=...&tri=price-asc`)
- `categorie.html` + `categorie.js` : page d'une catégorie avec bannière, description et produits (`categorie.html?cat=bien-etre`)
- `produit.html` + `produit.js` : fiche produit — prix, promotion (si configurée), disponibilité, caractéristiques, quantité, « Ajouter au panier », commande directe sur WhatsApp, produits similaires (`produit.html?id=1`)
- `apropos.html` : page À propos (histoire, promesse, catégories proposées), liée depuis le menu et le pied de page
- `panier.html` + `panier.js` : panier multi-produits — quantités, retrait, total des articles, envoi d'une seule demande de commande sur WhatsApp
- `data/config.js` : **configuration de la boutique** — numéro WhatsApp (`WHATSAPP_NUMBER`), livraison (`DELIVERY_INFO`), réseaux sociaux (`SOCIAL_LINKS`). Fichier public : n'y mettre aucune donnée interne (coûts, marges).
- `data/products.js` : **données centralisées** — catégories, produits
- `script.js` : code commun à toutes les pages (cartes produit, prix, emplacement photo, liens WhatsApp, réseaux sociaux, menu mobile, fil d’Ariane, bouton « Retour en haut », recherche) + affichage de l’accueil
- `style.css` : design responsive

Ordre de chargement des scripts dans chaque page : `data/config.js` → `data/products.js` → `script.js` → script de la page.

## Catégories

Définies une seule fois dans `CATEGORIES` (`data/products.js`) ; les cartes de l'accueil, les filtres, les pastilles et la recherche en sont générés. Chaque catégorie a un `id` utilisé dans les URL et dans le champ `category` des produits :

| id | Nom affiché |
|---|---|
| `electronique` | Électronique (aucun produit pour l'instant : « Produits bientôt disponibles ») |
| `electromenager` | Électroménager |
| `bien-etre` | Soin & bien-être (id conservé pour les liens déjà partagés) |

Le paramètre `cat` accepte l'id ou le nom, sans tenir compte des majuscules ni des accents (`?cat=bien-etre`, `?cat=Électroménager`).

Les liens des 3 catégories du menu et du pied de page sont écrits en dur dans les 4 pages HTML : les garder identiques aux noms de `CATEGORIES`.

**Catégories retirées** (Organisation, Cuisine, Maison, Accessoires) : listées dans `RETIRED_CATEGORIES`. Un produit dont `category` ne correspond à aucune catégorie de `CATEGORIES` est masqué partout (accueil, catalogue, recherche, fiche) mais ses données restent dans le fichier. Produits actuellement masqués : ids 2, 4, 7 (Organisation), 3, 5, 6 (ex-Cuisine), 9, 10 (ex-Accessoires). Pour en republier un, lui donner l'`id` d'une catégorie existante.

## Panier

- Bouton « Ajouter au panier » sur les cartes produit et la fiche (avec la quantité choisie) ; icône 🛒 avec compteur dans l'en-tête de toutes les pages.
- Le panier est enregistré **sur l'appareil du client** (`localStorage`, clé `novamarket-panier`) : uniquement l'`id` et la quantité de chaque article. Le nom, le **prix** et le **stock** sont toujours relus dans `data/products.js` : un ancien panier n'affiche jamais un prix périmé.
- Quantité limitée au stock (`stockQuantity`) s'il est renseigné ; sans stock chiffré, aucune limite et disponibilité à confirmer sur WhatsApp. Produits masqués, retirés ou épuisés : signalés dans le panier, exclus du total et du message, impossibles à commander.
- Produits sans prix (`price: null`) : « Prix sur demande », exclus du total ; le message demande le prix.
- Total des articles distinct des frais de livraison (« Frais de livraison à confirmer selon votre zone (payés séparément) », `DELIVERY_INFO.cartNote` dans `data/config.js`).
- Nom, ville / quartier et précisions de livraison : facultatifs, **jamais enregistrés**, utilisés uniquement pour le message.
- Le message WhatsApp est une **demande** de commande (jamais une confirmation de vente ou de paiement). Le panier n'est pas vidé après l'envoi (le site ne peut pas savoir si le message est parti) : bouton « Vider le panier ».
- Si `WHATSAPP_NUMBER` est vidé, le panier fonctionne mais le bouton d'envoi est désactivé (« WhatsApp bientôt disponible »).
- Le stock n'est **jamais** décrémenté automatiquement : le mettre à jour à la main dans `data/products.js` après chaque vente confirmée.
- Limites : panier propre à chaque appareil / navigateur (perdu en navigation privée ou si les données du site sont effacées) ; aucun serveur, aucune réservation de stock.

## Installation

1. Ouvrir ce dossier dans VS Code.
2. Ouvrir `index.html` avec Live Server ou simplement dans un navigateur.
3. Le numéro officiel est défini dans `data/config.js` (`WHATSAPP_NUMBER`, chiffres uniquement, indicatif pays compris) : c'est le seul endroit à modifier. **S'il est vidé, tous les boutons de commande WhatsApp sont désactivés** et affichent « WhatsApp bientôt disponible ». Les URL de `SOCIAL_LINKS` (Instagram, Facebook, TikTok) sont renseignées dans le même fichier ; un réseau laissé vide n'est pas affiché.

## Ajouter ou modifier un produit

Tout se passe dans `data/products.js` :

- copier un bloc produit existant ;
- lui donner un `id` unique (utilisé dans `produit.html?id=...`) ;
- `price` est un nombre en FCFA sans espaces (ex. `12000`), formaté automatiquement en « 12 000 FCFA » ;
- `image` : URL de la photo réelle ; laisser `""` pour afficher l’emplacement neutre « Photo à venir » ;
- `oldPrice` (optionnel, uniquement pour une promotion confirmée) : ancien prix → prix barré et badge de réduction ;
- `stock` (optionnel, uniquement si confirmé) : `"en-stock"`, `"stock-limite"` ou `"sur-commande"` ; sans ce champ, la fiche affiche « À confirmer sur WhatsApp » ;
- `stockQuantity` (optionnel, prioritaire sur `stock`) : nombre d'unités en stock. Supérieur à 0 → « En stock » et quantité commandable limitée à ce nombre ; `0` → « Épuisé », commande impossible. **Mise à jour manuelle** après chaque vente confirmée : le site ne décrémente jamais le stock tout seul (une demande WhatsApp n'est pas une vente). La fiche précise que la disponibilité est confirmée sur WhatsApp ;
- `category` doit correspondre à un `id` de `CATEGORIES` (ex. `"bien-etre"`) ;
- `price: null` si le prix n'est pas encore connu : « Prix sur demande » s'affiche et le message WhatsApp demande le prix ;
- `featuresNote` (optionnel) : phrase sous les caractéristiques pour signaler ce qui reste à confirmer.
- `gallery` (liste complète des photos `{ src, thumb, alt }` ; `[]` = image principale seule), `video` et `videoPoster` (`""` = pas d'onglet Vidéo) : alimentent la galerie de la fiche produit (miniatures, grande image, zoom, favori). Format détaillé en commentaire dans `data/products.js`.

Les filtres, le catalogue, la recherche et les fiches produit se mettent à jour automatiquement.

## À faire

- Ceinture chauffante (id 11) : remplacer la photo actuelle (`images/soin-bien-etre/ceinture chauffante/ceinture chauffante 1.jpg`, image trouvée sur internet) par des photos prises par NovaMarket, et compléter les caractéristiques confirmées (recharge, réglages, massage, accessoires). Stock : 10 unités au 24/10/2026, à mettre à jour à la main dans `stockQuantity`.
- Mini hachoir électrique (id 8) : confirmer le mode d'alimentation (secteur ou batterie) avant de l'indiquer.
- Lime électrique pour pieds (id 12) : stock de 10 unités au 24/10/2026, à mettre à jour à la main dans `stockQuantity`. Confirmer le mode d'alimentation, les réglages et les accessoires fournis avant de les ajouter aux caractéristiques.
- Rangement multifonction (id 7, masqué) : aucune photo.
- Relire les descriptions et caractéristiques des produits (textes génériques à adapter).
- Ajouter `oldPrice` / `stock` uniquement pour les promotions et disponibilités confirmées.
- Pas d’avis clients affichés : à ajouter uniquement quand de vrais avis existeront.

## Prochaine étape avec Claude dans VS Code

Demander à Claude de continuer le projet sans casser la structure actuelle.

Prompt conseillé (étape 1 réalisée : catalogue, page produit et données centralisées) :

> Analyse les fichiers index.html, style.css et script.js de NovaMarket. Il s'agit actuellement d'un site vitrine, pas d'un véritable e-commerce. Conserve l'identité visuelle, la palette, la structure responsive et les composants existants. Améliore le projet progressivement. Première étape : créer une vraie page catalogue avec filtres par catégories, une page produit dynamique, une navigation propre et des données produits centralisées. Ne supprime aucune fonctionnalité existante. Avant toute modification importante, explique les fichiers qui seront modifiés et pourquoi. Le site doit rester en français, utiliser le FCFA et privilégier la commande via WhatsApp.
