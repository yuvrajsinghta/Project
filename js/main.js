console.log("MAIN JS LOADED");

import { PRODUCTS } from "./data.js";
import { qs, qsa, STORAGE_KEYS, readJSON, writeJSON, getCartCount, getWishlistCount, formatINR, toast } from "./utils.js";

function initYear() {
  const y = qs("[data-year]");
  if (y) y.textContent = String(new Date().getFullYear());
}

function initAnnouncement() {
  const bar = qs("[data-announce]");
  const close = qs("[data-announce-close]");
  if (!bar || !close) return;

  const hidden = localStorage.getItem(STORAGE_KEYS.ANNOUNCE) === "1";
  if (hidden) bar.style.display = "none";

  close.addEventListener("click", () => {
    bar.style.display = "none";
    localStorage.setItem(STORAGE_KEYS.ANNOUNCE, "1");
  });
}

function initTheme() {
  const btn = qs("[data-theme-toggle]");
  const saved = localStorage.getItem(STORAGE_KEYS.THEME);
  if (saved) document.documentElement.setAttribute("data-theme", saved);

  if (!btn) return;
  btn.addEventListener("click", () => {
    const curr = document.documentElement.getAttribute("data-theme") || "light";
    const next = curr === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_KEYS.THEME, next);
    toast(`Theme: ${next}`);
  });
}

function initNav() {
  const toggle = qs("[data-nav-toggle]");
  const close = qs("[data-nav-close]");
  const menu = qs("[data-nav-menu]");
  if (!toggle || !menu) return;

  const open = () => {
    menu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };

  const shut = () => {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  toggle.addEventListener("click", () => {
    menu.classList.contains("is-open") ? shut() : open();
  });

  if (close) close.addEventListener("click", shut);

  // close on outside click (mobile)
  menu.addEventListener("click", (e) => {
    const isLink = e.target.closest(".nav__link");
    if (isLink) shut();
  });

  // ESC close
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) shut();
  });
}

function updateBadges() {
  const cartEl = qs("[data-cart-count]");
  const wlEl = qs("[data-wishlist-count]");
  if (cartEl) cartEl.textContent = String(getCartCount());
  if (wlEl) wlEl.textContent = String(getWishlistCount());
}

function initAuthLink() {
  const link = qs("[data-auth-link]");
  if (!link) return;

  const user = readJSON(STORAGE_KEYS.USER, null);
  if (user?.email) {
    link.textContent = "Profile";
    link.href = "./profile.html";
  } else {
    link.textContent = "Login";
    link.href = "./login.html";
  }
}

function productCard(p) {
  const tag = p.isBestSeller ? `<span class="tag tag--gold">Best</span>` : (p.isNew ? `<span class="tag">New</span>` : "");
  const rating = `
    <span class="rating" aria-label="Rating ${p.rating}">
      <span class="rating__star">★</span>
      <span>${p.rating.toFixed(1)}</span>
    </span>
  `;

  return `
    <a class="product-card" href="./product.html?id=${p.id}">
      <div class="product-card__media">
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
      </div>
      <div class="product-card__body">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
          <h3 class="product-card__title">${p.name}</h3>
          ${tag}
        </div>
        <div class="product-card__meta">
          <span class="price">${formatINR(p.price)}</span>
          ${rating}
        </div>
        <p class="muted" style="margin:0;">${p.category}</p>
      </div>
    </a>
  `;
}

function renderHomeSections() {
  const bestWrap = qs("[data-best-sellers]");
  const newWrap = qs("[data-new-arrivals]");

  // skeletons
  const skeletons = (n) =>
    Array.from({ length: n }).map(() => `
      <div class="skeleton">
        <div class="skeleton__top"></div>
        <div class="skeleton__body">
          <div class="skeleton__line sm"></div>
          <div class="skeleton__line xs"></div>
        </div>
      </div>
    `).join("");

  if (bestWrap) bestWrap.innerHTML = skeletons(4);
  if (newWrap) newWrap.innerHTML = skeletons(4);

  window.setTimeout(() => {
    if (bestWrap) {
      const best = PRODUCTS.filter(p => p.isBestSeller).slice(0, 4);
      bestWrap.innerHTML = best.map(productCard).join("");
    }
    if (newWrap) {
      const fresh = PRODUCTS.filter(p => p.isNew).slice(0, 4);
      newWrap.innerHTML = fresh.map(productCard).join("");
    }
  }, 250);
}

function initNewsletter() {
  const form = qs("[data-newsletter-form]");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.reset();
    toast("Subscribed! You'll receive new drops & offers.");
  });
}

function initBackToTop() {
  const btn = qs("[data-backtop]");
  if (!btn) return;

  const onScroll = () => {
    const show = window.scrollY > 450;
    btn.classList.toggle("is-visible", show);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function ensureStorageDefaults() {
  if (!localStorage.getItem(STORAGE_KEYS.CART)) writeJSON(STORAGE_KEYS.CART, []);
  if (!localStorage.getItem(STORAGE_KEYS.WISHLIST)) writeJSON(STORAGE_KEYS.WISHLIST, []);
}

document.addEventListener("DOMContentLoaded", () => {
  ensureStorageDefaults();
  initYear();
  initAnnouncement();
  initTheme();
  initNav();
  initAuthLink();
  updateBadges();
  renderHomeSections();
  initNewsletter();
  initBackToTop();
});