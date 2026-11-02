# NovaMarket — guide pour Claude

Boutique en ligne sénégalaise (Mbour) : site statique en français, prix en FCFA, **commande par WhatsApp**
(aucun paiement en ligne, aucun serveur). Hébergé sur Vercel (`https://novamarket-plum.vercel.app`),
dépôt GitHub `ngagne-kadior/Novamarket`. Le README.md détaille l'usage côté propriétaire.

## Pile technique
- HTML + CSS + JavaScript « vanilla », sans framework, sans build, sans dépendance npm.
- Pour tester : servir le dossier (`python -m http.server 8000`) puis ouvrir `http://127.0.0.1:8000/`.
- Aucun test automatisé dans le dépôt : les vérifications se font dans un navigateur
  (Playwright + Chrome, scripts gardés hors du dépôt).

## Fichiers
| Fichier | Rôle |
|---|---|
| `data/config.js` | **Configuration centrale** : `WHATSAPP_NUMBER`, `DELIVERY_INFO`, `SOCIAL_LINKS`, `PAGE_LINKS`. Fichier public : aucune donnée interne (coûts, marges). |
| `data/products.js` | Données : `CATEGORIES`, `RETIRED_CATEGORIES`, `products` (format documenté en commentaire en tête du fichier). |
| `script.js` | Code commun : utilitaires, liens WhatsApp, cartes produit, stock, panier (localStorage), menu, recherche, accueil. |
| `index.html` | Accueil (ancres `#accueil`, `#categories`, `#produits`, `#inspiration`, `#apropos`, `#contact`). |
| `produits.html` + `produits.js` | Catalogue : filtre, recherche, tri, état dans l'URL (`?cat=&q=&tri=`). |
| `categorie.html` + `categorie.js` | Page catégorie (`?cat=bien-etre`). |
| `produit.html` + `produit.js` | Fiche produit (`?id=1`) : galerie, zoom, vidéo, favoris, quantité, commande. |
| `panier.html` + `panier.js` | Panier multi-produits et message WhatsApp récapitulatif. |
| `style.css` | Tous les styles (points de rupture 1240, 1100, 950, 900, 760, 430, 359 px). |
| `images/` | Médias par catégorie/produit ; voir `images/README.md` (originaux conservés + WebP `-600`/`-1200`). |

**Ordre de chargement obligatoire dans chaque page :**
`data/config.js` → `data/products.js` → `script.js` → script de la page.

## Catalogue actuel
- Catégories visibles : `electronique` (vide, message « Nos produits électroniques arrivent bientôt »),
  `electromenager`, `bien-etre` (affichée « Soin & bien-être »).
- Produits actifs : 1 Air Fryer numérique 6L (35 000), 8 Mini hachoir électrique (22 500),
  11 Ceinture chauffante menstruelle sans fil (8 000, `stockQuantity: 10`), 12 Lime électrique pour pieds (6 000, `stockQuantity: 10`).
- Produits 2–7, 9, 10 : **masqués** (catégorie retirée), données conservées pour une republication éventuelle.

## Règles métier (à respecter)
- **WhatsApp** : un seul numéro, `WHATSAPP_NUMBER` dans `data/config.js` (`221771920076`). Ne jamais le recopier ailleurs ;
  tous les liens passent par `whatsappUrl()` / `whatsappLink()` dans `script.js`. Numéro vide ⇒ boutons désactivés (`WHATSAPP_READY`).
- Les messages sont des **demandes de commande**, jamais une vente ni un paiement confirmés.
- **Livraison** : distincte du total des articles, « frais à confirmer selon votre zone » (`DELIVERY_INFO`). Ne pas inventer de tarif ni de délai.
- **Stock** : `stockQuantity` (saisi à la main) plafonne la quantité ; `0` = « Épuisé », non commandable.
  Sans stock chiffré : aucune limite, « À confirmer sur WhatsApp ». Le site ne décrémente **jamais** le stock.
- **Panier** : localStorage `novamarket-panier`, seulement `{id, qty}` ; nom, prix et stock toujours relus dans `products.js`.
  Produits masqués/épuisés exclus du total et du message. Le panier n'est pas vidé après ouverture de WhatsApp.
  Nom/quartier/précisions jamais enregistrés.
- `price: null` ⇒ « Prix sur demande ». `oldPrice`, `stock`, `tag` : uniquement si l'information est confirmée.
- Pied de page : un lien social ou une page (Livraison, FAQ) vide dans la configuration n'est pas affiché.

## Conventions
- Tout le texte visible en français ; prix formatés par `formatPrice()` (« 35 000 FCFA »).
- Échapper tout contenu injecté en HTML avec `escapeHTML()`.
- Accessibilité soignée (aria-label, focus clavier, `prefers-reduced-motion`) : la préserver.
- Commentaires en français, style concis, comme le code existant.
- Pas de données fictives : ne pas inventer de caractéristiques, avis, promotions, stocks, URLs ou comptes sociaux.

## Règles de travail du propriétaire
- Travailler sur la branche `refonte-identite` (`main` = version en ligne via Vercel ; fusion par pull request).
- **Aucun commit, push ni déploiement sans autorisation explicite.**
- **Jamais `git add .`, `git add -A` ou `git add -u`** : ajouter les fichiers un par un.
- **Ne supprimer aucun média** ; sauvegarder les fichiers avant modification
  (sauvegardes dans `C:\Users\KADIOR\Desktop\novamarket-sauvegardes\`).
- Ne pas changer les prix ni les caractéristiques produit ; ne pas modifier le design sans raison.
- Présenter un rapport (fichiers modifiés, tests, problèmes restants) et attendre la validation.

## Points en suspens (au 02/11/2026)
- `images/accessoire/` (5 fichiers) est absent du disque mais intact dans Git : restauration à décider.
  Ces images ne servent qu'aux produits masqués 5 et 6.
- Fichiers volontairement **hors dépôt** (ne pas ajouter) : `friteuse air/4-*.webp`, `robot hachoir elect/1.webp` et `4.webp`,
  `lime-electrique-pieds/Lime 1.png`, `lime 2.png`, `lime 3.png`, `lime 4.png` (promesse avant/après), `video.jpeg` (autre modèle).
- Pull request `refonte-identite` → `main` à valider sur GitHub ; numéro WhatsApp à tester depuis un téléphone.
- À compléter quand c'est confirmé : caractéristiques de la ceinture, du hachoir et de la lime, comptes sociaux,
  pages Livraison et FAQ, produits Électronique.
