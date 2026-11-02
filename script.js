// Code commun à toutes les pages (accueil, produits, catégorie, produit).
// Les données viennent de data/config.js (WHATSAPP_NUMBER, DELIVERY_INFO, SOCIAL_LINKS)
// et de data/products.js (CATEGORIES, products), chargés AVANT ce fichier.

const HOME_PRODUCT_LIMIT = 8;

// Message d'une catégorie qui n'a encore aucun produit visible.
const COMING_SOON = "Produits bientôt disponibles";

// Libellés du champ optionnel "stock" des produits (voir data/products.js).
const AVAILABILITY = {
  "en-stock": { label: "En stock", tone: "ok" },
  "stock-limite": { label: "Stock limité", tone: "warn" },
  "sur-commande": { label: "Sur commande", tone: "info" }
};
const AVAILABILITY_SOLD_OUT = { label: "Épuisé", tone: "out" };
const SOLD_OUT_NOTE = "Ce produit est momentanément épuisé.";
// Le stock chiffré est mis à jour à la main : il reste indicatif.
const STOCK_NOTE = "Disponibilité indicative, confirmée par NovaMarket sur WhatsApp avant toute commande.";
const AVAILABILITY_UNKNOWN = { label: "À confirmer sur WhatsApp", tone: "info" };

/* ---------- Utilitaires ---------- */

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

