import type { ParsedHtmlDocument } from "../html";
import type { AuditFinding } from "../types";
import { finding } from "./helpers";

export function checkContent(doc: ParsedHtmlDocument | null): AuditFinding[] {
  const out: AuditFinding[] = [];
  if (!doc) {
    out.push(
      finding({
        id: "content-no-html",
        category: "content",
        severity: "medium",
        status: "not_available",
        title: "Tartalom nem értékelhető",
        detail: "Nem HTML válasz — H1, képek, linkek nem vizsgálhatók.",
        source: "static_html",
      })
    );
    return out;
  }

  const h1s = doc.h1Texts;
  if (h1s.length === 0) {
    out.push(
      finding({
        id: "h1-missing",
        category: "content",
        severity: "medium",
        title: "Hiányzó H1",
        detail: "Nincs H1 az oldalon — a főcím hierarchia gyenge.",
        recommendation: "Adj pontosan egy értelmes H1 címet az oldal fő témájához.",
        source: "static_html",
      })
    );
  } else if (h1s.length > 1) {
    out.push(
      finding({
        id: "h1-multiple",
        category: "content",
        severity: "low",
        title: "Több H1",
        detail: `${h1s.length} db H1 található. HTML5-ben megengedett, de SEO/UX szempontból általában egy H1 a legtisztább.`,
        recommendation: "Lehetőleg egy H1-et tarts meg, a többit H2+ szintre bontsd.",
        detectedValue: h1s.join(" | "),
        evidence: h1s.join(" | "),
        source: "static_html",
      })
    );
  } else {
    out.push(
      finding({
        id: "h1-ok",
        category: "content",
        severity: "pass",
        title: "H1 rendben",
        detail: `„${h1s[0]}” · ${h1s[0].length} karakter`,
        detectedValue: `„${h1s[0]}” (${h1s[0].length} karakter)`,
        evidence: h1s[0],
        source: "static_html",
      })
    );
  }

  // Heading hierarchy
  const headings = doc.headings;
  let skip = false;
  let prev = 0;
  for (const h of headings) {
    if (prev > 0 && h.level > prev + 1) {
      skip = true;
      break;
    }
    prev = h.level;
  }
  if (headings.length === 0) {
    out.push(
      finding({
        id: "heading-none",
        category: "content",
        severity: "info",
        title: "Nincs heading",
        detail: "Nem találtunk H1–H6 elemet.",
        source: "static_html",
      })
    );
  } else if (skip) {
    out.push(
      finding({
        id: "heading-skip",
        category: "content",
        severity: "low",
        title: "Heading szint ugrás",
        detail:
          "A heading hierarchiában feltűnő szintugrás van (pl. H2 után H4). Ez nehezíti a struktúra értelmezését.",
        recommendation: "Tartsd folytonos a heading szinteket (ne ugorj szintet).",
        detectedValue: headings.map((h) => `H${h.level}`).join(" → "),
        source: "static_html",
      })
    );
  } else {
    out.push(
      finding({
        id: "heading-ok",
        category: "content",
        severity: "pass",
        title: "Heading hierarchia rendben",
        detail: `${headings.length} heading, nincs feltűnő szintugrás.`,
        source: "static_html",
      })
    );
  }

  // Images
  const images = doc.images;
  const missingAlt = images.filter((i) => !i.hasAltAttr);
  const emptyAlt = images.filter((i) => i.emptyAlt);
  if (images.length === 0) {
    out.push(
      finding({
        id: "images-none",
        category: "content",
        severity: "info",
        title: "Nincs <img> a HTML-ben",
        detail: "Statikus HTML alapján nincs kép — CSS/háttérképek nem számítanak ide.",
        source: "static_html",
      })
    );
  } else {
    out.push(
      finding({
        id: "images-count",
        category: "content",
        severity: "pass",
        title: `Képek: ${images.length}`,
        detail: `${images.length - missingAlt.length} alt-tal, ${missingAlt.length} alt nélkül, ${emptyAlt.length} üres alt.`,
        detectedValue: String(images.length),
        source: "static_html",
      })
    );
    if (missingAlt.length > 0) {
      out.push(
        finding({
          id: "images-missing-alt",
          category: "content",
          severity: "medium",
          title: `${missingAlt.length} képhez hiányzik az alt attribútum`,
          detail:
            "Az alt nélküli képek gyengítik az akadálymentességet és a képi SEO jelek minőségét.",
          recommendation:
            "Adj leíró alt szöveget az informatív képekhez. Dekoratív képeknél használj üres alt=\"\" attribútumot.",
          detectedValue: String(missingAlt.length),
          source: "static_html",
        })
      );
    }
    if (emptyAlt.length > 0) {
      out.push(
        finding({
          id: "images-empty-alt",
          category: "content",
          severity: "info",
          title: `${emptyAlt.length} üres alt attribútum`,
          detail:
            "Üres alt dekoratív képeknél indokolt lehet. Ha a kép informatív, adj leíró alt szöveget.",
          recommendation:
            "Ellenőrizd, hogy az üres alt tényleg dekoratív képekre vonatkozik-e.",
          detectedValue: String(emptyAlt.length),
          source: "static_html",
        })
      );
    }
  }

  // Links
  const links = doc.links;
  const emptyHref = links.filter((l) => l.href == null || l.href.trim() === "");
  const hashOnly = links.filter((l) => l.href === "#");
  const jsPseudo = links.filter((l) =>
    /^javascript:/i.test(l.href || "")
  );
  const noName = links.filter((l) => {
    const name = (l.text || "").trim() || (l.ariaLabel || "").trim();
    return !name && l.href && l.href !== "#";
  });

  if (emptyHref.length > 0) {
    out.push(
      finding({
        id: "links-empty-href",
        category: "content",
        severity: "low",
        title: "Üres href linkek",
        detail: `${emptyHref.length} <a> elem üres vagy hiányzó href-fel.`,
        recommendation: "Adj érvényes URL-t, vagy használd gombként a megfelelő elemet.",
        detectedValue: String(emptyHref.length),
        source: "static_html",
      })
    );
  }
  if (hashOnly.length > 0) {
    out.push(
      finding({
        id: "links-hash",
        category: "content",
        severity: "info",
        title: 'href="#" linkek',
        detail: `${hashOnly.length} link csak #-re mutat — gyakran JS placeholder.`,
        recommendation:
          "Ha navigáció, adj valódi célt; ha gomb, használd a <button> elemet.",
        detectedValue: String(hashOnly.length),
        source: "static_html",
      })
    );
  }
  if (jsPseudo.length > 0) {
    out.push(
      finding({
        id: "links-javascript",
        category: "content",
        severity: "medium",
        title: "javascript: pseudo-linkek",
        detail: `${jsPseudo.length} javascript: href — kerülendő a modern webfejlesztésben.`,
        recommendation: "Cseréld valódi URL-re vagy button + eseménykezelőre.",
        detectedValue: String(jsPseudo.length),
        source: "static_html",
      })
    );
  }
  if (noName.length > 0) {
    out.push(
      finding({
        id: "links-no-name",
        category: "content",
        severity: "medium",
        title: "Hozzáférhetetlen linknév",
        detail: `${noName.length} linknek nincs látható szövege vagy aria-labelje.`,
        recommendation: "Adj linkszöveget vagy aria-label-t minden linkhez.",
        detectedValue: String(noName.length),
        source: "static_html",
      })
    );
  }
  if (
    emptyHref.length === 0 &&
    hashOnly.length === 0 &&
    jsPseudo.length === 0 &&
    noName.length === 0 &&
    links.length > 0
  ) {
    out.push(
      finding({
        id: "links-ok",
        category: "content",
        severity: "pass",
        title: "Linkek alapvetően rendben",
        detail: `${links.length} link, nincs üres/javascript/névtelen probléma a statikus HTML alapján.`,
        source: "static_html",
      })
    );
  }

  // Word count
  if (doc.wordCount < 50) {
    out.push(
      finding({
        id: "content-thin",
        category: "content",
        severity: "info",
        title: "Kevés szöveges tartalom",
        detail: `Hozzávetőleges szószám: ${doc.wordCount}. Ez nem feltétlenül rossz SEO — landing / app / galéria oldalakon természetes lehet.`,
        recommendation:
          "Ha az oldal célja szöveges tartalom, bővítsd. Egyébként figyelmen kívül hagyható.",
        detectedValue: `${doc.wordCount} szó`,
        source: "static_html",
      })
    );
  } else {
    out.push(
      finding({
        id: "content-words",
        category: "content",
        severity: "pass",
        title: "Szöveges tartalom",
        detail: `Hozzávetőleges szószám: ${doc.wordCount}`,
        detectedValue: `${doc.wordCount} szó`,
        source: "static_html",
      })
    );
  }

  return out;
}
