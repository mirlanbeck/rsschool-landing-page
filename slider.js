// State

let currentIndex = 0;
const durationMs = 4000;
let elapsedMs = 0;
let paused = false;
let lastTick;
const slideCount = 3;
let isSwiping = false;
let startX = 0;
let lastX = 0;

const track = document.querySelector(".slider__track");
const viewport = document.querySelector(".slider__viewport");
const fills = document.querySelectorAll(".progress__fill");

const prevBtn = document.querySelector(".slider__arrow--prev");
const nextBtn = document.querySelector(".slider__arrow--next");
const SWIPE_THRESHOLD = 50;

const bullets = document.querySelectorAll(".bullet");

function renderProgress() {
  const p = Math.max(0, Math.min(1, elapsedMs / durationMs));
  fills.forEach((el, i) => {
    el.style.width = i === currentIndex ? p * 100 + "%" : "0%";
  });
}

function tick(now) {
  if (lastTick == null) {
    lastTick = now;
  }
  const dt = now - lastTick;
  lastTick = now;

  if (!paused) {
    elapsedMs += dt;
  }

  if (elapsedMs >= durationMs) {
    goToSlide(currentIndex + 1);
  }

  renderProgress();
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

function goToSlide(index) {
  currentIndex = ((index % slideCount) + slideCount) % slideCount;
  elapsedMs = 0;

  bullets.forEach(function (el, ind) {
    if (ind === currentIndex) {
      el.setAttribute("aria-current", "true");
    } else {
      el.removeAttribute("aria-current");
    }
  });
  renderProgress();
  renderSlidePosition();
}

function pageWidth() {
  return viewport.clientWidth;
}

function renderSlidePosition() {
  const x = -currentIndex * pageWidth();
  track.style.transform = `translateX(${x}px)`;
}

bullets.forEach((el, ind) => {
  el.addEventListener("click", () => {
    goToSlide(ind);
  });
});

window.addEventListener("resize", renderSlidePosition);

viewport.addEventListener("mouseenter", () => {
  paused = true;
});
viewport.addEventListener("mouseleave", () => {
  paused = false;
});
viewport.addEventListener("pointerdown", (e) => {
  if (e.target.closest(".slider__arrow")) {
    return;
  }
  paused = true;
  isSwiping = true;
  startX = e.clientX;
  lastX = startX;
  e.currentTarget.setPointerCapture?.(e.pointerId);
});

viewport.addEventListener("pointerup", (e) => {
  if (e.target.closest(".slider__arrow")) {
    return;
  }
  paused = false;
  e.currentTarget.releasePointerCapture?.(e.pointerId);
});
viewport.addEventListener("pointercancel", (e) => {
  if (e.target.closest(".slider__arrow")) {
    return;
  }
  paused = false;
});

viewport.addEventListener("pointermove", (e) => {
  if (e.target.closest(".slider__arrow")) {
    return;
  }
  if (!isSwiping) return;
  lastX = e.clientX;
});

function endSwipe(e) {
  if (!isSwiping) return;
  isSwiping = false;

  const dx = lastX - startX;
  if (Math.abs(dx) >= SWIPE_THRESHOLD) {
    if (dx < 0) {
      goToSlide(currentIndex + 1);
    } else {
      goToSlide(currentIndex - 1);
    }
  } else {
    renderSlidePosition();
  }
  e.currentTarget.releasePointerCapture?.(e.pointerId);
  paused = false;
}

viewport.addEventListener("pointerup", endSwipe);
viewport.addEventListener("pointercancel", endSwipe);

nextBtn.addEventListener("click", () => {
  goToSlide(currentIndex + 1);
});

prevBtn.addEventListener("click", () => {
  goToSlide(currentIndex - 1);
});
