// client/src/components/BrazilIcon.jsx

import "./brazil-icon.css";

const BRAZIL_ICON_URL = "https://image.pngaaa.com/912/1774912-middle.png";

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

export default function BrazilIcon({ product, type = "inline" }) {
  if (!isBrazilProduct(product)) return null;

  if (type === "badge") {
    return (
      <span className="brazil-product-badge">
        <img src={BRAZIL_ICON_URL} alt="Brasil" />
        Brasil
      </span>
    );
  }

  return (
    <img
      src={BRAZIL_ICON_URL}
      alt="Brasil"
      className="brazil-product-icon"
      loading="lazy"
    />
  );
}