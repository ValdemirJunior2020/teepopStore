// client/src/pages/ProductPage.jsx

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProductRotateViewer from "../components/ProductRotateViewer";
import { useCart } from "../context/CartContext";
import { getProductBySlug } from "../lib/productApi";
import "./shop-page.css";

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedSku, setSelectedSku] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const variants = useMemo(() => {
    return Array.isArray(product?.variants)
      ? product.variants.filter((variant) => variant.active !== false)
      : [];
  }, [product]);

  const selectedVariant =
    variants.find((variant) => String(variant.sku) === String(selectedSku)) ||
    variants[0] ||
    null;

  const price = Number(selectedVariant?.price || product?.price || 40);

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const data = await getProductBySlug(slug);

        if (!active) return;

        setProduct(data);
      } catch (err) {
        if (active) {
          setError(err.message || "Could not load this product.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [slug]);

  function handleAdd() {
    addToCart({
      ...product,
      price,
      variantSku: selectedVariant?.sku || "",
      selectedVariant
    });

    navigate("/cart");
  }

  if (loading) {
    return (
      <section className="teepop-shop-page">
        <div className="container">
          <div className="notice">Loading product...</div>
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="teepop-shop-page">
        <div className="container">
          <div className="notice error-notice">{error || "Product not found."}</div>
          <Link className="btn" to="/shop">
            Back to shop
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="teepop-shop-page product-detail-page">
      <div className="container product-detail-layout">
        <ProductRotateViewer product={product} />

        <div className="product-detail-info">
          <p className="eyebrow">{product.category || "TeePoP DTF"}</p>

          <h1>{product.name}</h1>

          <p className="product-detail-description">
            {product.description || "Premium TeePoP DTF shirt printed in-house."}
          </p>

          <div className="product-detail-price">${price.toFixed(2)}</div>

          {variants.length > 0 && (
            <label className="product-detail-field">
              <span>Choose style / color / size</span>

              <select
                value={selectedVariant?.sku || ""}
                onChange={(event) => setSelectedSku(event.target.value)}
              >
                {variants.map((variant) => (
                  <option key={variant.sku} value={variant.sku}>
                    {variant.style} / {variant.color} / {variant.size}
                    {Number(variant.stock || 0) <= 0 ? " — Out of stock" : ""}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="product-detail-trust">
            <span>Printed in-house</span>
            <span>DTF quality</span>
            <span>Production queue after payment</span>
            <span>WhatsApp support</span>
          </div>

          <button
            className="btn product-detail-add-btn"
            type="button"
            onClick={handleAdd}
          >
            Add to cart
          </button>
        </div>
      </div>
    </section>
  );
}