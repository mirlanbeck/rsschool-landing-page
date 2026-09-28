// Burger menu overlay (≤768px, shared by both pages).

(function () {
  const btn = document.querySelector(".burger");
  const overlay = document.getElementById("nav-overlay");
  if (!btn || !overlay) return;

  const closeBtn = overlay.querySelector(".nav-overlay__close");
  const links = overlay.querySelectorAll("a");

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
    window.lockScroll();
    document.addEventListener("keydown", onKeydown);
  }

  function close() {
    if (!isOpen()) return;
    overlay.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Open menu");
    window.unlockScroll();
    document.removeEventListener("keydown", onKeydown);
  }

  btn.addEventListener("click", () => (isOpen() ? close() : open()));
  closeBtn.addEventListener("click", close);
  links.forEach((a) => a.addEventListener("click", close));

  // the overlay and its trigger are ≤768px-only; if the window is widened
  // past that while it's open, close it so scroll and aria state don't get stuck
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) close();
  });
})();
