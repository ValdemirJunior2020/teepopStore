// client/src/data/products.js

import { seedProducts, TSHIRT_PRICE } from "./seedProducts";

export { TSHIRT_PRICE };

// Show ALL hardcoded products, including Brasil collection.
export const featuredProducts = seedProducts;

// Optional helpers if other pages need them.
export const allProducts = seedProducts;

export const homeProducts = seedProducts;

export const brasilCollectionProducts = seedProducts.filter((product) =>
  String(product.category || "").toLowerCase().includes("brasil")
);

export const faithProducts = seedProducts.filter((product) =>
  String(product.category || "").toLowerCase().includes("faith")
);

export const funnyProducts = seedProducts.filter((product) =>
  String(product.category || "").toLowerCase().includes("funny")
);