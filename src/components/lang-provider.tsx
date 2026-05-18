"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { content, type Lang } from "@/lib/content";

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: typeof content.en;
};

const LangContext = createContext<LangContextValue | null>(null);

const STORAGE_KEY = "toromovers-lang";

function detectLang(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "es" || stored === "en") return stored;
  const nav = window.navigator?.language ?? "";
  return nav.toLowerCase().startsWith("es") ? "es" : "en";
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(detectLang());
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.setAttribute("lang", next);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("lang", lang);
    }
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t: content[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
