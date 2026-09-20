import React from "react";
import type { Locale } from "../../lib/i18n/types";
import { useLocale } from "../../lib/i18n/LocaleContext";

function FlagHu() {
  return (
    <svg viewBox="0 0 24 16" width="22" height="15" aria-hidden="true">
      <rect width="24" height="16" rx="2" fill="#fff" />
      <rect width="24" height="5.33" fill="#c8102e" />
      <rect y="10.67" width="24" height="5.33" fill="#00843d" />
    </svg>
  );
}

function FlagEn() {
  return (
    <svg viewBox="0 0 24 16" width="22" height="15" aria-hidden="true">
      <rect width="24" height="16" rx="2" fill="#012169" />
      <path d="M0 0 L24 16 M24 0 L0 16" stroke="#fff" strokeWidth="3" />
      <path d="M0 0 L24 16 M24 0 L0 16" stroke="#c8102e" strokeWidth="1.5" />
      <path d="M12 0 V16 M0 8 H24" stroke="#fff" strokeWidth="5" />
      <path d="M12 0 V16 M0 8 H24" stroke="#c8102e" strokeWidth="2.5" />
    </svg>
  );
}

function FlagDe() {
  return (
    <svg viewBox="0 0 24 16" width="22" height="15" aria-hidden="true">
      <rect width="24" height="16" rx="2" fill="#000" />
      <rect y="5.33" width="24" height="5.34" fill="#dd0000" />
      <rect y="10.67" width="24" height="5.33" fill="#ffce00" />
    </svg>
  );
}

const FLAGS: Record<Locale, { Flag: () => JSX.Element; labelKey: "langHu" | "langEn" | "langDe" }> = {
  hu: { Flag: FlagHu, labelKey: "langHu" },
  en: { Flag: FlagEn, labelKey: "langEn" },
  de: { Flag: FlagDe, labelKey: "langDe" },
};

export default function LangSwitcher() {
  const { locale, setLocale, t, locales } = useLocale();

  return (
    <div className="lang-switcher" role="group" aria-label={t.chrome.langLabel}>
      {locales.map((code) => {
        const { Flag, labelKey } = FLAGS[code];
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            className={`lang-btn${active ? " is-active" : ""}`}
            aria-label={t.chrome[labelKey]}
            aria-pressed={active}
            title={t.chrome[labelKey]}
            onClick={() => setLocale(code)}
          >
            <Flag />
          </button>
        );
      })}
    </div>
  );
}
