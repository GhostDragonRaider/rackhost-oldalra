import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  analyzeHtmlSeo,
  parseHtmlDocument,
  extractJsonLd,
  detectMixedContent,
} from "../lib/website-audit/html";
import {
  analyzeCanonical,
  buildIndexability,
  checkSeo,
  robotsTxtLikelyBlocks,
} from "../lib/website-audit/checks/seo";
import { checkContent } from "../lib/website-audit/checks/content";
import { checkAccessibility } from "../lib/website-audit/checks/accessibility";
import { checkSecurity } from "../lib/website-audit/checks/security";
import { checkAvailability } from "../lib/website-audit/checks/availability";
import { checkBestPractices } from "../lib/website-audit/checks/best-practices";
import { estimateLocalPerformance } from "../lib/website-audit/checks/performance";

describe("analyzeHtmlSeo (legacy)", () => {
  it("flags missing title, description, H1, canonical", () => {
    const r = analyzeHtmlSeo("<html><body><p>x</p></body></html>");
    const ids = r.findings.map((f) => f.id);
    assert.ok(ids.includes("title-missing"));
    assert.ok(ids.includes("desc-missing"));
    assert.ok(ids.includes("h1-missing"));
    assert.ok(ids.includes("canonical-missing"));
  });

  it("flags multiple H1", () => {
    const r = analyzeHtmlSeo(
      '<html><head><title>Long enough title here</title><meta name="description" content="A meta description that is long enough for the warning threshold maybe" /><link rel="canonical" href="https://example.com/" /></head><body><h1>One</h1><h1>Two</h1></body></html>'
    );
    assert.equal(r.h1Texts.length, 2);
    assert.ok(r.findings.some((f) => f.id === "h1-multiple"));
  });

  it("passes complete SEO basics", () => {
    const r = analyzeHtmlSeo(
      '<html><head><title>Complete Example Title</title><meta name="description" content="A solid meta description for the page that should pass." /><link rel="canonical" href="https://example.com/page" /></head><body><h1>Hello</h1></body></html>'
    );
    const ids = r.findings.map((f) => f.id);
    assert.ok(ids.includes("title-ok"));
    assert.ok(ids.includes("canonical-ok"));
  });
});

describe("parseHtmlDocument", () => {
  it("detects noindex, social, lang, images without alt, unlabeled inputs", () => {
    const html = `<!doctype html><html lang="hu"><head>
      <meta name="robots" content="noindex, nofollow" />
      <meta property="og:title" content="T" />
      <title>Title long enough</title>
      <meta name="description" content="Description that is long enough to pass the minimum threshold for SEO checks." />
      </head><body>
      <h1>Főcím</h1>
      <img src="/a.jpg" />
      <img src="/b.jpg" alt="" />
      <form><input type="text" name="email" /></form>
      <a href="javascript:void(0)">x</a>
      <p>${"szó ".repeat(80)}</p>
      </body></html>`;
    const doc = parseHtmlDocument(html, { pageIsHttps: true });
    assert.equal(doc.htmlLang, "hu");
    assert.ok(doc.metaRobots?.includes("noindex"));
    assert.equal(doc.social.ogTitle, "T");
    assert.equal(doc.images.filter((i) => !i.hasAltAttr).length, 1);
    assert.equal(doc.images.filter((i) => i.emptyAlt).length, 1);
    assert.ok(doc.inputs.length >= 1);
  });

  it("detects mixed content on HTTPS pages", () => {
    const urls = detectMixedContent(
      '<img src="http://evil.example/x.png" /><script src="http://cdn.example/a.js"></script>',
      true
    );
    assert.ok(urls.length >= 2);
    assert.deepEqual(detectMixedContent('<img src="https://ok/x.png" />', true), []);
  });

  it("parses JSON-LD types and invalid JSON", () => {
    const ok = extractJsonLd(
      `<script type="application/ld+json">{"@type":"Organization","name":"X"}</script>`
    );
    assert.equal(ok[0].parseOk, true);
    assert.ok(ok[0].types.includes("Organization"));
    const bad = extractJsonLd(
      `<script type="application/ld+json">{bad</script>`
    );
    assert.equal(bad[0].parseOk, false);
  });

  it("detects heading skip", () => {
    const doc = parseHtmlDocument(
      "<html><body><h1>A</h1><h3>B</h3></body></html>"
    );
    const findings = checkContent(doc);
    assert.ok(findings.some((f) => f.id === "heading-skip"));
  });
});

