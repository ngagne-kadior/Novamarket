// Configuration de la boutique NovaMarket, partagée par toutes les pages.
// C'est le SEUL fichier à modifier pour le numéro WhatsApp, la livraison, les réseaux sociaux et les pages d'information.
// Ordre de chargement dans chaque page : data/config.js → data/products.js → script.js → script de la page.
// Attention : ce fichier est public (visible par tous les visiteurs) — n'y mettre aucune donnée interne
// (coûts d'achat, marges, fournisseurs...).

/* =====================================================================
   WHATSAPP
   ===================================================================== */

// Numéro WhatsApp de NovaMarket au format international, chiffres uniquement,
// sans "+" ni espaces (ici +221 77 192 00 76 : Sénégal, indicatif 221).
// Si cette valeur est vidée, les boutons de commande sont désactivés
// et affichent « WhatsApp bientôt disponible ».
const WHATSAPP_NUMBER = "221771920076";

/* =====================================================================
   LIVRAISON — uniquement des informations confirmées
   (aucun tarif ni délai tant qu'ils ne sont pas fixés)
   ===================================================================== */

const DELIVERY_INFO = {
  // Zone de livraison confirmée (accueil et fiches produit). "" = non affiché.
  // Aucun tarif ni délai : ils ne sont pas encore fixés.
  areaNote: "Livraison disponible à Mbour, frais à confirmer",
  // Affiché sur les fiches produit et repris dans les messages de commande.
  feesNote: "Frais de livraison à confirmer selon votre zone",
  // La livraison n'est pas incluse dans le prix des articles.
  paymentNote: "La livraison est payée séparément par le client.",
  // Panier : affiché sous le total des articles et repris dans le message WhatsApp.
  cartNote: "Frais de livraison à confirmer selon votre zone (payés séparément)"
};

/* =====================================================================
   RÉSEAUX SOCIAUX (pied de page)
   Laisser "" tant que le compte n'est pas créé : le lien n'est pas affiché
   (la colonne « Nous suivre » disparaît si aucun réseau n'est renseigné).
   ===================================================================== */

const SOCIAL_LINKS = {
  instagram: "", // À RENSEIGNER, ex. "https://www.instagram.com/..."
  facebook: "",  // À RENSEIGNER
  tiktok: ""     // À RENSEIGNER
};

/* =====================================================================
   PAGES D'INFORMATION (pied de page)
   Laisser "" tant que la page n'existe pas : le lien n'est pas affiché.
   ===================================================================== */

const PAGE_LINKS = {
  livraison: "", // À RENSEIGNER, ex. "livraison.html"
  faq: ""        // À RENSEIGNER, ex. "faq.html"
};
