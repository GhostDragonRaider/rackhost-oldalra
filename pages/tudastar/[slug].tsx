import React from "react";
import Link from "next/link";
import { GetStaticPaths, GetStaticProps } from "next";
import LandingShell from "../../components/landing/LandingShell";
import { ARTICLES, Article, getArticle } from "../../lib/articles";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  SITE_NAME,
} from "../../lib/site";

type Props = { article: Article };

export default function TudastarArticlePage({ article }: Props) {
  const path = `/tudastar/${article.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.h1,
      description: article.description,
      datePublished: article.date,
      dateModified: article.date,
      inLanguage: "hu-HU",
      author: { "@type": "Person", name: "Anti", url: absoluteUrl("/rolam") },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/logo.png"),
        },
      },
      image: absoluteUrl("/og/default.png"),
      mainEntityOfPage: absoluteUrl(path),
    },
    breadcrumbJsonLd([
      { name: "Kezdőlap", path: "/" },
      { name: "Tudástár", path: "/tudastar" },
      { name: article.h1, path },
    ]),
  ];

  return (
    <LandingShell
      title={article.title}
      description={article.description}
      path={path}
      ogType="article"
      jsonLd={jsonLd}
    >
      <section className="hero container subpage-hero">
        <div>
          <div className="eyebrow">
            {article.eyebrow} · {article.readingMinutes} perc olvasás
          </div>
          <h1>{article.h1}</h1>
          <p>{article.lead}</p>
        </div>
      </section>

      {article.sections.map((section) => (
        <section className="content-block" key={section.heading}>
          <div className="container prose">
            <h2>{section.heading}</h2>
            {section.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
            {section.bullets?.length ? (
              <ul>
                {section.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ))}

      <section className="contact">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Kapcsolódó</div>
              <h2>Folytasd itt</h2>
            </div>
          </div>
          <ul className="related-links">
            {article.relatedServices.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/tudastar">Összes cikk</Link>
            </li>
          </ul>
        </div>
      </section>
    </LandingShell>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: ARTICLES.map((article) => ({
    params: { slug: article.slug },
  })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async (ctx) => {
  const slug = String(ctx.params?.slug || "");
  const article = getArticle(slug);
  if (!article) return { notFound: true };
  return { props: { article } };
};
