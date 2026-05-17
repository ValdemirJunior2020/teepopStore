// client/src/context/LanguageContext.jsx

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "../translations/translations";

const LanguageContext = createContext(null);

const DEFAULT_LANGUAGE = "en";
const STORAGE_KEY = "teepop_language";

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const savedLanguage = localStorage.getItem(STORAGE_KEY);

    if (savedLanguage && translations[savedLanguage]) {
      return savedLanguage;
    }

    return DEFAULT_LANGUAGE;
  });

  const setLanguage = (newLanguage) => {
    if (!translations[newLanguage]) {
      setLanguageState(DEFAULT_LANGUAGE);
      localStorage.setItem(STORAGE_KEY, DEFAULT_LANGUAGE);
      return;
    }

    setLanguageState(newLanguage);
    localStorage.setItem(STORAGE_KEY, newLanguage);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(() => {
    return {
      language,
      setLanguage,
      t: translations[language] || translations[DEFAULT_LANGUAGE],
      availableLanguages: [
        {
          code: "en",
          label: "English",
          shortLabel: "EN",
          flag: "🇺🇸"
        },
        {
          code: "pt",
          label: "Português",
          shortLabel: "PT",
          flag: "🇧🇷"
        },
        {
          code: "es",
          label: "Español",
          shortLabel: "ES",
          flag: "🇪🇸"
        }
      ]
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}