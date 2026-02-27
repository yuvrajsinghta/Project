import { PRODUCTS, CATEGORIES, SIZES, COLORS, PRICE_RANGE } from "./data.js";
import { qs, qsa, formatINR, toast } from "./utils.js";

const PAGE_SIZE = 8;

function getParams() {
  const sp = new URLSearchParams(window.location.search);
  return {
    q: (sp.get("q") || "").trim(),
    category: (sp.get("category") || "All").trim(),
    sort: sp.get("sort") || "newest",
    page: Math.max(1, Number(sp.get("page") || "1")),
    min: sp.get("min") ? Number(sp.get("min")) : null,
    max: sp.get("max") ? Number(sp.get("max")) : null,
    size: sp.get("size") ? sp.get("size").split(",").filter(Boolean) : [],
    color: sp.get("color") ? sp.get("color").split(",").filter(Boolean) : [],
  };
}

function setParams(next) {
  const sp = new URLSearchParams();

  if (next.q) sp.set("q", next.q);
  if (next.category && next.category !== "All") sp.set("category", next.category);
  if (next.sort && next.sort !== "newest") sp.set("sort", next.sort);
  if (next.page && next.page > 1) sp.set("page", String(next.page));

  if (typeof next.min === "number") sp.set("min", String(next.min));
  if (typeof next.max === "number") sp.set("max", String(next.max));

  if (next.size?.length) sp.set("size", next.size.join(","));
  if (next.color?.length) sp.set("color", next.color.join(","));

  const url = `${window.location.pathname}?${sp.toString()}`;
  window.history.replaceState({}, "", url);
}

