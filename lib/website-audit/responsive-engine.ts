/**
 * Responsive audit engine — static HTML/CSS heuristics across a viewport series.
 * Does NOT invent layout overflow without a browser. Issues that need a headless
 * browser are marked UNAVAILABLE (never PASS).
 */

import { finding } from "./checks/helpers";
import type { AuditFinding } from "./types";

export const RESPONSIVE_VIEWPORTS = [
  320, 360, 375, 390, 412, 430, 480, 540, 600, 768, 820, 912, 1024, 1280,
  1366, 1440, 1536, 1920, 2560,
] as const;

export type ResponsiveCellStatus = "pass" | "warn" | "fail" | "unavailable";

export type ResponsiveIssue = {
  title: string;
  detail: string;
  selector?: string;
  checkId: string;
};

export type ResponsiveMatrixCell = {
  status: ResponsiveCellStatus;
  issues: ResponsiveIssue[];
};

export type ResponsiveMatrixPage = {
  path: string;
  label: string;
  cells: Record<string, ResponsiveMatrixCell>;
};

export type ResponsiveMatrix = {
  viewports: number[];
  pages: ResponsiveMatrixPage[];
  summary: string;
  screenshotStatus: "unavailable" | "skipped";
  screenshotNote: string;
  provenance: "real" | "unavailable";
  source: string;
};

