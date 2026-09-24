import type { ParsedHtmlDocument } from "../html";
import type { AuditFinding, IndexabilityResult } from "../types";
import { finding } from "./helpers";

const TITLE_MIN = 10;
const TITLE_MAX = 60;
const DESC_MIN = 50;
const DESC_MAX = 160;

function looksLikeLang(code: string): boolean {
  return /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(code);
}

export function analyzeCanonical(
  canonical: string | null,
  pageUrl: string
): AuditFinding {
  if (!canonical) {
    return finding({
      id: "canonical-missing",
      category: "seo",
      severity: "medium",
      title: "Hiányzó canonical",
      detail:
        "Nincs rel=canonical link. Duplikált URL-ek esetén a keresők nehezebben választanak kanonikus változatot.",
      recommendation:
        "Adj hozzá egy abszolút HTTPS canonical linket, amely a kívánt kanonikus URL-re mutat.",
      source: "static_html",
    });
  }

  let parsedCanon: URL;
  let parsedPage: URL;
  try {
    parsedPage = new URL(pageUrl);
  } catch {
    return finding({
      id: "canonical-page-url",
      category: "seo",
      severity: "info",
      status: "not_available",
      title: "Canonical nem értékelhető",
      detail: "A vizsgált oldal URL-je nem értelmezhető a canonical összevetéshez.",
      detectedValue: canonical,
      source: "static_html",
    });
  }

  const isAbsolute = /^https?:\/\//i.test(canonical);
  try {
    parsedCanon = new URL(canonical, pageUrl);
  } catch {
    return finding({
      id: "canonical-invalid",
      category: "seo",
      severity: "high",
      title: "Érvénytelen canonical URL",
      detail: `A canonical érték nem érvényes URL: „${canonical}”.`,
      recommendation: "Javítsd a canonical href-et érvényes abszolút URL-re.",
      detectedValue: canonical,
      source: "static_html",
    });
  }

  const notes: string[] = [];
  let severity: AuditFinding["severity"] = "pass";
  let title = "Canonical rendben";
  let recommendation: string | null = null;

  if (!isAbsolute) {
    notes.push("A canonical relatív — abszolút HTTPS URL ajánlott.");
    severity = "low";
    title = "Relatív canonical";
    recommendation = "Használj abszolút HTTPS canonical URL-t.";
  }
  if (parsedCanon.protocol === "http:" && parsedPage.protocol === "https:") {
    notes.push("A canonical HTTP protokollra mutat HTTPS oldalról.");
    severity = "high";
    title = "Canonical HTTP-re mutat";
    recommendation = "Állítsd a canonical-t HTTPS URL-re.";
  }
  if (parsedCanon.hostname.replace(/^www\./, "") !== parsedPage.hostname.replace(/^www\./, "")) {
    notes.push(
      `A canonical más domainre mutat (${parsedCanon.hostname} ≠ ${parsedPage.hostname}).`
    );
    severity = severity === "pass" || severity === "low" ? "high" : severity;
    title = "Külső domainre mutató canonical";
    recommendation =
      "Ha nem szándékos cross-domain canonical, javítsd saját domainre. Ha szándékos, ellenőrizd a SEO következményeket.";
  }

  const selfLike =
    parsedCanon.origin === parsedPage.origin &&
    parsedCanon.pathname.replace(/\/$/, "") === parsedPage.pathname.replace(/\/$/, "");

  if (severity === "pass") {
    notes.push(
      selfLike
        ? "A canonical a vizsgált URL-re mutat (öncanonical)."
        : "A canonical érvényes abszolút URL, azonos domainen."
    );
  }

  return finding({
    id:
      severity === "pass"
        ? "canonical-ok"
        : severity === "high"
          ? "canonical-problem"
          : "canonical-warn",
    category: "seo",
    severity,
    title,
    detail: notes.join(" "),
    recommendation,
    detectedValue: canonical,
    evidence: canonical,
    technicalDetails: `absolute=${isAbsolute}; protocol=${parsedCanon.protocol}; host=${parsedCanon.hostname}`,
    source: "static_html",
  });
}

