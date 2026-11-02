// Données centralisées de NovaMarket (catégories et produits), partagées par toutes les pages.
// Ce fichier ne contient que des données : les fonctions d'affichage sont dans script.js.
// Numéro WhatsApp, livraison et réseaux sociaux : voir data/config.js (chargé avant ce fichier).

/* =====================================================================
   IMAGES
   ---------------------------------------------------------------------
   IMAGES PRODUIT — trois possibilités, dans cet ordre de priorité :
   1. imageUrl : URL EXTERNE directe vers le fichier image (http ou https).
                 Ex. imageUrl: "https://exemple.com/photos/air-fryer.jpg"
                 (+ optionnel imageUrlSrcset: "https://… 600w, https://… 1200w")
                 Attention : il faut l'adresse du FICHIER image (clic droit sur
                 l'image > « Copier l'adresse de l'image »), pas celle de la page.
   2. image    : chemin LOCAL dans le dossier du site.
                 Photos rangées par catégorie : images/<catégorie>/<produit>/…
                 Ex. image: "images/electromenager/friteuse air/3.png"
                 (+ optionnel srcset, si une version légère existe :
                  "images/accessoire/6-600.jpg 600w, images/accessoire/6.jpg 1200w")
   3. rien     : un emplacement neutre "Photo à venir" s'affiche.
   Si imageUrl ET image sont renseignés, imageUrl est utilisée ; si elle ne se
   charge pas (lien mort, blocage par le site d'origine), l'image locale prend
   le relais, puis l'emplacement neutre.
   Raccourci Unsplash : ...unsplashPhoto("identifiant") → remplit imageUrl ET imageUrlSrcset.

   IMAGES CATÉGORIE : champ image (URL ou chemin local), "" = emplacement neutre.
   ===================================================================== */

