import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeHtmlSeo } from "../lib/website-audit/html";

describe("analyzeHtmlSeo", () => {
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
      "<html><head><title>Long enough title here</title><meta name=\"description\" content=\"A meta description that is long enough for the warning threshold maybe\" /><link rel=\"canonical\" href=\"https://example.com/\" /></head><body><h1>One</h1><h1>Two</h1></body></html>"
    );
    assert.equal(r.h1Texts.length, 2);
    assert.ok(r.findings.some((f) => f.id === "h1-multiple"));
    assert.ok(r.findings.some((f) => f.id === "title-ok"));
    assert.ok(r.findings.some((f) => f.id === "canonical-ok"));
  });

  it("passes complete SEO basics", () => {
    const r = analyzeHtmlSeo(
      "<html><head><title>Complete Example Title</title><meta name=\"description\" content=\"A solid meta description for the page that should pass.\" /><link rel=\"canonical\" href=\"https://example.com/page\" /></head><body><h1>Hello</h1></body></html>"
    );
    const ids = r.findings.map((f) => f.id);
    assert.deepEqual(
      ids.filter((id) => id.endsWith("-ok") || id.endsWith("-missing") || id.endsWith("-multiple")),
      ["title-ok", "desc-ok", "h1-ok", "canonical-ok"]
    );
  });
});
