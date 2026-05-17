// server/routes/dtfImages.routes.js

import express from "express";
import { localDtfImages } from "../data/dtfImages.js";

const router = express.Router();

function normalizeExternalImage(item, index) {
  return {
    id: item.id || item.uuid || item.slug || `external-${index}`,
    title: item.title || item.name || item.alt || `DTF Design ${index + 1}`,
    category: item.category || item.type || "External",
    tags: Array.isArray(item.tags) ? item.tags : ["dtf"],
    imageUrl:
      item.imageUrl ||
      item.image_url ||
      item.url ||
      item.preview_url ||
      item.mockup_url ||
      item.thumbnail ||
      "",
    source: "api"
  };
}

async function fetchExternalDtfImages() {
  const apiBaseUrl = process.env.DTF_API_BASE_URL;
  const apiKey = process.env.DTF_API_KEY;

  if (!apiBaseUrl || !apiKey) {
    return [];
  }

  const response = await fetch(apiBaseUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-API-Key": apiKey
    }
  });

  if (!response.ok) {
    throw new Error(`DTF API failed with status ${response.status}`);
  }

  const data = await response.json();

  const list =
    data.items ||
    data.products ||
    data.designs ||
    data.images ||
    data.data ||
    [];

  if (!Array.isArray(list)) {
    return [];
  }

  return list
    .map(normalizeExternalImage)
    .filter((item) => item.imageUrl);
}

router.get("/", async (req, res) => {
  try {
    const search = String(req.query.search || "").toLowerCase().trim();
    const category = String(req.query.category || "all").toLowerCase().trim();

    let externalImages = [];

    try {
      externalImages = await fetchExternalDtfImages();
    } catch (error) {
      console.warn("External DTF API skipped:", error.message);
    }

    let images = [...externalImages, ...localDtfImages];

    if (search) {
      images = images.filter((item) => {
        const text = `${item.title} ${item.category} ${(item.tags || []).join(" ")}`.toLowerCase();
        return text.includes(search);
      });
    }

    if (category && category !== "all") {
      images = images.filter((item) => String(item.category || "").toLowerCase() === category);
    }

    res.json({
      ok: true,
      images,
      count: images.length,
      apiConnected: externalImages.length > 0
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message || "Could not load DTF images."
    });
  }
});

export default router;