// client/src/pages/DtfGalleryPage.jsx

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getDtfImages } from "../lib/dtfApi";
import "./dtf-gallery-page.css";

export default function DtfGalleryPage() {
  const [images, setImages] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [error, setError] = useState("");

  async function loadImages() {
    try {
      setLoading(true);
      setError("");

      const data = await getDtfImages({ search, category });

      setImages(data.images || []);
      setApiConnected(Boolean(data.apiConnected));
    } catch (err) {
      setError(err.message || "Could not load DTF images.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadImages();
  }, []);

  const categories = useMemo(() => {
    const unique = new Set(images.map((item) => item.category).filter(Boolean));
    return ["all", ...Array.from(unique)];
  }, [images]);

  function handleSearch(event) {
    event.preventDefault();
    loadImages();
  }

  return (
    <main className="dtf-gallery-page">
      <section className="dtf-gallery-hero">
        <div className="container">
          <p className="dtf-eyebrow">TeePoP DTF Image Gallery</p>

          <h1>Pick a DTF design image for your next shirt.</h1>

          <p>
            Browse local TeePoP shirt designs now. When your external DTF API is connected,
            this same page will also show API design images.
          </p>

          <div className="dtf-api-status">
            {apiConnected ? "External DTF API connected" : "Using local TeePoP images"}
          </div>
        </div>
      </section>

      <section className="dtf-gallery-content">
        <div className="container">
          <form className="dtf-toolbar" onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="Search faith, funny, dog, tacos..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All categories" : item}
                </option>
              ))}
            </select>

            <button type="submit">Search</button>
          </form>

          {loading && <div className="dtf-notice">Loading DTF images...</div>}

          {error && <div className="dtf-notice dtf-error">{error}</div>}

          {!loading && !error && images.length === 0 && (
            <div className="dtf-notice">No DTF images found.</div>
          )}

          {!loading && !error && images.length > 0 && (
            <>
              <p className="dtf-count">Showing {images.length} DTF image designs</p>

              <div className="dtf-image-grid">
                {images.map((item) => (
                  <article key={item.id} className="dtf-image-card">
                    <div className="dtf-image-wrap">
                      <img src={item.imageUrl} alt={item.title} loading="lazy" />
                      <span>{item.source === "api" ? "API" : "Local"}</span>
                    </div>

                    <div className="dtf-image-info">
                      <p>{item.category}</p>
                      <h3>{item.title}</h3>

                      <div className="dtf-tags">
                        {(item.tags || []).slice(0, 3).map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>

                      <Link
                        className="dtf-pick-btn"
                        to={`/shop?design=${encodeURIComponent(item.id)}`}
                      >
                        Pick this design
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}