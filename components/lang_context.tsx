"use client";
import React from "react";

export type Lang = "en" | "hu";

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const LangContext = React.createContext<LangContextValue | undefined>(undefined);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>("en");

  React.useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("lang") : null;
      let initial: Lang = "en";
      if (saved === "hu" || saved === "en") initial = saved;
      else if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("hu")) initial = "hu";
      setLangState(initial);
      if (typeof document !== "undefined") document.documentElement.lang = initial;
    } catch {}
  }, []);

  const setLang = React.useCallback((l: Lang) => {
    setLangState(l);
    try {
      if (typeof window !== "undefined") localStorage.setItem("lang", l);
      if (typeof document !== "undefined") document.documentElement.lang = l;
    } catch {}
  }, []);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = React.useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}


