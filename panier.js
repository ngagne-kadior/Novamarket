// Page panier : panier.html
// Le panier enregistré (readCart / writeCart, dans script.js) ne contient que des id et des
// quantités : le nom, le prix et le stock sont relus ici dans data/products.js à chaque affichage.
// Seuls les articles commandables (visibles et non épuisés) entrent dans le total et le message.
// Le message WhatsApp est une DEMANDE de commande : ni vente, ni paiement confirmés.

const cartList = document.getElementById("cartList");
const cartListTitle = document.getElementById("cartListTitle");
const cartNotice = document.getElementById("cartNotice");
const cartEmpty = document.getElementById("cartEmpty");
const cartEmptyLink = document.getElementById("cartEmptyLink");
const cartSummaryBox = document.getElementById("cartSummary");
const cartTotal = document.getElementById("cartTotal");
const cartTotalNote = document.getElementById("cartTotalNote");
const cartDelivery = document.getElementById("cartDelivery");
const cartForm = document.getElementById("cartForm");
const cartName = document.getElementById("cartName");
const cartPlace = document.getElementById("cartPlace");
const cartDetails = document.getElementById("cartDetails");
const cartSend = document.getElementById("cartSend");
const cartSendNote = document.getElementById("cartSendNote");
const cartClear = document.getElementById("cartClear");

const CART_SEND_LABEL = "Envoyer ma demande sur WhatsApp";
const DELIVERY_CART_NOTE = DELIVERY_INFO.cartNote || DELIVERY_INFO.feesNote;
let flashMessage = ""; // information ponctuelle (article retiré, quantité ajustée, message ouvert...)

/* ---------- Lignes du panier ---------- */

// status : "ok" (commandable), "soldout" (épuisé) ou "unavailable" (masqué ou retiré du catalogue).
function cartLines() {
  return readCart().map(item => {
    const product = findProduct(item.id);
    if (!product) {
      const known = products.find(entry => String(entry.id) === String(item.id));
      return { id: item.id, qty: item.qty, status: "unavailable", name: known ? known.name : "Article retiré du catalogue" };
    }
    if (isSoldOut(product)) return { id: item.id, qty: item.qty, status: "soldout", name: product.name, product };
    const max = maxOrderQuantity(product);
    return { id: item.id, qty: Math.min(item.qty, max), storedQty: item.qty, max, status: "ok", name: product.name, product };
  });
}

function cartTotals(lines) {
  const orderable = lines.filter(line => line.status === "ok");
  const priced = orderable.filter(line => hasPrice(line.product));
  return {
    orderable,
    unpriced: orderable.filter(line => !hasPrice(line.product)),
    total: priced.reduce((sum, line) => sum + line.product.price * line.qty, 0),
    hasPricedLine: priced.length > 0
  };
}

/* ---------- Message WhatsApp ---------- */

