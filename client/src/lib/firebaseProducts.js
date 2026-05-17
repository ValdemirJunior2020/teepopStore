// client/src/lib/firebaseProducts.js

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where
} from "firebase/firestore";
import { db } from "../firebase";
import { seedProducts } from "../data/seedProducts";

const PRODUCTS_COLLECTION = "products";

function normalizeProduct(docSnap) {
  const data = docSnap.data();

  return {
    id: docSnap.id,
    ...data,
    price: Number(data.price || 40),
    sortOrder: Number(data.sortOrder || 999),
    image:
      data.mainImageUrl ||
      data.imageUrl ||
      data.image ||
      "/logoshirt.png",
    mainImageUrl:
      data.mainImageUrl ||
      data.imageUrl ||
      data.image ||
      "/logoshirt.png",
    imageUrl:
      data.imageUrl ||
      data.mainImageUrl ||
      data.image ||
      "/logoshirt.png",
    videoUrl: data.videoUrl || data.product_video_url || "",
    product_video_url: data.product_video_url || data.videoUrl || "",
    gifUrl: data.gifUrl || data.gif_url || "",
    gif_url: data.gif_url || data.gifUrl || "",
    rotationImages: Array.isArray(data.rotationImages)
      ? data.rotationImages
      : [],
    galleryImages: Array.isArray(data.galleryImages)
      ? data.galleryImages
      : [],
    variants: Array.isArray(data.variants) ? data.variants : []
  };
}

export async function getProductsFromFirebase() {
  const productsRef = collection(db, PRODUCTS_COLLECTION);

  // No orderBy here, so Firebase does not require a composite index.
  const productsQuery = query(productsRef, where("active", "==", true));

  const snapshot = await getDocs(productsQuery);

  return snapshot.docs
    .map(normalizeProduct)
    .sort((a, b) => {
      const sortA = Number(a.sortOrder || 999);
      const sortB = Number(b.sortOrder || 999);

      if (sortA !== sortB) return sortA - sortB;

      return String(a.name || "").localeCompare(String(b.name || ""));
    });
}

export async function getProductBySlugFromFirebase(slug) {
  const productsRef = collection(db, PRODUCTS_COLLECTION);

  const productQuery = query(
    productsRef,
    where("slug", "==", slug),
    limit(1)
  );

  const snapshot = await getDocs(productQuery);

  if (snapshot.empty) {
    throw new Error("Product not found.");
  }

  return normalizeProduct(snapshot.docs[0]);
}

export async function seedProductsToFirebase() {
  const productsRef = collection(db, PRODUCTS_COLLECTION);

  let addedCount = 0;
  let updatedCount = 0;

  for (const product of seedProducts) {
    const productId = product.slug;
    const productRef = doc(productsRef, productId);
    const existingSnap = await getDoc(productRef);

    if (existingSnap.exists()) {
      await setDoc(
        productRef,
        {
          ...product,
          active: product.active !== false,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );

      updatedCount += 1;
    } else {
      await setDoc(productRef, {
        ...product,
        active: product.active !== false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      addedCount += 1;
    }
  }

  return {
    created: addedCount > 0,
    message: `${addedCount} new products added. ${updatedCount} existing products updated. Total seed products: ${seedProducts.length}.`
  };
}

export async function getProductById(productId) {
  const productRef = doc(db, PRODUCTS_COLLECTION, productId);
  const productSnap = await getDoc(productRef);

  if (!productSnap.exists()) {
    throw new Error("Product not found.");
  }

  return normalizeProduct(productSnap);
}