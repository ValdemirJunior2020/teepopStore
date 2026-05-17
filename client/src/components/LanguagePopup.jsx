// client/src/components/LanguagePopup.jsx

import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function LanguagePopup() {
  const { language, setLanguage } = useLanguage();
  const [showPopup, setShowPopup] = useState(true);

  const chooseLanguage = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setShowPopup(false);
  };

  if (!showPopup) {
    return null;
  }

  return (
    <div className="language-popup-overlay">
      <div className="language-popup-card">
        <div className="language-popup-badge">🌎 TeePoP</div>

        <h2>What language do you prefer?</h2>

        <p>Choose your language to continue shopping.</p>

        <div className="language-popup-options">
          <button
            type="button"
            className={language === "en" ? "language-option active" : "language-option"}
            onClick={() => chooseLanguage("en")}
          >
            <span className="language-flag">🇺🇸</span>
            <span>English</span>
          </button>

          <button
            type="button"
            className={language === "pt" ? "language-option active" : "language-option"}
            onClick={() => chooseLanguage("pt")}
          >
            <span className="language-flag">🇧🇷</span>
            <span>Português</span>
          </button>

          <button
            type="button"
            className={language === "es" ? "language-option active" : "language-option"}
            onClick={() => chooseLanguage("es")}
          >
            <span className="language-flag">🇪🇸</span>
            <span>Español</span>
          </button>
        </div>
      </div>
    </div>
  );
}