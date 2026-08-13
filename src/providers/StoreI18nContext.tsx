"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { StoreLang, storeTranslations, StoreTranslations } from "@/lib/i18n/store/translations";

interface StoreI18nContextType {
  lang: StoreLang;
  dir: "ltr" | "rtl";
  setLang: (lang: StoreLang) => void;
  toggleLang: () => void;
  t: (path: string, fallback?: string) => string;
  formatPrice: (amount: number | string) => string;
  formatNumber: (value: number | string) => string;
}

const STORAGE_KEY = "deroma_store_lang";

const StoreI18nContext = createContext<StoreI18nContextType | undefined>(undefined);

function getNestedValue(obj: any, path: string): string | undefined {
  const parts = path.split(".");
  let curr = obj;
  for (const part of parts) {
    if (curr && typeof curr === "object" && part in curr) {
      curr = curr[part];
    } else {
      return undefined;
    }
  }
  return typeof curr === "string" ? curr : undefined;
}

export function StoreI18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<StoreLang>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY) as StoreLang | null;
    if (saved === "ar" || saved === "en") {
      setLangState(saved);
      document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = saved;
    } else {
      // Use the device/browser language on the first visit. A manual toggle
      // is stored above and takes precedence on future visits.
      const deviceLanguage = (navigator.language || navigator.languages?.[0] || "en").toLowerCase();
      const detectedLanguage: StoreLang = deviceLanguage.startsWith("ar") ? "ar" : "en";
      setLangState(detectedLanguage);
      document.documentElement.dir = detectedLanguage === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = detectedLanguage;
    }
  }, []);

  const setLang = (newLang: StoreLang) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = newLang;
      window.dispatchEvent(new CustomEvent("store-lang-change", { detail: newLang }));
    }
  };

  const toggleLang = () => {
    const nextLang = lang === "ar" ? "en" : "ar";
    setLang(nextLang);
  };

  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr";

  const t = (path: string, fallback?: string): string => {
    const currentDict = storeTranslations[lang];
    const val = getNestedValue(currentDict, path);
    if (val !== undefined) return val;

    // Fallback to English dictionary
    const fallbackVal = getNestedValue(storeTranslations.en, path);
    if (fallbackVal !== undefined) return fallbackVal;

    return fallback ?? path;
  };

  // Rule: Numbers stay Western Arabic (English) digits (1, 2, 3...)
  const formatNumber = (value: number | string): string => {
    const num = typeof value === "number" ? value : parseFloat(String(value));
    if (isNaN(num)) return String(value);
    return new Intl.NumberFormat("en-US").format(num);
  };

  // Rule: Price numbers stay Western Arabic digits (1, 2, 3...)
  // In EN: 1,250 EGP
  // In AR: 1,250 ج.م
  const formatPrice = (amount: number | string): string => {
    const num = typeof amount === "number" ? amount : parseFloat(String(amount));
    if (isNaN(num)) return `${amount} ${lang === "ar" ? "ج.م" : "EGP"}`;
    const formattedNum = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(num);

    return lang === "ar" ? `${formattedNum} ج.م` : `${formattedNum} EGP`;
  };

  return (
    <StoreI18nContext.Provider
      value={{
        lang,
        dir,
        setLang,
        toggleLang,
        t,
        formatPrice,
        formatNumber,
      }}
    >
      {children}
    </StoreI18nContext.Provider>
  );
}

export function useStoreI18n() {
  const ctx = useContext(StoreI18nContext);
  if (!ctx) {
    // Provide safe default fallback if used outside provider
    return {
      lang: "en" as StoreLang,
      dir: "ltr" as const,
      setLang: () => {},
      toggleLang: () => {},
      t: (path: string, fallback?: string) => fallback ?? path,
      formatPrice: (amount: number | string) => `${amount} EGP`,
      formatNumber: (val: number | string) => String(val),
    };
  }
  return ctx;
}
