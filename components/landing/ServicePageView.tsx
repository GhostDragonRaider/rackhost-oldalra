import React from "react";
import Link from "next/link";
import LandingShell from "./LandingShell";
import type { ServicePageContent } from "./servicePages";
import { absoluteUrl, SITE_EMAIL, SITE_NAME, SITE_URL } from "../../lib/site";

export default function ServicePageView({ page }: { page: ServicePageContent }) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: page.schemaName,
      serviceType: page.schemaType,
      description: page.description,
      url: absoluteUrl(page.path),
      provider: {
        "@type": "ProfessionalService",
        name: SITE_NAME,
        url: SITE_URL,
        email: SITE_EMAIL,
      },
      areaServed: "HU",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Kezdőlap",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: page.schemaName,
          item: absoluteUrl(page.path),
        },
      ],
    },
  ];

  return (
    <LandingShell
      title={page.title}
      description={page.description}
      path={page.path}
      jsonLd={jsonLd}
    >
      <section className="hero container subpage-hero">
        <div>
          <div className="eyebrow">{page.eyebrow}</div>
          <h1>{page.h1}</h1>
          <p>{page.lead}</p>
          <div className="actions">
            <a className="btn" href={page.ctaHref}>
              Kérek ajánlatot <span aria-hidden="true">→</span>
            </a>
            <Link className="btn secondary" href="/arak">
              Árak megtekintése
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Mit kapsz</div>
              <h2>Egy irány. Érthető következő lépés.</h2>
            </div>
          </div>
          <div className="cards">
            {page.points.map((point, i) => (
              <article className="card" key={point.title}>
                <span className="num">
                  {String(i + 1).padStart(2, "0")} /{" "}
                  {page.eyebrow.toUpperCase()}
                </span>
                <h3>{point.title}</h3>
                <p>{point.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="contact">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Kapcsolódó</div>
              <h2>További szolgáltatások</h2>
            </div>
          </div>
          <ul className="related-links">
            {page.related.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
            <li>
              <a href="/#kapcsolat">Ajánlatkérés</a>
            </li>
          </ul>
        </div>
      </section>
    </LandingShell>
  );
}
