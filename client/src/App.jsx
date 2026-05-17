// client/src/App.jsx

import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import CartPage from "./pages/CartPage";
import AuthPage from "./pages/AuthPage";
import SuccessPage from "./pages/SuccessPage";
import ProductPage from "./pages/ProductPage";
import WhatsAppButton from "./components/WhatsAppButton";
import LanguagePopup from "./components/LanguagePopup";
import DtfGalleryPage from "./pages/DtfGalleryPage";

export default function App() {
  return (
    <>
      <LanguagePopup />

      <Navbar />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products/:slug" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/success" element={<SuccessPage />} />
          

<Route path="/dtf-gallery" element={<DtfGalleryPage />} />
        </Routes>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}