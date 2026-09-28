// Burger menu overlay (≤768px, shared by both pages).

(function () {
  const btn = document.querySelector(".burger");
  const overlay = document.getElementById("nav-overlay");
  if (!btn || !overlay) return;

  const closeBtn = overlay.querySelector(".nav-overlay__close");
  const links = overlay.querySelectorAll("a");
  // everything the overlay covers: made inert while it's open, so a keyboard
  // or screen-reader user can't tab or navigate into content hidden behind it
  const rest = document.querySelectorAll(
    "body > header, body > main, body > footer",
  );

  function isOpen() {
    return overlay.classList.contains("is-open");
  }

  function onKeydown(e) {
    if (e.key === "Escape") close();
  }

  function open() {
    overlay.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-label", "Close menu");
    rest.forEach((el) => (el.inert = true));
    window.lockScroll();
    document.addEventListener("keydown", onKeydown);
    closeBtn.focus();
  }

  function close() {
    if (!isOpen()) return;
    overlay.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Open menu");
    rest.forEach((el) => (el.inert = false));
    window.unlockScroll();
    document.removeEventListener("keydown", onKeydown);
    btn.focus();
  }

  btn.addEventListener("click", () => (isOpen() ? close() : open()));
  closeBtn.addEventListener("click", close);
  links.forEach((a) => a.addEventListener("click", close));

  // the overlay and its trigger are ≤768px-only; if the window is widened
  // past that while it's open, close it so scroll and aria state don't get stuck
  window.addEventListener("resize", () => {
    if (window.matchMedia("(width >= 769px)").matches) close();
  });
})();
