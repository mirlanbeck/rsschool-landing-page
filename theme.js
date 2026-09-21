// Light/dark theme: applied before first paint (loaded synchronously in <head>),
// saved in localStorage and shared by both pages.
const THEME_KEY = "theme";
const root = document.documentElement;

function getSavedTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null; // storage blocked (private mode etc.) - fall back to system preference
  }
}

function getInitialTheme() {
  return (
    getSavedTheme() ??
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );
}

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  document
    .querySelector(".theme-toggle")
    ?.setAttribute("aria-pressed", String(theme === "dark"));
}

applyTheme(getInitialTheme());

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(root.getAttribute("data-theme"));

  document.querySelector(".theme-toggle")?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* ignore: theme still applies for this page view */
    }
  });
});

// keep an already open second tab in sync
window.addEventListener("storage", (e) => {
  if (e.key === THEME_KEY && (e.newValue === "light" || e.newValue === "dark")) {
    applyTheme(e.newValue);
  }
});
