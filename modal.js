// Product modal (menu page). Reads whatever product object menu.js passes it
// via window.openProductModal — the modal never carries its own copy of the
// product data, so a card and its modal are always in sync.

(function () {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return; // not on this page

  const modal = overlay.querySelector(".modal");
  const imageEl = document.getElementById("modal-image");
  const titleEl = document.getElementById("modal-title");
  const descEl = document.getElementById("modal-desc");
  const sizesEl = document.getElementById("modal-sizes");
  const additivesEl = document.getElementById("modal-additives");
  const totalEl = document.getElementById("modal-total");
  const closeBtn = overlay.querySelector(".modal__close");
  // hidden behind the modal while it's open: kept out of the tab order and
  // off-limits to screen readers, same treatment burger.js gives the page
  const rest = document.querySelectorAll("body > header, body > main, body > footer, #nav-overlay");

  const SIZE_LABELS = { s: "S", m: "M", l: "L" };

  let current = null;
  let selectedSize = "s";
  let selectedAdditives = new Set();
  let trigger = null;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[c]);
  }

  function formatPrice(value) {
    return `$${Number(value).toFixed(2)}`;
  }

  function renderSizes() {
    sizesEl.innerHTML = Object.keys(current.sizes)
      .map((key) => {
        const checked = key === selectedSize;
        return `<button type="button" class="modal__option modal__option--size" role="radio"
          aria-checked="${checked}" data-size="${key}">
          <span class="modal__option-badge">${SIZE_LABELS[key]}</span>${escapeHtml(current.sizes[key].size)}
        </button>`;
      })
      .join("");
  }

  function renderAdditives() {
    additivesEl.innerHTML = current.additives
      .map((additive, i) => {
        const pressed = selectedAdditives.has(i);
        return `<button type="button" class="modal__option" aria-pressed="${pressed}" data-additive="${i}">
          <span class="modal__option-badge">${i + 1}</span>${escapeHtml(additive.name)}
        </button>`;
      })
      .join("");
  }

  function renderTotal() {
    let total = Number(current.price) + Number(current.sizes[selectedSize]["add-price"]);
    current.additives.forEach((additive, i) => {
      if (selectedAdditives.has(i)) total += Number(additive["add-price"]);
    });
    totalEl.textContent = formatPrice(total);
  }

  function onKeydown(e) {
    if (e.key === "Escape") close();
  }

  function open(product, openedBy) {
    current = product;
    selectedSize = "s";
    selectedAdditives = new Set();
    // menu.js hands us the card that was clicked/activated; falling back to
    // activeElement covers any other caller, though a synthetic .click() (as
    // opposed to a real pointer click) won't have focused anything by then
    trigger = openedBy ?? document.activeElement;

    imageEl.src = product.image;
    imageEl.alt = product.alt;
    titleEl.textContent = product.name;
    descEl.textContent = product.description;
    renderSizes();
    renderAdditives();
    renderTotal();

    overlay.classList.add("is-open");
    rest.forEach((el) => (el.inert = true));
    window.lockScroll();
    document.addEventListener("keydown", onKeydown);
    modal.focus();
  }

  function close() {
    if (!overlay.classList.contains("is-open")) return;
    overlay.classList.remove("is-open");
    rest.forEach((el) => (el.inert = false));
    window.unlockScroll();
    document.removeEventListener("keydown", onKeydown);
    current = null;
    trigger?.focus();
  }

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close(); // the darkened backdrop, not the modal itself
  });
  closeBtn.addEventListener("click", close);

  sizesEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-size]");
    if (!btn) return;
    selectedSize = btn.dataset.size;
    renderSizes();
    renderTotal();
  });

  additivesEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-additive]");
    if (!btn) return;
    const i = Number(btn.dataset.additive);
    if (selectedAdditives.has(i)) {
      selectedAdditives.delete(i);
    } else {
      selectedAdditives.add(i);
    }
    renderAdditives();
    renderTotal();
  });

  window.openProductModal = open;
})();
