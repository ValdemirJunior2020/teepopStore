// server/server.js


import dtfImagesRoutes from "./routes/dtfImages.routes.js";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import nodemailer from "nodemailer";
import { adminDb, FieldValue, firebaseAdminIsConfigured } from "./lib/firebaseAdmin.js";

dotenv.config();

const PRODUCT_PRICE = 40;
const FREE_SHIPPING_THRESHOLD = 80;
const STANDARD_SHIPPING = 8;
const MAX_QTY_PER_ITEM = 10;
const paypalApiBase = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";
const port = process.env.PORT || 8080;

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked origin: ${origin}`));
    }
  })
);

app.use(express.json({ limit: "2mb" }));

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function money(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new Error("Invalid money value.");
  return Number(number.toFixed(2));
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cleanString(value, fallback = "") {
  return String(value || fallback).trim();
}

function normalizeProduct(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    price: Number(data.price || PRODUCT_PRICE),
    mainImageUrl: data.mainImageUrl || data.image || "/logoshirt.png",
    image: data.mainImageUrl || data.image || "/logoshirt.png",
    videoUrl: data.videoUrl || "",
    gifUrl: data.gifUrl || "",
    rotationImages: Array.isArray(data.rotationImages) ? data.rotationImages : [],
    galleryImages: Array.isArray(data.galleryImages) ? data.galleryImages : [],
    colors: Array.isArray(data.colors) ? data.colors : [],
    sizes: Array.isArray(data.sizes) ? data.sizes : [],
    variants: Array.isArray(data.variants) ? data.variants : []
  };
}

async function getActiveProducts() {
  const snapshot = await adminDb
    .collection("products")
    .where("active", "==", true)
    .orderBy("sortOrder", "asc")
    .get();

  return snapshot.docs.map(normalizeProduct);
}

async function getProductById(productId) {
  const snap = await adminDb.collection("products").doc(String(productId)).get();
  if (!snap.exists) return null;
  const product = normalizeProduct(snap);
  if (product.active === false) return null;
  return product;
}

function findVariant(product, variantSku) {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  if (!variants.length) return null;

  const selected = variants.find((variant) => String(variant.sku) === String(variantSku));
  if (!selected || selected.active === false) return null;
  return selected;
}

function validateShippingInfo(shippingInfo = {}) {
  const requiredFields = [
    "fullName",
    "email",
    "phone",
    "address1",
    "city",
    "state",
    "postalCode",
    "country"
  ];

  const missing = requiredFields.filter((field) => !cleanString(shippingInfo[field]));

  if (missing.length) {
    throw new Error(`Missing shipping fields: ${missing.join(", ")}`);
  }

  if (!cleanString(shippingInfo.email).includes("@")) {
    throw new Error("Invalid customer email.");
  }

  return {
    fullName: cleanString(shippingInfo.fullName),
    email: cleanString(shippingInfo.email).toLowerCase(),
    phone: cleanString(shippingInfo.phone),
    address1: cleanString(shippingInfo.address1),
    address2: cleanString(shippingInfo.address2),
    city: cleanString(shippingInfo.city),
    state: cleanString(shippingInfo.state),
    postalCode: cleanString(shippingInfo.postalCode),
    country: cleanString(shippingInfo.country, "USA")
  };
}

async function validateCart(rawCart) {
  if (!Array.isArray(rawCart) || rawCart.length === 0) {
    throw new Error("Cart is empty.");
  }

  const validated = [];

  for (const item of rawCart) {
    const productId = cleanString(item.id || item.productId);
    const product = await getProductById(productId);

    if (!product) {
      throw new Error(`Invalid product in cart: ${productId || "unknown"}`);
    }

    const quantity = Number(item.quantity || 1);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY_PER_ITEM) {
      throw new Error(`Invalid quantity for ${product.name}.`);
    }

    const variantSku = item.variantSku || item.selectedVariant?.sku || item.selected_variant?.sku || "";
    const variant = variantSku ? findVariant(product, variantSku) : null;

    if (variantSku && !variant) {
      throw new Error(`Invalid variant selected for ${product.name}.`);
    }

    if (variant && Number(variant.stock || 0) < quantity) {
      throw new Error(`${product.name} ${variant.color || ""} ${variant.size || ""} is low/out of stock.`);
    }

    const unitPrice = money(variant?.price || product.price || PRODUCT_PRICE);

    validated.push({
      product_id: product.id,
      productId: product.id,
      slug: product.slug || product.id,
      name: product.name,
      image: product.mainImageUrl || product.image || "",
      unit_price: unitPrice,
      price: unitPrice,
      quantity,
      line_total: money(unitPrice * quantity),
      variantSku: variant?.sku || "",
      selectedVariant: variant
        ? {
            sku: variant.sku,
            style: variant.style || "Unisex Tee",
            color: variant.color || "",
            colorHex: variant.colorHex || "",
            size: variant.size || "",
            blankSku: variant.blankSku || "",
            price: unitPrice
          }
        : null,
      dtfDesignUrl: product.dtfDesignUrl || ""
    });
  }

  return validated;
}

function calculateOrder(cart) {
  const subtotal = money(cart.reduce((sum, item) => sum + item.line_total, 0));
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING;
  const total = money(subtotal + shipping);
  return { subtotal, shipping, total };
}

async function getPayPalAccessToken() {
  const clientId = requireEnv("PAYPAL_CLIENT_ID");
  const secret = requireEnv("PAYPAL_CLIENT_SECRET");
  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const response = await fetch(`${paypalApiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error_description || data.error || "Could not get PayPal access token.");
  }

  return data.access_token;
}

