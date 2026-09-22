import type { PageSpeedMetrics } from "./types";

export type PagespeedResult = {
  attempted: boolean;
  ok: boolean;
  performanceScore: number | null;
  error: string | null;
  source: "pagespeed_api" | null;
  metrics: PageSpeedMetrics | null;
  quotaExceeded: boolean;
  timedOut: boolean;
};

function numAudit(
  audits: Record<string, { numericValue?: number }> | undefined,
  id: string
): number | null {
  const v = audits?.[id]?.numericValue;
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export async function fetchPagespeed(url: string): Promise<PagespeedResult> {
  const key = process.env.PAGESPEED_API_KEY?.trim();
  const params = new URLSearchParams({
    url,
    strategy: "mobile",
  });
  // Request performance + accessibility categories
  params.append("category", "performance");
  params.append("category", "accessibility");
  if (key) params.set("key", key);
  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45_000);
    const res = await fetch(endpoint, { signal: controller.signal });
    clearTimeout(timer);
    const data = (await res.json()) as {
      error?: { message?: string; code?: number; status?: string };
      lighthouseResult?: {
        categories?: {
          performance?: { score?: number };
          accessibility?: { score?: number };
        };
        audits?: Record<
          string,
          {
            numericValue?: number;
            details?: {
              items?: Array<{
                wastedBytes?: number;
                totalBytes?: number;
                resourceType?: string;
              }>;
            };
          }
        >;
      };
    };

    if (!res.ok) {
      const msg = data.error?.message || `PageSpeed HTTP ${res.status}`;
      const quota =
        res.status === 429 ||
        /quota|rate.?limit|dailyLimitExceeded/i.test(msg) ||
        data.error?.status === "RESOURCE_EXHAUSTED";
      return {
        attempted: true,
        ok: false,
        performanceScore: null,
        error: msg,
        source: null,
        metrics: null,
        quotaExceeded: quota,
        timedOut: false,
      };
    }

    const perf = data.lighthouseResult?.categories?.performance?.score;
    const a11y = data.lighthouseResult?.categories?.accessibility?.score;
    const audits = data.lighthouseResult?.audits;

    const metrics: PageSpeedMetrics = {
      lcpMs: numAudit(audits, "largest-contentful-paint"),
      cls: numAudit(audits, "cumulative-layout-shift"),
      inpMs: numAudit(audits, "interaction-to-next-paint"),
      tbtMs: numAudit(audits, "total-blocking-time"),
      fcpMs: numAudit(audits, "first-contentful-paint"),
      speedIndexMs: numAudit(audits, "speed-index"),
      totalByteWeight: numAudit(audits, "total-byte-weight"),
      jsBytes: null,
      cssBytes: null,
      imageBytes: null,
      renderBlockingCount: null,
      accessibilityScore:
        typeof a11y === "number" ? Math.round(a11y * 100) : null,
    };

    const networkItems =
      audits?.["network-requests"]?.details?.items ||
      audits?.["resource-summary"]?.details?.items ||
      [];
    if (Array.isArray(networkItems) && networkItems.length) {
      let js = 0;
      let css = 0;
      let img = 0;
      for (const item of networkItems) {
        const t = (item.resourceType || "").toLowerCase();
        const bytes = item.totalBytes ?? 0;
        if (t === "script") js += bytes;
        else if (t === "stylesheet") css += bytes;
        else if (t === "image") img += bytes;
      }
      if (js || css || img) {
        metrics.jsBytes = js || null;
        metrics.cssBytes = css || null;
        metrics.imageBytes = img || null;
      }
    }

    const rb = audits?.["render-blocking-resources"]?.details?.items;
    if (Array.isArray(rb)) {
      metrics.renderBlockingCount = rb.length;
    }

    return {
      attempted: true,
      ok: typeof perf === "number",
      performanceScore:
        typeof perf === "number" ? Math.round(perf * 100) : null,
      error:
        typeof perf === "number"
          ? null
          : "A PageSpeed válasz nem tartalmazott performance pontszámot.",
      source: typeof perf === "number" ? "pagespeed_api" : null,
      metrics,
      quotaExceeded: false,
      timedOut: false,
    };
  } catch (e) {
    const timedOut = e instanceof Error && e.name === "AbortError";
    return {
      attempted: true,
      ok: false,
      performanceScore: null,
      error: timedOut
        ? "PageSpeed időtúllépés."
        : e instanceof Error
          ? e.message
          : "PageSpeed hiba.",
      source: null,
      metrics: null,
      quotaExceeded: false,
      timedOut,
    };
  }
}