export function buildIndexability(input: {
  metaRobots: string | null;
  xRobotsTag: string | null;
  robotsTxtBlocksPath: boolean;
}): IndexabilityResult {
  const meta = (input.metaRobots || "").toLowerCase();
  const x = (input.xRobotsTag || "").toLowerCase();
  const combined = `${meta} ${x}`;
  const hasNoindex = /\bnoindex\b/.test(combined);
  const hasNofollow = /\bnofollow\b/.test(combined);

  if (hasNoindex) {
    return {
      status: "blocked",
      summary:
        "KRITIKUS — az oldal noindex direktívát tartalmaz. Publikus oldal esetén ez megakadályozhatja az indexelést (ha szándékos, rendben lehet).",
      metaRobots: input.metaRobots,
      xRobotsTag: input.xRobotsTag,
      hasNoindex,
      hasNofollow,
      robotsTxtBlocks: input.robotsTxtBlocksPath,
    };
  }

  if (input.robotsTxtBlocksPath) {
    return {
      status: "caution",
      summary:
        "FIGYELEM — a robots.txt releváns szabálya tiltani látszik ezt az útvonalat. Ez nem noindex, de akadályozhatja a crawlert.",
      metaRobots: input.metaRobots,
      xRobotsTag: input.xRobotsTag,
      hasNoindex,
      hasNofollow,
      robotsTxtBlocks: true,
    };
  }

  if (hasNofollow) {
    return {
      status: "caution",
      summary:
        "nofollow direktíva található — az oldal indexelhető lehet, de a kimenő linkek követése korlátozott.",
      metaRobots: input.metaRobots,
      xRobotsTag: input.xRobotsTag,
      hasNoindex,
      hasNofollow,
      robotsTxtBlocks: false,
    };
  }

  return {
    status: "ok",
    summary:
      "Rendben — nem találtunk olyan technikai direktívát, amely nyilvánvalóan megakadályozná az oldal indexelését. (Ez nem állítja, hogy az URL ténylegesen a Google indexében van.)",
    metaRobots: input.metaRobots,
    xRobotsTag: input.xRobotsTag,
    hasNoindex: false,
    hasNofollow: false,
    robotsTxtBlocks: false,
  };
}

