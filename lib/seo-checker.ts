import nodemailer from "nodemailer";
import { fetchGscIndexingSummary, fetchGscTrafficSummary } from "./gsc-client";
import { SITE_EMAIL, SITE_URL } from "./site";
import {
  getSeoReport,
  patchSeoGscIndexing,
  saveSeoReport,
  type SeoIssue,
  type SeoReport,
} from "./seo-store";
import { getMonitoredUrls } from "./seo-urls";

let indexingRefreshInFlight: Promise<void> | null = null;

const FETCH_TIMEOUT_MS = 12_000;
const PERF_WARN_MS = 2500;
const PERF_CRITICAL_MS = 5000;
const MAX_EXTERNAL_LINK_CHECKS = 40;

type FetchedPage = {
  url: string;
  status: number;
  ok: boolean;
  html: string;
  responseMs: number;
  finalUrl: string;
};

function metaContent(html: string, name: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["']`,
    "i"
  );
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${name}["']`,
    "i"
  );
  const m = html.match(re) || html.match(re2);
  return m?.[1]?.trim() || null;
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m?.[1]?.replace(/\s+/g, " ").trim() || null;
}

function extractH1(html: string): string | null {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!m) return null;
  return m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() || null;
}

function extractCanonical(html: string): string | null {
  const m = html.match(
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i
  );
  const m2 = html.match(
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i
  );
  return (m?.[1] || m2?.[1] || "").trim() || null;
}

function extractRobotsMeta(html: string): string | null {
  return metaContent(html, "robots");
}

function extractLinks(html: string, pageUrl: string): string[] {
  const links = new Set<string>();
  const re = /<a\b[^>]+href=["']([^"'#]+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const href = match[1].trim();
    if (
      !href ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("javascript:") ||
      href.startsWith("data:")
    ) {
      continue;
    }
    try {
      const abs = new URL(href, pageUrl);
      if (abs.protocol !== "http:" && abs.protocol !== "https:") continue;
      // Skip heavy portfolio demos and Next assets
      if (
        abs.pathname.startsWith("/projects/") ||
        abs.pathname.startsWith("/_next/") ||
        abs.pathname.startsWith("/api/")
      ) {
        continue;
      }
      links.add(abs.href.split("#")[0]);
    } catch {
      /* ignore bad urls */
    }
  }
  return [...links];
}

async function fetchPage(url: string): Promise<FetchedPage> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "AntiCodeSEOMonitor/1.0 (+https://anticode.hu)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    const html = await res.text();
    return {
      url,
      status: res.status,
      ok: res.ok,
      html,
      responseMs: Date.now() - started,
      finalUrl: res.url || url,
    };
  } catch {
    return {
      url,
      status: 0,
      ok: false,
      html: "",
      responseMs: Date.now() - started,
      finalUrl: url,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function headOrGetStatus(url: string): Promise<number> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const head = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "AntiCodeSEOMonitor/1.0 (+https://anticode.hu)",
      },
    });
    if (head.status !== 405 && head.status !== 501) {
      return head.status;
    }
  } catch {
    /* fall through to GET */
  } finally {
    clearTimeout(timer);
  }

  const page = await fetchPage(url);
  return page.status;
}

function computeScore(issues: SeoIssue[]): number {
  let score = 100;
  for (const issue of issues) {
    if (issue.severity === "critical") score -= 12;
    else if (issue.severity === "warning") score -= 4;
    else score -= 1;
  }
  return Math.max(0, Math.min(100, score));
}

