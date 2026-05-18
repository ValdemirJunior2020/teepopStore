// client/src/lib/productApi.js

import { seedProducts } from "../data/seedProducts";
import {
  getProductsFromFirebase,
  getProductBySlugFromFirebase
} from "./firebaseProducts";

function isBrazilProduct(product) {
  const text = [
    product?.name,
    product?.category,
    product?.description,
    ...(Array.isArray(product?.tags) ? product.tags : [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return text.includes("brasil") || text.includes("brazil");
}

function addBrazilIconToName(product) {
  if (!isBrazilProduct(product)) return product;

  const currentName = String(product.name || "");

  if (currentName.includes("🇧🇷")) {
    return product;
  }

  return {
    ...product,
    name: `${currentName} 🇧🇷`
  };
}

function normalizeProduct(product) {
  const image =
    product.mainImageUrl ||
    product.imageUrl ||
    product.image ||
    "/logoshirt.png";

  const normalized = {
    ...product,
    id: product.id || product.slug,
    slug: product.slug || product.id,
    price: Number(product.price || 40),
    sortOrder: Number(product.sortOrder || 999),
    image,
    mainImageUrl: image,
    imageUrl: image,
    videoUrl: product.videoUrl || product.product_video_url || "",
    product_video_url: product.product_video_url || product.videoUrl || "",
    gifUrl: product.gifUrl || product.gif_url || "",
    gif_url: product.gif_url || product.gifUrl || "",
    galleryImages: Array.isArray(product.galleryImages) ? product.galleryImages : [image],
    rotationImages: Array.isArray(product.rotationImages) ? product.rotationImages : [image],
    variants: Array.isArray(product.variants) ? product.variants : []
  };

  return addBrazilIconToName(normalized);
}

function mergeProducts(firebaseProducts = [], localProducts = []) {
  const map = new Map();

  firebaseProducts.forEach((product) => {
    const normalized = normalizeProduct(product);
    map.set(normalized.slug, normalized);
  });

  localProducts.forEach((product) => {
    const normalized = normalizeProduct(product);

    // Local hardcoded products override Firebase if same slug.
    map.set(normalized.slug, normalized);
  });

  return Array.from(map.values())
    .filter((product) => product.active !== false)
    .sort((a, b) => Number(a.sortOrder || 999) - Number(b.sortOrder || 999));
}

export async function getProducts() {
  const localProducts = seedProducts.map(normalizeProduct);

  try {
    const firebaseProducts = await getProductsFromFirebase();
    return mergeProducts(firebaseProducts, localProducts);
  } catch (error) {
    console.warn("Firebase products failed. Showing local hardcoded products only.", error);
    return localProducts;
  }
}

export async function getProductBySlug(slug) {
  const localProduct = seedProducts.find((product) => product.slug === slug);

  if (localProduct) {
    return normalizeProduct(localProduct);
  }

  try {
    const firebaseProduct = await getProductBySlugFromFirebase(slug);
    return normalizeProduct(firebaseProduct);
  } catch (error) {
    throw new Error("Product not found.");
  }
}