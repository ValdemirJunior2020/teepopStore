// client/src/pages/HomePage.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../lib/productApi";
import { useLanguage } from "../context/LanguageContext";
import "./home-page.css";

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

const homeText = {
  en: {
    kicker: "TeePoP DTF Printing",
    title: "Faith, funny, and custom shirts printed in-house.",
    description:
      "Premium DTF shirts made by TeePoP. Choose your design, pick your size, and we print, press, package, and ship it ourselves.",
    shop: "Shop Shirts",
    whatsapp: "WhatsApp Us",
    trust1: "DTF Quality",
    trust2: "Made In-House",
    trust3: "Ships From Florida",
    drops: "New TeePoP Drops",
    pickTitle: "Pick your favorite shirt",
    viewAll: "View all",
    featured: "Featured",
    originalCanCategory: "Original Can",
    originalCanName: "Original TeePoP Can",
    pickThisOne: "Pick this one",
    choose: "Choose your shirt",
    chooseText: "Pick from faith, funny, Brazil 2026, and custom-ready designs.",
    print: "We print it",
    printText: "Your shirt is printed using TeePoP’s in-house DTF workflow.",
    ship: "We ship it",
    shipText: "We quality-check, package, and ship your order from Florida.",
    loading: "Loading TeePoP products..."
  },
  pt: {
    kicker: "Impressão DTF TeePoP",
    title: "Camisetas de fé, engraçadas e personalizadas feitas por nós.",
    description:
      "Camisetas DTF premium feitas pela TeePoP. Escolha seu design, selecione seu tamanho, e nós imprimimos, prensamos, embalamos e enviamos.",
    shop: "Comprar Camisetas",
    whatsapp: "Falar no WhatsApp",
    trust1: "Qualidade DTF",
    trust2: "Feito por Nós",
    trust3: "Enviado da Flórida",
    drops: "Novidades TeePoP",
    pickTitle: "Escolha sua camiseta favorita",
    viewAll: "Ver tudo",
    featured: "Destaque",
    originalCanCategory: "Lata Original",
    originalCanName: "Lata Original TeePoP",
    pickThisOne: "Escolher esta",
    choose: "Escolha sua camiseta",
    chooseText: "Escolha entre designs de fé, engraçados, Brasil 2026 e personalizados.",
    print: "Nós imprimimos",
    printText: "Sua camiseta é impressa com o processo DTF interno da TeePoP.",
    ship: "Nós enviamos",
    shipText: "Nós revisamos, embalamos e enviamos seu pedido da Flórida.",
    loading: "Carregando produtos TeePoP..."
  },
  es: {
    kicker: "Impresión DTF TeePoP",
    title: "Camisetas de fe, divertidas y personalizadas hechas por nosotros.",
    description:
      "Camisetas DTF premium hechas por TeePoP. Elige tu diseño, selecciona tu talla, y nosotros imprimimos, prensamos, empacamos y enviamos.",
    shop: "Comprar Camisetas",
    whatsapp: "WhatsApp",
    trust1: "Calidad DTF",
    trust2: "Hecho por Nosotros",
    trust3: "Enviado desde Florida",
    drops: "Nuevos Diseños TeePoP",
    pickTitle: "Elige tu camiseta favorita",
    viewAll: "Ver todo",
    featured: "Destacado",
    originalCanCategory: "Lata Original",
    originalCanName: "Lata Original TeePoP",
    pickThisOne: "Elegir esta",
    choose: "Elige tu camiseta",
    chooseText: "Elige entre diseños de fe, divertidos, Brasil 2026 y personalizados.",
    print: "La imprimimos",
    printText: "Tu camiseta se imprime con el proceso DTF interno de TeePoP.",
    ship: "La enviamos",
    shipText: "Revisamos, empacamos y enviamos tu pedido desde Florida.",
    loading: "Cargando productos TeePoP..."
  }
};

export default function HomePage() {
  const { language } = useLanguage();
  const text = homeText[language] || homeText.en;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        setLoading(true);
        const data = await getProducts();

        if (!active) return;

        setProducts(data);
      } catch (error) {
        console.error("Home products failed:", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="teepop-home">
      <section className="home-hero">
        <div className="container home-hero-content">
          <p className="home-eyebrow">{text.kicker}</p>

          <h1>{text.title}</h1>

          <p className="home-hero-text">{text.description}</p>

          <div className="home-hero-actions">
            <Link to="/shop" className="home-primary-btn">
              {text.shop}
            </Link>

            <a
              href="https://wa.me/17543669922"
              target="_blank"
              rel="noreferrer"
              className="home-secondary-btn"
            >
              {text.whatsapp}
            </a>
          </div>

          <div className="home-trust-row">
            <span>{text.trust1}</span>
            <span>{text.trust2}</span>
            <span>{text.trust3}</span>
          </div>
        </div>
      </section>

      <section className="home-products-section">
        <div className="container">
          <div className="home-section-header">
            <div>
              <p className="home-eyebrow">{text.drops}</p>
              <h2>{text.pickTitle}</h2>
            </div>

            <Link to="/shop" className="home-view-all">
              {text.viewAll}
            </Link>
          </div>

          {loading && <p className="home-loading">{text.loading}</p>}

          <div className="home-shirt-grid">
            <article className="home-shirt-card">
              <Link to="/shop" className="home-shirt-image-wrap">
                <video
                  className="home-shirt-image"
                  src="/teepop.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />

                <span>{text.featured}</span>
              </Link>

              <div className="home-shirt-info">
                <p>{text.originalCanCategory}</p>
                <h3>{text.originalCanName}</h3>
                <strong>$40.00</strong>

                <Link to="/shop" className="home-pick-btn">
                  {text.pickThisOne}
                </Link>
              </div>
            </article>

            {products.map((product) => {
              const showBrazilIcon = isBrazilProduct(product);

              return (
                <article key={product.id || product.slug} className="home-shirt-card">
                  <Link
                    to={`/products/${product.slug}`}
                    className="home-shirt-image-wrap"
                  >
                    <img
                      src={product.mainImageUrl || product.imageUrl || product.image}
                      alt={product.name}
                      className="home-shirt-image"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.src = "/logoshirt.png";
                      }}
                    />

                    {product.featured && <span>{text.featured}</span>}
                  </Link>

                  <div className="home-shirt-info">
                    <p>{product.category}</p>

                    <h3>
                      {product.name}
                      {showBrazilIcon && (
                        <span style={{ marginLeft: "6px", fontSize: "1.1rem" }}>
                          🇧🇷
                        </span>
                      )}
                    </h3>

                    <strong>${Number(product.price || 40).toFixed(2)}</strong>

                    <Link
                      to={`/products/${product.slug}`}
                      className="home-pick-btn"
                    >
                      {text.pickThisOne}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-process-section">
        <div className="container home-process-grid">
          <div className="home-process-card">
            <span>01</span>
            <h3>{text.choose}</h3>
            <p>{text.chooseText}</p>
          </div>

          <div className="home-process-card">
            <span>02</span>
            <h3>{text.print}</h3>
            <p>{text.printText}</p>
          </div>

          <div className="home-process-card">
            <span>03</span>
            <h3>{text.ship}</h3>
            <p>{text.shipText}</p>
          </div>
        </div>
      </section>
    </main>
  );
}