function productCard(p) {
  const tag = p.isBestSeller
    ? `<span class="tag tag--gold">Best</span>`
    : p.isNew
      ? `<span class="tag">New</span>`
      : "";

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
          <span class="rating"><span class="rating__star">★</span>${p.rating.toFixed(1)}</span>
        </div>
        <p class="muted" style="margin:0;">${p.category}</p>
      </div>
    </a>
  `;
}

function matchesCategory(p, category) {
  if (!category || category === "All") return true;
  if (category === "New") return !!p.isNew;
  if (category === "Best") return !!p.isBestSeller;
  return p.category === category;
}

function applyFilters(params) {
  const q = params.q.toLowerCase();

  let list = PRODUCTS.filter((p) => {
    const textMatch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);

    const catMatch = matchesCategory(p, params.category);

    const priceMinOk = typeof params.min === "number" ? p.price >= params.min : true;
    const priceMaxOk = typeof params.max === "number" ? p.price <= params.max : true;

    const sizeOk = params.size?.length ? params.size.some((s) => p.sizes.includes(s)) : true;
    const colorOk = params.color?.length ? params.color.some((c) => p.colors.includes(c)) : true;

    return textMatch && catMatch && priceMinOk && priceMaxOk && sizeOk && colorOk;
  });

  // Sorting
  switch (params.sort) {
    case "price_asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "rating_desc":
      list.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
    default:
      // "newest" = isNew first, then higher id
      list.sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.id - a.id);
      break;
  }

  return list;
}

function paginate(list, page) {
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const start = (safePage - 1) * PAGE_SIZE;
  const items = list.slice(start, start + PAGE_SIZE);

  return { items, total, totalPages, page: safePage };
}

function renderPagination({ page, totalPages }) {
  const wrap = qs("[data-pagination]");
  if (!wrap) return;

  const btn = (p, label, disabled = false, active = false) => `
    <button class="pager__btn ${active ? "is-active" : ""}"
      type="button" data-page="${p}" ${disabled ? "disabled" : ""}>
      ${label}
    </button>
  `;

  const parts = [];
  parts.push(btn(page - 1, "← Prev", page === 1));

  // Compact pages
  const windowSize = 2;
  const start = Math.max(1, page - windowSize);
  const end = Math.min(totalPages, page + windowSize);

  if (start > 1) parts.push(btn(1, "1", false, page === 1));
  if (start > 2) parts.push(`<span class="pager__dots">…</span>`);

  for (let p = start; p <= end; p++) parts.push(btn(p, String(p), false, p === page));

  if (end < totalPages - 1) parts.push(`<span class="pager__dots">…</span>`);
  if (end < totalPages) parts.push(btn(totalPages, String(totalPages), false, page === totalPages));

  parts.push(btn(page + 1, "Next →", page === totalPages));

  wrap.innerHTML = parts.join("");

  wrap.addEventListener(
    "click",
    (e) => {
      const b = e.target.closest("[data-page]");
      if (!b) return;
      const p = Number(b.dataset.page);
      if (!Number.isFinite(p)) return;

      const curr = getParams();
      const next = { ...curr, page: p };
      setParams(next);
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    { once: true }
  );
}

function renderActiveFilters(params, total) {
  const countEl = qs("[data-results-count]");
  const activeEl = qs("[data-active-filters]");
  if (countEl) countEl.textContent = `Showing ${total} products`;

  const chips = [];
  if (params.category && params.category !== "All") chips.push(`Category: ${params.category}`);
  if (params.q) chips.push(`Search: “${params.q}”`);
  if (typeof params.min === "number") chips.push(`Min: ${formatINR(params.min)}`);
  if (typeof params.max === "number") chips.push(`Max: ${formatINR(params.max)}`);
  if (params.size?.length) chips.push(`Size: ${params.size.join(", ")}`);
  if (params.color?.length) chips.push(`Color: ${params.color.join(", ")}`);

  if (activeEl) activeEl.textContent = chips.length ? chips.join(" • ") : "No filters applied";
}

function seedFilterUI(params) {
  // sort select
  const sortSel = qs("[data-sort]");
  if (sortSel) sortSel.value = params.sort || "newest";

  // sidebar search input
  const search = qs("[data-filter-search]");
  if (search) search.value = params.q || "";

  // price inputs
  const minEl = qs("[data-price-min]");
  const maxEl = qs("[data-price-max]");
  if (minEl) minEl.value = typeof params.min === "number" ? String(params.min) : "";
  if (maxEl) maxEl.value = typeof params.max === "number" ? String(params.max) : "";

  const hint = qs("[data-price-hint]");
  if (hint) hint.textContent = `Range: ${formatINR(PRICE_RANGE.min)} – ${formatINR(PRICE_RANGE.max)}`;

  // chips
  const catWrap = qs("[data-filter-categories]");
  const sizeWrap = qs("[data-filter-sizes]");
  const colorWrap = qs("[data-filter-colors]");

  if (catWrap) {
    const cats = ["All", "New", "Best", ...CATEGORIES.filter((c) => c !== "All")];
    catWrap.innerHTML = cats
      .map((c) => {
        const active = (params.category || "All") === c;
        return `<button class="chip-btn ${active ? "is-active" : ""}" type="button" data-chip-cat="${c}">${c}</button>`;
      })
      .join("");
  }

  if (sizeWrap) {
    sizeWrap.innerHTML = SIZES.map((s) => {
      const active = params.size.includes(s);
      return `<button class="chip-btn ${active ? "is-active" : ""}" type="button" data-chip-size="${s}">${s}</button>`;
    }).join("");
  }

  if (colorWrap) {
    colorWrap.innerHTML = COLORS.map((c) => {
      const active = params.color.includes(c);
      return `<button class="chip-btn ${active ? "is-active" : ""}" type="button" data-chip-color="${c}">${c}</button>`;
    }).join("");
  }
}

function bindFilterEvents() {
  // mobile filter drawer
  const openBtn = qs("[data-open-filters]");
  const closeBtn = qs("[data-close-filters]");
  const panel = qs("[data-filters-panel]");

  const open = () => {
    if (!panel) return;
    panel.classList.add("is-open");
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    if (!panel) return;
    panel.classList.remove("is-open");
    document.body.style.overflow = "";
  };

  openBtn?.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);

  // sort
  const sortSel = qs("[data-sort]");
  sortSel?.addEventListener("change", () => {
    const curr = getParams();
    setParams({ ...curr, sort: sortSel.value, page: 1 });
    render();
  });

  // chip handling (event delegation)
  qs("[data-filter-categories]")?.addEventListener("click", (e) => {
    const b = e.target.closest("[data-chip-cat]");
    if (!b) return;
    const cat = b.dataset.chipCat;
    const curr = getParams();
    setParams({ ...curr, category: cat, page: 1 });
    render();
  });

  qs("[data-filter-sizes]")?.addEventListener("click", (e) => {
    const b = e.target.closest("[data-chip-size]");
    if (!b) return;
    const size = b.dataset.chipSize;
    const curr = getParams();
    const nextSizes = new Set(curr.size);
    nextSizes.has(size) ? nextSizes.delete(size) : nextSizes.add(size);
    setParams({ ...curr, size: Array.from(nextSizes), page: 1 });
    render();
  });

  qs("[data-filter-colors]")?.addEventListener("click", (e) => {
    const b = e.target.closest("[data-chip-color]");
    if (!b) return;
    const color = b.dataset.chipColor;
    const curr = getParams();
    const nextColors = new Set(curr.color);
    nextColors.has(color) ? nextColors.delete(color) : nextColors.add(color);
    setParams({ ...curr, color: Array.from(nextColors), page: 1 });
    render();
  });

  // apply + clear
  qs("[data-apply-filters]")?.addEventListener("click", () => {
    const curr = getParams();
    const q = (qs("[data-filter-search]")?.value || "").trim();
    const minRaw = (qs("[data-price-min]")?.value || "").trim();
    const maxRaw = (qs("[data-price-max]")?.value || "").trim();

    const min = minRaw ? Number(minRaw) : null;
    const max = maxRaw ? Number(maxRaw) : null;

    const next = { ...curr, q, min: Number.isFinite(min) ? min : null, max: Number.isFinite(max) ? max : null, page: 1 };
    setParams(next);
    render();
    toast("Filters applied");
    close();
  });

  qs("[data-clear-filters]")?.addEventListener("click", () => {
    setParams({ q: "", category: "All", sort: "newest", page: 1, min: null, max: null, size: [], color: [] });
    render();
    toast("Filters cleared");
  });

  // Keep sidebar search in sync when user uses top bar query param
  qs("[data-filter-search]")?.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    qs("[data-apply-filters]")?.click();
  });
}

function render() {
  const params = getParams();

  // keep top search input in sync if present
  const topSearch = qs('input[name="q"]');
  if (topSearch) topSearch.value = params.q || "";

  seedFilterUI(params);

  const filtered = applyFilters(params);
  const { items, total, totalPages, page } = paginate(filtered, params.page);

  // if page got clamped, reflect in URL
  if (page !== params.page) setParams({ ...params, page });

  renderActiveFilters(params, total);

  const grid = qs("[data-products-grid]");
  if (grid) {
    if (!items.length) {
      grid.innerHTML = `
        <div class="empty">
          <h3 class="empty__title">No products found</h3>
          <p class="empty__text">Try removing some filters or searching a different term.</p>
          <button class="btn btn--outline" type="button" data-clear-inline>Clear filters</button>
        </div>
      `;
      grid.querySelector("[data-clear-inline]")?.addEventListener("click", () => {
        setParams({ q: "", category: "All", sort: "newest", page: 1, min: null, max: null, size: [], color: [] });
        render();
      });
    } else {
      grid.innerHTML = items.map(productCard).join("");
    }
  }

  renderPagination({ page, totalPages });
}

document.addEventListener("DOMContentLoaded", () => {
  bindFilterEvents();
  render();
});