const unsplash = (id, width = 600, quality = 80) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=${quality}`;

const unsplashPhoto = (id, widths = [400, 600, 900, 1200]) => ({
  imageUrl: unsplash(id, 600),
  imageUrlSrcset: widths.map(width => `${unsplash(id, width)} ${width}w`).join(", ")
});

/* =====================================================================
   CATÉGORIES
   Les images de catégorie sont des photos d'AMBIANCE (bannières),
   pas des photos de produits.

   - id          : identifiant technique, utilisé dans les URL
                   (categorie.html?cat=bien-etre), les filtres et le champ
                   "category" des produits.
   - name        : nom affiché sur le site.
   - tagline     : sous-titre court (bandeau de la page catégorie).
   - description : texte principal de la page catégorie.
   - intro       : texte secondaire de la page catégorie (optionnel).
   - cardText    : texte de la carte sur l'accueil (optionnel, sinon tagline).
   - image       : bannière de la page catégorie (1600 px).
   - imagePosition : cadrage de la bannière (optionnel, CSS background-position,
                   ex. "center 15%" pour remonter l'image ; centré par défaut).
   - cardImage / cardImageAlt : photo de la carte sur l'accueil (600 × 750 px).
   - comingSoon  : message du bandeau tant que la catégorie est vide (optionnel).
   L'accueil, les filtres et la recherche sont générés depuis cette liste.
   Le menu et le pied de page des pages HTML reprennent ces noms : les garder identiques.
   Une catégorie sans produit visible affiche « Produits bientôt disponibles ».
   ===================================================================== */

const CATEGORIES = [
  {
    id: "electronique",
    name: "Électronique",
    tagline: "Bientôt disponible",
    description: "Des appareils électroniques pratiques pour vous simplifier la vie.",
    comingSoon: "Nos produits électroniques arrivent bientôt", // bandeau de la catégorie tant qu'elle est vide
    cardText: "Produits bientôt disponibles.",
    image: "", // AUCUNE photo pour l'instant : emplacement neutre
    cardImage: ""
  },
  {
    id: "electromenager",
    name: "Électroménager",
    tagline: "Des appareils utiles",
    description: "Des petits appareils efficaces qui vous font gagner du temps en cuisine, sans encombrer votre espace.",
    // Bannière de la page catégorie : photo NovaMarket de l'Air Fryer (WebP optimisé, original : friteuse air/3.png),
    // au lieu du blender Unsplash. Ancienne valeur : unsplash("1585515320310-259814833e62", 1600).
    image: "images/electromenager/friteuse air/3-1200.webp",
    imagePosition: "center 15%", // garde le haut de l'appareil visible sur grand écran
    // Carte de l'accueil : photo d'un produit réellement vendu (mini hachoir), au lieu du blender Unsplash.
    cardImage: "images/electromenager/robot hachoir elect/3.webp",
    cardImageAlt: "Mini hachoir électrique rempli de légumes hachés, entouré de légumes frais"
  },
  {
    id: "bien-etre", // id conservé : les liens déjà partagés (categorie.html?cat=bien-etre) restent valides
    name: "Soin & bien-être",
    tagline: "Confort au quotidien",
    description: "Découvrez notre sélection d'accessoires de soin et de bien-être conçus pour accompagner votre confort au quotidien. Des produits pratiques, modernes et faciles à utiliser, sélectionnés pour simplifier vos habitudes et prendre soin de vous.",
    intro: "Explorez notre sélection d'accessoires de confort personnel. Découvrez les caractéristiques de chaque produit et contactez-nous sur WhatsApp pour obtenir des informations sur la disponibilité et les modalités de commande.",
    cardText: "Des accessoires pratiques pour votre confort et votre bien-être au quotidien.",
    image: unsplash("1540555700478-4be289fbecef", 1600), // photo d'ambiance : serviette, flacon, bougie
    cardImage: unsplash("1540555700478-4be289fbecef", 600)
  }
];

// Catégories RETIRÉES du site public (conservées ici pour mémoire, non affichées).
// Un produit dont "category" ne correspond à aucun id de CATEGORIES est masqué
// partout (accueil, catalogue, recherche, fiche) mais ses données sont conservées :
// il suffit de lui donner l'id d'une catégorie existante pour le republier,
// ou de remettre la catégorie complète (ex. "organisation" ci-dessous) dans CATEGORIES.
const RETIRED_CATEGORIES = [
  {
    id: "organisation", // retirée lors de la refonte : produits 2, 4 et 7 masqués
    name: "Organisation",
    tagline: "Rangement intelligent",
    description: "Des solutions de rangement malines pour gagner de la place et garder une maison bien ordonnée.",
    image: "images/Organisation maison, ordre et simplicité.png",
    cardImage: "images/categories/organisation.jpg",
    cardImageAlt: "Cuisine moderne avec rangements et boîtes de stockage organisées"
  },
  { id: "cuisine", name: "Cuisine", image: unsplash("1556911220-e15b29be8c8f", 1600) },
  { id: "maison", name: "Maison", image: unsplash("1618220179428-22790b461013", 1600) },
  { id: "accessoires", name: "Accessoires", image: unsplash("1520981825232-ece5fae45120", 1600) }
];

/* =====================================================================
   PRODUITS
   ---------------------------------------------------------------------
   Champs obligatoires : id (unique, utilisé dans produit.html?id=...),
   name, category (id d'une catégorie de CATEGORIES, ex. "bien-etre"), price (nombre en
   FCFA sans espaces ; null = prix non communiqué, la carte affiche
   « Prix sur demande »), description, features.
   Image : imageUrl et/ou image (voir IMAGES ci-dessus), ou aucune.

   Champs OPTIONNELS — à ajouter uniquement quand l'information est confirmée :
   - tag      : badge neutre affiché sur la photo (ex. "Sélection", "Pratique").
                Ne pas utiliser "Populaire" / "Nouveau" sans données réelles.
   - oldPrice : ancien prix (nombre). Affiche le prix barré et le badge de réduction.
                Ex. oldPrice: 42000
   - stock    : "en-stock", "stock-limite" ou "sur-commande".
                Sans ce champ, la fiche indique "À confirmer sur WhatsApp".
   - stockQuantity : nombre d'unités en stock (prioritaire sur "stock").
                > 0 : « En stock », quantité commandable limitée à ce nombre ;
                0   : « Épuisé », commande impossible.
                MISE À JOUR MANUELLE après chaque vente confirmée : le site ne
                décrémente pas le stock automatiquement.
   - featuresNote : phrase affichée sous les caractéristiques, pour signaler
                des points encore à confirmer (ex. accessoires fournis).

   GALERIE DE LA FICHE PRODUIT (miniatures + grande image + zoom) :
   - gallery : LISTE COMPLÈTE des photos, dans l'ordre d'affichage
               (la 1re est la photo affichée en grand à l'ouverture) :
                 gallery: [
                   { src: "images/accessoire/6.jpg",       // grande version (1200 px)
                     thumb: "images/accessoire/6-600.jpg", // miniature (600 px), optionnelle
                     alt: "Planche à découper premium vue de face" },
                   { src: "images/electromenager/friteuse air/1.png",
                     alt: "Air Fryer numérique 6L vue de face" }
                 ]
               src / thumb : chemin local ou URL externe directe (http/https).
               Sans thumb, la miniature utilise src.
               Une photo dont le fichier ne se charge pas affiche « Photo à venir ».
               gallery: [] => l'image principale (imageUrl / image) est utilisée seule.
   - video   : vidéo de démonstration ("" = aucune : pas d'onglet Vidéo).
               Fichier local (ex. "videos/1.mp4", MP4 H.264 conseillé) ou URL
               directe d'un fichier vidéo (https://…/demo.mp4). Pas de lien de page
               YouTube / Pinterest : il faut l'adresse du FICHIER vidéo.
   - videoPoster : image d'aperçu de la vidéo (JPG léger ~600 px, "" = aucune).
               Vide : la première photo de la galerie sert d'aperçu.
   ===================================================================== */

const products = [
  {
    id: 1,
    name: "Air Fryer numérique 6L",
    category: "electromenager",
    price: 35000,
    imageUrl: "", // URL externe (prioritaire si renseignée)
    // WebP optimisés (originaux PNG conservés dans le même dossier). Dans srcset, les espaces
    // du chemin doivent être écrites %20 (une espace sépare l'adresse de sa largeur).
    image: "images/electromenager/friteuse air/3-600.webp",
    srcset: "images/electromenager/friteuse%20air/3-600.webp 600w, images/electromenager/friteuse%20air/3-1200.webp 1200w",
    description: "Une friteuse sans huile au grand volume, idéale pour cuisiner pour toute la famille avec moins de matières grasses.",
    features: ["Capacité 6 litres", "Écran de commande numérique", "Panier amovible facile à nettoyer"],
    gallery: [
      { src: "images/electromenager/friteuse air/3-1200.webp", thumb: "images/electromenager/friteuse air/3-600.webp", alt: "Air Fryer numérique 6L servant frites et poulet sur un plan de travail" },
      { src: "images/electromenager/friteuse air/1-1200.webp", thumb: "images/electromenager/friteuse air/1-600.webp", alt: "Air Fryer numérique 6L noir à poignée dorée, vue de face" },
      { src: "images/electromenager/friteuse air/2-1200.webp", thumb: "images/electromenager/friteuse air/2-600.webp", alt: "Air Fryer numérique 6L avec le panier ouvert rempli de frites" }
      // 4.png retirée de la galerie : visuel publicitaire portant l'ancien slogan et des mentions
      // non vérifiées (manuel en français, écran tactile). Fichier conservé.
    ],
    video: "images/electromenager/friteuse air/5.mp4",
    videoPoster: "images/electromenager/friteuse air/1-1200.webp"
  },
  {
    id: 2,
    name: "Organisateur de cuisine",
    category: "organisation", // catégorie retirée : produit masqué (données conservées)
    price: 8500,
    imageUrl: "", // URL externe (prioritaire si renseignée)
    image: "images/organisateur/rangement cuisine/1.png",
    description: "Un organisateur pratique pour garder vos plans de travail dégagés et retrouver facilement vos ustensiles.",
    features: ["Plusieurs compartiments", "Gain de place sur le plan de travail", "Entretien facile"],
    gallery: [
      { src: "images/organisateur/rangement cuisine/1.png", alt: "Organisateur de cuisine à étagères avec bocaux d'épices et ustensiles suspendus" },
      { src: "images/organisateur/rangement cuisine/2.png", alt: "Organisateur de cuisine avec huiles, épices, couteaux et planche rangés" },
      { src: "images/organisateur/rangement cuisine/3.png", alt: "Organisateur de cuisine : présentation des compartiments et rangements" }
    ],
    video: "",
    videoPoster: ""
  },
  {
    id: 3,
    name: "Batterie de cuisine moderne",
    category: "cuisine", // catégorie retirée : produit masqué
    price: 45000,
    tag: "Sélection",
    imageUrl: "", // URL externe (prioritaire si renseignée)
    image: "images/cuisine/batterie/Ensemble de cuisine noir moucheté sur marbre.png",
    description: "Des casseroles et cocottes au design moderne pour mijoter, saisir et servir avec style.",
    features: ["Design moderne et coloré", "Adaptée à la cuisine du quotidien", "Couvercles inclus"],
    gallery: [
      { src: "images/cuisine/batterie/Ensemble de cuisine noir moucheté sur marbre.png", alt: "Batterie de cuisine moderne : casseroles, cocottes et poêle sur plan de travail en marbre" },
      { src: "images/cuisine/batterie/Ensemble de cuisine noir moucheté sur marbre 1.png", alt: "Batterie de cuisine moderne : vue d'ensemble avec couvercles en verre" },
      { src: "images/cuisine/batterie/Ensemble de cuisine noir moucheté sur marbre 2.png", alt: "Batterie de cuisine moderne : poêle et casseroles aux poignées effet bois" }
    ],
    video: "",
    videoPoster: ""
  },
  {
    id: 4,
    name: "Boîtes de rangement hermétiques",
    category: "organisation", // catégorie retirée : produit masqué (données conservées)
    price: 12000,
    tag: "Pratique",
    imageUrl: "", // URL externe (prioritaire si renseignée)
    image: "images/organisateur/rangement alimentaire.png",
    description: "Des boîtes hermétiques pour conserver vos aliments secs plus longtemps et organiser vos placards.",
    features: ["Fermeture hermétique", "Empilables", "Contenu visible d'un coup d'œil"],
    gallery: [],
    video: "",
    videoPoster: ""
  },
  {
    id: 5,
    name: "Set d'ustensiles cuisine",
    category: "cuisine", // catégorie retirée : produit masqué
    price: 15000,
    imageUrl: "", // URL externe (prioritaire si renseignée)
    image: "images/accessoire/5.jpg", // même photo que « Set d'ustensiles cuisine.png », en JPG plus léger
    description: "L'essentiel des ustensiles pour préparer, remuer et servir au quotidien.",
    features: ["Ensemble complet", "Prise en main confortable", "Rangement facile"],
    gallery: [],
    video: "",
    videoPoster: ""
  },
  {
    id: 6,
    name: "Planche à découper premium",
    category: "cuisine", // catégorie retirée : produit masqué
    price: 9500,
    imageUrl: "", // URL externe (prioritaire si renseignée)
    image: "images/accessoire/6-600.jpg", // même photo que « Planches en bambou et légumes frais.png »
    srcset: "images/accessoire/6-600.jpg 600w, images/accessoire/6.jpg 1200w",
    description: "Une planche robuste et élégante, aussi utile pour découper que pour servir.",
    features: ["Surface large", "Finition soignée", "Peut servir de plateau de présentation"],
    gallery: [],
    video: "",
    videoPoster: ""
  },
  {
    id: 7,
    name: "Rangement multifonction",
    category: "organisation", // catégorie retirée : produit masqué (anciennement "Maison")
    price: 10500,
    tag: "Pratique",
    imageUrl: "", // PHOTO À REMPLACER : URL externe de la photo (prioritaire)
    image: "",    // PHOTO À AJOUTER : le dossier images/maison/ est vide pour l'instant
    description: "Une solution de rangement polyvalente qui s'adapte à toutes les pièces de la maison.",
    features: ["Usage polyvalent", "Design sobre", "S'intègre dans tous les intérieurs"],
    gallery: [],
    video: "",
    videoPoster: ""
  },
  {
    id: 8,
    name: "Mini hachoir électrique", // nom confirmé par les photos (bloc moteur à bouton) ; prix et caractéristiques inchangés
    category: "electromenager",
    price: 22500,
    imageUrl: "", // URL externe (prioritaire si renseignée)
    image: "images/electromenager/robot hachoir elect/3.webp", // WebP optimisé (PNG d'origine conservé)
    description: "Un petit appareil compact pour gagner du temps en cuisine sans encombrer votre espace.",
    features: ["Format compact", "Simple à utiliser", "Idéal pour les petites cuisines"],
    gallery: [
      // 1 et 4 : versions recadrées (bande d'une autre photo et bordure blanche du montage retirées ; PNG d'origine conservés)
      { src: "images/electromenager/robot hachoir elect/3.webp", alt: "Mini hachoir électrique rempli de légumes hachés, entouré de légumes frais" },
      { src: "images/electromenager/robot hachoir elect/1-recadre.webp", alt: "Mini hachoir électrique avec viande hachée" },
      { src: "images/electromenager/robot hachoir elect/2.webp", alt: "Mini hachoir électrique avec ses bols et ses lames" },
      { src: "images/electromenager/robot hachoir elect/4-recadre.webp", alt: "Mini hachoir électrique, vue produit sur fond blanc" },
      { src: "images/electromenager/robot hachoir elect/5-1200.webp", thumb: "images/electromenager/robot hachoir elect/5-600.webp", alt: "Mini hachoir électrique : quatre vues du produit et de ses utilisations" }
    ],
    video: "",
    videoPoster: ""
  },
  {
    id: 9,
    name: "Bols en céramique (lot de 2)",
    category: "accessoires", // catégorie retirée : produit masqué
    price: 6000,
    ...unsplashPhoto("1603199506016-b9a594b593c0"), // Photo d'illustration — à remplacer par la photo réelle
    description: "Deux bols en céramique aux motifs délicats pour vos petits-déjeuners, desserts ou apéritifs.",
    features: ["Lot de 2 bols", "Motifs décoratifs", "S'empilent facilement"],
    gallery: [],
    video: "",
    videoPoster: ""
  },
  {
    id: 10,
    name: "Pot à ustensiles en céramique",
    category: "accessoires", // catégorie retirée : produit masqué
    price: 7500,
    tag: "Sélection",
    ...unsplashPhoto("1520981825232-ece5fae45120"), // Photo d'illustration — à remplacer par la photo réelle
    description: "Un pot élégant pour garder vos cuillères et spatules à portée de main tout en décorant votre cuisine.",
    features: ["Céramique blanche", "Grande contenance", "Style naturel et épuré"],
    gallery: [],
    video: "",
    videoPoster: ""
  },
  {
    id: 11,
    name: "Ceinture chauffante menstruelle sans fil",
    category: "bien-etre",
    price: 8000,
    // STOCK INITIAL : 10 unités (24/10/2026). Mise à jour MANUELLE : après chaque vente
    // confirmée, remplacer ce nombre par le stock restant. Le site ne le décrémente pas
    // automatiquement (une demande WhatsApp n'est pas une vente confirmée). 0 = « Épuisé ».
    stockQuantity: 10,
    imageUrl: "", // URL externe (prioritaire si renseignée)
    // Photos déposées par NovaMarket dans images/soin-bien-etre/ceinture chauffante/.
    // JPEG légers (≈ 80-100 Ko, 736 px) utilisés tels quels : une conversion WebP n'apporterait rien.
    image: "images/soin-bien-etre/ceinture chauffante/2.jpeg",
    description: "Profitez d'un accessoire de confort conçu pour accompagner votre quotidien pendant les règles. Cette ceinture chauffante sans fil a un format portable : vous pouvez l'emporter avec vous et l'utiliser selon les instructions du fabricant.",
    // Uniquement ce que le nom et la description confirment. À compléter quand la fiche
    // fabricant est disponible : recharge USB, réglages de température, massage, accessoires.
    features: ["Fonction de chauffage", "Utilisation sans fil", "Format portable, facile à emporter"],
    featuresNote: "Mode de recharge, réglages de température, fonction massage et accessoires fournis : à confirmer sur WhatsApp selon le modèle.",
    gallery: [
      { src: "images/soin-bien-etre/ceinture chauffante/2.jpeg", alt: "Ceinture chauffante rose à écran numérique et sangle grise, tenue en main au-dessus de sa boîte" },
      { src: "images/soin-bien-etre/ceinture chauffante/ceinture chauffante 1.jpg", alt: "Ceinture chauffante blanche avec écran d'affichage, dans sa boîte cadeau rose" }
    ],
    video: "",
    videoPoster: ""
  },
  {
    id: 12,
    name: "Lime électrique pour pieds",
    category: "bien-etre",
    price: 6000,
    // STOCK INITIAL : 10 unités (24/10/2026). Mise à jour MANUELLE : après chaque vente
    // confirmée, remplacer ce nombre par le stock restant. Le site ne le décrémente pas
    // automatiquement (une demande WhatsApp n'est pas une vente confirmée). 0 = « Épuisé ».
    stockQuantity: 10,
    imageUrl: "", // URL externe (prioritaire si renseignée)
    // Photos fournies par NovaMarket (dossier images/soin-bien-etre/lime-electrique-pieds/).
    // WebP optimisés créés à côté des PNG d'origine (conservés). Non utilisés : « lime 4.png »
    // (visuel avant / après = promesse de résultat) et « video.jpeg » (image fixe d'un autre modèle).
    image: "images/soin-bien-etre/lime-electrique-pieds/lime-3-600.webp",
    srcset: "images/soin-bien-etre/lime-electrique-pieds/lime-3-600.webp 600w, images/soin-bien-etre/lime-electrique-pieds/lime-3-1200.webp 1200w",
    description: "Prenez soin de vos pieds à la maison avec notre lime électrique. Son design ergonomique facilite la prise en main et aide à éliminer les rugosités. Un accessoire pratique à intégrer à votre routine de soin.",
    // Uniquement ce que la description confirme. La boîte visible sur la photo annonce d'autres
    // fonctions (recharge, vitesses, têtes fournies) : à n'ajouter qu'une fois confirmées.
    features: ["Design ergonomique, facile à prendre en main", "Aide à éliminer les rugosités", "Utilisation à la maison"],
    featuresNote: "Mode d'alimentation, réglages et accessoires fournis : à confirmer sur WhatsApp.",
    gallery: [
      { src: "images/soin-bien-etre/lime-electrique-pieds/lime-3-1200.webp", thumb: "images/soin-bien-etre/lime-electrique-pieds/lime-3-600.webp", alt: "Lime électrique pour pieds rose avec deux embouts et un câble, sur fond blanc" },
      { src: "images/soin-bien-etre/lime-electrique-pieds/lime-1-1200.webp", thumb: "images/soin-bien-etre/lime-electrique-pieds/lime-1-600.webp", alt: "Lime électrique pour pieds devant sa boîte, près d'une serviette rose" },
      { src: "images/soin-bien-etre/lime-electrique-pieds/lime à pied electrique1.jpeg", alt: "Lime électrique pour pieds rangée dans sa boîte avec ses accessoires" },
      { src: "images/soin-bien-etre/lime-electrique-pieds/lime-2-1200.webp", thumb: "images/soin-bien-etre/lime-electrique-pieds/lime-2-600.webp", alt: "Gros plan sur l'embout de la lime électrique pour pieds" }
    ],
    video: "",
    videoPoster: ""
  }
];
