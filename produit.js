// Page produit dynamique : produit.html?id=1

const RELATED_LIMIT = 4;

// Icône WhatsApp (décorative : le texte du bouton suffit aux lecteurs d'écran).
const WHATSAPP_ICON = `<svg class="btn-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="currentColor" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41Z"/></svg>`;

// Icône panier (décorative).
const CART_ICON = `<svg class="btn-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 4h2.2l2.1 10.2a1.5 1.5 0 0 0 1.5 1.2h8.3a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6.1"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/></svg>`;

const productDetail = document.getElementById("productDetail");
const productBreadcrumb = document.getElementById("productBreadcrumb");
const relatedSection = document.getElementById("relatedSection");
const relatedGrid = document.getElementById("relatedGrid");
const relatedLink = document.getElementById("relatedLink");

const product = findProduct(new URLSearchParams(window.location.search).get("id"));

function renderNotFound() {
  document.title = "Produit introuvable — NovaMarket";
  productBreadcrumb.innerHTML = breadcrumbHTML([HOME_CRUMB, { label: "Produits", href: "produits.html" }, { label: "Produit introuvable" }]);
  productDetail.innerHTML = `
    <div class="product-not-found">
      <span class="eyebrow">OUPS</span>
      <h1>Produit introuvable.</h1>
      <p>Ce produit n'existe pas ou n'est plus disponible.</p>
      <a class="btn btn-primary" href="produits.html">Voir tous les produits <span>→</span></a>
    </div>
  `;
}