async function sendOrderEmail({ to, subject, html }) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass || !to) {
    console.warn("SMTP not configured. Email skipped.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: { user: smtpUser, pass: smtpPass }
  });

  await transporter.sendMail({
    from: process.env.FROM_EMAIL || smtpUser,
    to,
    subject,
    html
  });
}

function buildShippingHtml(shippingInfo = {}) {
  return `
    <h3>Shipping details</h3>
    <p>
      <strong>Name:</strong> ${escapeHtml(shippingInfo.fullName || "-")}<br />
      <strong>Email:</strong> ${escapeHtml(shippingInfo.email || "-")}<br />
      <strong>Phone:</strong> ${escapeHtml(shippingInfo.phone || "-")}<br />
      <strong>Address 1:</strong> ${escapeHtml(shippingInfo.address1 || "-")}<br />
      <strong>Address 2:</strong> ${escapeHtml(shippingInfo.address2 || "-")}<br />
      <strong>City:</strong> ${escapeHtml(shippingInfo.city || "-")}<br />
      <strong>State:</strong> ${escapeHtml(shippingInfo.state || "-")}<br />
      <strong>ZIP:</strong> ${escapeHtml(shippingInfo.postalCode || "-")}<br />
      <strong>Country:</strong> ${escapeHtml(shippingInfo.country || "-")}
    </p>
  `;
}

function getCapturedAmount(captureData) {
  const capture = captureData?.purchase_units?.[0]?.payments?.captures?.[0];
  return Number(capture?.amount?.value || 0);
}

function buildItemsHtml(cart) {
  return cart
    .map((item) => {
      const variant = item.selectedVariant
        ? ` (${escapeHtml(item.selectedVariant.style)} / ${escapeHtml(item.selectedVariant.color)} / ${escapeHtml(item.selectedVariant.size)})`
        : "";
      return `<li>${escapeHtml(item.name)}${variant} x ${escapeHtml(item.quantity)} - $${item.line_total.toFixed(2)}</li>`;
    })
    .join("");
}

async function deductVariantStock(transaction, item) {
  if (!item.variantSku) return;

  const productRef = adminDb.collection("products").doc(item.productId);
  const snap = await transaction.get(productRef);
  if (!snap.exists) throw new Error(`Product missing during stock update: ${item.productId}`);

  const product = snap.data();
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const index = variants.findIndex((variant) => String(variant.sku) === String(item.variantSku));

  if (index === -1) throw new Error(`Variant missing during stock update: ${item.variantSku}`);

  const currentStock = Number(variants[index].stock || 0);
  if (currentStock < item.quantity) {
    throw new Error(`Not enough stock for ${item.name}.`);
  }

  variants[index] = {
    ...variants[index],
    stock: currentStock - item.quantity
  };

  transaction.update(productRef, {
    variants,
    updatedAt: FieldValue.serverTimestamp()
  });
}