export function checkSeo(input: {
  doc: ParsedHtmlDocument | null;
  pageUrl: string;
  xRobotsTag: string | null;
  robotsTxtBlocksPath: boolean;
  sitemap: {
    ok: boolean;
    status: number;
    kind: "urlset" | "index" | "unknown" | "invalid" | null;
    error?: string;
  };
  indexability: IndexabilityResult;
}): AuditFinding[] {
  const out: AuditFinding[] = [];

  if (!input.doc) {
    out.push(
      finding({
        id: "seo-no-html",
        category: "seo",
        severity: "medium",
        status: "not_available",
        title: "SEO jelek nem értékelhetők",
        detail: "Nem HTML válasz — title, meta, canonical nem vizsgálható.",
        source: "static_html",
      })
    );
    return out;
  }

  const { doc } = input;
  const title = doc.title;
  if (!title) {
    out.push(
      finding({
        id: "title-missing",
        category: "seo",
        severity: "critical",
        title: "Hiányzó <title>",
        detail: "Nincs title elem a HTML-ben — a keresők és böngészők nehezen azonosítják az oldalt.",
        recommendation: "Adj egyedi, tartalmas title elemet (kb. 30–60 karakter).",
        source: "static_html",
      })
    );
  } else if (title.length < TITLE_MIN) {
    out.push(
      finding({
        id: "title-short",
        category: "seo",
        severity: "medium",
        title: "Túl rövid title",
        detail: `A title csak ${title.length} karakter — általában kevés a keresőtalálatokhoz.`,
        recommendation: `Bővítsd a title-t kb. ${TITLE_MIN}–${TITLE_MAX} karakterre, egyedi tartalommal.`,
        detectedValue: `„${title}” (${title.length} karakter)`,
        evidence: title,
        source: "static_html",
      })
    );
  } else if (title.length > TITLE_MAX) {
    out.push(
      finding({
        id: "title-long",
        category: "seo",
        severity: "low",
        title: "Hosszú title",
        detail: `A title ${title.length} karakter — a keresők gyakran levágják ~${TITLE_MAX} karakter körül.`,
        recommendation: `Rövidítsd kb. ${TITLE_MAX} karakter alá, a fontos kulcsszavakat előre helyezve.`,
        detectedValue: `„${title}” (${title.length} karakter)`,
        evidence: title,
        source: "static_html",
      })
    );
  } else {
    out.push(
      finding({
        id: "title-ok",
        category: "seo",
        severity: "pass",
        title: "Title rendben",
        detail: `„${title}” — ${title.length} karakter`,
        detectedValue: `„${title}” (${title.length} karakter)`,
        evidence: title,
        source: "static_html",
      })
    );
  }

  const description = doc.metaDescription;
  if (!description) {
    out.push(
      finding({
        id: "desc-missing",
        category: "seo",
        severity: "medium",
        title: "Hiányzó meta description",
        detail: "Nincs meta description — a találati kivonat kevésbé kontrollálható.",
        recommendation:
          "Adj az oldalhoz egy egyedi meta descriptiont, amely röviden összefoglalja az oldal tartalmát (kb. 120–160 karakter).",
        source: "static_html",
      })
    );
  } else if (description.length < DESC_MIN) {
    out.push(
      finding({
        id: "desc-short",
        category: "seo",
        severity: "low",
        title: "Rövid meta description",
        detail: `A description ${description.length} karakter — érdemes bővíteni.`,
        recommendation: `Bővítsd kb. ${DESC_MIN}–${DESC_MAX} karakterre.`,
        detectedValue: `${description.length} karakter`,
        evidence: description,
        source: "static_html",
      })
    );
  } else if (description.length > DESC_MAX) {
    out.push(
      finding({
        id: "desc-long",
        category: "seo",
        severity: "info",
        title: "Hosszú meta description",
        detail: `A description ${description.length} karakter — a keresők levághatják.`,
        recommendation: `Célzottan tartsd ~${DESC_MAX} karakter alatt.`,
        detectedValue: `${description.length} karakter`,
        evidence: description,
        source: "static_html",
      })
    );
  } else {
    out.push(
      finding({
        id: "desc-ok",
        category: "seo",
        severity: "pass",
        title: "Meta description rendben",
        detail: `${description.length} karakter`,
        detectedValue: `${description.length} karakter`,
        evidence: description,
        source: "static_html",
      })
    );
  }

  out.push(analyzeCanonical(doc.canonical, input.pageUrl));

  // Indexability
  const idx = input.indexability;
  if (idx.status === "blocked") {
    out.push(
      finding({
        id: "indexability-noindex",
        category: "seo",
        severity: "critical",
        title: "Indexelhetőség: noindex",
        detail: idx.summary,
        recommendation:
          "Ha az oldal legyen a keresőkben: távolítsd el a noindex-et a meta robots / X-Robots-Tag-ből. Ha szándékos (pl. staging), hagyd meg.",
        detectedValue: [idx.metaRobots, idx.xRobotsTag].filter(Boolean).join(" | ") || "noindex",
        source: "static_html",
      })
    );
  } else if (idx.status === "caution") {
    out.push(
      finding({
        id: "indexability-caution",
        category: "seo",
        severity: "medium",
        title: "Indexelhetőség: figyelem",
        detail: idx.summary,
        recommendation:
          "Ellenőrizd a robots.txt és a meta robots direktívákat, ha az oldalnak indexelhetőnek kellene lennie.",
        detectedValue: [idx.metaRobots, idx.xRobotsTag].filter(Boolean).join(" | ") || null,
        source: "static_html",
      })
    );
  } else {
    out.push(
      finding({
        id: "indexability-ok",
        category: "seo",
        severity: "pass",
        title: "Indexelhetőség",
        detail: idx.summary,
        source: "static_html",
      })
    );
  }

  // Social meta
  const s = doc.social;
  const socialMissing: string[] = [];
  if (!s.ogTitle) socialMissing.push("og:title");
  if (!s.ogDescription) socialMissing.push("og:description");
  if (!s.ogImage) socialMissing.push("og:image");
  if (!s.ogUrl) socialMissing.push("og:url");
  if (!s.ogType) socialMissing.push("og:type");
  if (!s.twitterCard) socialMissing.push("twitter:card");

  if (socialMissing.length === 0) {
    out.push(
      finding({
        id: "social-ok",
        category: "seo",
        severity: "pass",
        title: "Social meta rendben",
        detail: "Open Graph és alap Twitter/X Card mezők megvannak.",
        detectedValue: `og:type=${s.ogType}; twitter:card=${s.twitterCard}`,
        source: "static_html",
      })
    );
  } else if (socialMissing.length <= 2) {
    out.push(
      finding({
        id: "social-partial",
        category: "seo",
        severity: "low",
        title: "Hiányos social meta",
        detail: `Hiányzik: ${socialMissing.join(", ")}. A megosztási előnézet kevésbé kontrollálható.`,
        recommendation:
          "Töltsd ki az Open Graph és Twitter Card mezőket (title, description, image).",
        detectedValue: socialMissing.join(", "),
        source: "static_html",
      })
    );
  } else {
    out.push(
      finding({
        id: "social-missing",
        category: "seo",
        severity: "low",
        title: "Hiányzó social meta",
        detail: `Több Open Graph / Twitter mező hiányzik: ${socialMissing.join(", ")}.`,
        recommendation:
          "Add hozzá az og:title, og:description, og:image, og:url, og:type és twitter:card mezőket.",
        detectedValue: socialMissing.join(", "),
        source: "static_html",
      })
    );
  }

  // JSON-LD
  if (doc.jsonLd.length === 0) {
    out.push(
      finding({
        id: "jsonld-missing",
        category: "seo",
        severity: "info",
        title: "Nincs JSON-LD strukturált adat",
        detail:
          "Nem találtunk application/ld+json blokkot. Nem kötelező minden oldalon, de segíthet a kereső megjelenésben. A parse-olhatóság önmagában nem garantál rich resultet.",
        recommendation:
          "Ha releváns, adj hozzá érvényes JSON-LD-t (pl. Organization, WebSite, Article).",
        source: "static_html",
      })
    );
  } else {
    const bad = doc.jsonLd.filter((b) => !b.parseOk);
    const types = Array.from(new Set(doc.jsonLd.flatMap((b) => b.types)));
    if (bad.length > 0) {
      out.push(
        finding({
          id: "jsonld-invalid",
          category: "seo",
          severity: "medium",
          title: "Hibás JSON-LD",
          detail: `${bad.length} JSON-LD blokk nem parse-olható. A Google nem tudja megbízhatóan feldolgozni.`,
          recommendation: "Javítsd a JSON szintaxist a ld+json scriptekben.",
          detectedValue: bad[0]?.error || "parse error",
          source: "static_html",
        })
      );
    } else {
      out.push(
        finding({
          id: "jsonld-ok",
          category: "seo",
          severity: "pass",
          title: "JSON-LD jelen van",
          detail: `Parse-olható strukturált adat. Típusok: ${types.length ? types.join(", ") : "(nincs @type)"}. A parse-olhatóság nem jelenti automatikusan a rich result elfogadást.`,
          detectedValue: types.join(", ") || null,
          source: "static_html",
        })
      );
    }
  }

  // Sitemap
  if (input.sitemap.ok && input.sitemap.kind && input.sitemap.kind !== "invalid") {
    out.push(
      finding({
        id: "sitemap-ok",
        category: "seo",
        severity: "pass",
        title:
          input.sitemap.kind === "index"
            ? "Sitemap index elérhető"
            : "sitemap.xml elérhető",
        detail: `HTTP ${input.sitemap.status} · típus: ${input.sitemap.kind}`,
        detectedValue: `HTTP ${input.sitemap.status} · ${input.sitemap.kind}`,
        source: "sitemap",
      })
    );
  } else if (input.sitemap.kind === "invalid") {
    out.push(
      finding({
        id: "sitemap-invalid",
        category: "seo",
        severity: "medium",
        title: "Hibás sitemap",
        detail:
          input.sitemap.error ||
          "A sitemap válasz nem tűnik érvényes XML sitemapnek.",
        recommendation:
          "Ellenőrizd, hogy a /sitemap.xml érvényes urlset vagy sitemapindex XML-t ad.",
        detectedValue: `HTTP ${input.sitemap.status}`,
        source: "sitemap",
      })
    );
  } else {
    out.push(
      finding({
        id: "sitemap-missing",
        category: "seo",
        severity: "low",
        title: "sitemap.xml hiányzik / hibás",
        detail: `HTTP ${input.sitemap.status || "n/a"}. Egyetlen URL auditnál a sitemap hiánya nem feltétlenül kritikus.`,
        recommendation: "Publikálj érvényes XML sitemapet, és hivatkozd a robots.txt-ben.",
        source: "sitemap",
      })
    );
  }

  // html lang (also a11y — light SEO signal)
  const lang = doc.htmlLang;
  if (lang == null) {
    out.push(
      finding({
        id: "html-lang-missing-seo",
        category: "seo",
        severity: "low",
        title: "Hiányzó html lang",
        detail: "Az <html> elemen nincs lang attribútum — gyengébb nyelvi jel a keresőknek.",
        recommendation: 'Állítsd be pl. <html lang="hu">.',
        source: "static_html",
      })
    );
  } else if (lang === "") {
    out.push(
      finding({
        id: "html-lang-empty-seo",
        category: "seo",
        severity: "low",
        title: "Üres html lang",
        detail: "A lang attribútum üres.",
        recommendation: 'Adj érvényes nyelvi kódot, pl. lang="hu".',
        source: "static_html",
      })
    );
  } else if (!looksLikeLang(lang)) {
    out.push(
      finding({
        id: "html-lang-invalid-seo",
        category: "seo",
        severity: "info",
        title: "Szokatlan html lang",
        detail: `A lang érték („${lang}”) nem tűnik tipikus BCP 47 nyelvi kódnak.`,
        recommendation: "Használj szabványos kódot (pl. hu, en, de).",
        detectedValue: lang,
        source: "static_html",
      })
    );
  } else {
    out.push(
      finding({
        id: "html-lang-ok-seo",
        category: "seo",
        severity: "pass",
        title: "html lang rendben",
        detail: `lang="${lang}"`,
        detectedValue: lang,
        source: "static_html",
      })
    );
  }

  return out;
}

/** Simple robots.txt path disallow check (not a full robots parser). */
export function robotsTxtLikelyBlocks(
  robotsTxt: string | null,
  path: string
): boolean {
  if (!robotsTxt) return false;
  const lines = robotsTxt.split(/\r?\n/);
  let inStar = false;
  const disallows: string[] = [];
  for (const raw of lines) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const lower = line.toLowerCase();
    if (lower.startsWith("user-agent:")) {
      const ua = line.slice(line.indexOf(":") + 1).trim();
      inStar = ua === "*";
      continue;
    }
    if (!inStar) continue;
    if (lower.startsWith("disallow:")) {
      const val = line.slice(line.indexOf(":") + 1).trim();
      if (val) disallows.push(val);
    }
  }
  for (const rule of disallows) {
    if (rule === "/") return true;
    if (path.startsWith(rule)) return true;
  }
  return false;
}
