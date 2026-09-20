import crypto from "crypto";
import { getMonitoredUrls } from "./seo-urls";

export type GscTrafficSummary = {
  connected: boolean;
  siteUrl: string | null;
  rangeDays: number;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  topQueries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  error: string | null;
};

export type GscUrlIndexStatus = {
  url: string;
  indexed: boolean | null;
  verdict: string | null;
  coverageState: string | null;
  robotsTxtState: string | null;
  indexingState: string | null;
  lastCrawlTime: string | null;
  pageFetchState: string | null;
  crawledAs: string | null;
  googleCanonical: string | null;
  userCanonical: string | null;
  sitemaps: string[];
  referringUrls: string[];
  mobileUsabilityVerdict: string | null;
  inspectionResultLink: string | null;
  error: string | null;
};

export type GscIndexingSummary = {
  connected: boolean;
  siteUrl: string | null;
  checkedAt: string;
  total: number;
  indexedCount: number;
  notIndexedCount: number;
  unknownCount: number;
  errorCount: number;
  urls: GscUrlIndexStatus[];
  error: string | null;
};

function getCredentials(): { email: string; privateKey: string } | null {
  const email = process.env.GSC_CLIENT_EMAIL?.trim();
  let privateKey = process.env.GSC_PRIVATE_KEY || "";
  // .env often stores literal \n
  privateKey = privateKey.replace(/\\n/g, "\n").trim();
  if (!email || !privateKey.includes("BEGIN PRIVATE KEY")) return null;
  return { email, privateKey };
}

function b64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function getAccessToken(
  email: string,
  privateKey: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: email,
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );
  const unsigned = `${header}.${claim}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = b64url(signer.sign(privateKey));
  const assertion = `${unsigned}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const data = (await res.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!res.ok || !data.access_token) {
    throw new Error(
      data.error_description || data.error || `Token hiba HTTP ${res.status}`
    );
  }
  return data.access_token;
}

function candidateSiteUrls(): string[] {
  const configured = process.env.GSC_SITE_URL?.trim();
  const defaults = [
    "sc-domain:anticode.hu",
    "https://anticode.hu/",
    "https://www.anticode.hu/",
  ];
  if (configured) return [configured, ...defaults.filter((u) => u !== configured)];
  return defaults;
}

async function listSites(token: string): Promise<string[]> {
  const res = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json()) as {
    siteEntry?: Array<{ siteUrl?: string }>;
    error?: { message?: string };
  };
  if (!res.ok) {
    throw new Error(data.error?.message || `Sites list HTTP ${res.status}`);
  }
  return (data.siteEntry || [])
    .map((s) => s.siteUrl || "")
    .filter(Boolean);
}

async function resolveSiteUrl(token: string): Promise<string> {
  const sites = await listSites(token);
  if (!sites.length) {
    throw new Error(
      "A service accountnak nincs Search Console property-je. Add hozzá felhasználóként: anticode-seo@anticode-website.iam.gserviceaccount.com"
    );
  }
  const preferred = candidateSiteUrls().find((u) => sites.includes(u));
  return preferred || sites[0];
}

function dayStamp(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function queryAnalytics(
  token: string,
  siteUrl: string,
  days: number
): Promise<{
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  topQueries: GscTrafficSummary["topQueries"];
}> {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 2); // GSC data lag
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const encoded = encodeURIComponent(siteUrl);
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encoded}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: dayStamp(start),
        endDate: dayStamp(end),
        dimensions: ["query"],
        rowLimit: 10,
        startRow: 0,
      }),
    }
  );
  const data = (await res.json()) as {
    rows?: Array<{
      keys?: string[];
      clicks?: number;
      impressions?: number;
      ctr?: number;
      position?: number;
    }>;
    error?: { message?: string };
  };
  if (!res.ok) {
    throw new Error(data.error?.message || `Search analytics HTTP ${res.status}`);
  }

  const rows = data.rows || [];
  let clicks = 0;
  let impressions = 0;
  let positionWeighted = 0;
  const topQueries = rows.map((row) => {
    const c = row.clicks || 0;
    const i = row.impressions || 0;
    const p = row.position || 0;
    clicks += c;
    impressions += i;
    positionWeighted += p * i;
    return {
      query: row.keys?.[0] || "(ismeretlen)",
      clicks: c,
      impressions: i,
      ctr: row.ctr || 0,
      position: p,
    };
  });

  return {
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    position: impressions > 0 ? positionWeighted / impressions : 0,
    topQueries,
  };
}

