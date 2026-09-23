// Code commun à toutes les pages (accueil, produits, catégorie, produit).
// Les données (WHATSAPP_NUMBER, SOCIAL_LINKS, CATEGORIES, products) viennent de
// data/products.js, qui doit être chargé AVANT ce fichier.

const HOME_PRODUCT_LIMIT = 8;

// Libellés du champ optionnel "stock" des produits (voir data/products.js).
const AVAILABILITY = {
  "en-stock": { label: "En stock", tone: "ok" },
  "stock-limite": { label: "Stock limité", tone: "warn" },
  "sur-commande": { label: "Sur commande", tone: "info" }
};
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

function findProduct(id) {
  return products.find(product => String(product.id) === String(id));
}

// Accepte "Électroménager", "electromenager", "ELECTROMENAGER"...
function findCategory(name) {
  if (!name) return undefined;
  return CATEGORIES.find(category => normalize(category.name) === normalize(name));
}

function productsInCategory(categoryName) {
  return products.filter(product => product.category === categoryName);
}

function productUrl(product) {
  return `produit.html?id=${product.id}`;
}

function categoryUrl(categoryName) {
  return `categorie.html?cat=${encodeURIComponent(categoryName)}`;
}

function matchesQuery(product, query) {
  return normalize(`${product.name} ${product.category} ${product.tag || ""}`).includes(normalize(query));
}

/* ---------- Tri (paramètre URL ?tri=...) ---------- */

// Seules ces valeurs sont acceptées. Map (et non objet) : aucune clé héritée
// comme "__proto__" ou "constructor" ne peut être atteinte depuis l'URL.
const DEFAULT_SORT = "default";
const PRODUCT_SORTERS = new Map([
  ["default", (a, b) => a.id - b.id],
  ["price-asc", (a, b) => a.price - b.price],
  ["price-desc", (a, b) => b.price - a.price],
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
  return product.oldPrice > product.price
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;
}

/* ---------- WhatsApp (une seule constante : WHATSAPP_NUMBER) ---------- */

function whatsappUrl(text) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function whatsappLink(product = null, quantity = 1) {
  const request = "Pouvez-vous me confirmer la disponibilité et les modalités de commande ?";
  if (product && quantity > 1) {
    return whatsappUrl(`Bonjour NovaMarket, je souhaite commander ${quantity} × "${product.name}" (${formatPrice(product.price)} l'unité, soit ${formatPrice(product.price * quantity)}). ${request}`);
  }
  if (product) {
    return whatsappUrl(`Bonjour NovaMarket, je suis intéressé(e) par le produit "${product.name}" affiché à ${formatPrice(product.price)}. ${request}`);
  }
  return whatsappUrl("Bonjour NovaMarket, je souhaite avoir des informations sur vos produits.");
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
  const oldPrice = product.oldPrice > product.price
    ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>`
    : "";
  return `<div class="${className}"><span>${formatPrice(product.price)}</span>${oldPrice}</div>`;
}

function availabilityHTML(product) {
  const availability = AVAILABILITY[product.stock] || AVAILABILITY_UNKNOWN;
  return `<span class="availability availability-${availability.tone}">${availability.label}</span>`;
}

function badgesHTML(product) {
  const discount = discountPercent(product);
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
        <a class="product-category" href="${categoryUrl(product.category)}">${escapeHTML(product.category)}</a>
        <h3 class="product-name"><a href="${url}">${name}</a></h3>
        ${priceHTML(product)}
        <div class="product-actions">
          <a class="card-whatsapp" href="${whatsappLink(product)}" target="_blank" rel="noopener" aria-label="Commander ${name} sur WhatsApp">Commander sur WhatsApp</a>
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
// il est ajouté ici à partir de WHATSAPP_NUMBER.
document.querySelectorAll("[data-whatsapp-link]").forEach(link => {
  link.href = whatsappLink();
});

// Réseaux sociaux (pied de page) : lien actif seulement si l'URL est renseignée dans SOCIAL_LINKS.
document.querySelectorAll("[data-social]").forEach(link => {
  const url = SOCIAL_LINKS[link.dataset.social];
  if (url) {
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener";
    link.classList.remove("is-pending");
  } else {
    link.classList.add("is-pending");
    link.title = "Bientôt disponible";
  }
});

document.getElementById("year").textContent = new Date().getFullYear();

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
const desktopNav = window.matchMedia("(min-width: 901px)");
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

  const matches = products.filter(product => matchesQuery(product, query));

  searchResults.innerHTML = matches.length
    ? matches.map(product => `
      <a class="search-result" href="${productUrl(product)}">
        <strong>${escapeHTML(product.name)}</strong> — ${formatPrice(product.price)}
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

/* ---------- Accueil : sélection de produits avec filtres ---------- */

const productGrid = document.getElementById("productGrid");
const filters = document.getElementById("filters");

function renderProducts(filter = "Tous") {
  const list = filter === "Tous" ? products : productsInCategory(filter);
  productGrid.innerHTML = list.slice(0, HOME_PRODUCT_LIMIT).map(productCardHTML).join("");
}

if (productGrid && filters) {
  filters.innerHTML = ["Tous", ...CATEGORIES.map(category => category.name)]
    .map(name => `<button type="button" class="filter${name === "Tous" ? " active" : ""}" data-filter="${escapeHTML(name)}" aria-pressed="${name === "Tous"}">${escapeHTML(name)}</button>`)
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
