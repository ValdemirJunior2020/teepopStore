// client/src/lib/productApi.js

import { seedProducts } from "../data/seedProducts";
import {
  getProductsFromFirebase,
  getProductBySlugFromFirebase
} from "./firebaseProducts";

function makeSlug(value) {
  return String(value || "teepop-shirt")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

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

function normalizeProduct(product) {
  const fallbackSlug = makeSlug(product?.name || product?.id || product?.slug);

  const image =
    product?.mainImageUrl ||
    product?.imageUrl ||
    product?.image ||
    product?.galleryImages?.[0] ||
    product?.rotationImages?.[0] ||
    "/logoshirt.png";

  const cleanName = String(product?.name || "TeePoP Shirt").replace("🇧🇷", "").trim();

  return {
    ...product,
    id: product?.id || product?.slug || fallbackSlug,
    slug: product?.slug || product?.id || fallbackSlug,
    name:
      isBrazilProduct(product) && !cleanName.includes("🇧🇷")
        ? `${cleanName} 🇧🇷`
        : cleanName,
    price: Number(product?.price || 40),
    sortOrder: Number(product?.sortOrder || 999),
    category: product?.category || "DTF Shirt",
    tags: Array.isArray(product?.tags) ? product.tags : [],
    description:
      product?.description || "Premium TeePoP DTF shirt printed in-house.",
    image,
    mainImageUrl: image,
    imageUrl: image,
    videoUrl: product?.videoUrl || product?.product_video_url || "",
    product_video_url: product?.product_video_url || product?.videoUrl || "",
    gifUrl: product?.gifUrl || product?.gif_url || "",
    gif_url: product?.gif_url || product?.gifUrl || "",
    galleryImages: Array.isArray(product?.galleryImages)
      ? product.galleryImages
      : [image],
    rotationImages: Array.isArray(product?.rotationImages)
      ? product.rotationImages
      : [image],
    variants: Array.isArray(product?.variants) ? product.variants : [],
    active: product?.active !== false
  };
}

function isModelProduct(product) {
  const text = [
    product?.name,
    product?.category,
    product?.description,
    ...(Array.isArray(product?.tags) ? product.tags : [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return text.includes("model") || text.includes("models") || text.includes("modelo");
}

function mergeProducts(localProducts = [], firebaseProducts = []) {
  const map = new Map();

  firebaseProducts.forEach((product) => {
    const normalized = normalizeProduct(product);
    map.set(normalized.slug, normalized);
  });

  localProducts.forEach((product) => {
    const normalized = normalizeProduct(product);

    // local hardcoded products override Firebase if same slug
    map.set(normalized.slug, normalized);
  });

  return Array.from(map.values())
    .filter((product) => product.active !== false)
    .sort((a, b) => {
      // Put new model images near the top so you can see them immediately
      const aModel = isModelProduct(a);
      const bModel = isModelProduct(b);

      if (aModel && !bModel) return -1;
      if (!aModel && bModel) return 1;

      return Number(a.sortOrder || 999) - Number(b.sortOrder || 999);
    });
}

export async function getProducts() {
  const localProducts = seedProducts.map(normalizeProduct);

  try {
    const firebaseProducts = await getProductsFromFirebase();
    return mergeProducts(localProducts, firebaseProducts);
  } catch (error) {
    console.warn("Firebase products failed. Showing local hardcoded products only.", error);

    return localProducts.sort((a, b) => {
      const aModel = isModelProduct(a);
      const bModel = isModelProduct(b);

      if (aModel && !bModel) return -1;
      if (!aModel && bModel) return 1;

      return Number(a.sortOrder || 999) - Number(b.sortOrder || 999);
    });
  }
}

export async function getProductBySlug(slug) {
  const localProduct = seedProducts.find(
    (product) => product.slug === slug || product.id === slug
  );

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