// client/src/lib/productApi.js

import { seedProducts } from "../data/seedProducts";

function normalizeProduct(product) {
  return {
    ...product,
    price: Number(product.price || 40),
    image:
      product.mainImageUrl ||
      product.imageUrl ||
      product.image ||
      "/logoshirt.png",
    mainImageUrl:
      product.mainImageUrl ||
      product.imageUrl ||
      product.image ||
      "/logoshirt.png",
    imageUrl:
      product.imageUrl ||
      product.mainImageUrl ||
      product.image ||
      "/logoshirt.png",
    videoUrl: product.videoUrl || product.product_video_url || "",
    product_video_url: product.product_video_url || product.videoUrl || "",
    gifUrl: product.gifUrl || product.gif_url || "",
    gif_url: product.gif_url || product.gifUrl || "",
    galleryImages: Array.isArray(product.galleryImages) ? product.galleryImages : [],
    rotationImages: Array.isArray(product.rotationImages) ? product.rotationImages : [],
    variants: Array.isArray(product.variants) ? product.variants : []
  };
}

export async function getProducts() {
  return seedProducts
    .filter((product) => product.active !== false)
    .map(normalizeProduct)
    .sort((a, b) => Number(a.sortOrder || 999) - Number(b.sortOrder || 999));
}

export async function getProductBySlug(slug) {
  const product = seedProducts.find((item) => item.slug === slug);

  if (!product) {
    throw new Error("Product not found.");
  }

  return normalizeProduct(product);
}