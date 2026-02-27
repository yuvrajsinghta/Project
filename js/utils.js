export const STORAGE_KEYS = {
  CART: "uw_cart",
  WISHLIST: "uw_wishlist",
  USER: "uw_user",
  THEME: "uw_theme",
  ANNOUNCE: "uw_announce_hidden",
};

export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export function getCartCount() {
  const cart = readJSON(STORAGE_KEYS.CART, []);
  return cart.reduce((sum, item) => sum + (item.qty || 1), 0);
}

export function getWishlistCount() {
  const wl = readJSON(STORAGE_KEYS.WISHLIST, []);
  return wl.length;
}

export function toast(message) {
  const wrap = qs("[data-toast-wrap]");
  if (!wrap) return;

  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `
    <p class="toast__msg">${message}</p>
    <button class="toast__close" type="button" aria-label="Close">✕</button>
  `;

  const closeBtn = el.querySelector(".toast__close");
  const remove = () => el.remove();

  closeBtn.addEventListener("click", remove);
  wrap.appendChild(el);

  window.setTimeout(() => {
    if (el.isConnected) el.remove();
  }, 3200);
}