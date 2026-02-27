/* ================================
  UrbanWear - Product Data (Frontend Only)
  - Keep paths relative for GitHub Pages
  - Images can be replaced later in /assets/images/
================================== */

export const PRODUCTS = [
  {
    id: 1,
    name: "Signature Oversized Tee",
    price: 1199,
    category: "T-Shirts",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "White", "Beige"],
    rating: 4.6,
    image: "./assets/images/product-01.jpg",
    description:
      "Premium cotton oversized tee with a structured drape. Minimal branding, elevated everyday essential.",
    isNew: true,
    isBestSeller: true,
  },
  {
    id: 2,
    name: "Tailored Slim Chinos",
    price: 2499,
    category: "Bottomwear",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Black", "Beige"],
    rating: 4.4,
    image: "./assets/images/product-02.jpg",
    description:
      "Smart slim-fit chinos with a clean taper. Comfortable stretch with a refined finish for day-to-night wear.",
    isNew: true,
    isBestSeller: false,
  },
  {
    id: 3,
    name: "Minimal Zip Hoodie",
    price: 2999,
    category: "Hoodies",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Beige"],
    rating: 4.7,
    image: "./assets/images/product-03.jpg",
    description:
      "Heavyweight fleece hoodie with premium zipper hardware. Soft interior, sharp silhouette, zero noise design.",
    isNew: false,
    isBestSeller: true,
  },
  {
    id: 4,
    name: "Cropped Denim Jacket",
    price: 3499,
    category: "Jackets",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Black", "White"],
    rating: 4.3,
    image: "./assets/images/product-04.jpg",
    description:
      "Modern cropped denim jacket with clean seams and subtle contrast stitching. Perfect layer for urban evenings.",
    isNew: true,
    isBestSeller: false,
  },
  {
    id: 5,
    name: "Classic Straight Jeans",
    price: 2799,
    category: "Bottomwear",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Black", "Beige"],
    rating: 4.5,
    image: "./assets/images/product-05.jpg",
    description:
      "Straight-fit jeans with a premium wash and durable stitching. Clean look, comfortable movement.",
    isNew: false,
    isBestSeller: true,
  },
  {
    id: 6,
    name: "Textured Knit Polo",
    price: 2299,
    category: "Shirts",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Beige", "White", "Black"],
    rating: 4.2,
    image: "./assets/images/product-06.jpg",
    description:
      "Soft knit polo with refined texture and minimal placket. A luxe alternative to the everyday tee.",
    isNew: true,
    isBestSeller: false,
  },
  {
    id: 7,
    name: "Relaxed Linen Shirt",
    price: 1999,
    category: "Shirts",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Beige"],
    rating: 4.4,
    image: "./assets/images/product-07.jpg",
    description:
      "Breathable linen shirt with relaxed fit and clean collar. Summer-ready sophistication in neutral tones.",
    isNew: false,
    isBestSeller: false,
  },
  {
    id: 8,
    name: "Structured Blazer",
    price: 4999,
    category: "Jackets",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Beige"],
    rating: 4.8,
    image: "./assets/images/product-08.jpg",
    description:
      "Sharp structured blazer with premium lining and minimal shoulder padding. Designed for modern tailoring.",
    isNew: true,
    isBestSeller: true,
  },
  {
    id: 9,
    name: "Pleated Wide-Leg Trousers",
    price: 3299,
    category: "Bottomwear",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Black", "Beige"],
    rating: 4.6,
    image: "./assets/images/product-09.jpg",
    description:
      "Elegant wide-leg trousers with pleats and fluid drape. Clean front, premium finish, statement silhouette.",
    isNew: true,
    isBestSeller: false,
  },
  {
    id: 10,
    name: "Ribbed Tank Top",
    price: 899,
    category: "T-Shirts",
    sizes: ["XS", "S", "M", "L"],
    colors: ["White", "Black", "Beige"],
    rating: 4.1,
    image: "./assets/images/product-10.jpg",
    description:
      "Ribbed tank with a soft stretch feel and clean neckline. Ideal for layering or minimal summer fits.",
    isNew: false,
    isBestSeller: false,
  },
  {
    id: 11,
    name: "Premium Crewneck Sweater",
    price: 2799,
    category: "Sweaters",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Beige", "Black"],
    rating: 4.5,
    image: "./assets/images/product-11.jpg",
    description:
      "Soft-touch crewneck sweater with a refined knit and minimal ribbing. Luxe warmth with a clean look.",
    isNew: false,
    isBestSeller: true,
  },
  {
    id: 12,
    name: "Essential Puffer Jacket",
    price: 5999,
    category: "Jackets",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Beige"],
    rating: 4.7,
    image: "./assets/images/product-12.jpg",
    description:
      "Lightweight warmth with a premium matte finish. Minimal design, maximum comfort for winter city nights.",
    isNew: true,
    isBestSeller: true,
  },
  {
    id: 13,
    name: "Monochrome Co-ord Set",
    price: 4499,
    category: "Sets",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Beige"],
    rating: 4.3,
    image: "./assets/images/product-13.jpg",
    description:
      "Matching co-ord set with elevated fabric and minimal lines. Designed for effortless, premium street style.",
    isNew: true,
    isBestSeller: false,
  },
  {
    id: 14,
    name: "Everyday Utility Overshirt",
    price: 2699,
    category: "Shirts",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Beige"],
    rating: 4.2,
    image: "./assets/images/product-14.jpg",
    description:
      "Utility overshirt with clean pockets and structured collar. Works as a layer or standalone statement.",
    isNew: false,
    isBestSeller: false,
  },
  {
    id: 15,
    name: "Minimal Leather Belt",
    price: 1299,
    category: "Accessories",
    sizes: ["S", "M", "L"],
    colors: ["Black"],
    rating: 4.6,
    image: "./assets/images/product-15.jpg",
    description:
      "Genuine leather belt with brushed metal buckle. Minimal and timeless—built for daily use.",
    isNew: false,
    isBestSeller: true,
  },
  {
    id: 16,
    name: "Clean Court Sneakers",
    price: 3999,
    category: "Footwear",
    sizes: ["UK6", "UK7", "UK8", "UK9", "UK10"],
    colors: ["White", "Beige", "Black"],
    rating: 4.4,
    image: "./assets/images/product-16.jpg",
    description:
      "Minimal court sneakers with a premium finish and comfortable insole. Matches everything, looks luxe.",
    isNew: true,
    isBestSeller: false,
  },
];

/* Useful derived lists for filters (optional) */
export const CATEGORIES = [
  "All",
  ...Array.from(new Set(PRODUCTS.map((p) => p.category))),
];

export const SIZES = Array.from(
  new Set(PRODUCTS.flatMap((p) => p.sizes))
).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

export const COLORS = ["Black", "White", "Beige"];

/* Price range helper */
export const PRICE_RANGE = {
  min: Math.min(...PRODUCTS.map((p) => p.price)),
  max: Math.max(...PRODUCTS.map((p) => p.price)),
};