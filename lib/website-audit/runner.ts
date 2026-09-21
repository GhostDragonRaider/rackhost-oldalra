import tls from "tls";
import { URL } from "url";
import {
  assertPublicHostname,
  validateAndResolveAuditUrl,
} from "./ssrf";
import {
  emptyTechnical,
  getAuditById,
  newAuditId,
  saveAudit,
} from "./store";
import {
  computeCategoryScores,
  computeOverallScore,
  summarizeFindings,
} from "./score";
import { getCachedAuditId, setCachedAuditId } from "./rate-limit";
import {
  extractCanonical,
  extractH1s,
  extractTitle,
  metaContent,
} from "./html";
import type {
  AuditFinding,
  AuditProgressStep,
  WebsiteAuditRecord,
} from "./types";

const FETCH_TIMEOUT_MS = 12_000;
const MAX_REDIRECTS = 8;
const MAX_BODY_BYTES = 1_500_000;

function setStep(
  progress: AuditProgressStep[],
  id: string,
  status: AuditProgressStep["status"],
  detail?: string
) {
  const row = progress.find((p) => p.id === id);
  if (row) {
    row.status = status;
    if (detail !== undefined) row.detail = detail;
  }
}

function headerMap(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((value, key) => {
    out[key.toLowerCase()] = value;
  });
  return out;
}

async function fetchWithLimits(
  url: string,
  options?: { method?: string; maxBytes?: number }
): Promise<{
  response: Response;
  buffer: Buffer;
  ms: number;
  truncated: boolean;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const started = Date.now();
  try {
    const response = await fetch(url, {
      method: options?.method || "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "User-Agent": "AntiCodeWebsiteAudit/1.0 (+https://anticode.hu)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    const maxBytes = options?.maxBytes ?? MAX_BODY_BYTES;
    const reader = response.body?.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    let truncated = false;
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;
        total += value.byteLength;
        if (total > maxBytes) {
          truncated = true;
          chunks.push(value.subarray(0, Math.max(0, maxBytes - (total - value.byteLength))));
          try {
            await reader.cancel();
          } catch {
            /* ignore */
          }
          break;
        }
        chunks.push(value);
      }
    }
    const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));
    return { response, buffer, ms: Date.now() - started, truncated };
  } finally {
    clearTimeout(timer);
  }
}

async function followRedirects(startUrl: string): Promise<{
  finalUrl: string;
  status: number;
  headers: Record<string, string>;
  buffer: Buffer;
  ms: number;
  chain: string[];
  truncated: boolean;
  error?: string;
}> {
  const chain: string[] = [];
  let current = startUrl;
  let totalMs = 0;

  try {
    for (let i = 0; i <= MAX_REDIRECTS; i++) {
      const parsed = new URL(current);
      await assertPublicHostname(parsed.hostname);

      const { response, buffer, ms, truncated } = await fetchWithLimits(current);
      totalMs += ms;
      chain.push(current);
      const headers = headerMap(response.headers);
      const status = response.status;

      if (status >= 300 && status < 400) {
        const loc = headers.location;
        if (!loc) {
          return {
            finalUrl: current,
            status,
            headers,
            buffer,
            ms: totalMs,
            chain,
            truncated,
            error: "Redirect Location header hiányzik.",
          };
        }
        const next = new URL(loc, current).toString();
        const nextHost = new URL(next).hostname;
        await assertPublicHostname(nextHost);
        current = next;
        continue;
      }

      return {
        finalUrl: current,
        status,
        headers,
        buffer,
        ms: totalMs,
        chain,
        truncated,
      };
    }

    return {
      finalUrl: current,
      status: 0,
      headers: {},
      buffer: Buffer.alloc(0),
      ms: totalMs,
      chain,
      truncated: false,
      error: `Túl sok átirányítás (max ${MAX_REDIRECTS}).`,
    };
  } catch (e) {
    const message =
      e instanceof Error
        ? e.name === "AbortError"
          ? "Időtúllépés a lekérés közben."
          : e.message
        : "Hálózati hiba a lekérés közben.";
    return {
      finalUrl: current,
      status: 0,
      headers: {},
      buffer: Buffer.alloc(0),
      ms: totalMs,
      chain,
      truncated: false,
      error: message,
    };
  }
}

