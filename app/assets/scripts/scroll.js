/**
 * When `no-scroll` is present on <body>, locks document scroll without jumping:
 * saves scrollY, applies position:fixed with top:-scrollY, restores on removal.
 */
const CLASS = 'no-scroll';

let savedScrollY = 0;
let locked = false;

function lockScroll() {
  if (locked) return;
  savedScrollY = window.scrollY;
  const {body} = document;
  body.style.position = 'fixed';
  body.style.top = `-${savedScrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';
  locked = true;
}

function unlockScroll() {
  if (!locked) return;
  const {body} = document;
  body.style.position = '';
  body.style.top = '';
  body.style.left = '';
  body.style.right = '';
  body.style.width = '';
  window.scrollTo(0, savedScrollY);
  locked = false;
}

function syncFromClass() {
  if (document.body.classList.contains(CLASS)) {
    lockScroll();
  } else {
    unlockScroll();
  }
}

function init() {
  syncFromClass();
  const observer = new MutationObserver(syncFromClass);
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once: true});
  } else {
    init();
  }
}