async function savePaidOrder({ paypalOrderId, captureData, cart, totals, email, shippingInfo }) {
  const orderRef = adminDb.collection("orders").doc();
  const batch = adminDb.batch();

  batch.set(orderRef, {
    id: orderRef.id,
    paypalOrderId,
    customerEmail: email || shippingInfo.email || null,
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    total: totals.total,
    status: "paid",
    paymentProvider: "paypal",
    shippingInfo,
    paypalCapture: captureData,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  cart.forEach((item) => {
    const itemRef = orderRef.collection("items").doc();
    batch.set(itemRef, {
      id: itemRef.id,
      productId: item.productId,
      slug: item.slug,
      name: item.name,
      image: item.image,
      unitPrice: item.unit_price,
      quantity: item.quantity,
      lineTotal: item.line_total,
      variantSku: item.variantSku,
      selectedVariant: item.selectedVariant,
      dtfDesignUrl: item.dtfDesignUrl,
      createdAt: FieldValue.serverTimestamp()
    });

    const productionRef = adminDb.collection("productionTasks").doc();
    batch.set(productionRef, {
      id: productionRef.id,
      orderId: orderRef.id,
      orderItemId: itemRef.id,
      productId: item.productId,
      productName: item.name,
      variantSku: item.variantSku,
      style: item.selectedVariant?.style || "",
      color: item.selectedVariant?.color || "",
      size: item.selectedVariant?.size || "",
      blankSku: item.selectedVariant?.blankSku || "",
      dtfDesignUrl: item.dtfDesignUrl || "",
      quantity: item.quantity,
      status: "to_be_printed",
      notes: "New paid order. Print, press, quality check, pack, and ship.",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
  });

  await adminDb.runTransaction(async (transaction) => {
    for (const item of cart) {
      await deductVariantStock(transaction, item);
    }
  });

  await batch.commit();

  return { id: orderRef.id };
}

app.get("/", (_, res) => {
  res.json({
    ok: true,
    service: "TeePoP Firebase server",
    routes: ["/api/health", "/api/products", "/api/products/:slug", "/api/cart/validate"]
  });
});

app.get("/api/health", (_, res) => {
  res.json({
    ok: true,
    service: "TeePoP Firebase server",
    paypalMode: paypalApiBase.includes("sandbox") ? "sandbox" : "live",
    firebaseAdminConfigured: firebaseAdminIsConfigured(),
    clientUrl: process.env.CLIENT_URL || null,
    productPrice: PRODUCT_PRICE
  });
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await getActiveProducts();
    const search = cleanString(req.query.search).toLowerCase();
    const category = cleanString(req.query.category).toLowerCase();

    const filtered = products.filter((product) => {
      const searchText = `${product.name} ${product.description} ${product.category} ${(product.tags || []).join(" ")}`.toLowerCase();
      const matchesSearch = search ? searchText.includes(search) : true;
      const matchesCategory = category ? String(product.category || "").toLowerCase() === category : true;
      return matchesSearch && matchesCategory;
    });

    res.json({ ok: true, products: filtered });
  } catch (error) {
    console.error("GET /api/products error:", error);
    res.status(500).json({ ok: false, error: error.message || "Could not load products." });
  }
});

app.get("/api/products/:slug", async (req, res) => {
  try {
    const slug = cleanString(req.params.slug).toLowerCase();
    const snapshot = await adminDb
      .collection("products")
      .where("slug", "==", slug)
      .where("active", "==", true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ ok: false, error: "Product not found." });
    }

    res.json({ ok: true, product: normalizeProduct(snapshot.docs[0]) });
  } catch (error) {
    console.error("GET /api/products/:slug error:", error);
    res.status(500).json({ ok: false, error: error.message || "Could not load product." });
  }
});

app.post("/api/cart/validate", async (req, res) => {
  try {
    const cart = await validateCart(req.body.cart);
    const totals = calculateOrder(cart);
    res.json({ ok: true, cart, totals });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message || "Cart validation failed." });
  }
});

app.post("/api/paypal/create-order", async (req, res) => {
  try {
    const shippingInfo = validateShippingInfo(req.body.shippingInfo || {});
    const cart = await validateCart(req.body.cart);
    const totals = calculateOrder(cart);
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${paypalApiBase}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: totals.total.toFixed(2),
              breakdown: {
                item_total: { currency_code: "USD", value: totals.subtotal.toFixed(2) },
                shipping: { currency_code: "USD", value: totals.shipping.toFixed(2) }
              }
            },
            items: cart.map((item) => ({
              name: `${item.name}${item.selectedVariant ? ` - ${item.selectedVariant.color} ${item.selectedVariant.size}` : ""}`,
              unit_amount: { currency_code: "USD", value: item.unit_price.toFixed(2) },
              quantity: String(item.quantity),
              category: "PHYSICAL_GOODS"
            })),
            shipping: {
              name: { full_name: shippingInfo.fullName },
              address: {
                address_line_1: shippingInfo.address1,
                address_line_2: shippingInfo.address2,
                admin_area_2: shippingInfo.city,
                admin_area_1: shippingInfo.state,
                postal_code: shippingInfo.postalCode,
                country_code: "US"
              }
            }
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({
        error: data.message || data.error || "Could not create PayPal order.",
        details: data
      });
    }

    return res.json({ ...data, serverTotals: totals });
  } catch (error) {
    console.error("Create PayPal order error:", error);
    return res.status(400).json({ error: error.message || "Server error while creating PayPal order." });
  }
});

