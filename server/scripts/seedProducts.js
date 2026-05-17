// server/scripts/seedProducts.js

import dotenv from "dotenv";
import { adminDb, FieldValue } from "../lib/firebaseAdmin.js";

dotenv.config();

const PRODUCT_PRICE = 40;
const shirtImages = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80"
];
const categories = ["T-Shirts", "Faith", "Streetwear", "Oversized", "Custom", "Hoodies", "Women", "Kids"];
const colors = [
  { name: "Black", hex: "#111111" },
  { name: "White", hex: "#ffffff" },
  { name: "Sand", hex: "#d6c1a3" },
  { name: "Navy", hex: "#172554" },
  { name: "Pink", hex: "#ff8fab" },
  { name: "Olive", hex: "#556b2f" }
];
const sizes = ["S", "M", "L", "XL", "2XL"];
const styles = ["Unisex Tee", "Oversized Tee", "Hoodie", "Women Fitted", "Tank Top"];
const productNames = [
  "TeePoP Can Shirt", "Faith Pop Tee", "Street Pop Oversized Tee", "Custom Name DTF Shirt", "TeePoP Hoodie Drop",
  "Weekend Pop Tee", "Blessed DTF Tee", "Retro Smile Tee", "Bold Street Tee", "Florida Pop Tee",
  "Urban Faith Tee", "Fresh Start Tee", "Premium Logo Tee", "Can Drop Classic", "Pink Pop Tee",
  "Gold Label Tee", "Sunday Energy Tee", "Street Cloud Tee", "Oversized Wave Tee", "Pop Culture Tee",
  "Royal Print Tee", "Happy Drop Shirt", "Clean Logo Shirt", "DTF Power Tee", "Kingdom Pop Tee",
  "Miami Night Tee", "Boca Pop Tee", "Palm Beach Tee", "Creative Spirit Tee", "Made Different Tee",
  "Neon Pop Tee", "Can Pack Tee", "TeePoP Essential", "Blessed Mode Tee", "Street Joy Tee",
  "Custom Birthday Tee", "Family Reunion Tee", "Small Business Tee", "Church Event Tee", "Team Logo Tee",
  "Creator Drop Tee", "Vintage Pop Tee", "Cloud Nine Tee", "Ocean Pop Tee", "Bold Name Tee",
  "Faith Over Fear Tee", "Premium Hoodie Pop", "Summer Tank Pop", "Women Pop Fit Tee", "Kids Pop Tee"
];

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

function buildVariants(productNumber, price) {
  return colors.slice(0, 4).flatMap((color) =>
    sizes.map((size) => ({
      sku: `TEEPOP-${String(productNumber).padStart(3, "0")}-${color.name.toUpperCase().replace(/\s+/g, "")}-${size}`,
      style: styles[productNumber % styles.length],
      color: color.name,
      colorHex: color.hex,
      size,
      price,
      stock: 20,
      blankSku: `BLANK-${color.name.toUpperCase().replace(/\s+/g, "")}-${size}`,
      active: true
    }))
  );
}

function buildRotationImages(mainImageUrl) {
  return [
    mainImageUrl,
    mainImageUrl.replace("w=1200", "w=1180"),
    mainImageUrl.replace("w=1200", "w=1160"),
    mainImageUrl.replace("w=1200", "w=1140"),
    mainImageUrl.replace("w=1200", "w=1120"),
    mainImageUrl.replace("w=1200", "w=1100")
  ];
}

const products = productNames.map((name, index) => {
  const number = index + 1;
  const image = number === 1 ? "/logoshirt.png" : shirtImages[index % shirtImages.length];
  return {
    id: `teepop-${String(number).padStart(3, "0")}`,
    name,
    slug: slugify(name),
    description: `Premium ${name} with vivid DTF print quality, soft blank shirt feel, and TeePoP in-house production.`,
    price: PRODUCT_PRICE,
    category: categories[index % categories.length],
    tags: ["dtf", "teepop", categories[index % categories.length].toLowerCase(), styles[index % styles.length].toLowerCase()],
    active: true,
    featured: number <= 8,
    sortOrder: number,
    mainImageUrl: image,
    image,
    videoUrl: number === 1 ? "/teepop.mp4" : "",
    gifUrl: "",
    dtfDesignUrl: `https://example.com/teepop/designs/design-${String(number).padStart(3, "0")}.png`,
    sizeChartUrl: "",
    galleryImages: buildRotationImages(image).slice(0, 4),
    rotationImages: buildRotationImages(image),
    colors,
    sizes,
    variants: buildVariants(number, PRODUCT_PRICE),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  };
});

async function seed() {
  const batch = adminDb.batch();
  products.forEach((product) => {
    const ref = adminDb.collection("products").doc(product.id);
    batch.set(ref, product, { merge: true });
  });
  await batch.commit();
  console.log(`Seeded ${products.length} TeePoP products to Firestore.`);
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
