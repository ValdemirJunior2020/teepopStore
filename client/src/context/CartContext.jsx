// client/src/context/CartContext.jsx

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

const CART_STORAGE_KEY = "teepop-cart";
const SHIPPING_STORAGE_KEY = "teepop-shipping-info";
const FREE_SHIPPING_THRESHOLD = 80;
const STANDARD_SHIPPING = 8;

const defaultShippingInfo = {
  fullName: "",
  email: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "USA"
};

function safeJsonParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function buildCartKey(product) {
  const productId = String(product.id || product.productId || "");
  const variantSku = String(product.variantSku || product.selectedVariant?.sku || "");
  return variantSku ? `${productId}__${variantSku}` : productId;
}

function normalizeProduct(product) {
  const selectedVariant = product.selectedVariant || product.selected_variant || null;
  const price = Number(selectedVariant?.price || product.price || 40);

  return {
    cartKey: product.cartKey || buildCartKey(product),
    id: String(product.id || product.productId),
    productId: String(product.id || product.productId),
    slug: String(product.slug || product.id || ""),
    name: String(product.name || "TeePoP Shirt"),
    description: String(product.description || "Premium TeePoP DTF shirt"),
    image: String(product.mainImageUrl || product.image || "/logoshirt.png"),
    price,
    variantSku: String(product.variantSku || selectedVariant?.sku || ""),
    selectedVariant
  };
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = safeJsonParse(localStorage.getItem(CART_STORAGE_KEY), []);
    return Array.isArray(saved)
      ? saved.map((item) => ({ ...normalizeProduct(item), quantity: Number(item.quantity) || 1 }))
      : [];
  });

  const [shippingInfo, setShippingInfo] = useState(() => {
    const saved = safeJsonParse(localStorage.getItem(SHIPPING_STORAGE_KEY), null);
    return saved ? { ...defaultShippingInfo, ...saved } : defaultShippingInfo;
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(shippingInfo));
  }, [shippingInfo]);

  function addToCart(product) {
    const normalized = normalizeProduct(product);

    setCart((prev) => {
      const existing = prev.find((item) => item.cartKey === normalized.cartKey);

      if (existing) {
        return prev.map((item) =>
          item.cartKey === normalized.cartKey
            ? { ...item, quantity: Math.min(Number(item.quantity || 1) + 1, 10), price: normalized.price }
            : item
        );
      }

      return [...prev, { ...normalized, quantity: 1 }];
    });
  }

  function removeFromCart(cartKey) {
    setCart((prev) => prev.filter((item) => item.cartKey !== cartKey));
  }

  function updateQuantity(cartKey, quantity) {
    const nextQuantity = Number(quantity);

    if (!Number.isFinite(nextQuantity) || nextQuantity < 1) {
      removeFromCart(cartKey);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.cartKey === cartKey ? { ...item, quantity: Math.min(nextQuantity, 10) } : item
      )
    );
  }

  function updateShippingInfo(patch) {
    setShippingInfo((prev) => ({ ...prev, ...patch }));
  }

  function clearCart() {
    setCart([]);
  }

  function resetShippingInfo() {
    setShippingInfo(defaultShippingInfo);
  }

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING;
    const total = subtotal + shipping;
    return { subtotal, shipping, total };
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totals,
        shippingInfo,
        updateShippingInfo,
        resetShippingInfo
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
