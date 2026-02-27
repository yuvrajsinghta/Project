import { PRODUCTS } from "./data.js";
import { qs, formatINR, STORAGE_KEYS, readJSON, writeJSON, toast } from "./utils.js";

const TAX_RATE = 0.05;

// shipping rule: free above 2999 else 149 (frontend simulation)
function calcShipping(subtotal) {
  if (subtotal <= 0) return 0;
  return subtotal >= 2999 ? 0 : 149;
}

// coupons
function computeDiscount(code, subtotal) {
  const c = (code || "").trim().toUpperCase();

  if (!c) return { code: "", amount: 0, label: "" };

  if (c === "URBAN10") {
    return { code: c, amount: Math.round(subtotal * 0.10), label: "10% OFF" };
  }
  if (c === "WELCOME100") {
    return { code: c, amount: Math.min(100, subtotal), label: "₹100 OFF" };
  }
  return { code: c, amount: 0, label: "Invalid" };
}

function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

function cartKey() {
  return STORAGE_KEYS.CART;
}

function readCart() {
  return readJSON(cartKey(), []);
}

function writeCart(cart) {
  writeJSON(cartKey(), cart);
}

function renderItemRow(row, product) {
  const lineTotal = product.price * (row.qty || 1);

  return `
    <article class="item" data-item="${product.id}" data-size="${row.size}">
      <a class="item__img" href="./product.html?id=${product.id}" aria-label="Open ${product.name}">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
      </a>

      <div class="item__body">
        <div class="item__top">
          <div>
            <h3 class="item__name">${product.name}</h3>
            <div class="item__meta">
              <span>Size: <strong>${row.size}</strong></span>
              <span class="item__price">${formatINR(product.price)}</span>
              <span class="muted">Line: <strong>${formatINR(lineTotal)}</strong></span>
            </div>
          </div>

          <button class="item__remove" type="button" data-remove aria-label="Remove item">
            Remove
          </button>
        </div>

        <div class="item__actions">
          <div class="qty" aria-label="Quantity selector">
            <button class="qty__btn" type="button" data-dec aria-label="Decrease">−</button>
            <input class="qty__input" type="number" min="1" value="${row.qty || 1}" inputmode="numeric" data-qty />
            <button class="qty__btn" type="button" data-inc aria-label="Increase">+</button>
          </div>

          <a class="link" href="./wishlist.html">Move to wishlist →</a>
        </div>
      </div>
    </article>
  `;
}