function hasViewportMeta(html: string): boolean {
  return /<meta[^>]+name=["']viewport["'][^>]*>/i.test(html);
}

function viewportContent(html: string): string | null {
  const m = html.match(
    /<meta[^>]+name=["']viewport["'][^>]*content=["']([^"']+)["']/i
  );
  if (m) return m[1];
  const m2 = html.match(
    /<meta[^>]+content=["']([^"']+)["'][^>]*name=["']viewport["']/i
  );
  return m2 ? m2[1] : null;
}

function extractFixedWidths(html: string): number[] {
  const widths: number[] = [];
  const re = /(?:min-)?width\s*:\s*(\d{3,4})px/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const n = Number(m[1]);
    if (n >= 600) widths.push(n);
  }
  // width="1200" attributes
  const attr = /width\s*=\s*["'](\d{3,4})["']/gi;
  while ((m = attr.exec(html))) {
    const n = Number(m[1]);
    if (n >= 600) widths.push(n);
  }
  return widths;
}

function hasHorizontalScrollHint(html: string): boolean {
  return /overflow-x\s*:\s*scroll/i.test(html) || /overflow\s*:\s*scroll/i.test(html);
}

function hasResponsiveImages(html: string): boolean {
  return (
    /<img[^>]+srcset=/i.test(html) ||
    /sizes=["']/i.test(html) ||
    /max-width\s*:\s*100%/i.test(html)
  );
}

function hasMediaQueries(html: string): boolean {
  return /@media[^{]+\{/i.test(html) || /<link[^>]+media=/i.test(html);
}

function hasFixedNavHint(html: string): boolean {
  return (
    /position\s*:\s*fixed/i.test(html) &&
    /(nav|header|menu)/i.test(html)
  );
}

function hasWideTable(html: string): boolean {
  return /<table[\s>]/i.test(html) && !/overflow-x/i.test(html);
}

function cellForViewport(
  width: number,
  ctx: {
    hasVp: boolean;
    vpContent: string | null;
    fixedWidths: number[];
    hasMq: boolean;
    hasWideTable: boolean;
    hasScrollHint: boolean;
  }
): ResponsiveMatrixCell {
  const issues: ResponsiveIssue[] = [];

  if (!ctx.hasVp) {
    issues.push({
      checkId: "resp-no-viewport",
      title: "Nincs viewport meta",
      detail:
        "Mobil nézetben a böngésző asztali szélességként rajzolhatja az oldalt.",
    });
  } else if (ctx.vpContent && /user-scalable\s*=\s*no/i.test(ctx.vpContent)) {
    if (width <= 480) {
      issues.push({
        checkId: "resp-no-zoom",
        title: "Tiltott nagyítás (user-scalable=no)",
        detail: "A felhasználó nem tudja nagyítani a tartalmat mobilon.",
      });
    }
  }

  const maxFixed = ctx.fixedWidths.length
    ? Math.max(...ctx.fixedWidths)
    : 0;
  if (maxFixed > 0 && width + 40 < maxFixed) {
    issues.push({
      checkId: "resp-fixed-width",
      title: `Fix szélesség (~${maxFixed}px) a ${width}px nézetben`,
      detail:
        "A HTML/CSS-ben nagyobb fix szélesség található, mint a vizsgált viewport — vízszintes görgetés valószínű.",
    });
  }

  if (ctx.hasWideTable && width < 768) {
    issues.push({
      checkId: "resp-table",
      title: "Táblázat mobilon",
      detail:
        "Van <table>, de nem látszik overflow-x kezelés — keskeny képernyőn kilóghat.",
    });
  }

  if (ctx.hasScrollHint && width < 600) {
    issues.push({
      checkId: "resp-overflow-scroll",
      title: "Vízszintes scroll jelzés a CSS-ben",
      detail: "overflow-x: scroll / overflow: scroll előfordul — ellenőrizd a layoutot.",
    });
  }

  if (!ctx.hasMq && width < 768 && ctx.hasVp) {
    issues.push({
      checkId: "resp-no-mq",
      title: "Nem található media query",
      detail:
        "A letöltött HTML/CSS-ben nincs @media — lehet, hogy külső fájlban van (akkor ez a jelzés ESTIMATED/WARNING).",
    });
  }

  // Issues that truly need a browser remain unavailable as separate findings,
  // not as fake pass cells.
  let status: ResponsiveCellStatus = "pass";
  if (issues.some((i) => i.checkId === "resp-no-viewport" || i.checkId === "resp-fixed-width")) {
    status = "fail";
  } else if (issues.length) {
    status = "warn";
  }

  return { status, issues };
}

export function buildResponsiveMatrix(input: {
  html: string | null;
  pagePath?: string;
  pageLabel?: string;
}): ResponsiveMatrix {
  const viewports = [...RESPONSIVE_VIEWPORTS];
  const screenshotNote =
    "Screenshot-alapú ellenőrzés ezen a VPS-en nincs bekapcsolva (nincs headless böngésző). A layout overflow / overlapping elemek böngésző nélkül nem állapíthatók meg megbízhatóan — ezek UNAVAILABLE, nem PASS.";

  if (!input.html || input.html.length < 20) {
    const emptyCells: Record<string, ResponsiveMatrixCell> = {};
    for (const w of viewports) {
      emptyCells[String(w)] = {
        status: "unavailable",
        issues: [
          {
            checkId: "resp-no-html",
            title: "Nincs HTML",
            detail: "Responsive vizsgálat nem futtatható HTML nélkül.",
          },
        ],
      };
    }
    return {
      viewports,
      pages: [
        {
          path: input.pagePath || "/",
          label: input.pageLabel || "Kezdőlap",
          cells: emptyCells,
        },
      ],
      summary: "Responsive vizsgálat: HTML hiányzik — UNAVAILABLE.",
      screenshotStatus: "unavailable",
      screenshotNote,
      provenance: "unavailable",
      source: "responsive-engine/static",
    };
  }

  const html = input.html;
  const ctx = {
    hasVp: hasViewportMeta(html),
    vpContent: viewportContent(html),
    fixedWidths: extractFixedWidths(html),
    hasMq: hasMediaQueries(html),
    hasWideTable: hasWideTable(html),
    hasScrollHint: hasHorizontalScrollHint(html),
  };

  const cells: Record<string, ResponsiveMatrixCell> = {};
  for (const w of viewports) {
    cells[String(w)] = cellForViewport(w, ctx);
  }

  const failCount = Object.values(cells).filter((c) => c.status === "fail").length;
  const warnCount = Object.values(cells).filter((c) => c.status === "warn").length;

  return {
    viewports,
    pages: [
      {
        path: input.pagePath || "/",
        label: input.pageLabel || "Kezdőlap",
        cells,
      },
    ],
    summary: `${viewports.length} reprezentatív viewport ellenőrizve ${viewports[0]}–${viewports[viewports.length - 1]} px között. Hibás: ${failCount}, figyelmeztetés: ${warnCount}. Screenshot: UNAVAILABLE.`,
    screenshotStatus: "unavailable",
    screenshotNote,
    provenance: "real",
    source: "responsive-engine/static-html-css",
  };
}

export function checkResponsive(input: {
  html: string | null;
  matrix: ResponsiveMatrix;
}): AuditFinding[] {
  const out: AuditFinding[] = [];
  const measuredAt = new Date().toISOString();

  out.push(
    finding({
      id: "resp-scope",
      category: "responsive",
      severity: "info",
      status: "pass",
      title: `${input.matrix.viewports.length} viewport ellenőrizve`,
      detail: input.matrix.summary,
      evidence: input.matrix.viewports.join(", "),
      technicalDetails: `source=${input.matrix.source}`,
      source: "static_html",
      measuredAt,
    })
  );

  out.push(
    finding({
      id: "resp-screenshot-na",
      category: "responsive",
      severity: "info",
      status: "not_available",
      title: "Screenshot-alapú responsive ellenőrzés nem elérhető",
      detail: input.matrix.screenshotNote,
      recommendation:
        "A kilógó/fedő elemekhez headless böngészős mérés kell — ez itt szándékosan nincs bekapcsolva a VPS terhelés miatt.",
      source: null,
      measuredAt,
    })
  );

  out.push(
    finding({
      id: "resp-browser-layout-na",
      category: "responsive",
      severity: "info",
      status: "not_available",
      title: "Valós layout overflow mérés böngésző nélkül nem lehetséges",
      detail:
        "Az egymást fedő elemek, levágott tartalom és touch-target ütközések megbízható mérése renderelt DOM-ot igényel. Ezeket nem jelezzük PASS-nak.",
      source: null,
      measuredAt,
    })
  );

  if (!input.html) {
    out.push(
      finding({
        id: "resp-no-html",
        category: "responsive",
        severity: "high",
        status: "not_available",
        title: "Responsive HTML hiányzik",
        detail: "Nem érkezett ellenőrizhető HTML tartalom.",
        measuredAt,
      })
    );
    return out;
  }

  if (!hasViewportMeta(input.html)) {
    out.push(
      finding({
        id: "resp-no-viewport",
        category: "responsive",
        severity: "high",
        status: "fail",
        title: "Hiányzik a viewport meta címke",
        detail:
          "Mobil eszközökön az oldal rosszul skálázódhat — a böngésző „asztali” szélességet feltételezhet.",
        recommendation:
          'Add hozzá: <meta name="viewport" content="width=device-width, initial-scale=1">',
        source: "static_html",
        measuredAt,
      })
    );
  } else {
    out.push(
      finding({
        id: "resp-viewport-ok",
        category: "responsive",
        severity: "pass",
        status: "pass",
        title: "Viewport meta megvan",
        detail: `content="${viewportContent(input.html) || "?"}"`,
        detectedValue: viewportContent(input.html),
        source: "static_html",
        measuredAt,
      })
    );
  }

  const fixed = extractFixedWidths(input.html);
  if (fixed.length) {
    const max = Math.max(...fixed);
    out.push(
      finding({
        id: "resp-fixed-widths",
        category: "responsive",
        severity: max >= 1100 ? "medium" : "low",
        status: "fail",
        title: "Fix pixel szélességek a kódban",
        detail: `Talált nagyobb fix szélességek (max ~${max}px). Keskeny viewporton vízszintes görgetést okozhatnak.`,
        recommendation:
          "Használj max-width: 100%, fluid layoutot és relatív egységeket a fix px helyett.",
        evidence: fixed.slice(0, 8).join(", "),
        source: "static_html",
        measuredAt,
      })
    );
  }

  if (!hasMediaQueries(input.html)) {
    out.push(
      finding({
        id: "resp-media-queries",
        category: "responsive",
        severity: "medium",
        status: "fail",
        title: "Nem látszik CSS media query a válaszban",
        detail:
          "A letöltött HTML-ben / inline CSS-ben nincs @media. Lehet külső CSS-ben — ha igen, ez false positive lehet; ha nincs sehol, a layout nem alkalmazkodik.",
        recommendation: "Adj breakpointokat (@media) a fő layout elemekhez.",
        source: "static_html",
        measuredAt,
      })
    );
  }

  if (hasWideTable(input.html)) {
    out.push(
      finding({
        id: "resp-tables",
        category: "responsive",
        severity: "low",
        status: "fail",
        title: "Táblázat overflow-kezelés nélkül",
        detail: "Van HTML táblázat, de a válaszban nem látszik overflow-x wrapper.",
        recommendation: "Csomagold a táblázatot görgethető konténerbe mobilon.",
        source: "static_html",
        measuredAt,
      })
    );
  }

  if (!hasResponsiveImages(input.html) && /<img[\s>]/i.test(input.html)) {
    out.push(
      finding({
        id: "resp-images",
        category: "responsive",
        severity: "info",
        status: "fail",
        title: "Responsive képjelzések hiányozhatnak",
        detail: "Nincs srcset/sizes / max-width:100% a vizsgált HTML-ben.",
        recommendation: "Adj srcset-et vagy CSS max-width: 100%-ot a képekre.",
        source: "static_html",
        measuredAt,
      })
    );
  }

  if (hasFixedNavHint(input.html)) {
    out.push(
      finding({
        id: "resp-fixed-nav",
        category: "responsive",
        severity: "info",
        status: "fail",
        title: "Fix/sticky pozíció jelzés",
        detail:
          "position:fixed előfordul navigáció/header kontextusban — mobilon takarhat tartalmat (böngésző nélkül nem mérhető pontosan).",
        recommendation: "Ellenőrizd a safe-area és a tartalom paddingjét fixed header alatt.",
        source: "static_html",
        measuredAt,
      })
    );
  }

  const failCells = input.matrix.pages[0]
    ? Object.values(input.matrix.pages[0].cells).filter((c) => c.status === "fail")
        .length
    : 0;
  if (failCells === 0 && hasViewportMeta(input.html)) {
    out.push(
      finding({
        id: "resp-matrix-ok",
        category: "responsive",
        severity: "pass",
        status: "pass",
        title: "Statikus viewport mátrix: nincs kritikus jelzés",
        detail:
          "A statikus HTML/CSS heurisztika nem talált kritikus viewport-hibát. Ez NEM jelenti, hogy minden felbontáson tökéletes a layout.",
        source: "static_html",
        measuredAt,
      })
    );
  }

  return out;
}
