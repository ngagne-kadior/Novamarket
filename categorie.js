// Page catégorie dynamique : categorie.html?cat=bien-etre (id de la catégorie)
// (le nom est aussi accepté, sans tenir compte des majuscules ni des accents : ?cat=Électroménager).
// Le paramètre "tri" est validé par parseSort() (script.js).

const categoryHero = document.getElementById("categoryHero");
const categoryHeroImage = document.getElementById("categoryHeroImage");
const categoryBreadcrumb = document.getElementById("categoryBreadcrumb");
const categoryEyebrow = document.getElementById("categoryEyebrow");
const categoryTitle = document.getElementById("categoryTitle");
const categoryDescription = document.getElementById("categoryDescription");
const categoryIntro = document.getElementById("categoryIntro");
const categoryActions = document.getElementById("categoryActions");
const categoryChips = document.getElementById("categoryChips");
const categoryToolbar = document.getElementById("categoryToolbar");
const categoryCount = document.getElementById("categoryCount");
const categorySort = document.getElementById("categorySort");
const categoryGrid = document.getElementById("categoryGrid");
const categoryEmpty = document.getElementById("categoryEmpty");
const categoryContactWhatsapp = document.getElementById("categoryContactWhatsapp");

const params = new URLSearchParams(window.location.search);
const category = findCategory(params.get("cat"));
let sort = parseSort(params.get("tri"));

function renderChips(activeId) {
  categoryChips.innerHTML = CATEGORIES.map(item => `
    <a class="category-option${item.id === activeId ? " active" : ""}" href="${categoryUrl(item.id)}"${item.id === activeId ? ' aria-current="page"' : ""}>
      <span>${escapeHTML(item.name)}</span>
      <small>${productsInCategory(item.id).length}</small>
    </a>
  `).join("") + `<a class="category-option" href="produits.html"><span>Tous les produits</span></a>`;
}

// Bannière : photo d'ambiance de la catégorie, ou emplacement neutre si aucune image pertinente.
function renderHeroImage() {
  if (category.image) {
    categoryHeroImage.style.backgroundImage = `url("${category.image}")`;
    if (category.imagePosition) categoryHeroImage.style.backgroundPosition = category.imagePosition;
  } else {
    categoryHeroImage.classList.add("is-placeholder");
    categoryHeroImage.innerHTML = `<span class="brand-mark" aria-hidden="true">N</span>`;
  }
}

// Menu principal : la catégorie affichée remplace « Catégories » comme lien actif.
function markNavCategory() {
  const navLink = document.querySelector(`.main-nav [data-nav-category="${category.id}"]`);
  if (!navLink) return;
  document.querySelectorAll(".main-nav a.active").forEach(link => link.classList.remove("active"));
  navLink.classList.add("active");
  navLink.setAttribute("aria-current", "page");
}

function renderNotFound() {
  document.title = "Catégorie introuvable — NovaMarket";
  categoryHero.classList.add("is-empty");
  categoryBreadcrumb.innerHTML = breadcrumbHTML([HOME_CRUMB, { label: "Catégorie introuvable" }]);
  categoryEyebrow.textContent = "OUPS";
  categoryTitle.textContent = "Catégorie introuvable.";
  categoryDescription.textContent = "Cette catégorie n'existe pas. Choisissez l'une de nos catégories ci-dessous.";
  categoryActions.innerHTML = `<a class="btn btn-primary" href="produits.html">Voir tous les produits <span>→</span></a>`;
  categoryToolbar.hidden = true;
  renderChips(null);
}

function renderGrid() {
  const list = sortProducts(productsInCategory(category.id), sort);
  categoryGrid.innerHTML = list.map(productCardHTML).join("");
  categoryEmpty.hidden = list.length > 0;
  categoryToolbar.hidden = list.length === 0; // catégorie vide : ni compteur « 0 produit » ni tri
  categoryCount.textContent = `${list.length} produit${list.length > 1 ? "s" : ""} dans « ${category.name} »`;

  const next = new URLSearchParams({ cat: category.id });
  if (sort !== DEFAULT_SORT) next.set("tri", sort);
  history.replaceState(null, "", `?${next.toString()}`);
}

function renderCategory() {
  const index = CATEGORIES.indexOf(category) + 1;

  document.title = `${category.name} — NovaMarket`;
  document.querySelector('meta[name="description"]').setAttribute("content", `${category.name} — ${category.description}`);

  renderHeroImage();
  categoryBreadcrumb.innerHTML = breadcrumbHTML([HOME_CRUMB, { label: category.name }]);
  categoryEyebrow.textContent = `CATÉGORIE ${String(index).padStart(2, "0")} • ${category.tagline.toUpperCase()}`;
  categoryTitle.textContent = category.name;
  categoryDescription.textContent = category.description;
  if (category.intro) {
    categoryIntro.textContent = category.intro;
    categoryIntro.hidden = false;
  }
  // Catégorie sans produit : rien à commander, le bandeau annonce simplement l'arrivée des produits.
  const isEmpty = productsInCategory(category.id).length === 0;
  categoryActions.innerHTML = isEmpty
    ? `<p class="category-soon">${escapeHTML(category.comingSoon || COMING_SOON)}</p>`
    : `
    <a class="btn btn-primary" href="#categoryProducts">Voir les produits <span aria-hidden="true">→</span></a>
    ${whatsappButtonHTML(categoryWhatsappLink(category), "btn btn-light", "Commander sur WhatsApp")}
  `;
  applyWhatsappLink(categoryContactWhatsapp, isEmpty ? whatsappLink() : categoryWhatsappLink(category));

  renderChips(category.id);
  markNavCategory();
  categorySort.value = sort;
  categorySort.addEventListener("change", () => {
    sort = parseSort(categorySort.value);
    renderGrid();
  });
  renderGrid();
}

if (category) {
  renderCategory();
} else {
  renderNotFound();
}