describe("canonical + indexability", () => {
  it("flags missing canonical", () => {
    const f = analyzeCanonical(null, "https://example.com/");
    assert.equal(f.id, "canonical-missing");
  });

  it("flags external domain canonical", () => {
    const f = analyzeCanonical(
      "https://other.com/page",
      "https://example.com/page"
    );
    assert.equal(f.severity, "high");
  });

  it("flags http canonical on https page", () => {
    const f = analyzeCanonical(
      "http://example.com/page",
      "https://example.com/page"
    );
    assert.equal(f.severity, "high");
  });

  it("accepts self canonical", () => {
    const f = analyzeCanonical(
      "https://example.com/page",
      "https://example.com/page"
    );
    assert.equal(f.severity, "pass");
  });

  it("builds noindex indexability as blocked", () => {
    const idx = buildIndexability({
      metaRobots: "noindex",
      xRobotsTag: null,
      robotsTxtBlocksPath: false,
    });
    assert.equal(idx.status, "blocked");
    assert.ok(idx.summary.includes("KRITIKUS"));
  });

  it("builds ok indexability when clear", () => {
    const idx = buildIndexability({
      metaRobots: "index,follow",
      xRobotsTag: null,
      robotsTxtBlocksPath: false,
    });
    assert.equal(idx.status, "ok");
  });

  it("detects robots.txt path block", () => {
    const txt = "User-agent: *\nDisallow: /private\n";
    assert.equal(robotsTxtLikelyBlocks(txt, "/private/x"), true);
    assert.equal(robotsTxtLikelyBlocks(txt, "/public"), false);
  });
});

describe("availability checks", () => {
  it("marks 500 critical and 404 critical", () => {
    const a = checkAvailability({
      status: 500,
      ms: 10,
      chain: ["https://x"],
      truncated: false,
      maxRedirects: 8,
      maxBodyBytes: 1000,
    });
    assert.ok(a.some((f) => f.id === "status-5xx" && f.severity === "critical"));
    const b = checkAvailability({
      status: 404,
      ms: 10,
      chain: ["https://x"],
      truncated: false,
      maxRedirects: 8,
      maxBodyBytes: 1000,
    });
    assert.ok(b.some((f) => f.id === "status-404"));
  });

  it("passes 200", () => {
    const a = checkAvailability({
      status: 200,
      ms: 120,
      chain: ["https://x"],
      truncated: false,
      maxRedirects: 8,
      maxBodyBytes: 1000,
    });
    assert.ok(a.some((f) => f.id === "status-ok"));
  });
});

describe("security checks", () => {
  it("flags missing CSP professionally and X-Powered-By", () => {
    const findings = checkSecurity({
      startProtocol: "https:",
      finalProtocol: "https:",
      chain: ["https://example.com/"],
      headers: { "x-powered-by": "Express" },
      tls: { ok: true, protocol: "TLSv1.3", authorized: true, error: null },
      mixedContentUrls: [],
    });
    const csp = findings.find((f) => f.id === "hdr-csp");
    assert.ok(csp);
    assert.equal(csp?.severity, "medium");
    assert.ok(csp?.detail.includes("Content-Security-Policy"));
    assert.ok(csp?.detail.includes("nem jelenti"));
    assert.ok(findings.some((f) => f.id === "hdr-x-powered-by"));
  });

  it("flags mixed content as high", () => {
    const findings = checkSecurity({
      startProtocol: "https:",
      finalProtocol: "https:",
      chain: ["https://example.com/"],
      headers: {},
      tls: { ok: true, protocol: "TLSv1.3", authorized: true, error: null },
      mixedContentUrls: ["http://x/a.js"],
    });
    assert.ok(findings.some((f) => f.id === "mixed-content" && f.severity === "high"));
  });
});

