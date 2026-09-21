import React from "react";
import Link from "next/link";
import {
  Article,
  ArticleBlock,
  ArticleSection,
  parseInlineLinks,
} from "../../lib/articles/types";

function RichText({ text }: { text: string }) {
  const parts = parseInlineLinks(text);
  return (
    <>
      {parts.map((part, i) => {
        if (part.type === "text") {
          return <React.Fragment key={i}>{part.value}</React.Fragment>;
        }
        if (part.href.startsWith("/")) {
          return (
            <Link key={i} href={part.href}>
              {part.label}
            </Link>
          );
        }
        return (
          <a key={i} href={part.href} rel="noopener noreferrer">
            {part.label}
          </a>
        );
      })}
    </>
  );
}

function Block({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "p":
      return (
        <p>
          <RichText text={block.text} />
        </p>
      );
    case "ul":
      return (
        <ul>
          {block.items.map((item) => (
            <li key={item}>
              <RichText text={item} />
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol>
          {block.items.map((item) => (
            <li key={item}>
              <RichText text={item} />
            </li>
          ))}
        </ol>
      );
    case "table":
      return (
        <div className="prose-table-wrap">
          {block.caption ? (
            <p className="prose-table-caption">{block.caption}</p>
          ) : null}
          <table className="prose-table">
            <thead>
              <tr>
                {block.headers.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>
                      <RichText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "code":
      return (
        <figure className="prose-code">
          {block.caption ? <figcaption>{block.caption}</figcaption> : null}
          <pre>
            <code>{block.code}</code>
          </pre>
        </figure>
      );
    case "compare":
      return (
        <div className="prose-compare">
          <p className="prose-compare-bad">
            <span className="prose-compare-label">Gyenge</span>
            <RichText text={block.bad} />
          </p>
          <p className="prose-compare-good">
            <span className="prose-compare-label">Jobb</span>
            <RichText text={block.good} />
          </p>
          {block.note ? (
            <p className="prose-compare-note">
              <RichText text={block.note} />
            </p>
          ) : null}
        </div>
      );
    case "checklist":
      return (
        <div className="prose-checklist">
          {block.title ? <h3>{block.title}</h3> : null}
          <ul className="prose-checklist-list">
            {block.items.map((item) => (
              <li key={item}>
                <RichText text={item} />
              </li>
            ))}
          </ul>
        </div>
      );
    case "note":
      return (
        <p className="prose-note">
          <RichText text={block.text} />
        </p>
      );
    default:
      return null;
  }
}

function Section({ section }: { section: ArticleSection }) {
  return (
    <section className="content-block">
      <div className="container prose">
        <h2>{section.heading}</h2>
        {section.blocks.map((block, i) => (
          <Block key={`${section.heading}-${i}`} block={block} />
        ))}
      </div>
    </section>
  );
}

export default function ArticleBody({ article }: { article: Article }) {
  return (
    <>
      {article.sections.map((section) => (
        <Section key={section.heading} section={section} />
      ))}

      {article.closingCta ? (
        <section className="content-block">
          <div className="container prose">
            <p className="prose-cta">
              {article.closingCta.text}{" "}
              <Link href={article.closingCta.href}>
                {article.closingCta.label}
              </Link>
            </p>
          </div>
        </section>
      ) : null}

      <section className="contact">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Kapcsolódó</div>
              <h2>Folytasd itt</h2>
            </div>
          </div>
          <ul className="related-links">
            {article.relatedArticles?.map((item) => (
              <li key={item.slug}>
                <Link href={`/tudastar/${item.slug}`}>{item.label}</Link>
              </li>
            ))}
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
    </>
  );
}
