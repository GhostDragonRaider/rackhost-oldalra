import type { AuditFinding, PageSpeedMetrics } from "../types";
import { finding } from "./helpers";

export function estimateLocalPerformance(input: {
  responseMs: number | null;
  responseBytes: number | null;
  headers: Record<string, string>;
  html: string | null;
  contentType: string | null;
}): { score: number; detail: string } {
  let score = 100;
  const notes: string[] = [];
  const ms = input.responseMs;
  if (ms == null) {
    score -= 20;
    notes.push("nincs válaszidő");
  } else if (ms > 3000) {
    score -= 35;
    notes.push(`lassú TTFB ${ms} ms`);
  } else if (ms > 1500) {
    score -= 22;
    notes.push(`közepes TTFB ${ms} ms`);
  } else if (ms > 800) {
    score -= 10;
    notes.push(`TTFB ${ms} ms`);
  } else {
    notes.push(`gyors TTFB ${ms} ms`);
  }

  const bytes = input.responseBytes;
  if (bytes != null) {
    if (bytes > 1_500_000) {
      score -= 25;
      notes.push(`nagy HTML ${Math.round(bytes / 1024)} KB`);
    } else if (bytes > 500_000) {
      score -= 12;
      notes.push(`HTML ${Math.round(bytes / 1024)} KB`);
    } else {
      notes.push(`HTML ${Math.round(bytes / 1024)} KB`);
    }
  }

  const enc = (input.headers["content-encoding"] || "").toLowerCase();
  if (!enc.includes("gzip") && !enc.includes("br") && !enc.includes("deflate")) {
    score -= 10;
    notes.push("nincs tömörítés");
  } else {
    notes.push(`tömörítés: ${enc}`);
  }

  const cache = input.headers["cache-control"] || input.headers["expires"];
  if (!cache) {
    score -= 6;
    notes.push("nincs cache-control");
  }

  const html = input.html || "";
  if (html) {
    const scripts = (html.match(/<script\b/gi) || []).length;
    const images = (html.match(/<img\b/gi) || []).length;
    if (scripts > 25) {
      score -= 12;
      notes.push(`${scripts} script`);
    } else if (scripts > 12) {
      score -= 6;
      notes.push(`${scripts} script`);
    }
    if (images > 40) {
      score -= 8;
      notes.push(`${images} kép`);
    }
  } else if (input.contentType && !/html/i.test(input.contentType)) {
    notes.push("nem HTML — becslés a válaszból");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, detail: notes.join(" · ") };
}

function auditScoreFromPerf(score: number): AuditFinding["severity"] {
  if (score >= 90) return "pass";
  if (score >= 70) return "low";
  if (score >= 50) return "medium";
  return "high";
}