app.post("/api/paypal/capture-order", async (req, res) => {
  try {
    const orderID = req.body.orderID;
    if (!orderID) return res.status(400).json({ error: "Missing PayPal orderID." });

    const shippingInfo = validateShippingInfo(req.body.shippingInfo || {});
    const cart = await validateCart(req.body.cart);
    const totals = calculateOrder(cart);
    const email = req.body.email || shippingInfo.email || null;
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${paypalApiBase}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    const captureData = await response.json();

    if (!response.ok) {
      return res.status(400).json({
        error: captureData.message || captureData.error || "Could not capture PayPal order.",
        details: captureData
      });
    }

    const capturedAmount = money(getCapturedAmount(captureData));
    if (capturedAmount !== totals.total) {
      console.error("PayPal amount mismatch", { capturedAmount, expected: totals.total, orderID });
      return res.status(400).json({ error: "Payment amount mismatch. Order was not saved." });
    }

    const savedOrder = await savePaidOrder({
      paypalOrderId: orderID,
      captureData,
      cart,
      totals,
      email,
      shippingInfo
    });

    const itemsHtml = buildItemsHtml(cart);
    const shippingHtml = buildShippingHtml(shippingInfo);

    await sendOrderEmail({
      to: email,
      subject: "Your TeePoP order is confirmed",
      html: `
        <h2>Thanks for your TeePoP order.</h2>
        <p>Your payment was captured successfully.</p>
        <ul>${itemsHtml}</ul>
        <p><strong>Subtotal:</strong> $${totals.subtotal.toFixed(2)}</p>
        <p><strong>Shipping:</strong> $${totals.shipping.toFixed(2)}</p>
        <p><strong>Total:</strong> $${totals.total.toFixed(2)}</p>
        ${shippingHtml}
      `
    });

    if (process.env.ORDER_ALERT_EMAIL) {
      await sendOrderEmail({
        to: process.env.ORDER_ALERT_EMAIL,
        subject: "New TeePoP order received",
        html: `
          <p>A new order was completed.</p>
          <p><strong>PayPal Order:</strong> ${escapeHtml(orderID)}</p>
          <ul>${itemsHtml}</ul>
          <p><strong>Total:</strong> $${totals.total.toFixed(2)}</p>
          ${shippingHtml}
        `
      });
    }

    return res.json({ ok: true, paypal: captureData, order: savedOrder, totals });
  } catch (error) {
    console.error("Capture PayPal order error:", error);
    return res.status(500).json({ error: error.message || "Server error while capturing PayPal order." });
  }
});

app.get("/api/admin/orders", async (_, res) => {
  try {
    const snapshot = await adminDb.collection("orders").orderBy("createdAt", "desc").limit(100).get();
    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ ok: true, orders });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message || "Could not load orders." });
  }
});

app.get("/api/admin/production-tasks", async (_, res) => {
  try {
    const snapshot = await adminDb.collection("productionTasks").orderBy("createdAt", "desc").limit(200).get();
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ ok: true, tasks });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message || "Could not load production tasks." });
  }
});

app.patch("/api/admin/production-tasks/:id/status", async (req, res) => {
  try {
    const allowed = ["to_be_printed", "printed", "pressed", "quality_checked", "packed", "shipped", "issue"];
    const status = cleanString(req.body.status);

    if (!allowed.includes(status)) {
      return res.status(400).json({ ok: false, error: "Invalid production status." });
    }

    await adminDb.collection("productionTasks").doc(req.params.id).update({
      status,
      notes: cleanString(req.body.notes),
      updatedAt: FieldValue.serverTimestamp()
    });

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message || "Could not update production task." });
  }
});

app.use((req, res) => {
  res.status(404).json({ ok: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`TeePoP Firebase server running on port ${port}`);
});
