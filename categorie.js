// Page catégorie dynamique : categorie.html?cat=Cuisine
// (insensible aux majuscules et aux accents : ?cat=electromenager fonctionne aussi).
// Le paramètre "tri" est validé par parseSort() (script.js).

const categoryHero = document.getElementById("categoryHero");
const categoryHeroImage = document.getElementById("categoryHeroImage");
const categoryBreadcrumb = document.getElementById("categoryBreadcrumb");
const categoryEyebrow = document.getElementById("categoryEyebrow");
const categoryTitle = document.getElementById("categoryTitle");
const categoryDescription = document.getElementById("categoryDescription");
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

function renderChips(activeName) {
  categoryChips.innerHTML = CATEGORIES.map(item => `
    <a class="category-option${item.name === activeName ? " active" : ""}" href="${categoryUrl(item.name)}"${item.name === activeName ? ' aria-current="page"' : ""}>
      <span>${escapeHTML(item.name)}</span>
      <small>${productsInCategory(item.name).length}</small>
    </a>
  `).join("") + `<a class="category-option" href="produits.html"><span>Tous les produits</span></a>`;
}

// Bannière : photo d'ambiance de la catégorie, ou emplacement neutre si aucune image pertinente.
function renderHeroImage() {
  if (category.image) {
    categoryHeroImage.style.backgroundImage = `url("${category.image}")`;
  } else {
    categoryHeroImage.classList.add("is-placeholder");
    categoryHeroImage.innerHTML = `<span class="brand-mark">N</span><span>Image à remplacer</span>`;
  }
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
  const list = sortProducts(productsInCategory(category.name), sort);
  categoryGrid.innerHTML = list.map(productCardHTML).join("");
  categoryEmpty.hidden = list.length > 0;
  categoryCount.textContent = `${list.length} produit${list.length > 1 ? "s" : ""} dans « ${category.name} »`;

  const next = new URLSearchParams({ cat: category.name });
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
  categoryActions.innerHTML = `
    <a class="btn btn-primary" href="#categoryProducts">Voir les produits <span aria-hidden="true">→</span></a>
    <a class="btn btn-light" href="${categoryWhatsappLink(category)}" target="_blank" rel="noopener">Commander sur WhatsApp</a>
  `;
  categoryContactWhatsapp.href = categoryWhatsappLink(category);

  renderChips(category.name);
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
