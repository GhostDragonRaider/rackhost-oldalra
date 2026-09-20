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
  "AntiCode tudástár: weboldal készítés árak, weboldal vs webshop, SEO alapok és indítási checklist szolgáltató vállalkozásoknak.";

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
            Rövid, gyakorlatias anyagok: árazás, SEO, indítás és a
            „weboldal vagy webshop” kérdés. Minden cikk a megfelelő
            szolgáltatásoldalra vezet.
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
                <p>{article.lead}</p>
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
