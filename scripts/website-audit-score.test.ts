import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeCategoryScores,
  computeOverallScore,
  countSeverities,
  countCheckOutcomes,
  prioritizeFixes,
  summarizeFindings,
} from "../lib/website-audit/score";
import {
  CATEGORY_WEIGHTS,
  PUBLIC_CATEGORY_WEIGHTS,
  SEVERITY_PENALTIES,
} from "../lib/website-audit/scoring-config";
import type { AuditFinding } from "../lib/website-audit/types";
import {
  checkAuditRateLimit,
  getCachedAuditId,
  setCachedAuditId,
} from "../lib/website-audit/rate-limit";
import {
  buildResponsiveMatrix,
  checkResponsive,
  RESPONSIVE_VIEWPORTS,
} from "../lib/website-audit/responsive-engine";

describe("website-audit score", () => {
  it("starts at 100 for categories that have measurable pass findings", () => {
    const findings: AuditFinding[] = [
      {
        id: "1",
        category: "seo",
        severity: "pass",
        status: "pass",
        title: "ok",
        detail: "ok",
      },
    ];
    const cats = computeCategoryScores(findings);
    assert.equal(cats.find((c) => c.id === "seo")?.score, 100);
    assert.equal(cats.find((c) => c.id === "seo")?.measurable, true);
    // Empty categories are UNAVAILABLE — never auto-100
    assert.equal(cats.find((c) => c.id === "accessibility")?.score, null);
    assert.equal(cats.find((c) => c.id === "accessibility")?.measurable, false);
    // Overall uses only measurable public categories
    assert.equal(computeOverallScore(cats), 100);
  });

  it("UNAVAILABLE findings never count as PASS and do not invent 100", () => {
    const findings: AuditFinding[] = [
      {
        id: "na",
        category: "performance",
        severity: "info",
        status: "not_available",
        title: "na",
        detail: "na",
      },
      {
        id: "unk",
        category: "responsive",
        severity: "info",
        status: "unknown",
        title: "unk",
        detail: "unk",
      },
    ];
    const cats = computeCategoryScores(findings);
    assert.equal(cats.find((c) => c.id === "performance")?.score, null);
    assert.equal(cats.find((c) => c.id === "responsive")?.score, null);
    const outcomes = countCheckOutcomes(findings);
    assert.equal(outcomes.unavailable, 2);
    assert.equal(outcomes.pass, 0);
    assert.equal(computeOverallScore(cats), null);
  });

  it("applies critical and medium penalties from central config", () => {
    const findings: AuditFinding[] = [
      {
        id: "c",
        category: "security",
        severity: "critical",
        status: "fail",
        title: "c",
        detail: "c",
      },
      {
        id: "w",
        category: "security",
        severity: "medium",
        status: "fail",
        title: "w",
        detail: "w",
      },
    ];
    const cats = computeCategoryScores(findings);
    const sec = cats.find((c) => c.id === "security");
    assert.equal(
      sec?.score,
      100 - SEVERITY_PENALTIES.critical - SEVERITY_PENALTIES.medium
    );
    const summary = summarizeFindings(computeOverallScore(cats), findings);
    assert.match(summary, /1 kritikus/);
    assert.match(summary, /1 közepes/);
  });

  it("weights sum to 100 and public weights are positive", () => {
    assert.equal(
      Object.values(CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0),
      100
    );
    assert.equal(
      Object.values(PUBLIC_CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0),
      100
    );
    assert.ok(CATEGORY_WEIGHTS.responsive > 0);
  });

  it("prioritizes critical before high", () => {
    const findings: AuditFinding[] = [
      {
        id: "h",
        category: "seo",
        severity: "high",
        status: "fail",
        title: "high",
        detail: "h",
      },
      {
        id: "c",
        category: "availability",
        severity: "critical",
        status: "fail",
        title: "crit",
        detail: "c",
      },
    ];
    const ranked = prioritizeFixes(findings);
    assert.equal(ranked[0].id, "c");
    assert.equal(ranked[1].id, "h");
  });

  it("counts severities skipping UNAVAILABLE", () => {
    const findings: AuditFinding[] = [
      {
        id: "1",
        category: "seo",
        severity: "pass",
        status: "pass",
        title: "a",
        detail: "a",
      },
      {
        id: "2",
        category: "seo",
        severity: "critical",
        status: "fail",
        title: "b",
        detail: "b",
      },
      {
        id: "3",
        category: "seo",
        severity: "info",
        status: "not_available",
        title: "c",
        detail: "c",
      },
    ];
    const c = countSeverities(findings);
    assert.equal(c.pass, 1);
    assert.equal(c.critical, 1);
    assert.equal(c.info, 0);
  });
});

describe("website-audit rate-limit + cache", () => {
  it("rate limits after N hits", () => {
    const key = `test-${Date.now()}-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      assert.equal(checkAuditRateLimit(key, 3, 60_000).ok, true);
    }
    const blocked = checkAuditRateLimit(key, 3, 60_000);
    assert.equal(blocked.ok, false);
    if (!blocked.ok) assert.ok(blocked.retryAfterSec >= 1);
  });

  it("caches audit ids for normalized URL", () => {
    const url = `https://cache-test.example/${Date.now()}`;
    assert.equal(getCachedAuditId(url), null);
    setCachedAuditId(url, "audit-abc");
    assert.equal(getCachedAuditId(url), "audit-abc");
  });
});

describe("responsive engine", () => {
  it("marks screenshot/layout browser checks as UNAVAILABLE never PASS", () => {
    const html =
      '<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><h1>Hi</h1></body></html>';
    const matrix = buildResponsiveMatrix({ html, pagePath: "/" });
    assert.equal(matrix.viewports.length, RESPONSIVE_VIEWPORTS.length);
    assert.equal(matrix.screenshotStatus, "unavailable");
    const findings = checkResponsive({ html, matrix });
    const shot = findings.find((f) => f.id === "resp-screenshot-na");
    assert.ok(shot);
    assert.equal(shot!.status, "not_available");
    assert.notEqual(shot!.status, "pass");
  });

  it("fails missing viewport across mobile cells", () => {
    const html = "<html><head></head><body><div style=\"width:1200px\">x</div></body></html>";
    const matrix = buildResponsiveMatrix({ html });
    const cell320 = matrix.pages[0].cells["320"];
    assert.equal(cell320.status, "fail");
    const findings = checkResponsive({ html, matrix });
    assert.ok(findings.some((f) => f.id === "resp-no-viewport" && f.status === "fail"));
  });
});
