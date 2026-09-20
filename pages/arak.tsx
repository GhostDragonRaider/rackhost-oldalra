import React from "react";
import Link from "next/link";
import LandingShell from "../components/landing/LandingShell";
import PricingTable from "../components/landing/PricingTable";
import { useLocale } from "../lib/i18n/LocaleContext";
import { absoluteUrl, SITE_EMAIL, SITE_NAME, SITE_URL } from "../lib/site";

export default function ArakPage() {
  const { t } = useLocale();
  const p = t.pricingPage;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: p.catalogName,
    description: p.description,
    url: absoluteUrl("/arak"),
    provider: {
      "@type": "ProfessionalService",
      name: SITE_NAME,
      url: SITE_URL,
      email: SITE_EMAIL,
    },
  };

  return (
    <LandingShell
      title={p.title}
      description={p.description}
      path="/arak"
      jsonLd={jsonLd}
    >
      <section className="pricing" id="arak">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">{p.eyebrow}</div>
              <h1>{p.h1}</h1>
            </div>
            <p>{p.lead}</p>
          </div>

          <PricingTable />

          <div className="price-callout">
            <p>
              <strong>{p.calloutStrong}</strong> {p.calloutRest}
            </p>
            <a className="btn" href="/kapcsolat">
              {p.cta} <span aria-hidden="true">→</span>
            </a>
          </div>

          <nav className="related-links" aria-label={p.relatedAria}>
            {p.related.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </LandingShell>
  );
}
