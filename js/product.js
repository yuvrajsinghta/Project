import { PRODUCTS } from "./data.js";
import { qs, qsa, STORAGE_KEYS, readJSON, writeJSON, formatINR, toast } from "./utils.js";

function getId() {
  const sp = new URLSearchParams(window.location.search);
  const id = Number(sp.get("id"));
  return Number.isFinite(id) ? id : null;
}

function findProduct(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

function getGalleryImages(p) {
  // Frontend-only: use same image as variants (until you add real gallery images)
  // You can replace with: p.images = [...]
  return [
    p.image,
    p.image,
    p.image,
    p.image,
  ];
}

function renderGallery(images) {
  const main = qs("[data-gallery-main]");
  const thumbs = qs("[data-gallery-thumbs]");
  if (!main || !thumbs) return;

  let activeIndex = 0;

  const renderMain = () => {
    main.innerHTML = `<img src="${images[activeIndex]}" alt="Product image ${activeIndex + 1}" loading="eager" />`;
  };

  const renderThumbs = () => {
    thumbs.innerHTML = images
      .map((src, i) => `
        <button class="thumb ${i === activeIndex ? "is-active" : ""}" type="button" aria-label="View image ${i + 1}" data-thumb="${i}">
          <img src="${src}" alt="Thumbnail ${i + 1}" loading="lazy" />
        </button>
      `)
      .join("");
  };

  renderMain();
  renderThumbs();

  thumbs.addEventListener("click", (e) => {
    const b = e.target.closest("[data-thumb]");
    if (!b) return;
    activeIndex = Number(b.dataset.thumb);
    renderMain();
    renderThumbs();
  });
}

function renderProduct(p) {
  document.title = `${p.name} | UrbanWear`;

  const bc = qs("[data-bc-name]");
  const name = qs("[data-name]");
  const cat = qs("[data-category]");
  const price = qs("[data-price]");
  const desc = qs("[data-desc]");
  const rating = qs("[data-rating] span:last-child");
  const tags = qs("[data-tags]");

  if (bc) bc.textContent = p.name;
  if (name) name.textContent = p.name;
  if (cat) cat.textContent = p.category;
  if (price) price.textContent = formatINR(p.price);
  if (desc) desc.textContent = p.description;
  if (rating) rating.textContent = p.rating.toFixed(1);

  if (tags) {
    const t = [];
    if (p.isNew) t.push(`<span class="tag">New</span>`);
    if (p.isBestSeller) t.push(`<span class="tag tag--gold">Best Seller</span>`);
    tags.innerHTML = t.join("");
  }

  // sizes
  const sizesWrap = qs("[data-sizes]");
  if (sizesWrap) {
    sizesWrap.innerHTML = p.sizes
      .map((s) => `<button class="size__btn" type="button" data-size="${s}">${s}</button>`)
      .join("");
  }

  // gallery
  const images = getGalleryImages(p);
  renderGallery(images);
}

function initSelectors() {
  let selectedSize = null;

  const sizesWrap = qs("[data-sizes]");
  const hint = qs("[data-size-hint]");
  const qtyInput = qs("[data-qty]");

  const dec = qs("[data-qty-dec]");
  const inc = qs("[data-qty-inc]");

  sizesWrap?.addEventListener("click", (e) => {
    const b = e.target.closest("[data-size]");
    if (!b) return;

    selectedSize = b.dataset.size;

    qsa(".size__btn", sizesWrap).forEach((x) => x.classList.remove("is-active"));
    b.classList.add("is-active");

    if (hint) hint.textContent = `Selected: ${selectedSize}`;
  });

  const clampQty = () => {
    if (!qtyInput) return 1;
    const v = Math.max(1, Number(qtyInput.value || "1"));
    qtyInput.value = String(v);
    return v;
  };

  dec?.addEventListener("click", () => {
    if (!qtyInput) return;
    qtyInput.value = String(Math.max(1, Number(qtyInput.value || "1") - 1));
  });

  inc?.addEventListener("click", () => {
    if (!qtyInput) return;
    qtyInput.value = String(Number(qtyInput.value || "1") + 1);
  });

  qtyInput?.addEventListener("change", clampQty);

  return {
    getSize: () => selectedSize,
    getQty: () => clampQty(),
  };
}

function addToCart(productId, size, qty) {
  const cart = readJSON(STORAGE_KEYS.CART, []);
  const existing = cart.find((x) => x.id === productId && x.size === size);

  if (existing) existing.qty += qty;
  else cart.push({ id: productId, size, qty });

  writeJSON(STORAGE_KEYS.CART, cart);
}

function toggleWishlist(productId) {
  const wl = readJSON(STORAGE_KEYS.WISHLIST, []);
  const idx = wl.findIndex((x) => x.id === productId);
  if (idx >= 0) {
    wl.splice(idx, 1);
    writeJSON(STORAGE_KEYS.WISHLIST, wl);
    return false;
  }
  wl.push({ id: productId });
  writeJSON(STORAGE_KEYS.WISHLIST, wl);
  return true;
}

function setWishlistButtonState(productId) {
  const btn = qs("[data-add-wishlist]");
  if (!btn) return;

  const wl = readJSON(STORAGE_KEYS.WISHLIST, []);
  const inWl = wl.some((x) => x.id === productId);

  btn.textContent = inWl ? "♥ In Wishlist" : "♡ Wishlist";
  btn.classList.toggle("btn--primary", inWl);
  btn.classList.toggle("btn--outline", !inWl);
}

function renderRelated(current) {
  const wrap = qs("[data-related]");
  if (!wrap) return;

  const related = PRODUCTS
    .filter((p) => p.id !== current.id && p.category === current.category)
    .slice(0, 4);

  wrap.innerHTML = related
    .map((p) => `
      <a class="product-card" href="./product.html?id=${p.id}">
        <div class="product-card__media"><img src="${p.image}" alt="${p.name}" loading="lazy" /></div>
        <div class="product-card__body">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <h3 class="product-card__title">${p.name}</h3>
            ${p.isBestSeller ? `<span class="tag tag--gold">Best</span>` : p.isNew ? `<span class="tag">New</span>` : ""}
          </div>
          <div class="product-card__meta">
            <span class="price">${formatINR(p.price)}</span>
            <span class="rating"><span class="rating__star">★</span>${p.rating.toFixed(1)}</span>
          </div>
          <p class="muted" style="margin:0;">${p.category}</p>
        </div>
      </a>
    `)
    .join("");

  if (!related.length) {
    wrap.innerHTML = `
      <div class="empty">
        <h3 class="empty__title">No related products found</h3>
        <p class="empty__text">Explore more items from the shop.</p>
        <a class="btn btn--outline" href="./shop.html">Go to Shop</a>
      </div>
    `;
  }
}

function guardNotFound() {
  document.querySelector("main")?.insertAdjacentHTML(
    "afterbegin",
    `
    <section class="section">
      <div class="container empty">
        <h2 class="empty__title">Product not found</h2>
        <p class="empty__text">The product link seems invalid. Please go back to shop.</p>
        <a class="btn btn--primary" href="./shop.html">Back to Shop</a>
      </div>
    </section>
    `
  );
}

document.addEventListener("DOMContentLoaded", () => {
  const id = getId();
  if (!id) return guardNotFound();

  const product = findProduct(id);
  if (!product) return guardNotFound();

  renderProduct(product);
  renderRelated(product);

  const selectors = initSelectors();
  setWishlistButtonState(product.id);

  const addCartBtn = qs("[data-add-cart]");
  const wlBtn = qs("[data-add-wishlist]");
  const sizeHint = qs("[data-size-hint]");

  addCartBtn?.addEventListener("click", () => {
    const size = selectors.getSize();
    const qty = selectors.getQty();

    if (!size) {
      toast("Please select a size");
      sizeHint && (sizeHint.textContent = "Please select a size");
      return;
    }

    addToCart(product.id, size, qty);
    toast("Added to cart");
    // update badges (main.js reads localStorage on load; quick update here too)
    const cartBadge = qs("[data-cart-count]");
    if (cartBadge) {
      const cart = readJSON(STORAGE_KEYS.CART, []);
      const count = cart.reduce((sum, x) => sum + (x.qty || 1), 0);
      cartBadge.textContent = String(count);
    }
  });

  wlBtn?.addEventListener("click", () => {
    const added = toggleWishlist(product.id);
    setWishlistButtonState(product.id);
    toast(added ? "Added to wishlist" : "Removed from wishlist");

    const wlBadge = qs("[data-wishlist-count]");
    if (wlBadge) {
      const wl = readJSON(STORAGE_KEYS.WISHLIST, []);
      wlBadge.textContent = String(wl.length);
    }
  });
});