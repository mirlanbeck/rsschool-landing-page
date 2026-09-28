// Menu page: category tabs and product cards, both rendered from products.json.
// A card and the modal it opens (see modal.js) read the same product object,
// so nothing about a product is written twice.

const MOBILE_QUERY = window.matchMedia("(width < 769px)"); // matches css/menu.css
const INITIAL_VISIBLE = 4; // cards shown per category on mobile before "load more"

const tabs = Array.from(document.querySelectorAll("[role='tab']"));
const panel = document.getElementById("menu-panel");
const list = document.getElementById("menu-list");
const loadMoreBtn = document.getElementById("load-more");

let products = [];
let category = tabs[0]?.dataset.category ?? "coffee";
let expanded = false; // reset whenever the category changes

function isMobile() {
  return MOBILE_QUERY.matches;
}

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`;
}

// product text is our own data file, not user input, but it's still injected
// into HTML via template strings, so escape it defensively
function escapeHtml(str) {
  return String(str).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}

function itemsInCategory(cat) {
  return products.filter((product) => product.category === cat);
}

function cardMarkup(product) {
  const name = escapeHtml(product.name);
  const alt = escapeHtml(product.alt);
  const description = escapeHtml(product.description);
  const price = formatPrice(product.price);
  return `
    <li class="menu-list__item">
      <article class="menu-card" data-id="${product.id}" tabindex="0" role="button"
        aria-label="${name}, ${price}">
        <img class="menu-card__img" src="${product.image}" alt="${alt}" width="310" height="310">
        <div class="menu-card__body">
          <h2 class="menu-card__title">${name}</h2>
          <p class="menu-card__desc">${description}</p>
          <p class="menu-card__price">${price}</p>
        </div>
      </article>
    </li>`;
}

function render() {
  const items = itemsInCategory(category);
  const showAll = !isMobile() || expanded;
  const visible = showAll ? items : items.slice(0, INITIAL_VISIBLE);

  list.innerHTML = visible.map(cardMarkup).join("");
  loadMoreBtn.style.display =
    !showAll && items.length > visible.length ? "flex" : "none";
}

function selectCategory(tab) {
  tabs.forEach((t) => {
    const active = t === tab;
    t.setAttribute("aria-selected", String(active));
    t.tabIndex = active ? 0 : -1;
  });
  panel.setAttribute("aria-labelledby", tab.id);
  category = tab.dataset.category;
  expanded = false;
  render();
}

tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => selectCategory(tab));
  tab.addEventListener("keydown", (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = tabs[(i + step + tabs.length) % tabs.length];
    selectCategory(next);
    next.focus();
  });
});

loadMoreBtn.addEventListener("click", () => {
  expanded = true;
  render();
  panel.focus();
});

function openProductById(id, trigger) {
  const product = products.find((p) => p.id === id);
  if (product && typeof window.openProductModal === "function") {
    window.openProductModal(product, trigger);
  }
}

list.addEventListener("click", (e) => {
  const card = e.target.closest(".menu-card");
  if (card) openProductById(card.dataset.id, card);
});

list.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const card = e.target.closest(".menu-card");
  if (!card) return;
  e.preventDefault();
  openProductById(card.dataset.id, card);
});

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(render, 150);
});

fetch("products.json")
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then((data) => {
    products = data;
    render();
  })
  .catch((err) => {
    console.error("Could not load products.json:", err);
    list.innerHTML =
      "<li>The menu couldn't be loaded. If you opened this file directly, please serve it through a local server (e.g. VS Code Live Server) instead.</li>";
  });
