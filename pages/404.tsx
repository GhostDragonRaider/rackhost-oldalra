import React from "react";
import Link from "next/link";
import SeoHead from "../components/landing/SeoHead";
import { useLang } from "../components/lang_context";

const messages = {
  en: {
    title: "Page not found",
    subtitle: "The page you're looking for doesn't exist or has been moved.",
    back: "Back to home",
  },
  hu: {
    title: "Az oldal nem található",
    subtitle: "A keresett oldal nem létezik vagy áthelyezték.",
    back: "Vissza a főoldalra",
  },
};

export default function Custom404() {
  const { lang } = useLang();
  const t = messages[lang];

  return (
    <div className="page-404">
      <SeoHead
        title="Az oldal nem található | AntiCode"
        description="A keresett AntiCode oldal nem található. Lépj vissza a kezdőlapra vagy a kapcsolat oldalra."
        path="/404"
        noindex
      />
      <p className="page-404-code" aria-hidden="true">
        404
      </p>
      <h1 className="page-404-title">{t.title}</h1>
      <p className="page-404-subtitle">{t.subtitle}</p>
      <p className="page-404-links">
        <Link href="/" className="page-404-link">
          {t.back}
        </Link>
        {" · "}
        <Link href="/kapcsolat" className="page-404-link">
          Kapcsolat
        </Link>
      </p>
    </div>
  );
}