// Texte saisi : espaces et retours à la ligne réduits, longueur limitée.
function cleanText(value, max) {
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function cartMessage(lines) {
  const { orderable, unpriced, total, hasPricedLine } = cartTotals(lines);
  const items = orderable.map((line, index) => {
    const product = line.product;
    const detail = hasPrice(product)
      ? `${line.qty} × ${formatPrice(product.price)} = ${formatPrice(product.price * line.qty)}`
      : `${line.qty} × prix à confirmer`;
    return `${index + 1}. ${product.name}\n   ${detail}`;
  });
  const totalLine = !hasPricedLine
    ? "Total des articles : à confirmer (prix sur demande)"
    : unpriced.length
      ? `Total des articles (hors articles à prix sur demande) : ${formatPrice(total)}`
      : `Total des articles : ${formatPrice(total)}`;
  const contact = [
    ["Nom", cleanText(cartName.value, 60)],
    ["Ville / quartier", cleanText(cartPlace.value, 80)],
    ["Précisions", cleanText(cartDetails.value, 300)]
  ].filter(([, value]) => value).map(([label, value]) => `${label} : ${value}`);

  return [
    "Bonjour NovaMarket, je souhaite passer une demande de commande :",
    "",
    ...items,
    "",
    totalLine,
    `${DELIVERY_CART_NOTE}.`,
    ...(contact.length ? ["", ...contact] : []),
    "",
    unpriced.length
      ? "Merci de me communiquer les prix manquants et de me confirmer la disponibilité et le montant total avant validation."
      : "Merci de me confirmer la disponibilité et le montant total avant validation."
  ].join("\n");
}

// Bouton d'envoi : actif seulement si le numéro est configuré ET qu'au moins un article est commandable.
function updateSendButton(lines) {
  const { orderable } = cartTotals(lines);
  const url = orderable.length ? whatsappUrl(cartMessage(lines)) : "";
  cartSend.classList.toggle("whatsapp-off", !url);
  if (url) {
    cartSend.href = url;
    cartSend.removeAttribute("aria-disabled");
    cartSend.textContent = CART_SEND_LABEL;
    cartSendNote.textContent = "WhatsApp s'ouvre avec votre demande pré-remplie : il vous reste à envoyer le message.";
    return;
  }
  cartSend.removeAttribute("href");
  cartSend.setAttribute("aria-disabled", "true");
  cartSend.textContent = WHATSAPP_READY ? CART_SEND_LABEL : WHATSAPP_OFF_LABEL;
  cartSendNote.textContent = WHATSAPP_READY ? "Aucun article commandable dans votre panier." : WHATSAPP_OFF_NOTE;
}

/* ---------- Affichage ---------- */

function lineHTML(line) {
  const id = escapeHTML(line.id);
  const name = escapeHTML(line.name);

  if (line.status !== "ok") {
    const reason = line.status === "soldout"
      ? "Épuisé : cet article ne peut pas être commandé pour le moment."
      : "Cet article n'est plus disponible à la commande.";
    return `
      <article class="cart-item is-blocked">
        <div class="cart-item-media">${line.product ? productImageHTML(line.product, { sizes: "96px", alt: "" }) : photoPlaceholderHTML("")}</div>
        <div class="cart-item-info">
          <h3 class="cart-item-name">${name}</h3>
          <p class="cart-item-alert">${reason} Il ne sera pas inclus dans votre demande.</p>
        </div>
        <div class="cart-item-controls">
          <button type="button" class="cart-remove" data-action="remove" data-id="${id}" aria-label="Retirer ${name} du panier">Retirer</button>
        </div>
      </article>`;
  }

  const product = line.product;
  const priced = hasPrice(product);
  const atMax = line.qty >= line.max;
  return `
    <article class="cart-item">
      <a class="cart-item-media" href="${productUrl(product)}" tabindex="-1" aria-hidden="true">${productImageHTML(product, { sizes: "96px", alt: "" })}</a>
      <div class="cart-item-info">
        <h3 class="cart-item-name"><a href="${productUrl(product)}">${name}</a></h3>
        <p class="cart-item-unit">${priced ? `${formatPrice(product.price)} l'unité` : `<span class="price-on-request">${PRICE_ON_REQUEST}</span>`}</p>
        ${atMax ? `<p class="cart-item-limit">Quantité maximale disponible : ${line.max}</p>` : ""}
      </div>
      <div class="cart-item-controls">
        <div class="quantity cart-qty" role="group" aria-label="Quantité de ${name}">
          <button type="button" data-action="dec" data-id="${id}" aria-label="Diminuer la quantité de ${name}"${line.qty <= 1 ? " disabled" : ""}>−</button>
          <output>${line.qty}</output>
          <button type="button" data-action="inc" data-id="${id}" aria-label="Augmenter la quantité de ${name}"${atMax ? " disabled" : ""}>+</button>
        </div>
        <p class="cart-item-subtotal">${priced ? formatPrice(product.price * line.qty) : "Prix sur demande"}</p>
        <button type="button" class="cart-remove" data-action="remove" data-id="${id}" aria-label="Retirer ${name} du panier">Retirer</button>
      </div>
    </article>`;
}

function showNotices(blockedCount) {
  const messages = [flashMessage];
  if (blockedCount) {
    messages.push(`${blockedCount > 1 ? `${blockedCount} articles ne peuvent` : "Un article ne peut"} pas être commandé${blockedCount > 1 ? "s" : ""} (épuisé ou plus disponible) : ${blockedCount > 1 ? "ils ne seront pas inclus" : "il ne sera pas inclus"} dans votre demande.`);
  }
  const text = messages.filter(Boolean).join(" ");
  cartNotice.textContent = text;
  cartNotice.hidden = !text;
}

// Le focus clavier reste sur le bouton utilisé (ou sur un voisin s'il a disparu).
function rememberFocus() {
  const element = document.activeElement;
  return element && cartList.contains(element) && element.dataset.action ? { action: element.dataset.action, id: element.dataset.id } : null;
}

function restoreFocus(previous) {
  if (!previous) return;
  const controls = [...cartList.querySelectorAll("[data-action]")];
  const target = controls.find(el => el.dataset.action === previous.action && el.dataset.id === previous.id && !el.disabled)
    || controls.find(el => el.dataset.id === previous.id && !el.disabled)
    || controls.find(el => el.dataset.action === "remove");
  (target || (cartEmpty.hidden ? cartListTitle : cartEmptyLink)).focus();
}

function render() {
  const previousFocus = rememberFocus();
  const lines = cartLines();

  // Quantité enregistrée supérieure au stock actuel : ajustée et signalée.
  const adjusted = lines.filter(line => line.status === "ok" && line.storedQty > line.qty);
  if (adjusted.length) {
    writeCart(readCart().map(item => {
      const line = adjusted.find(entry => String(entry.id) === String(item.id));
      return line ? { id: item.id, qty: line.qty } : item;
    }));
    flashMessage = adjusted.map(line => `La quantité de « ${line.name} » a été ajustée à ${line.qty} (maximum disponible).`).join(" ");
  }

  cartList.innerHTML = lines.map(lineHTML).join("");
  cartEmpty.hidden = lines.length > 0;
  cartSummaryBox.hidden = lines.length === 0;
  showNotices(lines.filter(line => line.status !== "ok").length);

  const { unpriced, total, hasPricedLine } = cartTotals(lines);
  cartTotal.textContent = hasPricedLine ? formatPrice(total) : "À confirmer";
  cartTotalNote.hidden = unpriced.length === 0;
  cartTotalNote.textContent = unpriced.length
    ? `${unpriced.length > 1 ? `${unpriced.length} articles` : "1 article"} à prix sur demande, non inclus dans ce total : le prix vous sera communiqué sur WhatsApp.`
    : "";
  cartDelivery.textContent = `${DELIVERY_CART_NOTE}.`;

  updateSendButton(lines);
  restoreFocus(previousFocus);
}

/* ---------- Actions ---------- */

cartList.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button || button.disabled) return;
  const items = readCart();
  const index = items.findIndex(item => String(item.id) === button.dataset.id);
  if (index === -1) return render();

  const line = cartLines().find(entry => String(entry.id) === button.dataset.id);
  if (button.dataset.action === "remove") {
    items.splice(index, 1);
    flashMessage = `« ${line ? line.name : "Article"} » a été retiré du panier.`;
  } else {
    const product = orderableProduct(items[index].id);
    if (!product) return render();
    const max = maxOrderQuantity(product);
    const next = Math.min(items[index].qty, max) + (button.dataset.action === "inc" ? 1 : -1);
    items[index].qty = Math.max(1, Math.min(max, next));
    flashMessage = "";
  }
  writeCart(items);
  render();
});

// Nom, quartier, précisions : utilisés pour le message uniquement, jamais enregistrés.
cartForm.addEventListener("input", () => updateSendButton(cartLines()));
cartForm.addEventListener("submit", event => event.preventDefault());

cartSend.addEventListener("click", event => {
  if (!cartSend.hasAttribute("href")) {
    event.preventDefault();
    return;
  }
  // Le site ne peut pas savoir si le message a vraiment été envoyé : le panier est conservé.
  flashMessage = "WhatsApp s'est ouvert avec votre demande. Envoyez le message pour la transmettre à NovaMarket. Votre panier est conservé : vous pourrez le vider une fois votre commande confirmée.";
  showNotices(cartLines().filter(line => line.status !== "ok").length);
});

cartClear.addEventListener("click", () => {
  if (!window.confirm("Vider le panier ? Tous les articles seront retirés.")) return;
  writeCart([]);
  flashMessage = "";
  render();
  cartEmptyLink.focus();
});

// Panier modifié dans un autre onglet : la page se met à jour.
window.addEventListener("storage", event => {
  if (event.key === CART_KEY) render();
});

if (!CART_PERSISTENT) {
  flashMessage = "Votre navigateur ne permet pas d'enregistrer le panier : il sera perdu si vous quittez cette page.";
}
render();
