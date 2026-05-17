// client/src/data/products.js

import { seedProducts, TSHIRT_PRICE } from "./seedProducts";

export { TSHIRT_PRICE };

export const featuredProducts = seedProducts.slice(0, 6);