function checkTls(hostname: string): Promise<WebsiteAuditRecord["technical"]["tls"]> {
  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host: hostname,
        port: 443,
        servername: hostname,
        timeout: 8000,
        rejectUnauthorized: true,
      },
      () => {
        const ok = socket.authorized;
        const protocol = socket.getProtocol();
        socket.end();
        resolve({
          ok,
          protocol: protocol || null,
          authorized: ok,
          error: ok
            ? null
            : String(socket.authorizationError || "TLS nem megbízható."),
        });
      }
    );
    socket.on("error", (err) => {
      resolve({
        ok: false,
        protocol: null,
        authorized: false,
        error: err.message || "TLS kapcsolat sikertelen.",
      });
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve({
        ok: false,
        protocol: null,
        authorized: false,
        error: "TLS kapcsolat időtúllépés.",
      });
    });
  });
}

async function fetchOptional(
  url: string
): Promise<{ ok: boolean; status: number; ms: number }> {
  try {
    await assertPublicHostname(new URL(url).hostname);
    const { response, ms } = await fetchWithLimits(url, {
      method: "GET",
      maxBytes: 200_000,
    });
    return { ok: response.ok, status: response.status, ms };
  } catch {
    return { ok: false, status: 0, ms: 0 };
  }
}

async function maybePagespeed(
  url: string
): Promise<WebsiteAuditRecord["technical"]["pagespeed"]> {
  const key = process.env.PAGESPEED_API_KEY?.trim();
  const params = new URLSearchParams({
    url,
    category: "performance",
    strategy: "mobile",
  });
  if (key) params.set("key", key);
  const endpoint =
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45_000);
    const res = await fetch(endpoint, { signal: controller.signal });
    clearTimeout(timer);
    const data = (await res.json()) as {
      error?: { message?: string };
      lighthouseResult?: { categories?: { performance?: { score?: number } } };
    };
    if (!res.ok) {
      return {
        attempted: true,
        ok: false,
        performanceScore: null,
        error: data.error?.message || `PageSpeed HTTP ${res.status}`,
      };
    }
    const score = data.lighthouseResult?.categories?.performance?.score;
    return {
      attempted: true,
      ok: typeof score === "number",
      performanceScore:
        typeof score === "number" ? Math.round(score * 100) : null,
      error:
        typeof score === "number"
          ? null
          : "A PageSpeed válasz nem tartalmazott performance pontszámot.",
    };
  } catch (e) {
    return {
      attempted: true,
      ok: false,
      performanceScore: null,
      error:
        e instanceof Error
          ? e.name === "AbortError"
            ? "PageSpeed időtúllépés."
            : e.message
          : "PageSpeed hiba.",
    };
  }
}

function initialProgress(): AuditProgressStep[] {
  return [
    { id: "validate", label: "URL ellenőrzés (SSRF)", status: "pending" },
    { id: "fetch", label: "Oldal lekérése", status: "pending" },
    { id: "tls", label: "TLS / tanúsítvány", status: "pending" },
    { id: "headers", label: "Biztonsági headerek", status: "pending" },
    { id: "html", label: "HTML / SEO jelek", status: "pending" },
    { id: "robots", label: "robots.txt / sitemap", status: "pending" },
    { id: "pagespeed", label: "PageSpeed", status: "pending" },
    { id: "score", label: "Pontszámítás", status: "pending" },
  ];
}