function renderProduct() {
  const discount = discountPercent(product);
  const category = categoryOf(product);
  const priced = hasPrice(product);
  const photos = galleryPhotos();
  const video = mediaSource(product.video);
  const soldOut = isSoldOut(product);
  const maxQuantity = maxOrderQuantity(product);

  document.title = `${product.name} — NovaMarket`;
  document.querySelector('meta[name="description"]').setAttribute("content", `${product.name} — ${product.description}`);

  productBreadcrumb.innerHTML = breadcrumbHTML([
    HOME_CRUMB,
    { label: category.name, href: categoryUrl(category.id) },
    { label: product.name }
  ]);

  productDetail.innerHTML = `
    <article class="product-detail">
      ${galleryHTML(photos, video)}

      <div class="product-detail-info">
        <a class="product-category" href="${categoryUrl(category.id)}">${escapeHTML(category.name)}</a>
        <h1>${escapeHTML(product.name)}</h1>
        ${priceHTML(product, "product-detail-price")}
        ${discount ? `<p class="promo-note">Promotion : vous économisez ${formatPrice(product.oldPrice - product.price)}.</p>` : ""}
        <div class="product-stock">Disponibilité : ${availabilityHTML(product)}</div>
        ${hasStockCount(product) && !soldOut ? `<p class="stock-note">${STOCK_NOTE}</p>` : ""}

        <p class="product-description">${escapeHTML(product.description)}</p>

        <h2 class="product-subtitle">Caractéristiques</h2>
        <ul class="product-features">
          ${product.features.map(feature => `<li>${escapeHTML(feature)}</li>`).join("")}
        </ul>
        ${product.featuresNote ? `<p class="product-features-note">${escapeHTML(product.featuresNote)}</p>` : ""}

        ${soldOut ? "" : `
        <div class="order-box">
          <div class="quantity" role="group" aria-label="Quantité">
            <button type="button" id="qtyMinus" aria-label="Diminuer la quantité">−</button>
            <output id="qtyValue" aria-live="polite">1</output>
            <button type="button" id="qtyPlus" aria-label="Augmenter la quantité">+</button>
          </div>
          ${priced ? `<div class="order-total">Total des articles : <strong id="orderTotal">${formatPrice(product.price)}</strong>
            <small>Hors livraison : ${escapeHTML(DELIVERY_INFO.feesNote.charAt(0).toLowerCase() + DELIVERY_INFO.feesNote.slice(1))}.</small></div>` : ""}
        </div>`}

        <div class="product-detail-actions">
          ${soldOut ? `
          <span class="btn btn-primary btn-whatsapp is-unavailable">Produit épuisé</span>
          <p class="order-note">${SOLD_OUT_NOTE}</p>` : `
          <button type="button" class="btn btn-primary btn-add-cart" id="addToCart">
            ${CART_ICON}
            <span>Ajouter au panier</span>
          </button>
          ${WHATSAPP_READY ? `
          <a class="btn btn-light btn-whatsapp-direct" id="orderWhatsapp" href="${whatsappLink(product)}" target="_blank" rel="noopener">
            ${WHATSAPP_ICON}
            <span>Commander directement sur WhatsApp</span>
            <span class="sr-only">(ouvre WhatsApp dans un nouvel onglet)</span>
          </a>
          <p class="order-note">${priced
            ? "Commande directe : le message est pré-rempli avec le nom du produit, la quantité et le prix."
            : "Commande directe : le message est pré-rempli avec le nom du produit et la quantité ; le prix vous sera communiqué sur WhatsApp."}</p>` : `
          <span class="btn btn-light btn-whatsapp-direct whatsapp-off">
            ${WHATSAPP_ICON}
            <span>${WHATSAPP_OFF_LABEL}</span>
          </span>
          <p class="order-note">${WHATSAPP_OFF_NOTE}</p>`}`}
        </div>

        <a class="back-link" href="produits.html"><span aria-hidden="true">←</span> Retour aux produits</a>

        <ul class="product-reassurance">
          <li>${iconHTML("truck", 26)}<span>${escapeHTML(DELIVERY_INFO.areaNote || DELIVERY_INFO.feesNote)}</span></li>
          <li>${iconHTML("headset", 26)}<span>Réponse sur WhatsApp</span></li>
          <li>${iconHTML("shieldCheck", 26)}<span>Disponibilité confirmée avant commande</span></li>
        </ul>
      </div>
    </article>
  `;

  initGallery(photos, video);
  if (soldOut) return; // pas de sélecteur de quantité pour un produit épuisé

  // Quantité : de 1 au stock disponible (stockQuantity), sans limite si le stock n'est pas chiffré.
  let quantity = 1;
  const qtyValue = document.getElementById("qtyValue");
  const orderTotal = document.getElementById("orderTotal");
  const orderWhatsapp = document.getElementById("orderWhatsapp");
  const qtyMinus = document.getElementById("qtyMinus");
  const qtyPlus = document.getElementById("qtyPlus");

  function setQuantity(next) {
    quantity = Math.min(maxQuantity, Math.max(1, next));
    qtyValue.textContent = quantity;
    if (priced) orderTotal.textContent = formatPrice(product.price * quantity);
    if (orderWhatsapp) orderWhatsapp.href = whatsappLink(product, quantity);
    qtyMinus.disabled = quantity === 1;
    qtyPlus.disabled = quantity === maxQuantity;
    qtyPlus.title = qtyPlus.disabled ? "Quantité maximale disponible" : "";
  }

  qtyMinus.addEventListener("click", () => setQuantity(quantity - 1));
  qtyPlus.addEventListener("click", () => setQuantity(quantity + 1));
  setQuantity(1);

  // Ajout au panier avec la quantité choisie (plafonnée au stock par addToCart).
  document.getElementById("addToCart").addEventListener("click", () => {
    showCartToast(addToCartMessage(product, quantity, addToCart(product, quantity)));
  });
}

/* ---------- Galerie produit (colonne image de la fiche) ----------
   Pilotée par data/products.js : gallery [{ src, thumb, alt }], video, videoPoster.
   - gallery vide : l'image principale du produit (imageUrl / image) est utilisée.
   - Miniatures (rangée horizontale sous l'image principale) : une seule
     tabulation pour la rangée, puis flèches ↑ ↓ ← →, Début / Fin.
   - ← → sur l'image principale : photo précédente / suivante.
   - Zoom : visionneuse plein écran (← →, Échap pour fermer).
   - Vidéo : lecteur créé seulement à l'ouverture de l'onglet « Vidéo », lecture au clic. */

const GALLERY_STAGE_SIZES = "(max-width: 900px) 100vw, 640px";
const GALLERY_THUMB_SIZES = "90px"; // => version 600 px du srcset
const GALLERY_ZOOM_SIZES = "92vw";
const FAVORITES_KEY = "novamarket-favoris";
const SWIPE_DISTANCE = 40;

