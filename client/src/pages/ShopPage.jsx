// client/src/pages/ShopPage.jsx

import { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../lib/productApi";
import { seedProducts } from "../data/seedProducts";
import "./shop-page.css";

const themeFilters = [
  { id: "all", label: "All" },
  { id: "models", label: "Models" },
  { id: "faith", label: "Faith" },
  { id: "funny", label: "Funny" },
  { id: "brasil", label: "Brazil 2026 🇧🇷" },
  { id: "coffee", label: "Coffee" },
  { id: "mom", label: "Mom Life" },
  { id: "food", label: "Food" },
  { id: "gaming", label: "Gaming" },
  { id: "work", label: "Work / Office" },
  { id: "summer", label: "Summer / Beach" },
  { id: "custom", label: "Custom" }
];

function getProductSearchText(product) {
  return [
    product?.name,
    product?.category,
    product?.description,
    product?.image,
    product?.mainImageUrl,
    product?.imageUrl,
    ...(Array.isArray(product?.tags) ? product.tags : [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function normalizeProduct(product) {
  const image =
    product.mainImageUrl ||
    product.imageUrl ||
    product.image ||
    product.galleryImages?.[0] ||
    product.rotationImages?.[0] ||
    "/logoshirt.png";

  return {
    ...product,
    id: product.id || product.slug,
    slug: product.slug || product.id,
    price: Number(product.price || 40),
    sortOrder: Number(product.sortOrder || 999),
    image,
    mainImageUrl: image,
    imageUrl: image,
    galleryImages: Array.isArray(product.galleryImages)
      ? product.galleryImages
      : [image],
    rotationImages: Array.isArray(product.rotationImages)
      ? product.rotationImages
      : [image],
    variants: Array.isArray(product.variants) ? product.variants : [],
    active: product.active !== false
  };
}

function isCanProduct(product) {
  const text = getProductSearchText(product);

  return (
    text.includes("original teepop can") ||
    text.includes("teepop can shirt") ||
    text.includes("can drop") ||
    product?.videoUrl === "/teepop.mp4" ||
    product?.product_video_url === "/teepop.mp4"
  );
}

function isModelProduct(product) {
  const text = getProductSearchText(product);

  return (
    text.includes("model") ||
    text.includes("models") ||
    text.includes("modelo") ||
    text.includes("/shirts/modelos")
  );
}

function matchesTheme(product, theme) {
  if (theme === "all") return true;

  const text = getProductSearchText(product);

  if (theme === "models") return isModelProduct(product);

  if (theme === "brasil") {
    return (
      text.includes("brasil") ||
      text.includes("brazil") ||
      text.includes("soccer") ||
      text.includes("2026")
    );
  }

  if (theme === "mom") {
    return (
      text.includes("mom") ||
      text.includes("mama") ||
      text.includes("cafecito") ||
      text.includes("cafito")
    );
  }

  if (theme === "food") {
    return (
      text.includes("food") ||
      text.includes("tacos") ||
      text.includes("snack") ||
      text.includes("hungry") ||
      text.includes("chili")
    );
  }

  if (theme === "gaming") {
    return text.includes("gaming") || text.includes("gamer") || text.includes("game");
  }

  if (theme === "work") {
    return (
      text.includes("work") ||
      text.includes("office") ||
      text.includes("meeting") ||
      text.includes("email")
    );
  }

  if (theme === "summer") {
    return (
      text.includes("summer") ||
      text.includes("beach") ||
      text.includes("tropical") ||
      text.includes("vacation")
    );
  }

  return text.includes(theme);
}

function mergeLocalAndFirebase(localProducts, firebaseProducts) {
  const map = new Map();

  firebaseProducts.forEach((product) => {
    const normalized = normalizeProduct(product);
    map.set(normalized.slug, normalized);
  });

  localProducts.forEach((product) => {
    const normalized = normalizeProduct(product);
    map.set(normalized.slug, normalized);
  });

  return Array.from(map.values()).filter((product) => product.active !== false);
}

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState("all");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const localProducts = seedProducts.map(normalizeProduct);
      let firebaseProducts = [];

      try {
        firebaseProducts = await getProducts();
      } catch (firebaseError) {
        console.warn("Firebase products skipped. Using local products.", firebaseError);
      }

      const merged = mergeLocalAndFirebase(localProducts, firebaseProducts);
      const shopOnlyProducts = merged.filter((product) => !isCanProduct(product));

      setProducts(shopOnlyProducts);
    } catch (err) {
      setError(err.message || "Something went wrong loading TeePoP products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const unique = new Set(products.map((product) => product.category).filter(Boolean));
    return ["all", ...Array.from(unique)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const text = getProductSearchText(product);

      const matchesSearch = searchText ? text.includes(searchText) : true;

      const matchesCategory =
        category === "all"
          ? true
          : String(product.category || "").toLowerCase() === category.toLowerCase();

      return matchesSearch && matchesCategory && matchesTheme(product, theme);
    });

    return filtered.sort((a, b) => {
      const aModel = isModelProduct(a);
      const bModel = isModelProduct(b);

      if (aModel && !bModel) return -1;
      if (!aModel && bModel) return 1;

      if (sortBy === "featured") {
        if (a.featured === b.featured) {
          return Number(a.sortOrder || 999) - Number(b.sortOrder || 999);
        }

        return a.featured ? -1 : 1;
      }

      if (sortBy === "az") {
        return String(a.name || "").localeCompare(String(b.name || ""));
      }

      if (sortBy === "za") {
        return String(b.name || "").localeCompare(String(a.name || ""));
      }

      if (sortBy === "price-low") {
        return Number(a.price || 40) - Number(b.price || 40);
      }

      if (sortBy === "price-high") {
        return Number(b.price || 40) - Number(a.price || 40);
      }

      return Number(a.sortOrder || 999) - Number(b.sortOrder || 999);
    });
  }, [products, search, category, theme, sortBy]);

  return (
    <main className="teepop-shop-page">
      <section className="shop-hero-section">
        <div className="container shop-hero-inner">
          <p className="shop-eyebrow">TeePoP DTF Store</p>

          <h1>Pick your shirt by theme.</h1>

          <p className="shop-hero-text">
            Browse faith, funny, Brazil 2026, coffee, food, gaming, models, and
            custom DTF shirts printed in-house by TeePoP.
          </p>

          <div className="shop-trust-row">
            <span>Printed by TeePoP</span>
            <span>Local DTF production</span>
            <span>Model previews</span>
            <span>Brazil 2026 🇧🇷</span>
          </div>
        </div>
      </section>

      <section className="shop-products-section">
        <div className="container">
          <div className="shop-section-header">
            <div>
              <p className="shop-eyebrow">Shop TeePoP Drops</p>
              <h2>Choose your favorite shirt</h2>
            </div>

            <div className="shop-price-pill">$40 standard tee</div>
          </div>

          <div className="shop-toolbar">
            <input
              className="shop-search-input"
              type="search"
              placeholder="Search shirts, models, Brazil, coffee, faith..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              className="shop-category-select"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All categories" : item}
                </option>
              ))}
            </select>

            <select
              className="shop-category-select"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="featured">Featured first</option>
              <option value="az">Name A-Z</option>
              <option value="za">Name Z-A</option>
              <option value="price-low">Price low-high</option>
              <option value="price-high">Price high-low</option>
            </select>
          </div>

          <div className="shop-theme-filters">
            {themeFilters.map((item) => (
              <button
                key={item.id}
                type="button"
                className={theme === item.id ? "active" : ""}
                onClick={() => setTheme(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {loading && <div className="notice">Loading TeePoP products...</div>}

          {error && <div className="notice error-notice">{error}</div>}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className="notice">No products found.</div>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <>
              <p className="shop-count">
                Showing {filteredProducts.length} product
                {filteredProducts.length === 1 ? "" : "s"}
              </p>

              <div className="teepop-product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id || product.slug} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}