function deriveIndexed(args: {
  verdict: string | null;
  coverageState: string | null;
}): boolean | null {
  const coverage = (args.coverageState || "").toLowerCase();
  const verdict = (args.verdict || "").toUpperCase();

  if (
    coverage.includes("submitted and indexed") ||
    (coverage.includes("indexed") && !coverage.includes("not indexed"))
  ) {
    return true;
  }
  if (verdict === "PASS") return true;

  if (
    coverage.includes("not indexed") ||
    coverage.includes("excluded") ||
    coverage.includes("unknown to google") ||
    coverage.includes("blocked")
  ) {
    return false;
  }
  if (verdict === "FAIL") return false;

  return null;
}

type InspectionApiResponse = {
  inspectionResult?: {
    inspectionResultLink?: string;
    indexStatusResult?: {
      verdict?: string;
      coverageState?: string;
      robotsTxtState?: string;
      indexingState?: string;
      lastCrawlTime?: string;
      pageFetchState?: string;
      crawledAs?: string;
      googleCanonical?: string;
      userCanonical?: string;
      sitemap?: string[];
      referringUrls?: string[];
    };
    mobileUsabilityResult?: {
      verdict?: string;
    };
  };
  error?: { message?: string; status?: string };
};

async function inspectUrl(
  token: string,
  siteUrl: string,
  inspectionUrl: string
): Promise<GscUrlIndexStatus> {
  const res = await fetch(
    "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inspectionUrl,
        siteUrl,
        languageCode: "hu-HU",
      }),
    }
  );
  const data = (await res.json()) as InspectionApiResponse;
  if (!res.ok) {
    return {
      url: inspectionUrl,
      indexed: null,
      verdict: null,
      coverageState: null,
      robotsTxtState: null,
      indexingState: null,
      lastCrawlTime: null,
      pageFetchState: null,
      crawledAs: null,
      googleCanonical: null,
      userCanonical: null,
      sitemaps: [],
      referringUrls: [],
      mobileUsabilityVerdict: null,
      inspectionResultLink: null,
      error: data.error?.message || `URL Inspection HTTP ${res.status}`,
    };
  }

  const index = data.inspectionResult?.indexStatusResult;
  const verdict = index?.verdict || null;
  const coverageState = index?.coverageState || null;

  return {
    url: inspectionUrl,
    indexed: deriveIndexed({ verdict, coverageState }),
    verdict,
    coverageState,
    robotsTxtState: index?.robotsTxtState || null,
    indexingState: index?.indexingState || null,
    lastCrawlTime: index?.lastCrawlTime || null,
    pageFetchState: index?.pageFetchState || null,
    crawledAs: index?.crawledAs || null,
    googleCanonical: index?.googleCanonical || null,
    userCanonical: index?.userCanonical || null,
    sitemaps: Array.isArray(index?.sitemap) ? index!.sitemap! : [],
    referringUrls: Array.isArray(index?.referringUrls)
      ? index!.referringUrls!
      : [],
    mobileUsabilityVerdict:
      data.inspectionResult?.mobileUsabilityResult?.verdict || null,
    inspectionResultLink:
      data.inspectionResult?.inspectionResultLink || null,
    error: null,
  };
}