async function maybeSendAlert(report: SeoReport): Promise<boolean> {
  if (report.summary.criticalCount === 0) return false;

  const prev = getSeoReport();
  // Avoid spamming: only alert if new criticals or first critical since last alert
  const prevCritical = prev.summary.criticalCount || 0;
  if (prevCritical > 0 && prev.alertSentAt) {
    const last = Date.parse(prev.alertSentAt);
    if (!Number.isNaN(last) && Date.now() - last < 20 * 60 * 60 * 1000) {
      return false;
    }
  }

  const smtpPass = process.env.SMTP_PASS;
  const to =
    process.env.SEO_ALERT_EMAIL ||
    process.env.ADMIN_ALERT_EMAIL ||
    SITE_EMAIL;
  if (!smtpPass) {
    console.warn("[seo-checker] SMTP_PASS hiányzik — riasztás kihagyva.");
    return false;
  }

  const criticals = report.issues.filter((i) => i.severity === "critical");
  const lines = criticals
    .slice(0, 12)
    .map((i) => `- ${i.title}${i.url ? ` (${i.url})` : ""}: ${i.detail}`)
    .join("\n");

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.rackhost.hu",
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || SITE_EMAIL,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `AntiCode SEO Monitor <${SITE_EMAIL}>`,
      to,
      subject: `[AntiCode SEO] ${report.summary.criticalCount} kritikus hiba — ${report.summary.score}/100`,
      text: [
        `SEO státusz: ${report.summary.score}/100`,
        `Kritikus: ${report.summary.criticalCount}`,
        `Figyelmeztetés: ${report.summary.warningCount}`,
        `Utolsó ellenőrzés: ${report.summary.lastCheckedAt}`,
        "",
        "Kritikus hibák:",
        lines || "(nincs részlet)",
        "",
        `Admin: ${SITE_URL}/admin`,
      ].join("\n"),
    });
    return true;
  } catch (err) {
    console.error("[seo-checker] alert mail failed:", err);
    return false;
  }
}

/**
 * Refresh GSC URL Inspection in the background and patch the latest report.
 * Safe to call after a deferred admin check — does not block the HTTP response.
 */
export function refreshSeoIndexingInBackground(): void {
  if (indexingRefreshInFlight) return;

  indexingRefreshInFlight = (async () => {
    try {
      const gscIndexing = await fetchGscIndexingSummary();
      patchSeoGscIndexing(gscIndexing);
    } catch (err) {
      console.error("[seo-checker] background indexing refresh failed:", err);
    } finally {
      indexingRefreshInFlight = null;
    }
  })();
}

