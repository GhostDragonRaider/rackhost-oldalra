import React, {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import type { Dictionary, Locale } from "./types";
import { getDictionary, LOCALES } from "./dictionaries";

const LOCALE_KEY = "anticode-locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
  locales: Locale[];
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function isLocale(value: string | null): value is Locale {
  return value === "hu" || value === "en" || value === "de";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("hu");

  useLayoutEffect(() => {
    const saved = localStorage.getItem(LOCALE_KEY);
    const initial: Locale = isLocale(saved) ? saved : "hu";
    setLocaleState(initial);
    document.documentElement.lang =
      initial === "hu" ? "hu" : initial === "de" ? "de" : "en";
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(LOCALE_KEY, next);
    document.documentElement.lang =
      next === "hu" ? "hu" : next === "de" ? "de" : "en";
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: getDictionary(locale),
      locales: LOCALES,
    }),
    [locale, setLocale]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
