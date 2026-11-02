// Page produits (catalogue complet) : filtre par catégorie, recherche et tri.
// L'état est gardé dans l'URL (?cat=bien-etre&q=...&tri=...) pour pouvoir partager un lien filtré.
// Le paramètre "tri" est validé par parseSort() (script.js) : toute valeur inconnue
// (ex. "__proto__", "constructor") donne le tri par défaut.

const categoryList = document.getElementById("categoryList");
const catalogueSearch = document.getElementById("catalogueSearch");
const sortSelect = document.getElementById("sortSelect");
const catalogueGrid = document.getElementById("catalogueGrid");
const catalogueCount = document.getElementById("catalogueCount");
const catalogueEmpty = document.getElementById("catalogueEmpty");
const categoryPageLink = document.getElementById("categoryPageLink");
const catalogueEmptyText = document.getElementById("catalogueEmptyText");
const resetFilters = document.getElementById("resetFilters");

const params = new URLSearchParams(window.location.search);
const initialCategory = findCategory(params.get("cat"));
const state = {
  category: initialCategory ? initialCategory.id : "", // id de catégorie, "" = toutes
  query: params.get("q") || "",
  sort: parseSort(params.get("tri"))
};

function updateUrl() {
  const next = new URLSearchParams();
  if (state.category) next.set("cat", state.category);
  if (state.query) next.set("q", state.query);
  if (state.sort !== DEFAULT_SORT) next.set("tri", state.sort);
  const search = next.toString();
  history.replaceState(null, "", search ? `?${search}` : window.location.pathname);
}

// Boutons de catégorie créés une seule fois (le focus clavier reste sur le bouton cliqué).
function renderCategoryList() {
  const entries = [
    { id: "", name: "Tous", count: visibleProducts.length },
    ...CATEGORIES.map(category => ({ id: category.id, name: category.name, count: productsInCategory(category.id).length }))
  ];

  categoryList.innerHTML = entries.map(entry => `
    <button type="button" class="category-option" data-category-filter="${escapeHTML(entry.id)}" aria-pressed="false">
      <span>${escapeHTML(entry.name)}</span>
      <small>${entry.count}</small>
    </button>
  `).join("");
}

function updateCategoryList() {
  categoryList.querySelectorAll("[data-category-filter]").forEach(button => {
    const active = button.dataset.categoryFilter === state.category;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function renderCatalogue() {
  const query = state.query.trim();
  const activeCategory = findCategory(state.category);
  const filtered = visibleProducts
    .filter(product => !activeCategory || product.category === activeCategory.id)
    .filter(product => !query || matchesQuery(product, query));
  const list = sortProducts(filtered, state.sort);

  catalogueGrid.innerHTML = list.map(productCardHTML).join("");
  catalogueEmpty.hidden = list.length > 0;
  // Catégorie encore vide (sans recherche) : « bientôt disponibles », pas « aucun résultat ».
  const comingSoon = activeCategory && !query && productsInCategory(activeCategory.id).length === 0;
  catalogueEmptyText.textContent = comingSoon ? `${COMING_SOON}.` : "Aucun produit ne correspond à votre recherche.";
  resetFilters.textContent = comingSoon ? "Voir tous les produits" : "Réinitialiser les filtres";
  catalogueCount.textContent = `${list.length} produit${list.length > 1 ? "s" : ""}`
    + (activeCategory ? ` dans « ${activeCategory.name} »` : "")
    + (query ? ` pour « ${query} »` : "");

  categoryPageLink.hidden = !activeCategory;
  if (activeCategory) {
    categoryPageLink.href = categoryUrl(activeCategory.id);
    categoryPageLink.textContent = `Voir la page ${activeCategory.name} →`;
  }

  updateCategoryList();
  updateUrl();
}

categoryList.addEventListener("click", event => {
  const button = event.target.closest("[data-category-filter]");
  if (!button) return;
  state.category = button.dataset.categoryFilter;
  renderCatalogue();
});

catalogueSearch.addEventListener("input", () => {
  state.query = catalogueSearch.value;
  renderCatalogue();
});

sortSelect.addEventListener("change", () => {
  state.sort = parseSort(sortSelect.value);
  renderCatalogue();
});

resetFilters.addEventListener("click", () => {
  state.category = "";
  state.query = "";
  catalogueSearch.value = "";
  renderCatalogue();
});

catalogueSearch.value = state.query;
sortSelect.value = state.sort;
renderCategoryList();
renderCatalogue();
