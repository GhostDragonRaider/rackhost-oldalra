import type { ParsedHtmlDocument } from "../html";
import type { AuditFinding } from "../types";
import { finding } from "./helpers";

function looksLikeLang(code: string): boolean {
  return /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(code);
}

export function checkAccessibility(input: {
  doc: ParsedHtmlDocument | null;
  lighthouseA11yScore: number | null;
}): AuditFinding[] {
  const out: AuditFinding[] = [];
  const { doc } = input;

  if (!doc) {
    out.push(
      finding({
        id: "a11y-no-html",
        category: "accessibility",
        severity: "medium",
        status: "not_available",
        title: "Akadálymentesség nem értékelhető",
        detail: "Nem HTML válasz — a11y ellenőrzések nem futtathatók.",
        source: "static_html",
      })
    );
    return out;
  }

  out.push(
    finding({
      id: "a11y-disclaimer",
      category: "accessibility",
      severity: "info",
      status: "pass",
      title: "Automatikus a11y korlát",
      detail:
        "Ez statikus HTML alapú ellenőrzés — nem ad WCAG compliant minősítést. Dinamikus ARIA / billentyűzet / kontraszt nem dönthető el megbízhatóan.",
      source: "static_html",
    })
  );

  const lang = doc.htmlLang;
  if (lang == null) {
    out.push(
      finding({
        id: "a11y-lang-missing",
        category: "accessibility",
        severity: "medium",
        title: "Hiányzó html lang",
        detail: "Képernyőolvasók számára fontos a dokumentum nyelvének megadása.",
        recommendation: 'Állítsd be: <html lang="hu"> (vagy a megfelelő kód).',
        source: "static_html",
      })
    );
  } else if (!lang || !looksLikeLang(lang)) {
    out.push(
      finding({
        id: "a11y-lang-invalid",
        category: "accessibility",
        severity: "low",
        title: "Érvénytelen / üres html lang",
        detail: `lang="${lang || ""}" — nem tűnik érvényes nyelvi kódnak.`,
        recommendation: "Használj érvényes BCP 47 kódot.",
        detectedValue: lang || "(üres)",
        source: "static_html",
      })
    );
  } else {
    out.push(
      finding({
        id: "a11y-lang-ok",
        category: "accessibility",
        severity: "pass",
        title: "html lang rendben",
        detail: `lang="${lang}"`,
        detectedValue: lang,
        source: "static_html",
      })
    );
  }

  const missingAlt = doc.images.filter((i) => !i.hasAltAttr);
  if (missingAlt.length > 0) {
    out.push(
      finding({
        id: "a11y-images-alt",
        category: "accessibility",
        severity: "medium",
        title: `${missingAlt.length} kép alt nélkül`,
        detail: "Az alt attribútum hiányzik — képernyőolvasók nem tudják bemondani a képet.",
        recommendation:
          "Adj alt szöveget, vagy dekoratív képnél üres alt=\"\" attribútumot.",
        detectedValue: String(missingAlt.length),
        source: "static_html",
      })
    );
  } else if (doc.images.length > 0) {
    out.push(
      finding({
        id: "a11y-images-ok",
        category: "accessibility",
        severity: "pass",
        title: "Képeknek van alt attribútuma",
        detail: `${doc.images.length} kép — mindegyiknek van alt attribútuma (üres lehet dekoratívnál).`,
        source: "static_html",
      })
    );
  }

  // Form labels
  const unlabeled = doc.inputs.filter((inp) => {
    if (inp.ariaLabel || inp.hasAriaLabelledBy) return false;
    if (inp.id && doc.labelFors.has(inp.id)) return false;
    return true;
  });
  // Heuristic: nested labels may cover some — reduce count roughly
  const unlabeledCount = Math.max(0, unlabeled.length - doc.nestedLabelInputs);

  if (doc.inputs.length === 0) {
    out.push(
      finding({
        id: "a11y-inputs-none",
        category: "accessibility",
        severity: "info",
        status: "not_applicable",
        title: "Nincs űrlapmező",
        detail: "Nincs vizsgálandó input/textarea/select.",
        source: "static_html",
      })
    );
  } else if (unlabeledCount > 0) {
    out.push(
      finding({
        id: "a11y-inputs-label",
        category: "accessibility",
        severity: "medium",
        title: `${unlabeledCount} mezőhöz hiányzik a label`,
        detail:
          "Egyes inputokhoz nem találtunk label / aria-label / aria-labelledby kapcsolatot. Statikus elemzés — nested labelek részben figyelembe véve.",
        recommendation:
          "Minden mezőhöz kapcsolj <label for=\"...\">-t vagy aria-label-t.",
        detectedValue: String(unlabeledCount),
        source: "static_html",
      })
    );
  } else {
    out.push(
      finding({
        id: "a11y-inputs-ok",
        category: "accessibility",
        severity: "pass",
        title: "Űrlapmezők címkézve",
        detail: `${doc.inputs.length} mező — label kapcsolat rendben (statikus ellenőrzés).`,
        source: "static_html",
      })
    );
  }

  // Buttons
  const namelessButtons = doc.buttons.filter(
    (b) => !(b.text || "").trim() && !(b.ariaLabel || "").trim()
  );
  if (namelessButtons.length > 0) {
    out.push(
      finding({
        id: "a11y-button-name",
        category: "accessibility",
        severity: "medium",
        title: `${namelessButtons.length} gomb accessible name nélkül`,
        detail: "Gomboknak legyen látható szövegük vagy aria-labeljük.",
        recommendation: "Adj szöveget vagy aria-label-t a gomboknak.",
        detectedValue: String(namelessButtons.length),
        source: "static_html",
      })
    );
  } else if (doc.buttons.length > 0) {
    out.push(
      finding({
        id: "a11y-button-ok",
        category: "accessibility",
        severity: "pass",
        title: "Gombok accessible name rendben",
        detail: `${doc.buttons.length} gomb.`,
        source: "static_html",
      })
    );
  }

  // Links accessible name
  const namelessLinks = doc.links.filter((l) => {
    if (!l.href || l.href === "#") return false;
    return !(l.text || "").trim() && !(l.ariaLabel || "").trim();
  });
  if (namelessLinks.length > 0) {
    out.push(
      finding({
        id: "a11y-link-name",
        category: "accessibility",
        severity: "medium",
        title: `${namelessLinks.length} link accessible name nélkül`,
        detail: "A linkeknek legyen értelmes szövegük vagy aria-labeljük.",
        recommendation: "Adj linkszöveget / aria-label-t.",
        detectedValue: String(namelessLinks.length),
        source: "static_html",
      })
    );
  }

  // Heading hierarchy (a11y angle)
  let skip = false;
  let prev = 0;
  for (const h of doc.headings) {
    if (prev > 0 && h.level > prev + 1) {
      skip = true;
      break;
    }
    prev = h.level;
  }
  if (skip) {
    out.push(
      finding({
        id: "a11y-heading-skip",
        category: "accessibility",
        severity: "low",
        title: "Heading hierarchia ugrás",
        detail: "A szintugrás megnehezíti a képernyőolvasós navigációt.",
        recommendation: "Ne ugorj heading szintet.",
        source: "static_html",
      })
    );
  }

  // Viewport
  if (!doc.viewport) {
    out.push(
      finding({
        id: "a11y-viewport-missing",
        category: "accessibility",
        severity: "medium",
        title: "Hiányzó viewport meta",
        detail: "Mobil nézethez általában szükséges a viewport meta.",
        recommendation:
          'Add hozzá: <meta name="viewport" content="width=device-width, initial-scale=1">',
        source: "static_html",
      })
    );
  } else if (/user-scalable\s*=\s*no/i.test(doc.viewport) || /maximum-scale\s*=\s*1/i.test(doc.viewport)) {
    out.push(
      finding({
        id: "a11y-viewport-zoom",
        category: "accessibility",
        severity: "medium",
        title: "Viewport zoom korlátozás",
        detail:
          "A viewport úgy tűnik, korlátozza a nagyítást — ez akadályozhatja a gyengénlátó felhasználókat.",
        recommendation: "Ne tiltsd a user-scalable / maximum-scale nagyítást.",
        detectedValue: doc.viewport,
        source: "static_html",
      })
    );
  } else {
    out.push(
      finding({
        id: "a11y-viewport-ok",
        category: "accessibility",
        severity: "pass",
        title: "Viewport meta rendben",
        detail: doc.viewport,
        detectedValue: doc.viewport,
        source: "static_html",
      })
    );
  }

  for (const issue of doc.ariaIssues) {
    out.push(
      finding({
        id: `a11y-aria-${issue.slice(0, 24).replace(/\W+/g, "-")}`,
        category: "accessibility",
        severity: "low",
        title: "Alapvető ARIA figyelmeztetés",
        detail: `${issue}. Statikus ellenőrzés — nem teljes ARIA audit.`,
        recommendation: "Ellenőrizd az ARIA használatot kézzel / Lighthouse-szal.",
        source: "static_html",
      })
    );
  }

  if (input.lighthouseA11yScore != null) {
    const score = input.lighthouseA11yScore;
    out.push(
      finding({
        id: "a11y-lighthouse",
        category: "accessibility",
        severity: score >= 90 ? "pass" : score >= 70 ? "low" : "medium",
        title: `Lighthouse Accessibility: ${score}/100`,
        detail:
          "PageSpeed / Lighthouse mérés. Ez nem egyenlő teljes WCAG audittal.",
        detectedValue: `${score}/100`,
        source: "pagespeed_api",
      })
    );
  } else {
    out.push(
      finding({
        id: "a11y-lighthouse-na",
        category: "accessibility",
        severity: "info",
        status: "not_available",
        title: "Lighthouse Accessibility nem elérhető",
        detail:
          "Nincs PageSpeed Accessibility score — csak a helyi HTML ellenőrzések futottak.",
        source: "pagespeed_api",
      })
    );
  }

  return out;
}