export async function runWebsiteAudit(options: {
  inputUrl: string;
  reuseCache?: boolean;
}): Promise<WebsiteAuditRecord> {
  const now = new Date().toISOString();
  const progress = initialProgress();
  const findings: AuditFinding[] = [];

  let record: WebsiteAuditRecord = {
    id: newAuditId(),
    createdAt: now,
    updatedAt: now,
    inputUrl: options.inputUrl,
    normalizedUrl: options.inputUrl,
    status: "running",
    overallScore: 0,
    summary: "Fut…",
    error: null,
    categories: [],
    findings: [],
    technical: emptyTechnical(),
    progress,
  };

  setStep(progress, "validate", "running");
  const validated = await validateAndResolveAuditUrl(options.inputUrl);
  if (validated.ok === false) {
    setStep(progress, "validate", "error", validated.error);
    record.status = "failed";
    record.error = validated.error;
    record.summary = validated.error;
    record.updatedAt = new Date().toISOString();
    findings.push({
      id: "url-invalid",
      category: "availability",
      severity: "critical",
      title: "URL elutasítva",
      detail: validated.error,
    });
    record.findings = findings;
    record.categories = computeCategoryScores(findings);
    record.overallScore = 0;
    return saveAudit(record);
  }

  record.normalizedUrl = validated.normalized;
  setStep(progress, "validate", "done", validated.normalized);
  record = saveAudit(record);

  if (options.reuseCache !== false) {
    const cachedId = getCachedAuditId(validated.normalized);
    if (cachedId) {
      const cached = getAuditById(cachedId);
      if (cached && cached.status === "completed") {
        return {
          ...cached,
          id: record.id,
          createdAt: record.createdAt,
          updatedAt: new Date().toISOString(),
          inputUrl: options.inputUrl,
          summary: `${cached.summary} (cache · 10 perc)`,
        };
      }
    }
  }

  try {
    setStep(progress, "fetch", "running");
    record = saveAudit({ ...record, progress, updatedAt: new Date().toISOString() });

    const fetched = await followRedirects(validated.normalized);
    record.technical.finalUrl = fetched.finalUrl;
    record.technical.statusCode = fetched.status;
    record.technical.responseMs = fetched.ms;
    record.technical.redirectChain = fetched.chain;
    record.technical.headers = fetched.headers;
    record.technical.responseBytes = fetched.buffer.length;
    record.technical.contentType = fetched.headers["content-type"] || null;

    if (fetched.error) {
      findings.push({
        id: "redirect-error",
        category: "availability",
        severity: "critical",
        title: "Átirányítási hiba",
        detail: fetched.error,
      });
    }
    if (fetched.chain.length > 3) {
      findings.push({
        id: "redirect-chain-long",
        category: "performance",
        severity: "warning",
        title: "Hosszú redirect lánc",
        detail: `${fetched.chain.length} lépés a végső URL-ig.`,
        evidence: fetched.chain.join(" → "),
      });
    }
    if (fetched.truncated) {
      findings.push({
        id: "body-too-large",
        category: "performance",
        severity: "warning",
        title: "Nagy válaszméret",
        detail: `A válasz ${MAX_BODY_BYTES}+ bájt — a vizsgálat részleges.`,
      });
    }

    const httpStart = validated.url.protocol === "http:";
    if (httpStart) {
      const httpsUpgrade = fetched.chain.some((u) => u.startsWith("https://"));
      findings.push({
        id: httpStart && httpsUpgrade ? "http-to-https" : "http-only",
        category: "security",
        severity: httpsUpgrade ? "pass" : "critical",
        title: httpsUpgrade
          ? "HTTP → HTTPS átirányítás rendben"
          : "Nincs HTTPS átirányítás",
        detail: httpsUpgrade
          ? "A HTTP kérés HTTPS-re irányít."
          : "A kiinduló URL HTTP, és nem került át HTTPS-re.",
      });
    }

    if (fetched.status === 0) {
      findings.push({
        id: "fetch-failed",
        category: "availability",
        severity: "critical",
        title: "Az oldal nem érhető el",
        detail: fetched.error || "Hálózati / időtúllépési hiba.",
      });
      setStep(progress, "fetch", "error", fetched.error || "fetch failed");
    } else if (fetched.status >= 500) {
      findings.push({
        id: "status-5xx",
        category: "availability",
        severity: "critical",
        title: `Szerverhiba (HTTP ${fetched.status})`,
        detail: "Az oldal 5xx választ adott.",
      });
      setStep(progress, "fetch", "done", `HTTP ${fetched.status}`);
    } else if (fetched.status === 404) {
      findings.push({
        id: "status-404",
        category: "availability",
        severity: "critical",
        title: "404 — az oldal nem található",
        detail: "A végleges URL 404-et adott.",
      });
      setStep(progress, "fetch", "done", "HTTP 404");
    } else if (fetched.status >= 400) {
      findings.push({
        id: "status-4xx",
        category: "availability",
        severity: "warning",
        title: `HTTP ${fetched.status}`,
        detail: "Az oldal hibás kliensválaszt adott.",
      });
      setStep(progress, "fetch", "done", `HTTP ${fetched.status}`);
    } else {
      findings.push({
        id: "status-ok",
        category: "availability",
        severity: "pass",
        title: `Elérhető (HTTP ${fetched.status})`,
        detail: `Válaszidő: ${fetched.ms} ms`,
      });
      setStep(progress, "fetch", "done", `HTTP ${fetched.status} · ${fetched.ms} ms`);
    }

    // TLS
    const finalUrl = new URL(fetched.finalUrl || validated.normalized);
    if (finalUrl.protocol === "https:") {
      setStep(progress, "tls", "running");
      const tlsInfo = await checkTls(finalUrl.hostname);
      record.technical.tls = tlsInfo;
      if (tlsInfo.ok) {
        findings.push({
          id: "tls-ok",
          category: "security",
          severity: "pass",
          title: "TLS tanúsítvány rendben",
          detail: tlsInfo.protocol ? `Protokoll: ${tlsInfo.protocol}` : "OK",
        });
        setStep(progress, "tls", "done", tlsInfo.protocol || "OK");
      } else {
        findings.push({
          id: "tls-fail",
          category: "security",
          severity: "critical",
          title: "TLS / SSL probléma",
          detail: tlsInfo.error || "Ismeretlen TLS hiba.",
        });
        setStep(progress, "tls", "error", tlsInfo.error);
      }
    } else {
      setStep(progress, "tls", "done", "Nem HTTPS — TLS ellenőrzés lefutott (hiba)");
      findings.push({
        id: "tls-no-https",
        category: "security",
        severity: "critical",
        title: "Nincs HTTPS",
        detail: "A végső URL nem HTTPS — a TLS tanúsítvány nem ellenőrizhető biztonságosan.",
      });
    }

    // Security headers
    setStep(progress, "headers", "running");
    const h = fetched.headers;
    const securityChecks: Array<{ id: string; header: string; title: string }> = [
      { id: "hdr-csp", header: "content-security-policy", title: "Content-Security-Policy" },
      { id: "hdr-xfo", header: "x-frame-options", title: "X-Frame-Options" },
      { id: "hdr-cto", header: "x-content-type-options", title: "X-Content-Type-Options" },
      { id: "hdr-ref", header: "referrer-policy", title: "Referrer-Policy" },
      {
        id: "hdr-hsts",
        header: "strict-transport-security",
        title: "Strict-Transport-Security",
      },
    ];
    for (const check of securityChecks) {
      if (h[check.header]) {
        findings.push({
          id: check.id,
          category: "security",
          severity: "pass",
          title: `${check.title} jelen van`,
          detail: h[check.header].slice(0, 180),
          evidence: h[check.header],
        });
      } else {
        findings.push({
          id: check.id,
          category: "security",
          severity: check.header === "strict-transport-security" ? "warning" : "info",
          title: `Hiányzó header: ${check.title}`,
          detail: "Ajánlott biztonsági válaszfejléc hiányzik.",
        });
      }
    }
    setStep(progress, "headers", "done");

    // HTML / SEO
    setStep(progress, "html", "running");
    const ctype = (record.technical.contentType || "").toLowerCase();
    const looksHtml = ctype.includes("text/html") || ctype.includes("application/xhtml");
    const html = looksHtml || fetched.buffer.slice(0, 200).toString("utf8").includes("<html")
      ? fetched.buffer.toString("utf8")
      : "";

    if (!html) {
      findings.push({
        id: "not-html",
        category: "content",
        severity: "warning",
        title: "Nem HTML tartalom",
        detail: ctype || "Ismeretlen Content-Type — SEO jelek nem értékelhetők.",
      });
      setStep(progress, "html", "done", "nem HTML");
    } else {
      const title = extractTitle(html);
      const description = metaContent(html, "description");
      const canonical = extractCanonical(html);
      const h1s = extractH1s(html);
      record.technical.title = title;
      record.technical.metaDescription = description;
      record.technical.canonical = canonical;
      record.technical.h1Count = h1s.length;
      record.technical.h1Texts = h1s.slice(0, 5);

      if (!title) {
        findings.push({
          id: "title-missing",
          category: "seo",
          severity: "critical",
          title: "Hiányzó <title>",
          detail: "Nincs title elem a HTML-ben.",
        });
      } else if (title.length < 10) {
        findings.push({
          id: "title-short",
          category: "seo",
          severity: "warning",
          title: "Rövid title",
          detail: `Title: „${title}”`,
          evidence: title,
        });
      } else {
        findings.push({
          id: "title-ok",
          category: "seo",
          severity: "pass",
          title: "Title rendben",
          detail: title,
          evidence: title,
        });
      }

      if (!description) {
        findings.push({
          id: "desc-missing",
          category: "seo",
          severity: "warning",
          title: "Hiányzó meta description",
          detail: "Nincs meta description.",
        });
      } else if (description.length < 50) {
        findings.push({
          id: "desc-short",
          category: "seo",
          severity: "info",
          title: "Rövid meta description",
          detail: description,
          evidence: description,
        });
      } else {
        findings.push({
          id: "desc-ok",
          category: "seo",
          severity: "pass",
          title: "Meta description rendben",
          detail: description.slice(0, 160),
          evidence: description,
        });
      }

      if (h1s.length === 0) {
        findings.push({
          id: "h1-missing",
          category: "content",
          severity: "warning",
          title: "Hiányzó H1",
          detail: "Nincs H1 az oldalon.",
        });
      } else if (h1s.length > 1) {
        findings.push({
          id: "h1-multiple",
          category: "content",
          severity: "warning",
          title: "Több H1",
          detail: `${h1s.length} db H1 található.`,
          evidence: h1s.join(" | "),
        });
      } else {
        findings.push({
          id: "h1-ok",
          category: "content",
          severity: "pass",
          title: "H1 rendben",
          detail: h1s[0],
          evidence: h1s[0],
        });
      }

      if (!canonical) {
        findings.push({
          id: "canonical-missing",
          category: "seo",
          severity: "info",
          title: "Hiányzó canonical",
          detail: "Nincs rel=canonical link.",
        });
      } else {
        findings.push({
          id: "canonical-ok",
          category: "seo",
          severity: "pass",
          title: "Canonical jelen van",
          detail: canonical,
          evidence: canonical,
        });
      }

      if (fetched.ms > 3000) {
        findings.push({
          id: "slow-ttfb",
          category: "performance",
          severity: "warning",
          title: "Lassú válasz",
          detail: `${fetched.ms} ms a teljes redirect+válasz.`,
        });
      } else {
        findings.push({
          id: "ttfb-ok",
          category: "performance",
          severity: "pass",
          title: "Elfogadható válaszidő",
          detail: `${fetched.ms} ms`,
        });
      }

      setStep(progress, "html", "done");
    }

    // robots + sitemap
    setStep(progress, "robots", "running");
    const origin = `${finalUrl.protocol}//${finalUrl.host}`;
    const robotsUrl = `${origin}/robots.txt`;
    const sitemapUrl = `${origin}/sitemap.xml`;
    record.technical.robotsTxtUrl = robotsUrl;
    record.technical.sitemapUrl = sitemapUrl;
    const robots = await fetchOptional(robotsUrl);
    const sitemap = await fetchOptional(sitemapUrl);
    record.technical.robotsTxtOk = robots.ok;
    record.technical.sitemapOk = sitemap.ok;

    findings.push({
      id: robots.ok ? "robots-ok" : "robots-missing",
      category: "best_practices",
      severity: robots.ok ? "pass" : "warning",
      title: robots.ok ? "robots.txt elérhető" : "robots.txt hiányzik / hibás",
      detail: robots.ok ? `HTTP ${robots.status}` : `HTTP ${robots.status || "n/a"}`,
    });
    findings.push({
      id: sitemap.ok ? "sitemap-ok" : "sitemap-missing",
      category: "seo",
      severity: sitemap.ok ? "pass" : "warning",
      title: sitemap.ok ? "sitemap.xml elérhető" : "sitemap.xml hiányzik / hibás",
      detail: sitemap.ok ? `HTTP ${sitemap.status}` : `HTTP ${sitemap.status || "n/a"}`,
    });
    setStep(progress, "robots", "done");

    // PageSpeed (always attempted)
    setStep(progress, "pagespeed", "running");
    const ps = await maybePagespeed(fetched.finalUrl || validated.normalized);
    record.technical.pagespeed = ps;
    if (ps.ok && ps.performanceScore != null) {
      setStep(progress, "pagespeed", "done", `${ps.performanceScore}/100`);
      findings.push({
        id: "pagespeed-score",
        category: "performance",
        severity: ps.performanceScore >= 50 ? "pass" : "warning",
        title: `PageSpeed: ${ps.performanceScore}/100`,
        detail: "Lighthouse performance (mobile).",
      });
    } else {
      setStep(progress, "pagespeed", "error", ps.error || "hiba");
      findings.push({
        id: "pagespeed-error",
        category: "performance",
        severity: "warning",
        title: "PageSpeed nem sikerült",
        detail: ps.error || "Ismeretlen hiba — az audit többi része megmarad.",
      });
    }

    setStep(progress, "score", "running");
    const categories = computeCategoryScores(findings);
    const overall = computeOverallScore(categories);
    record.categories = categories;
    record.findings = findings;
    record.overallScore = overall;
    record.summary = summarizeFindings(overall, findings);
    record.status = "completed";
    record.error = null;
    record.progress = progress;
    record.updatedAt = new Date().toISOString();
    setStep(progress, "score", "done", `${overall}/100`);
    const saved = saveAudit(record);
    setCachedAuditId(validated.normalized, saved.id);
    return saved;
  } catch (e) {
    const message =
      e instanceof Error
        ? e.name === "AbortError"
          ? "Időtúllépés a lekérés közben."
          : e.message
        : "Ismeretlen audit hiba.";
    findings.push({
      id: "runtime-error",
      category: "availability",
      severity: "critical",
      title: "Az ellenőrzés megszakadt",
      detail: message,
    });
    record.findings = findings;
    record.categories = computeCategoryScores(findings);
    record.overallScore = 0;
    record.status = "failed";
    record.error = message;
    record.summary = message;
    record.updatedAt = new Date().toISOString();
    for (const step of progress) {
      if (step.status === "running" || step.status === "pending") {
        step.status = "error";
        if (!step.detail) step.detail = "Nem futott le teljesen.";
      }
    }
    return saveAudit(record);
  }
}
