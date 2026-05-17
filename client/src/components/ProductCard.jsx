// client/src/components/ProductCard.jsx

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ProductVideo from "./ProductVideo";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedSku, setSelectedSku] = useState("");

  const variants = useMemo(() => {
    return Array.isArray(product?.variants)
      ? product.variants.filter((variant) => variant.active !== false)
      : [];
  }, [product]);

  const selectedVariant =
    variants.find((variant) => String(variant.sku) === String(selectedSku)) ||
    variants[0] ||
    null;

  const colors = useMemo(() => {
    const map = new Map();

    variants.forEach((variant) => {
      if (!variant.color) return;

      if (!map.has(variant.color)) {
        map.set(variant.color, {
          name: variant.color,
          hex: variant.colorHex || variant.color_hex || "#111111"
        });
      }
    });

    return Array.from(map.values());
  }, [variants]);

  const price = Number(selectedVariant?.price || product?.price || 40);

  function handleAdd() {
    addToCart({
      ...product,
      price,
      variantSku: selectedVariant?.sku || "",
      selectedVariant
    });

    navigate("/cart");
  }

  return (
    <article className="teepop-product-card">
      <Link to={`/products/${product.slug}`} className="teepop-product-media-link">
        <ProductVideo product={product} className="teepop-product-media" />

        {product.featured && <span className="product-badge">Featured</span>}

        {(product.videoUrl || product.gifUrl || product.rotationImages?.length > 1) && (
          <span className="product-video-badge">360 Preview</span>
        )}
      </Link>

      <div className="teepop-product-body">
        <div className="teepop-product-topline">
          <p className="product-category">{product.category || "DTF Shirt"}</p>
          <strong>${price.toFixed(2)}</strong>
        </div>

        <h3>{product.name}</h3>

        <p className="product-description">
          {product.description || "Premium TeePoP DTF shirt printed in-house."}
        </p>

        {colors.length > 0 && (
          <div className="product-swatches" aria-label="Available colors">
            {colors.slice(0, 6).map((color) => (
              <span
                key={color.name}
                className="product-swatch"
                title={color.name}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        )}

        {variants.length > 0 && (
          <select
            className="product-size-select"
            value={selectedVariant?.sku || ""}
            onChange={(event) => setSelectedSku(event.target.value)}
            aria-label="Choose shirt variant"
          >
            {variants.map((variant) => (
              <option key={variant.sku} value={variant.sku}>
                {variant.style} / {variant.color} / {variant.size}
              </option>
            ))}
          </select>
        )}

        <div className="product-trust-row">
          <span>DTF Print</span>
          <span>Made in-house</span>
        </div>

        <button
          type="button"
          className="btn teepop-add-cart-btn"
          onClick={handleAdd}
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}