const GALLERY_ICONS = {
  heart: '<path d="M12 20s-7.2-4.4-9-8.9C1.8 7.9 3.8 4.5 7.2 4.5c2 0 3.4 1.1 4.8 2.9 1.4-1.8 2.8-2.9 4.8-2.9 3.4 0 5.4 3.4 4.2 6.6C19.2 15.6 12 20 12 20Z"/>',
  zoom: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5M10.5 7.8v5.4M7.8 10.5h5.4"/>',
  prev: '<path d="m15 5-7 7 7 7"/>',
  next: '<path d="m9 5 7 7-7 7"/>',
  up: '<path d="m5 15 7-7 7 7"/>',
  down: '<path d="m5 9 7 7 7-7"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  photo: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-9 8"/>',
  play: '<path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.4-6.5a1 1 0 0 0 0-1.8L9.5 4.6A1 1 0 0 0 8 5.5Z" fill="currentColor" stroke="none"/>',
  // Services de la fiche produit (même trait que les icônes de la galerie)
  truck: '<path d="M2.5 6.5h11.5v9.5H2.5z"/><path d="M14 9.5h3.7l3.3 3.4V16H14"/><circle cx="6.5" cy="17.5" r="1.8" fill="#fff"/><circle cx="17" cy="17.5" r="1.8" fill="#fff"/>',
  headset: '<path d="M4.5 13.5V12a7.5 7.5 0 0 1 15 0v1.5"/><rect x="3.5" y="13" width="4" height="6" rx="1.6"/><rect x="16.5" y="13" width="4" height="6" rx="1.6"/><path d="M18.5 19c0 1.5-1.8 2.2-4.5 2.2h-1.5"/>',
  shieldCheck: '<path d="M12 3 5 5.8v5.3c0 4.3 2.9 8.2 7 9.4 4.1-1.2 7-5.1 7-9.4V5.8Z"/><path d="m9 12 2.2 2.2L15.3 10"/>'
};

function iconHTML(name, size = 20) {
  return `<svg class="pg-icon" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${GALLERY_ICONS[name]}</svg>`;
}

// Chemin local ou URL http(s) ; toute autre valeur ("javascript:", "data:"...) est ignorée.
function mediaSource(value) {
  return typeof value === "string" && (isExternalImageUrl(value) || isLocalImagePath(value)) ? value.trim() : "";
}

// Élément de gallery -> { alt, stage, thumb } (stage / thumb sont compatibles avec productImageHTML).
// Formats acceptés : { src, thumb, alt }, un simple chemin / URL, ou l'ancien format
// { image, srcset, imageUrl, imageUrlSrcset, alt }. Renvoie null si aucune source n'est utilisable.
function galleryPhoto(entry, index) {
  const data = typeof entry === "string" ? { src: entry } : (entry && typeof entry === "object" ? entry : {});
  const alt = typeof data.alt === "string" && data.alt.trim() ? data.alt.trim() : `${product.name}, vue ${index + 1}`;
  const src = mediaSource(data.src);
  const thumb = mediaSource(data.thumb);

  let stage;
  let small;
  if (src || thumb) {
    const big = src || thumb;
    const light = thumb || src;
    // Convention du projet : thumb = version 600 px, src = version 1200 px.
    // Les espaces sont encodées : dans un srcset, une espace sépare l'URL de sa largeur.
    const inSrcset = path => path.replace(/ /g, "%20");
    const srcset = light !== big && isExternalImageUrl(light) === isExternalImageUrl(big) ? `${inSrcset(light)} 600w, ${inSrcset(big)} 1200w` : undefined;
    stage = isExternalImageUrl(big)
      ? { imageUrl: big, imageUrlSrcset: srcset, image: isLocalImagePath(light) ? light : undefined }
      : { image: big, srcset };
    small = isExternalImageUrl(light)
      ? { imageUrl: light, image: isLocalImagePath(big) ? big : undefined }
      : { image: light };
  } else {
    stage = { imageUrl: data.imageUrl, imageUrlSrcset: data.imageUrlSrcset, image: data.image, srcset: data.srcset };
    small = stage;
  }
  stage.name = alt;
  small.name = alt;
  return productImageSources(stage).length ? { alt, stage, thumb: small } : null;
}

// Photos à afficher : celles de gallery, sinon l'image principale (ou l'emplacement « Photo à venir »).
function galleryPhotos() {
  const photos = (Array.isArray(product.gallery) ? product.gallery : []).map(galleryPhoto).filter(Boolean);
  return photos.length ? photos : [{ alt: product.name, stage: product, thumb: product }];
}