export function checkPerformance(input: {
  responseMs: number | null;
  responseBytes: number | null;
  headers: Record<string, string>;
  pagespeedScore: number | null;
  pagespeedSource: "pagespeed_api" | "local_estimate" | null;
  pagespeedError: string | null;
  metrics: PageSpeedMetrics | null;
  localDetail?: string;
}): AuditFinding[] {
  const out: AuditFinding[] = [];
  const ms = input.responseMs;

  if (ms == null) {
    out.push(
      finding({
        id: "ttfb-na",
        category: "performance",
        severity: "info",
        status: "not_available",
        title: "TTFB nem elérhető",
        detail: "Nincs mérhető válaszidő.",
        source: "http",
      })
    );
  } else if (ms > 3000) {
    out.push(
      finding({
        id: "slow-ttfb",
        category: "performance",
        severity: "high",
        title: "Lassú TTFB / válaszidő",
        detail: `${ms} ms a redirectekkel együtt mért válasz. Ez jelentősen ronthatja a felhasználói élményt.`,
        recommendation:
          "Optimalizáld a szerver választ, CDN-t, cache-t; csökkentsd a redirect lépéseket.",
        detectedValue: `${ms} ms`,
        source: "http",
      })
    );
  } else if (ms > 1500) {
    out.push(
      finding({
        id: "ttfb-medium",
        category: "performance",
        severity: "medium",
        title: "Közepes válaszidő",
        detail: `${ms} ms`,
        recommendation: "Cél: TTFB < 800 ms a fő dokumentumra.",
        detectedValue: `${ms} ms`,
        source: "http",
      })
    );
  } else {
    out.push(
      finding({
        id: "ttfb-ok",
        category: "performance",
        severity: "pass",
        title: "Elfogadható válaszidő",
        detail: `${ms} ms`,
        detectedValue: `${ms} ms`,
        source: "http",
      })
    );
  }

  if (input.responseBytes != null) {
    const kb = Math.round(input.responseBytes / 1024);
    if (input.responseBytes > 1_000_000) {
      out.push(
        finding({
          id: "body-large",
          category: "performance",
          severity: "medium",
          title: "Nagy HTML válasz",
          detail: `${kb} KB dokumentum méret.`,
          recommendation: "Csökkentsd a HTML méretét (kevesebb inline asset, lazy content).",
          detectedValue: `${kb} KB`,
          source: "http",
        })
      );
    } else {
      out.push(
        finding({
          id: "body-size-ok",
          category: "performance",
          severity: "pass",
          title: "HTML válaszméret",
          detail: `${kb} KB`,
          detectedValue: `${kb} KB`,
          source: "http",
        })
      );
    }
  }

  const enc = (input.headers["content-encoding"] || "").toLowerCase();
  if (!enc.includes("gzip") && !enc.includes("br") && !enc.includes("deflate")) {
    out.push(
      finding({
        id: "compression-missing",
        category: "performance",
        severity: "medium",
        title: "Nincs gzip/Brotli tömörítés",
        detail: "A válasz Content-Encoding nem jelez tömörítést.",
        recommendation: "Kapcsold be a Brotli vagy gzip tömörítést a szerveren / CDN-en.",
        source: "http",
      })
    );
  } else {
    out.push(
      finding({
        id: "compression-ok",
        category: "performance",
        severity: "pass",
        title: "Tömörítés aktív",
        detail: `Content-Encoding: ${enc}`,
        detectedValue: enc,
        source: "http",
      })
    );
  }

  const cache = input.headers["cache-control"];
  if (!cache) {
    out.push(
      finding({
        id: "cache-missing",
        category: "performance",
        severity: "low",
        title: "Hiányzó Cache-Control",
        detail: "Nincs Cache-Control header a dokumentumválaszon.",
        recommendation:
          "Állíts be megfelelő cache szabályokat (legalább statikus assetekre).",
        source: "http",
      })
    );
  }

  if (input.pagespeedScore != null && input.pagespeedSource === "pagespeed_api") {
    const sev = auditScoreFromPerf(input.pagespeedScore);
    out.push(
      finding({
        id: "pagespeed-score",
        category: "performance",
        severity: sev,
        title: `PageSpeed / Lighthouse: ${input.pagespeedScore}/100`,
        detail: "PageSpeed / Lighthouse mérés (mobile strategy).",
        detectedValue: `${input.pagespeedScore}/100`,
        source: "pagespeed_api",
        recommendation:
          sev === "pass"
            ? null
            : "Priorizáld az LCP, TBT és képméret optimalizálást a Lighthouse javaslatok alapján.",
      })
    );

    const m = input.metrics;
    if (m) {
      if (m.lcpMs != null) {
        out.push(
          finding({
            id: "psi-lcp",
            category: "performance",
            severity: m.lcpMs > 4000 ? "high" : m.lcpMs > 2500 ? "medium" : "pass",
            title: `LCP: ${Math.round(m.lcpMs)} ms`,
            detail: "PageSpeed / Lighthouse mérés — Largest Contentful Paint.",
            detectedValue: `${Math.round(m.lcpMs)} ms`,
            source: "pagespeed_api",
            recommendation:
              m.lcpMs > 2500
                ? "Optimalizáld a hero képet / kritikus CSS-t, csökkentsd a szerver latenciát."
                : null,
          })
        );
      }
      if (m.cls != null) {
        out.push(
          finding({
            id: "psi-cls",
            category: "performance",
            severity: m.cls > 0.25 ? "high" : m.cls > 0.1 ? "medium" : "pass",
            title: `CLS: ${m.cls.toFixed(3)}`,
            detail: "PageSpeed / Lighthouse mérés — Cumulative Layout Shift.",
            detectedValue: m.cls.toFixed(3),
            source: "pagespeed_api",
            recommendation:
              m.cls > 0.1
                ? "Adj width/height vagy aspect-ratio értéket a képeknek/iframe-eknek."
                : null,
          })
        );
      }
      if (m.inpMs != null) {
        out.push(
          finding({
            id: "psi-inp",
            category: "performance",
            severity: m.inpMs > 500 ? "high" : m.inpMs > 200 ? "medium" : "pass",
            title: `INP: ${Math.round(m.inpMs)} ms`,
            detail: "PageSpeed / Lighthouse mérés — Interaction to Next Paint (ha elérhető).",
            detectedValue: `${Math.round(m.inpMs)} ms`,
            source: "pagespeed_api",
          })
        );
      }
      if (m.tbtMs != null) {
        out.push(
          finding({
            id: "psi-tbt",
            category: "performance",
            severity: m.tbtMs > 600 ? "high" : m.tbtMs > 300 ? "medium" : "pass",
            title: `TBT: ${Math.round(m.tbtMs)} ms`,
            detail: "PageSpeed / Lighthouse mérés — Total Blocking Time.",
            detectedValue: `${Math.round(m.tbtMs)} ms`,
            source: "pagespeed_api",
            recommendation:
              m.tbtMs > 300 ? "Csökkentsd / bontsd a hosszú JavaScript feladatokat." : null,
          })
        );
      }
      if (m.fcpMs != null) {
        out.push(
          finding({
            id: "psi-fcp",
            category: "performance",
            severity: m.fcpMs > 3000 ? "medium" : "pass",
            title: `FCP: ${Math.round(m.fcpMs)} ms`,
            detail: "PageSpeed / Lighthouse mérés — First Contentful Paint.",
            detectedValue: `${Math.round(m.fcpMs)} ms`,
            source: "pagespeed_api",
          })
        );
      }
      if (m.speedIndexMs != null) {
        out.push(
          finding({
            id: "psi-si",
            category: "performance",
            severity: "info",
            title: `Speed Index: ${Math.round(m.speedIndexMs)} ms`,
            detail: "PageSpeed / Lighthouse mérés.",
            detectedValue: `${Math.round(m.speedIndexMs)} ms`,
            source: "pagespeed_api",
          })
        );
      }
      if (m.totalByteWeight != null) {
        out.push(
          finding({
            id: "psi-bytes",
            category: "performance",
            severity: m.totalByteWeight > 3_000_000 ? "medium" : "info",
            title: `Teljes transfer: ${Math.round(m.totalByteWeight / 1024)} KB`,
            detail: "PageSpeed / Lighthouse mérés — összesített erőforrásméret.",
            detectedValue: `${Math.round(m.totalByteWeight / 1024)} KB`,
            source: "pagespeed_api",
          })
        );
      }
      const parts: string[] = [];
      if (m.jsBytes != null) parts.push(`JS ${Math.round(m.jsBytes / 1024)} KB`);
      if (m.cssBytes != null) parts.push(`CSS ${Math.round(m.cssBytes / 1024)} KB`);
      if (m.imageBytes != null) parts.push(`Kép ${Math.round(m.imageBytes / 1024)} KB`);
      if (parts.length) {
        out.push(
          finding({
            id: "psi-resource-breakdown",
            category: "performance",
            severity: "info",
            title: "Erőforrás méretek",
            detail: parts.join(" · "),
            detectedValue: parts.join(" · "),
            source: "pagespeed_api",
          })
        );
      }
      if (m.renderBlockingCount != null && m.renderBlockingCount > 0) {
        out.push(
          finding({
            id: "psi-render-blocking",
            category: "performance",
            severity: m.renderBlockingCount > 5 ? "medium" : "low",
            title: `Render-blocking erőforrások: ${m.renderBlockingCount}`,
            detail: "PageSpeed / Lighthouse mérés.",
            recommendation:
              "Halaszd / inline-old a kritikus CSS-t, defer/async a nem kritikus scriptekre.",
            detectedValue: String(m.renderBlockingCount),
            source: "pagespeed_api",
          })
        );
      }
    }
  } else if (
    input.pagespeedScore != null &&
    input.pagespeedSource === "local_estimate"
  ) {
    const sev = auditScoreFromPerf(input.pagespeedScore);
    out.push(
      finding({
        id: "pagespeed-local",
        category: "performance",
        severity: sev,
        title: `Helyi becslés: ${input.pagespeedScore}/100`,
        detail: `Helyi becslés — nem Lighthouse mérés. ${input.localDetail || ""} ${
          input.pagespeedError ? `(PSI: ${input.pagespeedError})` : ""
        }`.trim(),
        detectedValue: `${input.pagespeedScore}/100 (helyi becslés)`,
        source: "local_estimate",
        recommendation:
          "A Google PageSpeed API most nem volt használható. A fenti pont helyi heurisztika (TTFB, méret, tömörítés).",
      })
    );
  } else {
    out.push(
      finding({
        id: "pagespeed-unavailable",
        category: "performance",
        severity: "info",
        status: "not_available",
        title: "PageSpeed nem elérhető",
        detail: input.pagespeedError || "Nincs PageSpeed / helyi becslés adat.",
        source: "pagespeed_api",
      })
    );
  }

  return out;
}
