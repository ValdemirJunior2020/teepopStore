// client/src/pages/ShopPage.jsx

import { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../lib/productApi";
import "./shop-page.css";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const data = await getProducts();
      setProducts(data);
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
    return products.filter((product) => {
      const text = `${product.name} ${product.description} ${product.category} ${(product.tags || []).join(
        " "
      )}`.toLowerCase();

      const matchesSearch = search.trim()
        ? text.includes(search.trim().toLowerCase())
        : true;

      const matchesCategory =
        category === "all"
          ? true
          : String(product.category || "").toLowerCase() === category.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  return (
    <section className="teepop-shop-page">
      <div className="container">
        <div className="shop-hero">
          <div>
            <p className="eyebrow">TeePoP DTF Store</p>
            <h1>Premium custom shirts printed in-house.</h1>
            <p>
              Browse ready-made TeePoP drops, pick your style, choose your size,
              and we print, quality-check, pack, and ship it ourselves.
            </p>
          </div>

          <div className="shop-hero-card">
            <strong>$40</strong>
            <span>standard tee price</span>
            <small>DTF print quality • handmade workflow • WhatsApp support</small>
          </div>
        </div>

        <div className="shop-toolbar">
          <input
            className="shop-search-input"
            type="search"
            placeholder="Search shirts, faith, funny, tacos..."
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
        </div>

        <div className="shop-trust-strip">
          <span>Printed by TeePoP</span>
          <span>Local DTF production</span>
          <span>Faith + funny designs</span>
          <span>Ships from Florida</span>
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
  );
}