function galleryHTML(photos, video) {
  const multi = photos.length > 1;
  const name = escapeHTML(product.name);

  const thumbs = multi ? `
      <div class="pg-thumbs-wrap">
        <button type="button" class="pg-scroll pg-scroll-up" aria-label="Faire défiler les miniatures vers le haut" hidden>${iconHTML("up", 18)}</button>
        <div class="pg-thumbs" role="group" aria-label="Miniatures des photos de ${name}">
          ${photos.map((photo, i) => `
          <button type="button" class="pg-thumb" data-index="${i}" aria-label="${escapeHTML(`Photo ${i + 1} sur ${photos.length} : ${photo.alt}`)}" tabindex="${i === 0 ? 0 : -1}">
            ${productImageHTML(photo.thumb, { sizes: GALLERY_THUMB_SIZES, alt: "" })}
          </button>`).join("")}
        </div>
        <button type="button" class="pg-scroll pg-scroll-down" aria-label="Faire défiler les miniatures vers le bas" hidden>${iconHTML("down", 18)}</button>
      </div>` : "";

  const tabs = video ? `
      <div class="pg-tabs" role="tablist" aria-label="Type de média">
        <button type="button" role="tab" class="pg-tab" id="pgTabPhotos" aria-controls="pgStage" aria-selected="true">${iconHTML("photo", 18)}<span>Photos</span></button>
        <button type="button" role="tab" class="pg-tab" id="pgTabVideo" aria-controls="pgStage" aria-selected="false" tabindex="-1">${iconHTML("play", 16)}<span>Vidéo</span></button>
      </div>` : "";

  return `
    <div class="pg${multi ? " has-thumbs" : ""}" id="productGallery">
      <div class="pg-stage" id="pgStage"${video ? ' role="tabpanel" aria-labelledby="pgTabPhotos"' : ""}>
        <div class="pg-media" id="pgMedia"></div>
        <div class="pg-badges">${badgesHTML(product)}</div>
        <div class="pg-tools">
          <button type="button" class="pg-btn pg-fav" aria-pressed="false" aria-label="Ajouter aux favoris">${iconHTML("heart")}</button>
          <button type="button" class="pg-btn pg-zoom" aria-haspopup="dialog" aria-label="Agrandir la photo">${iconHTML("zoom")}</button>
        </div>
        ${multi ? `
        <button type="button" class="pg-btn pg-arrow pg-prev" aria-label="Photo précédente">${iconHTML("prev")}</button>
        <button type="button" class="pg-btn pg-arrow pg-next" aria-label="Photo suivante">${iconHTML("next")}</button>
        <span class="pg-counter" aria-hidden="true"></span>` : ""}
      </div>
      ${thumbs}
      ${tabs}
      <p class="sr-only" id="pgStatus" aria-live="polite"></p>
    </div>`;
}

