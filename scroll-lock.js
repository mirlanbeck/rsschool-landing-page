// Shared body-scroll lock, used by the burger menu overlay and the product modal.
// A counter lets both be "open" at once without one's close accidentally
// unlocking scroll the other still needs.

let lockCount = 0;

function lockScroll() {
  if (lockCount === 0) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  lockCount++;
}

function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }
}

window.lockScroll = lockScroll;
window.unlockScroll = unlockScroll;
