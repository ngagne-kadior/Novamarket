// Données centralisées de NovaMarket, partagées par toutes les pages.
// Ce fichier ne contient que des données : les fonctions d'affichage sont dans script.js.

/* =====================================================================
   CONFIGURATION DE LA BOUTIQUE — À RENSEIGNER
   ===================================================================== */

// Numéro WhatsApp au format international, sans "+" ni espaces.
// Valeur TEMPORAIRE : ce n'est pas le numéro de NovaMarket.
// TODO: remplacer par le vrai numéro WhatsApp NovaMarket avant mise en ligne
const WHATSAPP_NUMBER = "221770000000";

// Liens des réseaux sociaux (pied de page). Laisser "" tant que le compte n'est pas créé :
// le lien s'affiche alors comme texte non cliquable.
const SOCIAL_LINKS = {
  instagram: "", // À RENSEIGNER, ex. "https://www.instagram.com/..."
  facebook: "",  // À RENSEIGNER
  tiktok: ""     // À RENSEIGNER
};

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
   ===================================================================== */

const CATEGORIES = [
  {
    name: "Cuisine",
    tagline: "Ustensiles & accessoires",
    description: "Tout le nécessaire pour cuisiner avec plaisir : casseroles, ustensiles et accessoires pratiques pour le quotidien.",
    image: unsplash("1556911220-e15b29be8c8f", 1600)
  },
  {
    name: "Maison",
    tagline: "Pratique & élégant",
    description: "Des objets utiles et soignés pour rendre chaque pièce de la maison plus agréable à vivre.",
    image: unsplash("1618220179428-22790b461013", 1600)
  },
  {
    name: "Organisation",
    tagline: "Rangement intelligent",
    description: "Des solutions de rangement malines pour gagner de la place et garder une maison bien ordonnée.",
    image: "images/Organisation maison, ordre et simplicité.png" // bannière (1254 px : plus petite que les 1600 px conseillés)
  },
  {
    name: "Électroménager",
    tagline: "Des appareils utiles",
    description: "Des petits appareils efficaces qui vous font gagner du temps en cuisine, sans encombrer votre espace.",
    image: unsplash("1585515320310-259814833e62", 1600)
  },
  {
    name: "Accessoires",
    tagline: "Les petits essentiels",
    description: "Les petits détails qui changent tout : vaisselle, rangements d'ustensiles et accessoires du quotidien.",
    image: unsplash("1520981825232-ece5fae45120", 1600)
  }
];

/* =====================================================================
   PRODUITS
   ---------------------------------------------------------------------
   Champs obligatoires : id (unique, utilisé dans produit.html?id=...),
   name, category (nom d'une catégorie de CATEGORIES), price (nombre en
   FCFA sans espaces), description, features.
   Image : imageUrl et/ou image (voir IMAGES ci-dessus), ou aucune.

   Champs OPTIONNELS — à ajouter uniquement quand l'information est confirmée :
   - tag      : badge neutre affiché sur la photo (ex. "Sélection", "Pratique").
                Ne pas utiliser "Populaire" / "Nouveau" sans données réelles.
   - oldPrice : ancien prix (nombre). Affiche le prix barré et le badge de réduction.
                Ex. oldPrice: 42000
   - stock    : "en-stock", "stock-limite" ou "sur-commande".
                Sans ce champ, la fiche indique "À confirmer sur WhatsApp".

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
    category: "Électroménager",
    price: 35000,
    imageUrl: "", // URL externe (prioritaire si renseignée)
    image: "images/electromenager/friteuse air/3.png",
    description: "Une friteuse sans huile au grand volume, idéale pour cuisiner pour toute la famille avec moins de matières grasses.",
    features: ["Capacité 6 litres", "Écran de commande numérique", "Panier amovible facile à nettoyer"],
    gallery: [
      { src: "images/electromenager/friteuse air/3.png", alt: "Air Fryer numérique 6L servant frites et poulet sur un plan de travail" },
      { src: "images/electromenager/friteuse air/1.png", alt: "Air Fryer numérique 6L noir à poignée dorée, vue de face" },
      { src: "images/electromenager/friteuse air/2.png", alt: "Air Fryer numérique 6L avec le panier ouvert rempli de frites" },
      { src: "images/electromenager/friteuse air/4.png", alt: "Contenu de la boîte de l'Air Fryer : appareil, panier, grille, cordon et manuel" }
    ],
    video: "images/electromenager/friteuse air/5.mp4",
    videoPoster: "images/electromenager/friteuse air/1.png"
  },
  {
    id: 2,
    name: "Organisateur de cuisine",
    category: "Organisation",
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
    category: "Cuisine",
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
    category: "Organisation",
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
    category: "Cuisine",
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
    category: "Cuisine",
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
    category: "Maison",
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
    name: "Mini appareil de cuisine",
    category: "Électroménager",
    price: 22500,
    imageUrl: "", // URL externe (prioritaire si renseignée)
    image: "images/electromenager/robot hachoir elect/3.png",
    description: "Un petit appareil compact pour gagner du temps en cuisine sans encombrer votre espace.",
    features: ["Format compact", "Simple à utiliser", "Idéal pour les petites cuisines"],
    gallery: [
      { src: "images/electromenager/robot hachoir elect/3.png", alt: "Mini hachoir électrique rempli de légumes hachés, entouré de légumes frais" },
      { src: "images/electromenager/robot hachoir elect/1.png", alt: "Mini hachoir électrique avec viande hachée" },
      { src: "images/electromenager/robot hachoir elect/2.png", alt: "Mini hachoir électrique avec ses bols et ses lames" },
      { src: "images/electromenager/robot hachoir elect/4.png", alt: "Mini hachoir électrique, vue produit sur fond blanc" },
      { src: "images/electromenager/robot hachoir elect/5.png", alt: "Mini hachoir électrique : quatre vues du produit et de ses utilisations" }
    ],
    video: "",
    videoPoster: ""
  },
  {
    id: 9,
    name: "Bols en céramique (lot de 2)",
    category: "Accessoires",
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
    category: "Accessoires",
    price: 7500,
    tag: "Sélection",
    ...unsplashPhoto("1520981825232-ece5fae45120"), // Photo d'illustration — à remplacer par la photo réelle
    description: "Un pot élégant pour garder vos cuillères et spatules à portée de main tout en décorant votre cuisine.",
    features: ["Céramique blanche", "Grande contenance", "Style naturel et épuré"],
    gallery: [],
    video: "",
    videoPoster: ""
  }
];