function readFavorites() {
  try {
    const list = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function initGallery(photos, video) {
  const root = document.getElementById("productGallery");
  const stage = document.getElementById("pgStage");
  const mediaEl = document.getElementById("pgMedia");
  const status = document.getElementById("pgStatus");
  const counter = root.querySelector(".pg-counter");
  const prevBtn = root.querySelector(".pg-prev");
  const nextBtn = root.querySelector(".pg-next");
  const zoomBtn = root.querySelector(".pg-zoom");
  const favBtn = root.querySelector(".pg-fav");
  const thumbsEl = root.querySelector(".pg-thumbs");
  const thumbs = thumbsEl ? [...thumbsEl.querySelectorAll(".pg-thumb")] : [];
  const scrollUp = root.querySelector(".pg-scroll-up");
  const scrollDown = root.querySelector(".pg-scroll-down");
  const tabPhotos = document.getElementById("pgTabPhotos");
  const tabVideo = document.getElementById("pgTabVideo");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const count = photos.length;
  const hasImage = photo => productImageSources(photo.stage).length > 0;
  const scrollBehavior = () => (reduceMotion.matches ? "auto" : "smooth");

  let index = 0;
  let mode = "photos";
  let lightbox = null;

  /* --- Photos --- */

  // Après une action de l'utilisateur, les photos voisines sont préchargées :
  // le passage à la suivante / précédente est alors immédiat (rien n'est préchargé à l'ouverture de la page).
  const preloaded = new Set();
  function preload(i) {
    const photo = photos[(i + count) % count];
    const [source] = productImageSources(photo.stage);
    if (!source || preloaded.has(photo)) return;
    preloaded.add(photo);
    const img = new Image();
    if (source.external) img.referrerPolicy = "no-referrer";
    if (source.srcset) {
      img.sizes = GALLERY_STAGE_SIZES;
      img.srcset = source.srcset;
    }
    img.src = source.src;
  }

  function showPhoto(next, { announce = true } = {}) {
    const prevHadFocus = document.activeElement === prevBtn;
    index = (next + count) % count;
    const photo = photos[index];

    mode = "photos";
    selectTab("photos");
    stage.classList.remove("is-video");
    mediaEl.innerHTML = productImageHTML(photo.stage, { priority: true, sizes: GALLERY_STAGE_SIZES, alt: photo.alt });
    zoomBtn.hidden = !hasImage(photo);

    if (count > 1) {
      counter.textContent = `${index + 1} / ${count}`;
      prevBtn.hidden = index === 0; // « précédent » seulement quand il y a une photo avant
      if (prevHadFocus && prevBtn.hidden) nextBtn.focus();
      thumbs.forEach((thumb, i) => {
        thumb.tabIndex = i === index ? 0 : -1;
        if (i === index) thumb.setAttribute("aria-current", "true");
        else thumb.removeAttribute("aria-current");
      });
      keepThumbVisible(thumbs[index]);
      if (announce) {
        status.textContent = `Photo ${index + 1} sur ${count} : ${photo.alt}`;
        preload(index + 1);
        preload(index - 1);
      }
    }
    if (lightbox && !lightbox.hidden) renderLightbox();
  }

  /* --- Miniatures --- */

  const isVertical = () => thumbsEl && getComputedStyle(thumbsEl).flexDirection.startsWith("column");

  // Fait défiler la rangée (et seulement elle, pas la page) pour garder la miniature active visible.
  function keepThumbVisible(thumb) {
    const [pos, size, scroll, view] = isVertical()
      ? ["offsetTop", "offsetHeight", "scrollTop", "clientHeight"]
      : ["offsetLeft", "offsetWidth", "scrollLeft", "clientWidth"];
    const start = thumb[pos];
    const end = start + thumb[size];
    let target = null;
    if (start < thumbsEl[scroll]) target = start;
    else if (end > thumbsEl[scroll] + thumbsEl[view]) target = end - thumbsEl[view];
    if (target !== null) {
      thumbsEl.scrollTo({ [isVertical() ? "top" : "left"]: target, behavior: scrollBehavior() });
    }
  }

  // Flèches haut / bas : visibles seulement si la colonne verticale déborde.
  function updateScrollButtons() {
    const overflow = isVertical() && thumbsEl.scrollHeight > thumbsEl.clientHeight + 1;
    scrollUp.hidden = scrollDown.hidden = !overflow;
    if (!overflow) return;
    const atTop = thumbsEl.scrollTop <= 0;
    const atBottom = thumbsEl.scrollTop + thumbsEl.clientHeight >= thumbsEl.scrollHeight - 1;
    // Une flèche qui disparaît ne doit pas faire perdre le focus clavier.
    if (atTop && document.activeElement === scrollUp) scrollDown.focus();
    if (atBottom && document.activeElement === scrollDown) scrollUp.focus();
    scrollUp.setAttribute("aria-disabled", String(atTop));
    scrollDown.setAttribute("aria-disabled", String(atBottom));
  }

  if (thumbsEl) {
    thumbsEl.addEventListener("click", event => {
      const thumb = event.target.closest(".pg-thumb");
      if (thumb) showPhoto(Number(thumb.dataset.index));
    });

    thumbsEl.addEventListener("keydown", event => {
      const current = thumbs.indexOf(document.activeElement);
      const moves = { ArrowUp: current - 1, ArrowLeft: current - 1, ArrowDown: current + 1, ArrowRight: current + 1, Home: 0, End: count - 1 };
      if (current === -1 || !Object.hasOwn(moves, event.key)) return;
      event.preventDefault();
      showPhoto(moves[event.key]);
      thumbs[index].focus({ preventScroll: true });
    });

    [scrollUp, scrollDown].forEach(button => button.addEventListener("click", () => {
      if (button.getAttribute("aria-disabled") === "true") return;
      const step = thumbsEl.clientHeight * 0.75 * (button === scrollUp ? -1 : 1);
      thumbsEl.scrollBy({ top: step, behavior: scrollBehavior() });
    }));

    thumbsEl.addEventListener("scroll", updateScrollButtons, { passive: true });
    if ("ResizeObserver" in window) new ResizeObserver(updateScrollButtons).observe(thumbsEl);
    else window.addEventListener("resize", updateScrollButtons);
  }

  /* --- Image principale : flèches, clavier, balayage, clic = zoom --- */

  if (count > 1) {
    prevBtn.addEventListener("click", () => showPhoto(index - 1));
    nextBtn.addEventListener("click", () => showPhoto(index + 1));

    stage.addEventListener("keydown", event => {
      if (mode !== "photos" || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      showPhoto(index + (event.key === "ArrowRight" ? 1 : -1));
    });

    let touchStartX = null;
    mediaEl.addEventListener("pointerdown", event => {
      touchStartX = event.pointerType === "touch" && mode === "photos" ? event.clientX : null;
    });
    mediaEl.addEventListener("pointercancel", () => { touchStartX = null; });
    mediaEl.addEventListener("pointerup", event => {
      if (touchStartX === null) return;
      const distance = event.clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(distance) > SWIPE_DISTANCE) showPhoto(index + (distance < 0 ? 1 : -1));
    });
  }

  mediaEl.addEventListener("click", event => {
    if (mode === "photos" && event.target instanceof HTMLImageElement) openLightbox();
  });
  zoomBtn.addEventListener("click", openLightbox);

  /* --- Favori (mémorisé sur cet appareil uniquement) --- */

  const productKey = String(product.id);
  function renderFavorite() {
    const active = readFavorites().includes(productKey);
    favBtn.setAttribute("aria-pressed", String(active));
    favBtn.title = active ? "Retirer des favoris" : "Ajouter aux favoris";
  }
  favBtn.addEventListener("click", () => {
    const active = favBtn.getAttribute("aria-pressed") !== "true";
    const list = readFavorites().filter(id => id !== productKey);
    if (active) list.push(productKey);
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
    } catch {
      // Stockage indisponible (navigation privée...) : l'état reste valable pour cette page.
    }
    favBtn.setAttribute("aria-pressed", String(active));
    favBtn.title = active ? "Retirer des favoris" : "Ajouter aux favoris";
    status.textContent = active ? "Ajouté à vos favoris sur cet appareil." : "Retiré de vos favoris.";
  });

  /* --- Onglets Photos / Vidéo (uniquement si une vidéo est définie) --- */

  function selectTab(name) {
    if (!tabPhotos) return;
    const isVideo = name === "video";
    tabPhotos.setAttribute("aria-selected", String(!isVideo));
    tabVideo.setAttribute("aria-selected", String(isVideo));
    tabPhotos.tabIndex = isVideo ? -1 : 0;
    tabVideo.tabIndex = isVideo ? 0 : -1;
    stage.setAttribute("aria-labelledby", isVideo ? "pgTabVideo" : "pgTabPhotos");
  }

  function showVideo() {
    mode = "video";
    selectTab("video");
    stage.classList.add("is-video");
    const [firstImage] = productImageSources(photos[0].thumb);
    const poster = mediaSource(product.videoPoster) || (firstImage ? firstImage.src : "");
    mediaEl.innerHTML = `
      <video controls playsinline preload="none"${poster ? ` poster="${escapeHTML(poster)}"` : ""} aria-label="Vidéo de démonstration : ${escapeHTML(product.name)}">
        <source src="${escapeHTML(video)}">
        Votre navigateur ne peut pas lire cette vidéo.
      </video>
      <button type="button" class="pg-play" aria-label="Lire la vidéo">${iconHTML("play", 28)}</button>`;

    const videoEl = mediaEl.querySelector("video");
    const playBtn = mediaEl.querySelector(".pg-play");
    playBtn.addEventListener("click", () => {
      videoEl.play().catch(() => { playBtn.hidden = false; });
      videoEl.focus(); // le bouton disparaît : le focus passe aux contrôles de la vidéo
    });
    videoEl.addEventListener("play", () => { playBtn.hidden = true; });
    // Fichier introuvable ou format non pris en charge : message neutre au lieu d'un lecteur vide.
    videoEl.querySelector("source").addEventListener("error", () => {
      mediaEl.innerHTML = `
        <div class="photo-placeholder" role="img" aria-label="Vidéo indisponible">
          <span class="brand-mark" aria-hidden="true">N</span>
          <span aria-hidden="true">Vidéo indisponible</span>
        </div>`;
    });
  }

  if (tabPhotos) {
    tabPhotos.addEventListener("click", () => { if (mode !== "photos") showPhoto(index, { announce: false }); });
    tabVideo.addEventListener("click", () => { if (mode !== "video") showVideo(); });
    root.querySelector(".pg-tabs").addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const target = event.key === "Home" ? tabPhotos
        : event.key === "End" ? tabVideo
        : document.activeElement === tabPhotos ? tabVideo : tabPhotos;
      target.focus();
      target.click();
    });
  }

  /* --- Visionneuse (zoom) --- */

  function buildLightbox() {
    lightbox = document.createElement("div");
    lightbox.className = "pg-lightbox";
    lightbox.hidden = true;
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", `Photos agrandies : ${product.name}`);
    lightbox.innerHTML = `
      <div class="pg-lb-figure"></div>
      <p class="pg-lb-caption"><span class="pg-lb-count"></span><span class="pg-lb-alt"></span></p>
      <button type="button" class="pg-lb-btn pg-lb-close" aria-label="Fermer l'agrandissement">${iconHTML("close", 22)}</button>
      ${count > 1 ? `
      <button type="button" class="pg-lb-btn pg-lb-prev" aria-label="Photo précédente">${iconHTML("prev", 24)}</button>
      <button type="button" class="pg-lb-btn pg-lb-next" aria-label="Photo suivante">${iconHTML("next", 24)}</button>` : ""}`;
    document.body.appendChild(lightbox);

    lightbox.addEventListener("click", event => {
      if (event.target === lightbox || event.target.closest(".pg-lb-close")) closeLightbox();
      else if (event.target.closest(".pg-lb-prev")) showPhoto(index - 1);
      else if (event.target.closest(".pg-lb-next")) showPhoto(index + 1);
    });

    lightbox.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeLightbox();
      } else if (count > 1 && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        event.preventDefault();
        showPhoto(index + (event.key === "ArrowRight" ? 1 : -1));
      } else if (event.key === "Tab") {
        // Le focus clavier reste dans la visionneuse.
        const focusable = [...lightbox.querySelectorAll("button")];
        const first = focusable[0];
        const lastButton = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          lastButton.focus();
        } else if (!event.shiftKey && document.activeElement === lastButton) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  function renderLightbox() {
    const photo = photos[index];
    lightbox.querySelector(".pg-lb-figure").innerHTML = productImageHTML(photo.stage, { priority: true, sizes: GALLERY_ZOOM_SIZES, alt: photo.alt });
    lightbox.querySelector(".pg-lb-count").textContent = count > 1 ? `${index + 1} / ${count}` : "";
    lightbox.querySelector(".pg-lb-alt").textContent = photo.alt;
  }

  function openLightbox() {
    if (!hasImage(photos[index])) return;
    if (!lightbox) buildLightbox();
    renderLightbox();
    // Bloque le défilement de la page derrière (en compensant la barre de défilement).
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.classList.add("pg-locked");
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    lightbox.hidden = false;
    lightbox.querySelector(".pg-lb-close").focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.documentElement.classList.remove("pg-locked");
    document.body.style.paddingRight = "";
    zoomBtn.focus();
  }

  showPhoto(0, { announce: false });
  renderFavorite();
  if (thumbsEl) updateScrollButtons();
}

// Produits similaires : d'abord la même catégorie, complétés par d'autres produits si besoin.
function renderRelated() {
  const sameCategory = visibleProducts.filter(p => p.category === product.category && p.id !== product.id);
  const others = visibleProducts.filter(p => p.category !== product.category);
  const related = [...sameCategory, ...others].slice(0, RELATED_LIMIT);

  relatedGrid.innerHTML = related.map(productCardHTML).join("");
  relatedLink.href = categoryUrl(product.category);
  relatedLink.textContent = `Voir la catégorie ${categoryOf(product).name} →`;
  relatedSection.hidden = related.length === 0;
}

if (product) {
  renderProduct();
  renderRelated();
} else {
  renderNotFound();
}