function renderEmpty() {
  const wrap = qs("[data-cart-items]");
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="cart-empty">
      <h2>Your cart is empty</h2>
      <p>Add items from the shop to see them here.</p>
      <a class="btn btn--primary" href="./shop.html">Go to Shop</a>
    </div>
  `;

  // Disable checkout
  const checkoutBtn = qs("[data-checkout-btn]");
  if (checkoutBtn) {
    checkoutBtn.classList.add("is-disabled");
    checkoutBtn.setAttribute("aria-disabled", "true");
    checkoutBtn.addEventListener("click", (e) => e.preventDefault());
  }
}

function renderCart(cart) {
  const wrap = qs("[data-cart-items]");
  if (!wrap) return;

  const valid = cart
    .map((row) => ({ row, product: getProduct(row.id) }))
    .filter((x) => x.product && x.row.size);

  if (!valid.length) {
    renderEmpty();
    return;
  }

  wrap.innerHTML = valid.map(({ row, product }) => renderItemRow(row, product)).join("");
}

function computeTotals(cart, couponCode) {
  let subtotal = 0;

  for (const row of cart) {
    const p = getProduct(row.id);
    if (!p) continue;
    subtotal += p.price * (row.qty || 1);
  }

  const discount = computeDiscount(couponCode, subtotal);
  const discountedSubtotal = Math.max(0, subtotal - discount.amount);

  const tax = Math.round(discountedSubtotal * TAX_RATE);
  const shipping = calcShipping(discountedSubtotal);
  const total = Math.max(0, discountedSubtotal + tax + shipping);

  return { subtotal, tax, shipping, total, discount };
}

function renderSummary(totals) {
  const subEl = qs("[data-subtotal]");
  const taxEl = qs("[data-tax]");
  const shipEl = qs("[data-shipping]");
  const totalEl = qs("[data-total]");

  const discRow = qs("[data-discount-row]");
  const discEl = qs("[data-discount]");

  if (subEl) subEl.textContent = formatINR(totals.subtotal);
  if (taxEl) taxEl.textContent = formatINR(totals.tax);
  if (shipEl) shipEl.textContent = totals.shipping === 0 ? "Free" : formatINR(totals.shipping);
  if (totalEl) totalEl.textContent = formatINR(totals.total);

  if (discRow && discEl) {
    const show = totals.discount.amount > 0;
    discRow.hidden = !show;
    discEl.textContent = `-${formatINR(totals.discount.amount)}`;
  }
}

function updateBadgesQuick() {
  const cart = readCart();
  const count = cart.reduce((sum, x) => sum + (x.qty || 1), 0);
  const badge = qs("[data-cart-count]");
  if (badge) badge.textContent = String(count);
}

function normalizeCart(cart) {
  // Remove invalid rows, clamp qty
  return cart
    .filter((x) => x && Number.isFinite(x.id) && x.size)
    .map((x) => ({ ...x, qty: Math.max(1, Number(x.qty || 1)) }));
}

function bindCartEvents(state) {
  const wrap = qs("[data-cart-items]");
  if (!wrap) return;

  wrap.addEventListener("click", (e) => {
    const itemEl = e.target.closest("[data-item]");
    if (!itemEl) return;

    const id = Number(itemEl.dataset.item);
    const size = itemEl.dataset.size;

    // Remove
    if (e.target.closest("[data-remove]")) {
      state.cart = state.cart.filter((x) => !(x.id === id && x.size === size));
      writeCart(state.cart);
      toast("Removed from cart");
      rerender(state);
      return;
    }

    // Dec
    if (e.target.closest("[data-dec]")) {
      state.cart = state.cart.map((x) => {
        if (x.id === id && x.size === size) return { ...x, qty: Math.max(1, (x.qty || 1) - 1) };
        return x;
      });
      writeCart(state.cart);
      rerender(state);
      return;
    }

    // Inc
    if (e.target.closest("[data-inc]")) {
      state.cart = state.cart.map((x) => {
        if (x.id === id && x.size === size) return { ...x, qty: (x.qty || 1) + 1 };
        return x;
      });
      writeCart(state.cart);
      rerender(state);
      return;
    }
  });

  // Qty input change
  wrap.addEventListener("change", (e) => {
    const input = e.target.closest("[data-qty]");
    if (!input) return;

    const itemEl = e.target.closest("[data-item]");
    if (!itemEl) return;

    const id = Number(itemEl.dataset.item);
    const size = itemEl.dataset.size;

    const qty = Math.max(1, Number(input.value || "1"));
    input.value = String(qty);

    state.cart = state.cart.map((x) => (x.id === id && x.size === size ? { ...x, qty } : x));
    writeCart(state.cart);
    rerender(state);
  });

  // Clear cart
  qs("[data-clear-cart]")?.addEventListener("click", () => {
    state.cart = [];
    writeCart(state.cart);
    state.coupon = "";
    toast("Cart cleared");
    rerender(state);
  });
}

function bindCoupon(state) {
  const form = qs("[data-coupon-form]");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.querySelector("input");
    const code = (input?.value || "").trim().toUpperCase();
    if (!code) {
      toast("Enter a coupon code");
      return;
    }

    // Validate with a preview
    const totals = computeTotals(state.cart, code);
    if (totals.discount.amount <= 0) {
      toast("Invalid coupon");
      state.coupon = "";
      input.value = "";
      rerender(state);
      return;
    }

    state.coupon = code;
    toast(`Coupon applied: ${code}`);
    rerender(state);
  });
}

function rerender(state) {
  state.cart = normalizeCart(state.cart);
  writeCart(state.cart);

  renderCart(state.cart);
  const totals = computeTotals(state.cart, state.coupon);
  renderSummary(totals);

  updateBadgesQuick();

  // If cart empty, hide discount row
  if (!state.cart.length) {
    const discRow = qs("[data-discount-row]");
    if (discRow) discRow.hidden = true;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const state = {
    cart: normalizeCart(readCart()),
    coupon: "",
  };

  renderCart(state.cart);
  renderSummary(computeTotals(state.cart, state.coupon));

  bindCartEvents(state);
  bindCoupon(state);

  rerender(state);
});