// Minuscules et sans accents : "Électroménager" -> "electromenager"
function normalize(value) {
  return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// 35000 -> "35 000 FCFA" (les espaces insécables de toLocaleString sont remplacés par des espaces simples)
function formatPrice(value) {
  return `${value.toLocaleString("fr-FR").replace(/[\u202f\u00a0]/g, " ")} FCFA`;
}

// Prix non renseigné (price: null) : la boutique le communique sur WhatsApp.
const PRICE_ON_REQUEST = "Prix sur demande";

function hasPrice(product) {
  return Number.isFinite(product.price);
}

function priceLabel(product) {
  return hasPrice(product) ? formatPrice(product.price) : PRICE_ON_REQUEST;
}

// Accepte l'id ("bien-etre") ou le nom ("Électroménager", "electromenager"...).
function findCategory(value) {
  if (!value) return undefined;
  const key = normalize(value);
  return CATEGORIES.find(category => category.id === key || normalize(category.name) === key);
}

// Catégorie d'un produit (undefined si sa catégorie a été retirée).
function categoryOf(product) {
  return CATEGORIES.find(category => category.id === product.category);
}

// Produits publics : ceux dont la catégorie existe encore dans CATEGORIES.
// Les produits des catégories retirées restent dans data/products.js mais ne sont affichés nulle part.
const visibleProducts = products.filter(product => categoryOf(product));

function findProduct(id) {
  return visibleProducts.find(product => String(product.id) === String(id));
}

function productsInCategory(categoryId) {
  return visibleProducts.filter(product => product.category === categoryId);
}

function productUrl(product) {
  return `produit.html?id=${product.id}`;
}

function categoryUrl(categoryId) {
  return `categorie.html?cat=${encodeURIComponent(categoryId)}`;
}

function matchesQuery(product, query) {
  return normalize(`${product.name} ${categoryOf(product).name} ${product.tag || ""}`).includes(normalize(query));
}

/* ---------- Tri (paramètre URL ?tri=...) ---------- */

// Les produits sans prix ("Prix sur demande") sont toujours placés en fin de liste.
function byPrice(a, b, direction) {
  if (!hasPrice(a) || !hasPrice(b)) return hasPrice(b) - hasPrice(a) || a.id - b.id;
  return (a.price - b.price) * direction;
}

// Seules ces valeurs sont acceptées. Map (et non objet) : aucune clé héritée
// comme "__proto__" ou "constructor" ne peut être atteinte depuis l'URL.
const DEFAULT_SORT = "default";
const PRODUCT_SORTERS = new Map([
  ["default", (a, b) => a.id - b.id],
  ["price-asc", (a, b) => byPrice(a, b, 1)],
  ["price-desc", (a, b) => byPrice(a, b, -1)],
  ["name", (a, b) => a.name.localeCompare(b.name, "fr")]
]);

// Anciennes valeurs françaises, conservées pour que les liens déjà partagés fonctionnent.
const SORT_ALIASES = new Map([
  ["pertinence", "default"],
  ["prix-asc", "price-asc"],
  ["prix-desc", "price-desc"],
  ["nom", "name"]
]);

// Renvoie toujours une valeur de tri autorisée (DEFAULT_SORT si la valeur est inconnue).
function parseSort(value) {
  const key = SORT_ALIASES.get(value) || value;
  return PRODUCT_SORTERS.has(key) ? key : DEFAULT_SORT;
}

function sortProducts(list, sortKey) {
  return [...list].sort(PRODUCT_SORTERS.get(parseSort(sortKey)));
}

function discountPercent(product) {
  return hasPrice(product) && product.oldPrice > product.price
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;
}

/* ---------- WhatsApp (une seule constante : WHATSAPP_NUMBER, dans data/config.js) ---------- */

// Numéro valide : chiffres uniquement, indicatif pays compris (8 à 15 chiffres).
// Tant qu'il est vide ou invalide, aucun lien WhatsApp n'est créé : les boutons
// de commande sont désactivés et affichent WHATSAPP_OFF_LABEL.
const WHATSAPP_READY = /^[1-9]\d{7,14}$/.test(String(WHATSAPP_NUMBER).trim());
const WHATSAPP_OFF_LABEL = "WhatsApp bientôt disponible";
const WHATSAPP_OFF_NOTE = "La commande sur WhatsApp sera disponible très prochainement : le numéro de NovaMarket est en cours de confirmation.";

// "" si le numéro n'est pas configuré.
function whatsappUrl(text) {
  return WHATSAPP_READY ? `https://wa.me/${WHATSAPP_NUMBER.trim()}?text=${encodeURIComponent(text)}` : "";
}

// Bouton WhatsApp généré en HTML : lien actif, ou texte désactivé si le numéro n'est pas configuré.
// attrs : attributs supplémentaires du lien actif (ex. aria-label).
function whatsappButtonHTML(url, className, label, attrs = "") {
  return url
    ? `<a class="${className}" href="${url}" target="_blank" rel="noopener"${attrs}>${label}</a>`
    : `<span class="${className} whatsapp-off" title="${escapeHTML(WHATSAPP_OFF_NOTE)}">${WHATSAPP_OFF_LABEL}</span>`;
}

// Lien WhatsApp déjà présent dans la page : href ajouté, ou lien désactivé avec message
// (data-off-label : libellé court pour les boutons étroits, ex. celui de l'en-tête).
function applyWhatsappLink(link, url) {
  if (url) {
    link.href = url;
    return;
  }
  link.removeAttribute("href");
  link.removeAttribute("target");
  link.classList.add("whatsapp-off");
  link.title = WHATSAPP_OFF_NOTE;
  link.textContent = link.dataset.offLabel || WHATSAPP_OFF_LABEL;
}

// Commande individuelle : une DEMANDE de commande, ni vente ni paiement confirmés.
function whatsappLink(product = null, quantity = 1) {
  if (!product) return whatsappUrl("Bonjour NovaMarket, je souhaite avoir des informations sur vos produits.");
  const price = !hasPrice(product)
    ? "à confirmer"
    : quantity > 1
      ? `${formatPrice(product.price)} l'unité, soit ${formatPrice(product.price * quantity)}`
      : formatPrice(product.price);
  return whatsappUrl(`Bonjour NovaMarket, je souhaite passer une commande pour le produit suivant : ${product.name}. Quantité : ${quantity}. Prix : ${price}. Merci de me confirmer sa disponibilité ainsi que les modalités de livraison.`);
}

function categoryWhatsappLink(category) {
  return whatsappUrl(`Bonjour NovaMarket, je souhaite avoir des informations sur vos produits de la catégorie "${category.name}".`);
}

/* ---------- Fragments HTML réutilisables ---------- */

/* ---------- Images produit ----------
   Ordre de priorité (voir data/products.js) :
   1. imageUrl : URL externe (http/https), avec imageUrlSrcset optionnel
   2. image    : chemin local (ex. "images/electromenager/friteuse air/3.png"), avec srcset optionnel
   3. emplacement neutre "Photo à venir"
   Si l'image externe ne se charge pas (lien mort, blocage), l'image locale puis
   l'emplacement neutre prennent le relais automatiquement. */

function isExternalImageUrl(value) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

// Chemin local : relatif et sans protocole (refuse "javascript:", "data:", etc.)
function isLocalImagePath(value) {
  return typeof value === "string" && value.trim() !== "" && !/^[a-z][a-z0-9+.-]*:/i.test(value.trim()) && !value.trim().startsWith("//");
}

// Renvoie la liste des sources utilisables, dans l'ordre de priorité.
function productImageSources(product) {
  const sources = [];
  if (isExternalImageUrl(product.imageUrl)) {
    sources.push({ src: product.imageUrl, srcset: product.imageUrlSrcset, external: true });
  }
  if (isLocalImagePath(product.image)) {
    sources.push({ src: product.image, srcset: product.srcset, external: false });
  }
  return sources;
}

// name vide : emplacement décoratif (ex. miniature dans un bouton déjà nommé).
function photoPlaceholderHTML(name) {
  const label = name ? `role="img" aria-label="Photo à venir : ${escapeHTML(name)}"` : 'aria-hidden="true"';
  return `
      <div class="photo-placeholder" ${label}>
        <span class="brand-mark" aria-hidden="true">N</span>
        <span aria-hidden="true">Photo à venir</span>
      </div>
    `;
}

// sizes : largeur d'affichage, utilisée avec srcset pour charger la bonne taille d'image.
// alt : texte alternatif (nom du produit par défaut ; "" pour une image décorative).
function productImageHTML(product, { priority = false, sizes = "(max-width: 760px) 50vw, 300px", alt = product.name } = {}) {
  const [main, fallback] = productImageSources(product);
  if (!main) return photoPlaceholderHTML(alt);

  const srcset = main.srcset ? ` srcset="${escapeHTML(main.srcset)}" sizes="${sizes}"` : "";
  const loading = priority ? ' fetchpriority="high"' : ' loading="lazy"';
  const referrer = main.external ? ' referrerpolicy="no-referrer"' : "";
  const fallbackAttr = fallback ? ` data-fallback="${escapeHTML(fallback.src)}"` : "";
  return `<img src="${escapeHTML(main.src)}"${srcset} alt="${escapeHTML(alt)}" width="600" height="600" decoding="async"${loading}${referrer} data-product-image${fallbackAttr}>`;
}

// Image qui échoue au chargement : image locale de secours, sinon emplacement neutre.
// Écouteur en phase de capture (l'événement "error" ne remonte pas) : couvre aussi les cartes ajoutées plus tard.
document.addEventListener("error", event => {
  const img = event.target;
  if (!(img instanceof HTMLImageElement) || !img.hasAttribute("data-product-image")) return;

  const fallback = img.getAttribute("data-fallback");
  if (fallback) {
    img.removeAttribute("data-fallback");
    img.removeAttribute("srcset");
    img.removeAttribute("sizes");
    img.removeAttribute("referrerpolicy");
    img.src = fallback;
  } else {
    img.outerHTML = photoPlaceholderHTML(img.alt);
  }
}, true);

function priceHTML(product, className = "product-price") {
  if (!hasPrice(product)) {
    return `<div class="${className} price-on-request"><span>${PRICE_ON_REQUEST}</span></div>`;
  }
  const oldPrice = product.oldPrice > product.price
    ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>`
    : "";
  return `<div class="${className}"><span>${formatPrice(product.price)}</span>${oldPrice}</div>`;
}

/* ---------- Stock ----------
   stockQuantity (nombre, saisi à la main dans data/products.js) est prioritaire sur stock (texte).
   Il n'est jamais décrémenté automatiquement : une demande WhatsApp n'est pas une vente confirmée. */

function hasStockCount(product) {
  return Number.isInteger(product.stockQuantity);
}

function isSoldOut(product) {
  return hasStockCount(product) && product.stockQuantity <= 0;
}

// Quantité maximale commandable : le stock s'il est chiffré (jamais négative), sinon aucune limite :
// sans stock confirmé, NovaMarket confirme la disponibilité sur WhatsApp.
function maxOrderQuantity(product) {
  return hasStockCount(product) ? Math.max(0, product.stockQuantity) : Infinity;
}

function availabilityOf(product) {
  if (hasStockCount(product)) return isSoldOut(product) ? AVAILABILITY_SOLD_OUT : AVAILABILITY["en-stock"];
  return Object.hasOwn(AVAILABILITY, product.stock || "") ? AVAILABILITY[product.stock] : AVAILABILITY_UNKNOWN;
}

function availabilityHTML(product) {
  const availability = availabilityOf(product);
  return `<span class="availability availability-${availability.tone}">${availability.label}</span>`;
}

function badgesHTML(product) {
  const discount = discountPercent(product);
  if (isSoldOut(product)) return `<span class="product-tag product-tag-out">Épuisé</span>`;
  return (product.tag ? `<span class="product-tag">${escapeHTML(product.tag)}</span>` : "")
    + (discount ? `<span class="product-discount">-${discount}%</span>` : "");
}

// Carte produit. L'image est un lien nommé ("Voir la fiche de …") mais retiré de la
// tabulation : au clavier, le nom et "Voir le produit" mènent déjà à la fiche.
function productCardHTML(product) {
  const url = productUrl(product);
  const name = escapeHTML(product.name);
  return `
    <article class="product-card">
      <a class="product-image" href="${url}" tabindex="-1" aria-label="Voir la fiche de ${name}">
        ${productImageHTML(product)}
        ${badgesHTML(product)}
      </a>
      <div class="product-info">
        <a class="product-category" href="${categoryUrl(product.category)}">${escapeHTML(categoryOf(product).name)}</a>
        <h3 class="product-name"><a href="${url}">${name}</a></h3>
        ${priceHTML(product)}
        <div class="product-actions">
          ${isSoldOut(product)
            ? `<span class="card-add is-unavailable">Épuisé</span>`
            : `<button type="button" class="card-add" data-add-to-cart="${escapeHTML(product.id)}" aria-label="Ajouter ${name} au panier">Ajouter au panier</button>`}
          <a class="card-details" href="${url}" aria-label="Voir le produit ${name}">Voir le produit</a>
        </div>
      </div>
    </article>
  `;
}

// Fil d'Ariane : items = [{ label, href }, ...] ; le dernier (sans href) est la page courante.
function breadcrumbHTML(items) {
  return `<ol>${items.map(item => item.href
    ? `<li><a href="${item.href}">${escapeHTML(item.label)}</a></li>`
    : `<li><span aria-current="page">${escapeHTML(item.label)}</span></li>`
  ).join("")}</ol>`;
}

const HOME_CRUMB = { label: "Accueil", href: "index.html" };

/* ---------- Liens WhatsApp généraux et réseaux sociaux ---------- */

// Les liens [data-whatsapp-link] n'ont pas de href dans le HTML (pas de lien "#" trompeur) :
// il est ajouté ici à partir de WHATSAPP_NUMBER (ou le lien est désactivé si le numéro est vide).
document.querySelectorAll("[data-whatsapp-link]").forEach(link => {
  applyWhatsappLink(link, whatsappLink());
});

// Réseaux sociaux (pied de page) : lien affiché seulement si l'URL est renseignée dans SOCIAL_LINKS.
document.querySelectorAll("[data-social]").forEach(link => {
  const url = SOCIAL_LINKS[link.dataset.social];
  if (url) {
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener";
  } else {
    link.remove();
  }
});

// Aucun réseau configuré : la colonne « Nous suivre » est retirée elle aussi.
document.querySelectorAll(".footer-social").forEach(column => {
  if (!column.querySelector("[data-social]")) {
    column.parentElement.classList.add("no-social");
    column.remove();
  }
});

// Pages d'information (pied de page) : lien affiché seulement si la page est renseignée dans PAGE_LINKS.
document.querySelectorAll("[data-page-link]").forEach(link => {
  const url = PAGE_LINKS[link.dataset.pageLink];
  if (url) link.href = url;
  else link.remove();
});

// Zone de livraison (data/config.js) : affichée seulement si elle est renseignée.
document.querySelectorAll("[data-delivery-area]").forEach(element => {
  if (DELIVERY_INFO.areaNote) element.textContent = DELIVERY_INFO.areaNote;
});

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Panier (enregistré sur l'appareil du client) ----------
   Seuls l'id et la quantité de chaque article sont enregistrés : le nom, le prix et
   le stock sont TOUJOURS relus dans data/products.js. Aucune donnée personnelle
   (nom, quartier, précisions) n'est enregistrée. Le stock n'est jamais décrémenté. */

const CART_KEY = "novamarket-panier";
const CART_MAX_LINES = 50;
let cartMemory = []; // secours si le stockage du navigateur est indisponible (navigation privée...)

function cartStorageAvailable() {
  try {
    localStorage.setItem(`${CART_KEY}-test`, "1");
    localStorage.removeItem(`${CART_KEY}-test`);
    return true;
  } catch {
    return false;
  }
}

const CART_PERSISTENT = cartStorageAvailable();

// Lignes valides uniquement : { id, qty } avec qty entier ≥ 1, sans doublon.
function readCart() {
  let raw = cartMemory;
  if (CART_PERSISTENT) {
    try {
      const stored = localStorage.getItem(CART_KEY);
      raw = stored ? JSON.parse(stored).items : [];
    } catch {
      raw = []; // contenu illisible : panier considéré comme vide
    }
  }
  const seen = new Set();
  return (Array.isArray(raw) ? raw : [])
    .filter(item => item && ["string", "number"].includes(typeof item.id) && Number.isInteger(item.qty) && item.qty > 0)
    .filter(item => !seen.has(String(item.id)) && seen.add(String(item.id)))
    .slice(0, CART_MAX_LINES)
    .map(item => ({ id: item.id, qty: item.qty }));
}

function writeCart(items) {
  cartMemory = items;
  try {
    if (items.length) localStorage.setItem(CART_KEY, JSON.stringify({ v: 1, items }));
    else localStorage.removeItem(CART_KEY);
  } catch {
    // stockage indisponible : le panier reste valable pour cette page
  }
  updateCartCount();
}

// Article commandable : produit visible, non épuisé.
function orderableProduct(id) {
  const product = findProduct(id);
  return product && !isSoldOut(product) ? product : undefined;
}

// Nombre d'articles commandables (quantités plafonnées au stock).
function cartCount() {
  return readCart().reduce((total, item) => {
    const product = orderableProduct(item.id);
    return product ? total + Math.min(item.qty, maxOrderQuantity(product)) : total;
  }, 0);
}

// Ajoute quantity unités, sans dépasser le stock / la limite par commande.
function addToCart(product, quantity = 1) {
  if (!orderableProduct(product.id)) return { added: 0, total: 0, max: 0 };
  const max = maxOrderQuantity(product);
  const items = readCart();
  const line = items.find(item => String(item.id) === String(product.id));
  const current = line ? Math.min(line.qty, max) : 0;
  const total = Math.min(max, current + Math.max(1, quantity));
  if (line) line.qty = total;
  else items.push({ id: product.id, qty: total });
  writeCart(items);
  return { added: total - current, total, max };
}

function addToCartMessage(product, quantity, result) {
  const name = `« ${product.name} »`;
  if (result.added === 0) return `Quantité maximale de ${name} déjà dans votre panier (${result.max}).`;
  if (result.added < quantity) return `${name} : quantité limitée à ${result.max} (maximum disponible). ${result.total} dans votre panier.`;
  return result.added > 1 ? `${result.added} × ${name} ajoutés au panier.` : `${name} ajouté au panier.`;
}

function updateCartCount() {
  const count = cartCount();
  document.querySelectorAll("[data-cart-count]").forEach(badge => {
    badge.textContent = count > 99 ? "99+" : String(count);
    badge.hidden = count === 0;
  });
  document.querySelectorAll("[data-cart-link]").forEach(link => {
    link.setAttribute("aria-label", count ? `Panier : ${count} article${count > 1 ? "s" : ""}` : "Panier (vide)");
  });
}

// Confirmation d'ajout : la page ne change pas, lien « Voir le panier ».
// La zone d'annonce (role="status") reste dans la page ; elle est vidée une fois masquée,
// pour qu'aucun lien invisible ne reste accessible au clavier.
const CART_TOAST_DURATION = 6000;
const cartToast = document.createElement("div");
cartToast.className = "cart-toast";
cartToast.setAttribute("role", "status");
document.body.appendChild(cartToast);
let cartToastTimer = null;

function showCartToast(message) {
  cartToast.innerHTML = `<span>${escapeHTML(message)}</span><a href="panier.html">Voir le panier <span aria-hidden="true">→</span></a>`;
  cartToast.classList.add("visible");
  clearTimeout(cartToastTimer);
  cartToastTimer = setTimeout(() => {
    if (cartToast.contains(document.activeElement)) return; // lien en cours d'utilisation : on le laisse
    cartToast.classList.remove("visible");
    cartToastTimer = setTimeout(() => { cartToast.innerHTML = ""; }, 250);
  }, CART_TOAST_DURATION);
}

// Le focus quitte le lien « Voir le panier » : le message se ferme normalement.
cartToast.addEventListener("focusout", () => {
  if (!cartToast.classList.contains("visible")) return;
  clearTimeout(cartToastTimer);
  cartToastTimer = setTimeout(() => {
    cartToast.classList.remove("visible");
    cartToastTimer = setTimeout(() => { cartToast.innerHTML = ""; }, 250);
  }, 1500);
});

// Boutons « Ajouter au panier » des cartes produit (y compris celles ajoutées plus tard).
document.addEventListener("click", event => {
  const button = event.target.closest("[data-add-to-cart]");
  if (!button) return;
  const product = findProduct(button.dataset.addToCart);
  if (!product) return;
  showCartToast(addToCartMessage(product, 1, addToCart(product, 1)));
});

// Panier modifié dans un autre onglet : compteur mis à jour.
window.addEventListener("storage", event => {
  if (event.key === CART_KEY) updateCartCount();
});

updateCartCount();

/* ---------- Menu mobile ---------- */

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

function isMenuOpen() {
  return mainNav.classList.contains("open");
}

function setMenuOpen(open) {
  mainNav.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  menuToggle.textContent = open ? "✕" : "☰";
}

menuToggle.addEventListener("click", () => setMenuOpen(!isMenuOpen()));

mainNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => setMenuOpen(false));
});

// Fermeture au clic / toucher en dehors du menu
document.addEventListener("click", event => {
  if (isMenuOpen() && !mainNav.contains(event.target) && !menuToggle.contains(event.target)) {
    setMenuOpen(false);
  }
});

// Fermeture quand le focus clavier sort du menu (Tab après le dernier lien)
mainNav.addEventListener("focusout", event => {
  const next = event.relatedTarget;
  if (isMenuOpen() && next && !mainNav.contains(next) && next !== menuToggle) {
    setMenuOpen(false);
  }
});

// Passage en affichage bureau (rotation, redimensionnement) : le menu mobile est réinitialisé.
const desktopNav = window.matchMedia("(min-width: 1101px)"); // même seuil que le menu burger dans style.css
desktopNav.addEventListener("change", () => {
  if (desktopNav.matches) setMenuOpen(false);
});

/* ---------- Bouton « Retour en haut » ---------- */

const BACK_TO_TOP_OFFSET = 600;
const backToTop = document.createElement("button");
backToTop.type = "button";
backToTop.className = "back-to-top";
backToTop.setAttribute("aria-label", "Retour en haut de la page");
backToTop.innerHTML = '<span aria-hidden="true">↑</span>';
document.body.appendChild(backToTop);

function updateBackToTop() {
  backToTop.classList.toggle("visible", window.scrollY > BACK_TO_TOP_OFFSET);
}

// Saut immédiat en haut, quel que soit le scroll-behavior défini en CSS.
function jumpToTop() {
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  root.style.scrollBehavior = previous;
}

// Défilement animé si l'utilisateur l'accepte, avec garantie d'arriver en haut :
// à la fin du défilement (scrollend) ou au plus tard après 1,2 s, la page est
// ramenée en haut si l'animation a été interrompue ou n'a pas eu lieu.
function scrollToTop(onArrive) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || window.scrollY === 0) {
    jumpToTop();
    onArrive();
    return;
  }

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(safetyTimer);
    window.removeEventListener("scrollend", finish);
    if (window.scrollY > 0) jumpToTop();
    onArrive();
  };
  const safetyTimer = setTimeout(finish, 1200);
  window.addEventListener("scrollend", finish);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

backToTop.addEventListener("click", () => {
  scrollToTop(() => {
    updateBackToTop();
    // Le bouton disparaît en haut de page : le focus clavier revient au logo.
    document.querySelector(".site-header .brand").focus({ preventScroll: true });
  });
});

window.addEventListener("scroll", updateBackToTop, { passive: true });
updateBackToTop();

/* ---------- Recherche (fenêtre modale accessible) ---------- */

const searchModal = document.getElementById("searchModal");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const searchBtn = document.getElementById("searchBtn");
const closeSearch = document.getElementById("closeSearch");
const SEARCH_HINT = "<p class='search-result'>Commencez à taper pour rechercher un produit.</p>";
let searchOpener = null;

function isSearchOpen() {
  return searchModal.classList.contains("open");
}

function openSearch() {
  searchOpener = document.activeElement;
  setMenuOpen(false);
  searchModal.classList.add("open");
  searchInput.focus();
}

function closeSearchModal() {
  if (!isSearchOpen()) return;
  searchModal.classList.remove("open");
  (searchOpener && document.contains(searchOpener) ? searchOpener : searchBtn).focus();
}

// Garde le focus clavier à l'intérieur de la fenêtre tant qu'elle est ouverte.
function trapSearchFocus(event) {
  const focusable = [...searchModal.querySelectorAll("button, input, a[href]")];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

searchBtn.addEventListener("click", openSearch);
closeSearch.addEventListener("click", closeSearchModal);
searchModal.addEventListener("click", event => {
  if (event.target === searchModal) closeSearchModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if (isSearchOpen()) {
      closeSearchModal();
    } else if (isMenuOpen()) {
      setMenuOpen(false);
      menuToggle.focus();
    }
  } else if (event.key === "Tab" && isSearchOpen()) {
    trapSearchFocus(event);
  }
});

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();
  if (!query) {
    searchResults.innerHTML = SEARCH_HINT;
    return;
  }

  const matches = visibleProducts.filter(product => matchesQuery(product, query));

  searchResults.innerHTML = matches.length
    ? matches.map(product => `
      <a class="search-result" href="${productUrl(product)}">
        <strong>${escapeHTML(product.name)}</strong> — ${priceLabel(product)}
      </a>
    `).join("") + `<a class="search-result search-all" href="produits.html?q=${encodeURIComponent(query)}">Voir tous les résultats →</a>`
    : "<p class='search-result'>Aucun produit trouvé pour cette recherche.</p>";
});

searchInput.addEventListener("keydown", event => {
  const query = searchInput.value.trim();
  if (event.key === "Enter" && query) {
    window.location.href = `produits.html?q=${encodeURIComponent(query)}`;
  }
});

searchResults.innerHTML = SEARCH_HINT;

/* ---------- Accueil : cartes de catégorie (générées depuis CATEGORIES) ---------- */

const homeCategoryGrid = document.getElementById("homeCategoryGrid");

function categoryCardHTML(category) {
  const media = category.cardImage
    ? `<div class="category-media"><img src="${escapeHTML(category.cardImage)}" alt="${escapeHTML(category.cardImageAlt || "")}" width="600" height="750" loading="lazy" decoding="async"></div>`
    : `<div class="category-media is-placeholder"><span class="brand-mark" aria-hidden="true">N</span></div>`;
  return `
    <a class="category-card" href="${categoryUrl(category.id)}">
      ${media}
      <div class="category-body">
        <h3>${escapeHTML(category.name)}</h3>
        <p class="category-text">${escapeHTML(category.cardText || category.tagline)}</p>
        <span class="category-link">Voir la catégorie <span aria-hidden="true">→</span></span>
      </div>
    </a>
  `;
}

if (homeCategoryGrid) {
  homeCategoryGrid.innerHTML = CATEGORIES.map(categoryCardHTML).join("");
}

/* ---------- Accueil : sélection de produits avec filtres ---------- */

const productGrid = document.getElementById("productGrid");
const filters = document.getElementById("filters");

// filter : id de catégorie, "" = tous les produits.
function renderProducts(filter = "") {
  const list = filter ? productsInCategory(filter) : visibleProducts;
  productGrid.innerHTML = list.length
    ? list.slice(0, HOME_PRODUCT_LIMIT).map(productCardHTML).join("")
    : `<p class="grid-empty">${COMING_SOON}.</p>`;
}

if (productGrid && filters) {
  filters.innerHTML = [{ id: "", name: "Tous" }, ...CATEGORIES]
    .map(category => `<button type="button" class="filter${category.id ? "" : " active"}" data-filter="${escapeHTML(category.id)}" aria-pressed="${!category.id}">${escapeHTML(category.name)}</button>`)
    .join("");

  filters.addEventListener("click", event => {
    const button = event.target.closest(".filter");
    if (!button) return;
    filters.querySelectorAll(".filter").forEach(btn => {
      btn.classList.toggle("active", btn === button);
      btn.setAttribute("aria-pressed", String(btn === button));
    });
    renderProducts(button.dataset.filter);
  });

  renderProducts();
}
