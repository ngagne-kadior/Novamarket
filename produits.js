// Page produits (catalogue complet) : filtre par catégorie, recherche et tri.
// L'état est gardé dans l'URL (?cat=...&q=...&tri=...) pour pouvoir partager un lien filtré.
// Le paramètre "tri" est validé par parseSort() (script.js) : toute valeur inconnue
// (ex. "__proto__", "constructor") donne le tri par défaut.

const categoryList = document.getElementById("categoryList");
const catalogueSearch = document.getElementById("catalogueSearch");
const sortSelect = document.getElementById("sortSelect");
const catalogueGrid = document.getElementById("catalogueGrid");
const catalogueCount = document.getElementById("catalogueCount");
const catalogueEmpty = document.getElementById("catalogueEmpty");
const categoryPageLink = document.getElementById("categoryPageLink");

const params = new URLSearchParams(window.location.search);
const initialCategory = findCategory(params.get("cat"));
const state = {
  category: initialCategory ? initialCategory.name : "Tous",
  query: params.get("q") || "",
  sort: parseSort(params.get("tri"))
};

function updateUrl() {
  const next = new URLSearchParams();
  if (state.category !== "Tous") next.set("cat", state.category);
  if (state.query) next.set("q", state.query);
  if (state.sort !== DEFAULT_SORT) next.set("tri", state.sort);
  const search = next.toString();
  history.replaceState(null, "", search ? `?${search}` : window.location.pathname);
}

// Boutons de catégorie créés une seule fois (le focus clavier reste sur le bouton cliqué).
function renderCategoryList() {
  const entries = [
    { name: "Tous", count: products.length },
    ...CATEGORIES.map(category => ({ name: category.name, count: productsInCategory(category.name).length }))
  ];

  categoryList.innerHTML = entries.map(entry => `
    <button type="button" class="category-option" data-category-filter="${escapeHTML(entry.name)}" aria-pressed="false">
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
  const filtered = products
    .filter(product => state.category === "Tous" || product.category === state.category)
    .filter(product => !query || matchesQuery(product, query));
  const list = sortProducts(filtered, state.sort);

  catalogueGrid.innerHTML = list.map(productCardHTML).join("");
  catalogueEmpty.hidden = list.length > 0;
  catalogueCount.textContent = `${list.length} produit${list.length > 1 ? "s" : ""}`
    + (state.category !== "Tous" ? ` dans « ${state.category} »` : "")
    + (query ? ` pour « ${query} »` : "");

  categoryPageLink.hidden = state.category === "Tous";
  if (state.category !== "Tous") {
    categoryPageLink.href = categoryUrl(state.category);
    categoryPageLink.textContent = `Voir la page ${state.category} →`;
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

document.getElementById("resetFilters").addEventListener("click", () => {
  state.category = "Tous";
  state.query = "";
  catalogueSearch.value = "";
  renderCatalogue();
});

catalogueSearch.value = state.query;
sortSelect.value = state.sort;
renderCategoryList();
renderCatalogue();
