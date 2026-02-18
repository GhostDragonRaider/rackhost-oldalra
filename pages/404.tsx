import React from "react";
import Link from "next/link";
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
      <h1 className="page-404-code">404</h1>
      <h2 className="page-404-title">{t.title}</h2>
      <p className="page-404-subtitle">{t.subtitle}</p>
      <Link href="/" className="page-404-link">
        {t.back}
      </Link>
    </div>
  );
}
