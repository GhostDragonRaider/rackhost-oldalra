import React from "react";
import Link from "next/link";
import LandingShell from "./LandingShell";
import { SERVICE_PAGES } from "./servicePages";
import { useLocale } from "../../lib/i18n/LocaleContext";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  faqJsonLd,
  SITE_EMAIL,
  SITE_NAME,
  SITE_URL,
} from "../../lib/site";

export default function ServicePageView({ path }: { path: string }) {
  const { t, locale } = useLocale();
  const page = t.servicePages[path];
  if (!page) {
    return null;
  }

  // Keep expanded HU SEO content from servicePages.ts without affecting EN/DE copy.
  const seoExtra =
    locale === "hu"
      ? SERVICE_PAGES.find((entry) => entry.path === path)
      : undefined;

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: page.schemaName,
      serviceType: page.schemaType,
      description: page.description,
      url: absoluteUrl(path),
      provider: {
        "@type": "ProfessionalService",
        name: SITE_NAME,
        url: SITE_URL,
        email: SITE_EMAIL,
        image: absoluteUrl("/logo.png"),
      },
      areaServed: "HU",
    },
    breadcrumbJsonLd([
      { name: t.serviceUi.home, path: "/" },
      { name: page.schemaName, path },
    ]),
  ];

  if (seoExtra?.faqs?.length) {
    jsonLd.push(faqJsonLd(seoExtra.faqs, absoluteUrl(path)));
  }

  return (
    <LandingShell
      title={page.title}
      description={page.description}
      path={path}
      jsonLd={jsonLd}
    >
      <section className="hero container subpage-hero">
        <div>
          <div className="eyebrow">{page.eyebrow}</div>
          <h1>{seoExtra?.h1 || page.h1}</h1>
          <p>{seoExtra?.lead || page.lead}</p>
          <div className="actions">
            <Link className="btn" href="/kapcsolat">
              {t.serviceUi.cta} <span aria-hidden="true">→</span>
            </Link>
            <Link className="btn secondary" href="/arak">
              {t.serviceUi.viewPrices}
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">{t.serviceUi.whatYouGetEyebrow}</div>
              <h2>{t.serviceUi.whatYouGetH2}</h2>
            </div>
          </div>
          <div className="cards">
            {(seoExtra?.points || page.points).map((point, i) => (
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

      {seoExtra?.sections?.map((section) => (
        <section className="content-block" key={section.heading}>
          <div className="container prose">
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
            {section.bullets?.length ? (
              <ul>
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ))}

      {seoExtra?.faqs?.length ? (
        <section className="faq" id="gyik">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow">GYIK</div>
                <h2>Gyakori kérdések</h2>
              </div>
            </div>
            <div className="faq-list faq-list-single">
              {seoExtra.faqs.map((item) => (
                <details className="faq-item" key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="contact">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">{t.serviceUi.relatedEyebrow}</div>
              <h2>{t.serviceUi.relatedH2}</h2>
            </div>
          </div>
          <ul className="related-links">
            {(seoExtra?.related || page.related).map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/kapcsolat">{t.serviceUi.requestQuote}</Link>
            </li>
          </ul>
        </div>
      </section>
    </LandingShell>
  );
}
