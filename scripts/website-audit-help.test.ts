import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CATEGORY_HELP,
  FINDING_HELP,
  OVERALL_SCORE_HELP,
  SEVERITY_HELP,
  findingHelpText,
} from "../lib/website-audit/help-texts";

describe("audit help texts", () => {
  it("has layperson overall and category help", () => {
    assert.ok(OVERALL_SCORE_HELP.length > 40);
    assert.ok(CATEGORY_HELP.accessibility.includes("Akadálymentesség"));
    assert.ok(SEVERITY_HELP.critical.toLowerCase().includes("kritikus") || SEVERITY_HELP.critical.includes("súlyos"));
  });

  it("resolves known finding ids", () => {
    assert.ok(findingHelpText("hdr-csp")?.includes("Content-Security-Policy"));
    assert.ok(findingHelpText("indexability-noindex")?.includes("noindex"));
    assert.equal(findingHelpText("totally-unknown-check"), null);
  });

  it("covers core finding families", () => {
    for (const id of [
      "title-ok",
      "pagespeed-local",
      "a11y-lang-missing",
      "tls-ok",
      "sitemap-missing",
    ]) {
      assert.ok(FINDING_HELP[id], `missing help for ${id}`);
    }
  });
});