export async function fetchGscTrafficSummary(
  days = 28
): Promise<GscTrafficSummary> {
  const empty: GscTrafficSummary = {
    connected: false,
    siteUrl: null,
    rangeDays: days,
    clicks: 0,
    impressions: 0,
    ctr: 0,
    position: 0,
    topQueries: [],
    error: null,
  };

  const creds = getCredentials();
  if (!creds) {
    return {
      ...empty,
      error: "GSC_CLIENT_EMAIL / GSC_PRIVATE_KEY nincs beállítva.",
    };
  }

  try {
    const token = await getAccessToken(creds.email, creds.privateKey);
    const siteUrl = await resolveSiteUrl(token);
    const stats = await queryAnalytics(token, siteUrl, days);

    return {
      connected: true,
      siteUrl,
      rangeDays: days,
      clicks: Math.round(stats.clicks),
      impressions: Math.round(stats.impressions),
      ctr: stats.ctr,
      position: Number(stats.position.toFixed(1)),
      topQueries: stats.topQueries,
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ...empty,
      connected: Boolean(creds),
      error: message,
    };
  }
}

export type FetchGscIndexingOptions = {
  /** Soft deadline for URL Inspection; remaining URLs stay unknown. */
  budgetMs?: number;
};

/** Inspect monitored (or provided) URLs via GSC URL Inspection API. */
export async function fetchGscIndexingSummary(
  urls?: string[],
  options?: FetchGscIndexingOptions
): Promise<GscIndexingSummary> {
  const checkedAt = new Date().toISOString();
  const empty: GscIndexingSummary = {
    connected: false,
    siteUrl: null,
    checkedAt,
    total: 0,
    indexedCount: 0,
    notIndexedCount: 0,
    unknownCount: 0,
    errorCount: 0,
    urls: [],
    error: null,
  };

  const creds = getCredentials();
  if (!creds) {
    return {
      ...empty,
      error: "GSC_CLIENT_EMAIL / GSC_PRIVATE_KEY nincs beállítva.",
    };
  }

  const targets = (urls && urls.length > 0 ? urls : getMonitoredUrls()).slice();
  const budgetMs =
    typeof options?.budgetMs === "number" && options.budgetMs > 0
      ? options.budgetMs
      : null;
  const startedAt = Date.now();

  try {
    const token = await getAccessToken(creds.email, creds.privateKey);
    const siteUrl = await resolveSiteUrl(token);

    const results: GscUrlIndexStatus[] = [];
    let truncated = false;
    // Sequential to stay under URL Inspection rate limits.
    for (const url of targets) {
      if (budgetMs !== null && Date.now() - startedAt >= budgetMs) {
        truncated = true;
        results.push({
          url,
          indexed: null,
          verdict: null,
          coverageState: null,
          robotsTxtState: null,
          indexingState: null,
          lastCrawlTime: null,
          pageFetchState: null,
          crawledAs: null,
          googleCanonical: null,
          userCanonical: null,
          sitemaps: [],
          referringUrls: [],
          mobileUsabilityVerdict: null,
          inspectionResultLink: null,
          error: "Időkorlát — később frissül.",
        });
        continue;
      }
      results.push(await inspectUrl(token, siteUrl, url));
    }

    const indexedCount = results.filter((r) => r.indexed === true).length;
    const notIndexedCount = results.filter((r) => r.indexed === false).length;
    const errorCount = results.filter((r) => Boolean(r.error)).length;
    const unknownCount = results.filter(
      (r) => r.indexed === null && !r.error
    ).length;

    return {
      connected: true,
      siteUrl,
      checkedAt,
      total: results.length,
      indexedCount,
      notIndexedCount,
      unknownCount,
      errorCount,
      urls: results,
      error: truncated
        ? "Az indexelés-ellenőrzés időkorlát miatt részleges; háttérben folytatódik."
        : null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ...empty,
      connected: Boolean(creds),
      total: targets.length,
      error: message,
    };
  }
}
