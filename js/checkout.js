import { PRODUCTS } from "./data.js";
import { qs, formatINR, STORAGE_KEYS, readJSON, writeJSON, toast } from "./utils.js";

const TAX_RATE = 0.05;

function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

function readCart() {
  return readJSON(STORAGE_KEYS.CART, []);
}

function clearCart() {
  writeJSON(STORAGE_KEYS.CART, []);
}

function calcShipping(subtotal) {
  if (subtotal <= 0) return 0;
  return subtotal >= 2999 ? 0 : 149;
}

function totalsFromCart(cart) {
  let subtotal = 0;

  const lines = cart
    .map((row) => {
      const p = getProduct(row.id);
      if (!p) return null;
      const qty = Math.max(1, Number(row.qty || 1));
      const line = p.price * qty;
      subtotal += line;
      return { row, p, qty, line };
    })
    .filter(Boolean);

  const tax = Math.round(subtotal * TAX_RATE);
  const shipping = calcShipping(subtotal);
  const total = subtotal + tax + shipping;

  return { lines, subtotal, tax, shipping, total };
}

function renderSummary(lines, totals) {
  const itemsWrap = qs("[data-summary-items]");
  if (itemsWrap) {
    if (!lines.length) {
      itemsWrap.innerHTML = `
        <div class="wl-empty">
          <h2 style="margin:0 0 6px; font-family: var(--font-serif);">Cart is empty</h2>
          <p style="margin:0 0 12px; color: var(--text-2);">Please add items before checkout.</p>
          <a class="btn btn--primary" href="./shop.html">Go to Shop</a>
        </div>
      `;
    } else {
      itemsWrap.innerHTML = lines
        .map(({ row, p, qty, line }) => `
          <div class="sumitem">
            <div class="sumitem__img">
              <img src="${p.image}" alt="${p.name}" loading="lazy" />
            </div>
            <div>
              <p class="sumitem__name">${p.name}</p>
              <p class="sumitem__meta">
                <span>Size: <strong>${row.size}</strong></span>
                <span>Qty: <strong>${qty}</strong></span>
                <span>${formatINR(line)}</span>
              </p>
            </div>
          </div>
        `)
        .join("");
    }
  }

  const subEl = qs("[data-subtotal]");
  const taxEl = qs("[data-tax]");
  const shipEl = qs("[data-shipping]");
  const totalEl = qs("[data-total]");

  if (subEl) subEl.textContent = formatINR(totals.subtotal);
  if (taxEl) taxEl.textContent = formatINR(totals.tax);
  if (shipEl) shipEl.textContent = totals.shipping === 0 ? "Free" : formatINR(totals.shipping);
  if (totalEl) totalEl.textContent = formatINR(totals.total);
}

function bindSameAsBilling() {
  const cb = qs("[data-same-as-billing]");
  if (!cb) return;

  const map = [
    ["fullName", "shipName"],
    ["address", "shipAddress"],
    ["city", "shipCity"],
    ["pincode", "shipPincode"],
  ];

  const copy = () => {
    for (const [from, to] of map) {
      const a = qs(`#${from}`);
      const b = qs(`#${to}`);
      if (a && b) b.value = a.value;
    }
  };

  cb.addEventListener("change", () => {
    if (cb.checked) {
      copy();
      toast("Shipping copied from billing");
    }
  });

  // Keep syncing while checked
  map.forEach(([from]) => {
    qs(`#${from}`)?.addEventListener("input", () => {
      if (cb.checked) copy();
    });
  });
}

function bindPaymentUI() {
  const cardFields = qs("[data-card-fields]");
  const radios = document.querySelectorAll('input[name="payment"]');

  function update() {
    const selected = document.querySelector('input[name="payment"]:checked')?.value;
    if (!cardFields) return;
    cardFields.hidden = selected !== "card";
  }

  radios.forEach((r) => r.addEventListener("change", update));
  update();
}

function validatePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.length >= 10;
}

function bindSubmit(lines) {
  const form = qs("[data-checkout-form]");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!lines.length) {
      toast("Your cart is empty");
      window.location.href = "./shop.html";
      return;
    }

    const phone = qs("#phone")?.value;
    if (!validatePhone(phone)) {
      toast("Please enter a valid phone number");
      return;
    }

    // Save a simple "last order" snapshot (frontend-only)
    const payload = {
      id: `UW-${Date.now()}`,
      placedAt: new Date().toISOString(),
      billing: {
        fullName: qs("#fullName")?.value || "",
        email: qs("#email")?.value || "",
        phone: qs("#phone")?.value || "",
        address: qs("#address")?.value || "",
        city: qs("#city")?.value || "",
        pincode: qs("#pincode")?.value || "",
      },
      shipping: {
        fullName: qs("#shipName")?.value || "",
        address: qs("#shipAddress")?.value || "",
        city: qs("#shipCity")?.value || "",
        pincode: qs("#shipPincode")?.value || "",
      },
      payment: document.querySelector('input[name="payment"]:checked')?.value || "cod",
      items: lines.map(({ row, qty }) => ({ id: row.id, size: row.size, qty })),
    };

    localStorage.setItem("uw_last_order", JSON.stringify(payload));

    clearCart();
    toast("Order placed!");
    window.location.href = "./order-success.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const cart = readCart();
  const { lines, subtotal, tax, shipping, total } = totalsFromCart(cart);

  renderSummary(lines, { subtotal, tax, shipping, total });
  bindSameAsBilling();
  bindPaymentUI();
  bindSubmit(lines);
});