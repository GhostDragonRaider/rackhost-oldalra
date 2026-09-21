import React from "react";
import Link from "next/link";
import LandingShell from "../../components/landing/LandingShell";
import { ARTICLES } from "../../lib/articles";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  SITE_NAME,
  SITE_URL,
} from "../../lib/site";

const TITLE = "Tudástár — weboldal, webshop, SEO | AntiCode";
const DESCRIPTION =
  "Weboldal és webshop útmutatók: árak, döntési segédletek, SEO checklistek és technikai magyarázatok — gyakorlati válaszokkal.";

export default function TudastarIndexPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: TITLE,
      url: absoluteUrl("/tudastar"),
      description: DESCRIPTION,
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    },
    breadcrumbJsonLd([
      { name: "Kezdőlap", path: "/" },
      { name: "Tudástár", path: "/tudastar" },
    ]),
  ];

  return (
    <LandingShell
      title={TITLE}
      description={DESCRIPTION}
      path="/tudastar"
      jsonLd={jsonLd}
    >
      <section className="hero container subpage-hero">
        <div>
          <div className="eyebrow">Tudástár</div>
          <h1>Döntést segítő cikkek weboldalhoz és webshophoz.</h1>
          <p>
            Konkrét árkeretek, döntési táblázatok, élesítési checklistek és
            technikai SEO magyarázatok. Akkor is hasznos, ha végül nem nálam
            rendelsz.
          </p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="cards article-cards">
            {ARTICLES.map((article) => (
              <article className="card" key={article.slug}>
                <span className="num">
                  {article.eyebrow.toUpperCase()} · {article.readingMinutes} perc
                </span>
                <h2>
                  <Link href={`/tudastar/${article.slug}`}>{article.h1}</Link>
                </h2>
                <p>{article.cardExcerpt}</p>
                <Link className="text-link" href={`/tudastar/${article.slug}`}>
                  Elolvasom →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </LandingShell>
  );
}
