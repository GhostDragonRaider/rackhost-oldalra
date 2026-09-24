import type { ParsedHtmlDocument } from "../html";
import type { AuditFinding } from "../types";
import { finding } from "./helpers";

export function checkBestPractices(input: {
  doc: ParsedHtmlDocument | null;
  finalProtocol: string;
  robots: { ok: boolean; status: number; body: string | null };
  mixedContentUrls: string[];
}): AuditFinding[] {
  const out: AuditFinding[] = [];

  if (input.robots.ok) {
    out.push(
      finding({
        id: "robots-ok",
        category: "best_practices",
        severity: "pass",
        title: "robots.txt elérhető",
        detail: `HTTP ${input.robots.status}`,
        detectedValue: `HTTP ${input.robots.status}`,
        source: "robots",
      })
    );
    const body = input.robots.body || "";
    if (/disallow:\s*\/\s*$/im.test(body) && /user-agent:\s*\*/i.test(body)) {
      out.push(
        finding({
          id: "robots-block-all",
          category: "best_practices",
          severity: "high",
          title: "robots.txt mindent tilt (* /)",
          detail:
            "A User-agent: * Disallow: / szabály a teljes site crawlját blokkolhatja. Publikus site esetén ez kritikus lehet.",
          recommendation:
            "Ha a site publikus, távolítsd el a teljes tiltást, vagy korlátozd staging környezetre.",
          source: "robots",
        })
      );
    }
  } else {
    out.push(
      finding({
        id: "robots-missing",
        category: "best_practices",
        severity: "low",
        title: "robots.txt hiányzik / hibás",
        detail: `HTTP ${input.robots.status || "n/a"}. A robots.txt hiánya nem tiltja az indexelést, de ajánlott a crawl szabályozásához.`,
        recommendation: "Publikálj robots.txt-et a domain gyökerében.",
        source: "robots",
      })
    );
  }

  if (input.finalProtocol === "https:") {
    out.push(
      finding({
        id: "bp-https",
        category: "best_practices",
        severity: "pass",
        title: "HTTPS használatban",
        detail: "A végső URL HTTPS.",
        source: "http",
      })
    );
  } else {
    out.push(
      finding({
        id: "bp-no-https",
        category: "best_practices",
        severity: "critical",
        title: "Nincs HTTPS",
        detail: "A végső URL nem HTTPS.",
        recommendation: "Kapcsold be a HTTPS-t.",
        source: "http",
      })
    );
  }

  if (input.mixedContentUrls.length > 0) {
    out.push(
      finding({
        id: "bp-mixed-content",
        category: "best_practices",
        severity: "high",
        title: "Mixed content a HTML-ben",
        detail: `${input.mixedContentUrls.length} http:// erőforrás HTTPS oldalon.`,
        recommendation: "Cseréld https://-re az erőforrásokat.",
        detectedValue: String(input.mixedContentUrls.length),
        source: "static_html",
      })
    );
  }

  if (!input.doc) {
    out.push(
      finding({
        id: "bp-no-html",
        category: "best_practices",
        severity: "info",
        status: "not_available",
        title: "HTML struktúra nem értékelhető",
        detail: "Nem HTML válasz.",
        source: "static_html",
      })
    );
    return out;
  }

  const doc = input.doc;
  if (doc.favicon) {
    out.push(
      finding({
        id: "favicon-ok",
        category: "best_practices",
        severity: "pass",
        title: "Favicon jelen van",
        detail: "Található icon link a HTML-ben.",
        source: "static_html",
      })
    );
  } else {
    out.push(
      finding({
        id: "favicon-missing",
        category: "best_practices",
        severity: "info",
        title: "Favicon hiányzik a HTML-ből",
        detail:
          "Nem találtunk rel=icon linket. A böngésző még kérhet /favicon.ico-t — ez csak a HTML hivatkozást nézi.",
        recommendation: "Adj hozzá favicon linket a <head>-be.",
        source: "static_html",
      })
    );
  }

  if (doc.manifest) {
    out.push(
      finding({
        id: "manifest-ok",
        category: "best_practices",
        severity: "pass",
        title: "Web app manifest hivatkozás",
        detail: "rel=manifest link megvan.",
        source: "static_html",
      })
    );
  } else {
    out.push(
      finding({
        id: "manifest-missing",
        category: "best_practices",
        severity: "info",
        title: "Nincs web app manifest",
        detail: "Nem kötelező minden oldalon — PWA / install élményhez hasznos.",
        recommendation: "Ha PWA kell, add hozzá a manifest.json hivatkozást.",
        source: "static_html",
      })
    );
  }

  if (doc.viewport) {
    out.push(
      finding({
        id: "bp-viewport-ok",
        category: "best_practices",
        severity: "pass",
        title: "Viewport meta jelen van",
        detail: doc.viewport,
        detectedValue: doc.viewport,
        source: "static_html",
      })
    );
  } else {
    out.push(
      finding({
        id: "bp-viewport-missing",
        category: "best_practices",
        severity: "medium",
        title: "Hiányzó viewport meta",
        detail: "Mobil megjelenéshez ajánlott.",
        recommendation:
          'Add hozzá: <meta name="viewport" content="width=device-width, initial-scale=1">',
        source: "static_html",
      })
    );
  }

  // Basic document structure signals
  if (doc.title == null && doc.headings.length === 0 && doc.wordCount < 5) {
    out.push(
      finding({
        id: "bp-html-sparse",
        category: "best_practices",
        severity: "low",
        title: "Hiányos HTML dokumentumstruktúra",
        detail:
          "Kevesebb jel a klassikus dokumentumstruktúrára (title / heading / szöveg).",
        recommendation: "Biztosíts érvényes HTML5 dokumentumot head + body tartalommal.",
        source: "static_html",
      })
    );
  } else {
    out.push(
      finding({
        id: "bp-html-ok",
        category: "best_practices",
        severity: "pass",
        title: "Alap HTML struktúra rendben",
        detail: "A dokumentum tartalmaz értelmezhető HTML jeleket.",
        source: "static_html",
      })
    );
  }

  return out;
}
