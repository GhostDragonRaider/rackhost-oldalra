import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeCategoryScores,
  computeOverallScore,
  countSeverities,
  prioritizeFixes,
  summarizeFindings,
} from "../lib/website-audit/score";
import { CATEGORY_WEIGHTS, SEVERITY_PENALTIES } from "../lib/website-audit/scoring-config";
import type { AuditFinding } from "../lib/website-audit/types";
import {
  checkAuditRateLimit,
  getCachedAuditId,
  setCachedAuditId,
} from "../lib/website-audit/rate-limit";

describe("website-audit score", () => {
  it("starts at 100 with only pass findings", () => {
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
    assert.equal(cats.find((c) => c.id === "accessibility")?.score, 100);
    assert.equal(computeOverallScore(cats), 100);
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

  it("does not penalize not_available findings", () => {
    const findings: AuditFinding[] = [
      {
        id: "na",
        category: "performance",
        severity: "info",
        status: "not_available",
        title: "na",
        detail: "na",
      },
    ];
    const cats = computeCategoryScores(findings);
    assert.equal(cats.find((c) => c.id === "performance")?.score, 100);
  });

  it("weights include accessibility", () => {
    assert.ok(CATEGORY_WEIGHTS.accessibility > 0);
    assert.equal(
      Object.values(CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0),
      100
    );
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

  it("counts severities", () => {
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
    ];
    const c = countSeverities(findings);
    assert.equal(c.pass, 1);
    assert.equal(c.critical, 1);
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