describe("accessibility checks", () => {
  it("flags missing lang and unlabeled input", () => {
    const doc = parseHtmlDocument(
      "<html><body><form><input id=\"e\" name=\"email\" /></form></body></html>"
    );
    const findings = checkAccessibility({ doc, lighthouseA11yScore: null });
    assert.ok(findings.some((f) => f.id === "a11y-lang-missing"));
    assert.ok(findings.some((f) => f.id === "a11y-inputs-label"));
    assert.ok(findings.some((f) => f.id === "a11y-disclaimer"));
  });

  it("accepts labeled input", () => {
    const doc = parseHtmlDocument(
      '<html lang="en"><body><label for="e">Email</label><input id="e" name="email" /></body></html>'
    );
    const findings = checkAccessibility({ doc, lighthouseA11yScore: 95 });
    assert.ok(findings.some((f) => f.id === "a11y-inputs-ok"));
    assert.ok(findings.some((f) => f.id === "a11y-lighthouse"));
  });
});

describe("seo suite", () => {
  it("emits noindex finding as critical", () => {
    const html =
      '<html lang="hu"><head><title>Teszt oldal címe elég hosszú</title><meta name="description" content="Ez egy elég hosszú meta description a teszthez, hogy átmenjen." /><meta name="robots" content="noindex" /></head><body><h1>H1</h1></body></html>';
    const doc = parseHtmlDocument(html);
    const idx = buildIndexability({
      metaRobots: doc.metaRobots,
      xRobotsTag: null,
      robotsTxtBlocksPath: false,
    });
    const findings = checkSeo({
      doc,
      pageUrl: "https://example.com/",
      xRobotsTag: null,
      robotsTxtBlocksPath: false,
      sitemap: { ok: false, status: 404, kind: null },
      indexability: idx,
    });
    assert.ok(findings.some((f) => f.id === "indexability-noindex"));
  });

  it("flags invalid sitemap kind", () => {
    const findings = checkSeo({
      doc: parseHtmlDocument(
        '<html lang="hu"><head><title>Teszt oldal címe elég hosszú</title><meta name="description" content="Ez egy elég hosszú meta description a teszthez, hogy átmenjen." /></head><body><h1>H1</h1></body></html>'
      ),
      pageUrl: "https://example.com/",
      xRobotsTag: null,
      robotsTxtBlocksPath: false,
      sitemap: {
        ok: false,
        status: 200,
        kind: "invalid",
        error: "nem XML",
      },
      indexability: buildIndexability({
        metaRobots: null,
        xRobotsTag: null,
        robotsTxtBlocksPath: false,
      }),
    });
    assert.ok(findings.some((f) => f.id === "sitemap-invalid"));
  });
});

describe("best practices + local perf", () => {
  it("flags robots block-all", () => {
    const findings = checkBestPractices({
      doc: parseHtmlDocument(
        '<html lang="hu"><head><title>T</title><meta name="viewport" content="width=device-width" /><link rel="icon" href="/f.ico" /></head><body><h1>x</h1></body></html>'
      ),
      finalProtocol: "https:",
      robots: {
        ok: true,
        status: 200,
        body: "User-agent: *\nDisallow: /\n",
      },
      mixedContentUrls: [],
    });
    assert.ok(findings.some((f) => f.id === "robots-block-all"));
  });

  it("estimates local performance without claiming lighthouse", () => {
    const r = estimateLocalPerformance({
      responseMs: 100,
      responseBytes: 10_000,
      headers: { "content-encoding": "br", "cache-control": "max-age=60" },
      html: "<html></html>",
      contentType: "text/html",
    });
    assert.ok(r.score >= 80);
    assert.ok(r.detail.includes("TTFB") || r.detail.includes("gyors"));
  });
});