export async function runSeoCheck(options?: {
  baseUrl?: string;
  sendAlert?: boolean;
  /**
   * When true, reuse the previous GSC indexing snapshot so the HTTP response
   * stays under reverse-proxy timeouts. Call refreshSeoIndexingInBackground()
   * after responding to update indexing asynchronously.
   */
  deferIndexing?: boolean;
}): Promise<SeoReport> {
  const baseUrl = (options?.baseUrl || process.env.SEO_BASE_URL || SITE_URL).replace(
    /\/$/,
    ""
  );
  const monitored = getMonitoredUrls(baseUrl);
  const issues: SeoIssue[] = [];
  const pages: SeoReport["pages"] = [];
  const linkTargets = new Map<string, string>(); // target -> found on

  let totalMs = 0;

  for (const url of monitored) {
    const page = await fetchPage(url);
    totalMs += page.responseMs;

    const title = page.html ? extractTitle(page.html) : null;
    const description = page.html
      ? metaContent(page.html, "description")
      : null;

    pages.push({
      url,
      status: page.status,
      title,
      description,
      responseMs: page.responseMs,
    });

    if (!page.ok || page.status >= 400 || page.status === 0) {
      issues.push({
        id: `404-${url}`,
        severity: "critical",
        category: "404",
        title: "404 / elérhetetlen oldal",
        detail:
          page.status === 0
            ? "Az oldal nem válaszolt időben vagy hálózati hiba történt."
            : `HTTP ${page.status} választ kaptunk.`,
        url,
      });
      continue;
    }

    if (!title || title.length < 10) {
      issues.push({
        id: `title-${url}`,
        severity: "critical",
        category: "metadata",
        title: "Hiányzó vagy túl rövid title",
        detail: title
          ? `Title túl rövid: „${title}”`
          : "Nincs <title> a válaszban.",
        url,
      });
    } else if (title.length > 65) {
      issues.push({
        id: `title-long-${url}`,
        severity: "warning",
        category: "metadata",
        title: "Hosszú title",
        detail: `Title ${title.length} karakter (ajánlott ≤ 60–65).`,
        url,
      });
    }

    if (!description || description.length < 50) {
      issues.push({
        id: `desc-${url}`,
        severity: description ? "warning" : "critical",
        category: "metadata",
        title: "Hiányzó vagy gyenge meta description",
        detail: description
          ? `Description ${description.length} karakter (ajánlott ≥ 50).`
          : "Nincs meta description.",
        url,
      });
    } else if (description.length > 160) {
      issues.push({
        id: `desc-long-${url}`,
        severity: "info",
        category: "metadata",
        title: "Hosszú meta description",
        detail: `Description ${description.length} karakter (ajánlott ≤ 155–160).`,
        url,
      });
    }

    const h1 = extractH1(page.html);
    if (!h1) {
      issues.push({
        id: `h1-${url}`,
        severity: "warning",
        category: "metadata",
        title: "Hiányzó H1",
        detail: "Az oldalon nem található H1 cím.",
        url,
      });
    }

    const robots = extractRobotsMeta(page.html);
    if (robots && /noindex/i.test(robots)) {
      issues.push({
        id: `noindex-${url}`,
        severity: "critical",
        category: "indexing",
        title: "Oldal noindex",
        detail: `robots meta: ${robots}`,
        url,
      });
    }

    const canonical = extractCanonical(page.html);
    if (!canonical) {
      issues.push({
        id: `canon-${url}`,
        severity: "info",
        category: "indexing",
        title: "Hiányzó canonical",
        detail: "Nincs rel=canonical a válaszban.",
        url,
      });
    }

    if (page.responseMs >= PERF_CRITICAL_MS) {
      issues.push({
        id: `perf-crit-${url}`,
        severity: "critical",
        category: "performance",
        title: "Lassú válaszidő",
        detail: `${page.responseMs} ms (küszöb ${PERF_CRITICAL_MS} ms).`,
        url,
      });
    } else if (page.responseMs >= PERF_WARN_MS) {
      issues.push({
        id: `perf-warn-${url}`,
        severity: "warning",
        category: "performance",
        title: "Lassabb válaszidő",
        detail: `${page.responseMs} ms (küszöb ${PERF_WARN_MS} ms).`,
        url,
      });
    }

    for (const link of extractLinks(page.html, page.finalUrl || url)) {
      if (!linkTargets.has(link)) linkTargets.set(link, url);
    }
  }

  // Broken link sample (prefer same-origin first)
  const origin = baseUrl;
  const targets = [...linkTargets.keys()].sort((a, b) => {
    const aInternal = a.startsWith(origin) ? 0 : 1;
    const bInternal = b.startsWith(origin) ? 0 : 1;
    return aInternal - bInternal;
  });

  let brokenLinkCount = 0;
  const checked = targets.slice(0, MAX_EXTERNAL_LINK_CHECKS);
  for (const target of checked) {
    // Skip monitored pages already known OK
    const known = pages.find((p) => p.url === target || p.url === `${target}/`);
    if (known && known.status > 0 && known.status < 400) continue;

    const status = await headOrGetStatus(target);
    if (status === 0 || status >= 400) {
      brokenLinkCount += 1;
      issues.push({
        id: `broken-${target}`,
        severity: status === 404 || status >= 500 || status === 0 ? "critical" : "warning",
        category: "broken_link",
        title: "Hibás / törött link",
        detail: `HTTP ${status || "timeout"} — forrás: ${linkTargets.get(target)}`,
        url: target,
      });
    }
  }

  // Sitemap + robots
  let sitemapOk = false;
  const sitemap = await fetchPage(`${origin}/sitemap.xml`);
  if (sitemap.ok && /<urlset[\s>]/i.test(sitemap.html)) {
    sitemapOk = true;
    const sitemapPaths = new Set<string>();
    const locRe = /<loc>\s*([^<]+)\s*<\/loc>/gi;
    let locMatch: RegExpExecArray | null;
    while ((locMatch = locRe.exec(sitemap.html))) {
      try {
        const p = new URL(locMatch[1].trim()).pathname.replace(/\/$/, "") || "/";
        sitemapPaths.add(p);
      } catch {
        /* ignore */
      }
    }
    const stillMissing = monitored.filter((u) => {
      try {
        const p = new URL(u).pathname.replace(/\/$/, "") || "/";
        return !sitemapPaths.has(p);
      } catch {
        return true;
      }
    });
    if (stillMissing.length > 0) {
      issues.push({
        id: "sitemap-missing",
        severity: "warning",
        category: "sitemap",
        title: "Sitemap hiányos",
        detail: `${stillMissing.length} monitored URL nincs a sitemapben (pl. ${stillMissing[0]}).`,
      });
    }
  } else {
    issues.push({
      id: "sitemap-down",
      severity: "critical",
      category: "sitemap",
      title: "Sitemap nem elérhető",
      detail:
        sitemap.status === 0
          ? "A sitemap.xml nem válaszolt."
          : `HTTP ${sitemap.status} / érvénytelen XML.`,
      url: `${origin}/sitemap.xml`,
    });
  }

  const robotsTxt = await fetchPage(`${origin}/robots.txt`);
  if (!robotsTxt.ok) {
    issues.push({
      id: "robots-missing",
      severity: "warning",
      category: "indexing",
      title: "robots.txt hiányzik vagy hibás",
      detail: `HTTP ${robotsTxt.status || "timeout"}`,
      url: `${origin}/robots.txt`,
    });
  } else if (/Disallow:\s*\/\s*$/im.test(robotsTxt.html)) {
    issues.push({
      id: "robots-block-all",
      severity: "critical",
      category: "indexing",
      title: "robots.txt mindent tilt",
      detail: "Disallow: / megtalálható — indexelés blokkolva lehet.",
      url: `${origin}/robots.txt`,
    });
  } else if (!/Sitemap:/i.test(robotsTxt.html)) {
    issues.push({
      id: "robots-no-sitemap",
      severity: "info",
      category: "indexing",
      title: "robots.txt nem hivatkozik sitemapre",
      detail: "Érdemes Sitemap: sort hozzáadni.",
      url: `${origin}/robots.txt`,
    });
  }

  const gsc = await fetchGscTrafficSummary(28);
  const previousIndexing = getSeoReport().gscIndexing;
  const gscIndexing = options?.deferIndexing
    ? previousIndexing ||
      ({
        connected: Boolean(
          process.env.GSC_CLIENT_EMAIL && process.env.GSC_PRIVATE_KEY
        ),
        siteUrl: null,
        checkedAt: new Date().toISOString(),
        total: 0,
        indexedCount: 0,
        notIndexedCount: 0,
        unknownCount: 0,
        errorCount: 0,
        urls: [],
        error: null,
      } as NonNullable<SeoReport["gscIndexing"]>)
    : await fetchGscIndexingSummary();
  const gscConnected = Boolean(
    process.env.GSC_CLIENT_EMAIL && process.env.GSC_PRIVATE_KEY
  );

  if (!gscConnected) {
    issues.push({
      id: "gsc-not-connected",
      severity: "info",
      category: "gsc",
      title: "Google Search Console nincs csatlakoztatva",
      detail:
        "A technikai ellenőrzés fut; a GSC lekérdezésekhez service account kell (opcionális).",
    });
    issues.push({
      id: "traffic-gsc",
      severity: "info",
      category: "traffic",
      title: "Keresési forgalom / lekérdezések",
      detail:
        "A keresőszavas forgalom a GSC csatlakoztatása után jelenik meg. Addig az admin látogatottsági adatai a belső forgalmat mutatják.",
    });
  } else if (gsc.error) {
    issues.push({
      id: "gsc-error",
      severity: "warning",
      category: "gsc",
      title: "GSC API hiba",
      detail: gsc.error,
    });
  } else {
    issues.push({
      id: "traffic-gsc-ok",
      severity: "info",
      category: "traffic",
      title: `Keresési forgalom (utolsó ${gsc.rangeDays} nap)`,
      detail: `${gsc.clicks} kattintás · ${gsc.impressions} megjelenés · CTR ${(
        gsc.ctr * 100
      ).toFixed(1)}% · átl. pozíció ${gsc.position}${
        gsc.siteUrl ? ` · ${gsc.siteUrl}` : ""
      }`,
    });
  }

  if (gscConnected && gscIndexing.error) {
    issues.push({
      id: "gsc-indexing-error",
      severity: "warning",
      category: "indexing",
      title: "GSC indexelés-ellenőrzés hiba",
      detail: gscIndexing.error,
    });
  } else if (gscConnected && !gscIndexing.error) {
    issues.push({
      id: "gsc-indexing-summary",
      severity: gscIndexing.notIndexedCount > 0 ? "warning" : "info",
      category: "indexing",
      title: "GSC indexeltség",
      detail: `${gscIndexing.indexedCount}/${gscIndexing.total} indexelve · ${gscIndexing.notIndexedCount} nincs indexelve · ${gscIndexing.unknownCount} ismeretlen · ${gscIndexing.errorCount} hiba`,
    });
    for (const row of gscIndexing.urls) {
      if (row.indexed === false) {
        issues.push({
          id: `gsc-not-indexed-${row.url}`,
          severity: "warning",
          category: "indexing",
          title: "Oldal nincs indexelve (GSC)",
          detail: [
            row.coverageState,
            row.verdict ? `verdict: ${row.verdict}` : null,
            row.pageFetchState ? `fetch: ${row.pageFetchState}` : null,
            row.robotsTxtState ? `robots: ${row.robotsTxtState}` : null,
          ]
            .filter(Boolean)
            .join(" · "),
          url: row.url,
        });
      } else if (row.error) {
        issues.push({
          id: `gsc-inspect-error-${row.url}`,
          severity: "warning",
          category: "indexing",
          title: "URL Inspection hiba",
          detail: row.error,
          url: row.url,
        });
      }
    }
  }

  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const infoCount = issues.filter((i) => i.severity === "info").length;
  const missingMetaCount = issues.filter(
    (i) =>
      i.category === "metadata" &&
      (i.severity === "critical" || i.severity === "warning")
  ).length;
  const indexingOk =
    !issues.some(
      (i) =>
        i.category === "indexing" &&
        (i.severity === "critical" || i.severity === "warning")
    );

  const summary = {
    score: computeScore(issues),
    criticalCount,
    warningCount,
    infoCount,
    sitemapOk,
    indexingOk,
    brokenLinkCount,
    missingMetaCount,
    pagesChecked: pages.length,
    avgResponseMs:
      pages.length > 0 ? Math.round(totalMs / pages.length) : 0,
    lastCheckedAt: new Date().toISOString(),
  };

  const draft: Omit<SeoReport, "history" | "alertSentAt"> = {
    summary,
    issues,
    pages,
    gscConnected,
    gsc,
    gscIndexing,
  };

  let alertSent = false;
  if (options?.sendAlert !== false) {
    // Build temporary report for alert decision
    const tempReport: SeoReport = {
      ...draft,
      history: [],
      alertSentAt: null,
    };
    alertSent = await maybeSendAlert(tempReport);
  }

  return saveSeoReport(draft, { alertSent });
}
