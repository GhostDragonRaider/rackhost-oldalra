import crypto from "crypto";

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
  const data = (await res.json()) as { access_token?: string; error?: string; error_description?: string };
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
    const sites = await listSites(token);
    if (!sites.length) {
      return {
        ...empty,
        connected: true,
        error:
          "A service accountnak nincs Search Console property-je. Add hozzá felhasználóként: anticode-seo@anticode-website.iam.gserviceaccount.com",
      };
    }

    const preferred = candidateSiteUrls().find((u) => sites.includes(u));
    const siteUrl = preferred || sites[0];
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
