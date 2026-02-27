import { PRODUCTS } from "./data.js";
import { qs, formatINR, STORAGE_KEYS, readJSON, writeJSON, toast } from "./utils.js";

function readWishlist() {
  return readJSON(STORAGE_KEYS.WISHLIST, []);
}
function writeWishlist(list) {
  writeJSON(STORAGE_KEYS.WISHLIST, list);
}

function readCart() {
  return readJSON(STORAGE_KEYS.CART, []);
}
function writeCart(cart) {
  writeJSON(STORAGE_KEYS.CART, cart);
}

function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

function updateBadgesQuick() {
  const wl = readWishlist();
  const cart = readCart();

  const wlBadge = qs("[data-wishlist-count]");
  const cartBadge = qs("[data-cart-count]");

  if (wlBadge) wlBadge.textContent = String(wl.length);
  if (cartBadge) cartBadge.textContent = String(cart.reduce((s, x) => s + (x.qty || 1), 0));
}

function addToCart(productId, size, qty = 1) {
  const cart = readCart();
  const existing = cart.find((x) => x.id === productId && x.size === size);
  if (existing) existing.qty += qty;
  else cart.push({ id: productId, size, qty });
  writeCart(cart);
}

function removeFromWishlist(productId) {
  const wl = readWishlist().filter((x) => x.id !== productId);
  writeWishlist(wl);
}

function renderEmpty() {
  const grid = qs("[data-wishlist-grid]");
  if (!grid) return;
  grid.innerHTML = `
    <div class="wl-empty">
      <h2>Your wishlist is empty</h2>
      <p>Browse the shop and add products you love.</p>
      <a class="btn btn--primary" href="./shop.html">Go to Shop</a>
    </div>
  `;
}

function renderCard(p) {
  const tag = p.isBestSeller
    ? `<span class="tag tag--gold">Best</span>`
    : p.isNew
      ? `<span class="tag">New</span>`
      : "";

  // size options for quick add
  const sizeOptions = p.sizes
    .map((s) => `<option value="${s}">${s}</option>`)
    .join("");

  return `
    <div class="product-card" data-wl-item="${p.id}">
      <a href="./product.html?id=${p.id}">
        <div class="product-card__media">
          <img src="${p.image}" alt="${p.name}" loading="lazy" />
        </div>
      </a>

      <div class="product-card__body">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
          <h3 class="product-card__title">${p.name}</h3>
          ${tag}
        </div>

        <div class="product-card__meta">
          <span class="price">${formatINR(p.price)}</span>
          <span class="rating"><span class="rating__star">★</span>${p.rating.toFixed(1)}</span>
        </div>

        <p class="muted" style="margin:0;">${p.category}</p>

        <div class="wl-actions">
          <label class="sr-only" for="size-${p.id}">Select size</label>
          <select id="size-${p.id}" class="input" data-size>
            ${sizeOptions}
          </select>

          <button class="btn btn--primary" type="button" data-move>
            Move to Cart
          </button>

          <button class="btn btn--outline" type="button" data-remove>
            Remove
          </button>
        </div>
      </div>
    </div>
  `;
}

function render() {
  const grid = qs("[data-wishlist-grid]");
  if (!grid) return;

  const wl = readWishlist();
  const products = wl.map((x) => getProduct(x.id)).filter(Boolean);

  if (!products.length) {
    renderEmpty();
    updateBadgesQuick();
    return;
  }

  grid.innerHTML = products.map(renderCard).join("");
  updateBadgesQuick();
}

function bindEvents() {
  // Clear wishlist
  qs("[data-clear-wishlist]")?.addEventListener("click", () => {
    writeWishlist([]);
    toast("Wishlist cleared");
    render();
  });

  // Delegated actions
  qs("[data-wishlist-grid]")?.addEventListener("click", (e) => {
    const card = e.target.closest("[data-wl-item]");
    if (!card) return;

    const id = Number(card.dataset.wlItem);
    const p = getProduct(id);
    if (!p) return;

    // Remove
    if (e.target.closest("[data-remove]")) {
      removeFromWishlist(id);
      toast("Removed from wishlist");
      render();
      return;
    }

    // Move to cart
    if (e.target.closest("[data-move]")) {
      const sel = card.querySelector("[data-size]");
      const size = sel?.value || p.sizes[0];

      addToCart(id, size, 1);
      removeFromWishlist(id);

      toast("Moved to cart");
      render();
      return;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  render();
});