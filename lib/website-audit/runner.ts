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
  countSeverities,
  prioritizeFixes,
  scoreBandLabel,
  summarizeFindings,
} from "./score";
import { getCachedAuditId, setCachedAuditId } from "./rate-limit";
import { parseHtmlDocument } from "./html";
import {
  buildIndexability,
  checkAccessibility,
  checkAvailability,
  checkBestPractices,
  checkContent,
  checkPerformance,
  checkSecurity,
  checkSeo,
  estimateLocalPerformance,
  finding,
  robotsTxtLikelyBlocks,
} from "./checks";
import { fetchPagespeed } from "./pagespeed";
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
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
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
          chunks.push(
            value.subarray(
              0,
              Math.max(0, maxBytes - (total - value.byteLength))
            )
          );
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
        // Re-validate every redirect target before following (SSRF).
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

function checkTls(
  hostname: string
): Promise<WebsiteAuditRecord["technical"]["tls"]> {
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

async function fetchTextResource(
  url: string,
  maxBytes = 200_000
): Promise<{ ok: boolean; status: number; body: string | null; ms: number }> {
  try {
    await assertPublicHostname(new URL(url).hostname);
    const { response, buffer, ms } = await fetchWithLimits(url, {
      method: "GET",
      maxBytes,
    });
    return {
      ok: response.ok,
      status: response.status,
      body: buffer.toString("utf8"),
      ms,
    };
  } catch {
    return { ok: false, status: 0, body: null, ms: 0 };
  }
}

function classifySitemap(
  body: string | null,
  ok: boolean
): {
  ok: boolean;
  kind: "urlset" | "index" | "unknown" | "invalid" | null;
  error?: string;
} {
  if (!ok || !body) {
    return { ok: false, kind: null };
  }
  const trimmed = body.trim();
  if (!trimmed.includes("<") || !/xml/i.test(trimmed.slice(0, 200)) && !trimmed.includes("<urlset") && !trimmed.includes("<sitemapindex")) {
    if (!/<urlset\b/i.test(trimmed) && !/<sitemapindex\b/i.test(trimmed)) {
      return {
        ok: false,
        kind: "invalid",
        error: "A válasz nem tűnik XML sitemapnek.",
      };
    }
  }
  if (/<sitemapindex\b/i.test(trimmed)) {
    return { ok: true, kind: "index" };
  }
  if (/<urlset\b/i.test(trimmed)) {
    return { ok: true, kind: "urlset" };
  }
  if (/<\?xml/i.test(trimmed)) {
    return {
      ok: false,
      kind: "invalid",
      error: "XML válasz, de nem urlset / sitemapindex.",
    };
  }
  return {
    ok: false,
    kind: "invalid",
    error: "Értelmezhetetlen sitemap tartalom.",
  };
}

function initialProgress(): AuditProgressStep[] {
  return [
    { id: "validate", label: "URL ellenőrzése", status: "pending" },
    { id: "fetch", label: "Weboldal lekérése", status: "pending" },
    { id: "tls", label: "Biztonság ellenőrzése (TLS)", status: "pending" },
    { id: "headers", label: "Biztonsági headerek", status: "pending" },
    { id: "html", label: "SEO és tartalom elemzése", status: "pending" },
    { id: "a11y", label: "Akadálymentesség", status: "pending" },
    { id: "robots", label: "robots.txt / sitemap", status: "pending" },
    { id: "pagespeed", label: "PageSpeed", status: "pending" },
    { id: "score", label: "Pontszámítás", status: "pending" },
  ];
}

function finalize(
  record: WebsiteAuditRecord,
  findings: AuditFinding[],
  progress: AuditProgressStep[]
): WebsiteAuditRecord {
  const categories = computeCategoryScores(findings);
  const overall = computeOverallScore(categories);
  record.categories = categories;
  record.findings = findings;
  record.priorityFixes = prioritizeFixes(findings).slice(0, 12);
  record.severityCounts = countSeverities(findings);
  record.overallScore = overall;
  record.overallLabel = scoreBandLabel(overall);
  record.summary = summarizeFindings(overall, findings);
  record.progress = progress;
  record.updatedAt = new Date().toISOString();
  return record;
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
    overallLabel: scoreBandLabel(0),
    summary: "Fut…",
    error: null,
    categories: [],
    findings: [],
    priorityFixes: [],
    severityCounts: {
      pass: 0,
      info: 0,
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    },
    technical: emptyTechnical(),
    progress,
    beta: true,
  };

  setStep(progress, "validate", "running");
  const validated = await validateAndResolveAuditUrl(options.inputUrl);
  if (validated.ok === false) {
    setStep(progress, "validate", "error", validated.error);
    findings.push(
      finding({
        id: "url-invalid",
        category: "availability",
        severity: "critical",
        title: "URL elutasítva",
        detail: validated.error,
        recommendation: "Adj meg publikus http(s) URL-t (localhost / privát IP tiltott).",
        source: "http",
      })
    );
    record.status = "failed";
    record.error = validated.error;
    record = finalize(record, findings, progress);
    record.overallScore = 0;
    record.summary = validated.error;
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
          beta: true,
        };
      }
    }
  }

  try {
    setStep(progress, "fetch", "running");
    record = saveAudit({
      ...record,
      progress,
      updatedAt: new Date().toISOString(),
    });

    const fetched = await followRedirects(validated.normalized);
    record.technical.finalUrl = fetched.finalUrl;
    record.technical.statusCode = fetched.status;
    record.technical.responseMs = fetched.ms;
    record.technical.redirectChain = fetched.chain;
    record.technical.headers = fetched.headers;
    record.technical.responseBytes = fetched.buffer.length;
    record.technical.contentType = fetched.headers["content-type"] || null;

    findings.push(
      ...checkAvailability({
        status: fetched.status,
        ms: fetched.ms,
        chain: fetched.chain,
        truncated: fetched.truncated,
        error: fetched.error,
        maxRedirects: MAX_REDIRECTS,
        maxBodyBytes: MAX_BODY_BYTES,
      })
    );

    if (fetched.status === 0) {
      setStep(progress, "fetch", "error", fetched.error || "fetch failed");
    } else {
      setStep(
        progress,
        "fetch",
        "done",
        `HTTP ${fetched.status} · ${fetched.ms} ms`
      );
    }

    const finalUrl = new URL(fetched.finalUrl || validated.normalized);

    // TLS
    if (finalUrl.protocol === "https:") {
      setStep(progress, "tls", "running");
      const tlsInfo = await checkTls(finalUrl.hostname);
      record.technical.tls = tlsInfo;
      setStep(
        progress,
        "tls",
        tlsInfo.ok ? "done" : "error",
        tlsInfo.ok ? tlsInfo.protocol || "OK" : tlsInfo.error || "hiba"
      );
    } else {
      setStep(progress, "tls", "done", "Nem HTTPS");
    }

    // Parallel: robots + sitemap (independent, SSRF-checked)
    setStep(progress, "robots", "running");
    const origin = `${finalUrl.protocol}//${finalUrl.host}`;
    const robotsUrl = `${origin}/robots.txt`;
    const sitemapUrl = `${origin}/sitemap.xml`;
    record.technical.robotsTxtUrl = robotsUrl;
    record.technical.sitemapUrl = sitemapUrl;

    const [robotsRes, sitemapRes] = await Promise.all([
      fetchTextResource(robotsUrl),
      fetchTextResource(sitemapUrl),
    ]);

    record.technical.robotsTxtOk = robotsRes.ok;
    record.technical.robotsTxtStatus = robotsRes.status;
    const sitemapClass = classifySitemap(sitemapRes.body, sitemapRes.ok);
    record.technical.sitemapOk = sitemapClass.ok;
    record.technical.sitemapStatus = sitemapRes.status;
    record.technical.sitemapKind = sitemapClass.kind;
    setStep(
      progress,
      "robots",
      "done",
      `robots ${robotsRes.status} · sitemap ${sitemapRes.status}`
    );

    // HTML parse
    setStep(progress, "headers", "running");
    setStep(progress, "html", "running");
    const ctype = (record.technical.contentType || "").toLowerCase();
    const looksHtml =
      ctype.includes("text/html") ||
      ctype.includes("application/xhtml") ||
      fetched.buffer.slice(0, 200).toString("utf8").includes("<html");
    const html = looksHtml ? fetched.buffer.toString("utf8") : "";
    const pageIsHttps = finalUrl.protocol === "https:";
    const doc = html
      ? parseHtmlDocument(html, { pageIsHttps })
      : null;

    if (doc) {
      record.technical.title = doc.title;
      record.technical.metaDescription = doc.metaDescription;
      record.technical.canonical = doc.canonical;
      record.technical.h1Count = doc.h1Texts.length;
      record.technical.h1Texts = doc.h1Texts.slice(0, 5);
      record.technical.htmlLang = doc.htmlLang;
    } else if (fetched.status > 0) {
      findings.push(
        finding({
          id: "not-html",
          category: "content",
          severity: "medium",
          title: "Nem HTML tartalom",
          detail: ctype || "Ismeretlen Content-Type — SEO/tartalom jelek nem értékelhetők.",
          source: "http",
        })
      );
    }

    const robotsBlocks = robotsTxtLikelyBlocks(
      robotsRes.body,
      finalUrl.pathname || "/"
    );
    const indexability = buildIndexability({
      metaRobots: doc?.metaRobots || null,
      xRobotsTag: fetched.headers["x-robots-tag"] || null,
      robotsTxtBlocksPath: robotsBlocks,
    });
    record.technical.indexability = indexability;

    findings.push(
      ...checkSecurity({
        startProtocol: validated.url.protocol,
        finalProtocol: finalUrl.protocol,
        chain: fetched.chain,
        headers: fetched.headers,
        tls: record.technical.tls,
        mixedContentUrls: doc?.mixedContentUrls || [],
      })
    );
    setStep(progress, "headers", "done");

    findings.push(
      ...checkSeo({
        doc,
        pageUrl: fetched.finalUrl || validated.normalized,
        xRobotsTag: fetched.headers["x-robots-tag"] || null,
        robotsTxtBlocksPath: robotsBlocks,
        sitemap: {
          ok: sitemapClass.ok,
          status: sitemapRes.status,
          kind: sitemapClass.kind,
          error: sitemapClass.error,
        },
        indexability,
      })
    );
    findings.push(...checkContent(doc));
    setStep(progress, "html", "done");

    setStep(progress, "a11y", "running");
    // a11y first pass without lighthouse; enrich after PSI
    findings.push(
      ...checkAccessibility({
        doc,
        lighthouseA11yScore: null,
      })
    );
    setStep(progress, "a11y", "done");

    findings.push(
      ...checkBestPractices({
        doc,
        finalProtocol: finalUrl.protocol,
        robots: {
          ok: robotsRes.ok,
          status: robotsRes.status,
          body: robotsRes.body,
        },
        mixedContentUrls: doc?.mixedContentUrls || [],
      })
    );

    // PageSpeed
    setStep(progress, "pagespeed", "running");
    const ps = await fetchPagespeed(fetched.finalUrl || validated.normalized);
    if (ps.ok && ps.performanceScore != null) {
      record.technical.pagespeed = {
        attempted: true,
        ok: true,
        performanceScore: ps.performanceScore,
        error: null,
        source: "pagespeed_api",
        metrics: ps.metrics,
      };
      setStep(
        progress,
        "pagespeed",
        "done",
        `${ps.performanceScore}/100 (PageSpeed / Lighthouse)`
      );
      findings.push(
        ...checkPerformance({
          responseMs: fetched.ms,
          responseBytes: fetched.buffer.byteLength,
          headers: fetched.headers,
          pagespeedScore: ps.performanceScore,
          pagespeedSource: "pagespeed_api",
          pagespeedError: null,
          metrics: ps.metrics,
        })
      );
      // Replace a11y lighthouse N/A with real score
      if (ps.metrics?.accessibilityScore != null) {
        const idx = findings.findIndex((f) => f.id === "a11y-lighthouse-na");
        if (idx >= 0) findings.splice(idx, 1);
        const score = ps.metrics.accessibilityScore;
        findings.push(
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
      }
    } else {
      const local = estimateLocalPerformance({
        responseMs: fetched.ms,
        responseBytes: fetched.buffer.byteLength,
        headers: fetched.headers,
        html: html || null,
        contentType: fetched.headers["content-type"] || null,
      });
      const apiNote = ps.error
        ? ps.quotaExceeded
          ? `kvóta / rate limit: ${ps.error}`
          : ps.timedOut
            ? "PageSpeed időtúllépés"
            : ps.error.length > 160
              ? `${ps.error.slice(0, 160)}…`
              : ps.error
        : "API hiba";
      record.technical.pagespeed = {
        attempted: true,
        ok: true,
        performanceScore: local.score,
        error: `Google PSI nem elérhető (${apiNote}). Helyi becslés használva.`,
        source: "local_estimate",
        metrics: null,
      };
      setStep(
        progress,
        "pagespeed",
        "done",
        `${local.score}/100 (helyi becslés)`
      );
      findings.push(
        ...checkPerformance({
          responseMs: fetched.ms,
          responseBytes: fetched.buffer.byteLength,
          headers: fetched.headers,
          pagespeedScore: local.score,
          pagespeedSource: "local_estimate",
          pagespeedError: apiNote,
          metrics: null,
          localDetail: local.detail,
        })
      );
    }

    setStep(progress, "score", "running");
    record.status = "completed";
    record.error = null;
    record = finalize(record, findings, progress);
    setStep(progress, "score", "done", `${record.overallScore}/100`);
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
    findings.push(
      finding({
        id: "runtime-error",
        category: "availability",
        severity: "critical",
        title: "Az ellenőrzés megszakadt",
        detail: message,
        source: "http",
      })
    );
    record.status = "failed";
    record.error = message;
    record = finalize(record, findings, progress);
    record.overallScore = 0;
    record.summary = message;
    for (const step of progress) {
      if (step.status === "running" || step.status === "pending") {
        step.status = "error";
        if (!step.detail) step.detail = "Nem futott le teljesen.";
      }
    }
    return saveAudit(record);
  }
}
