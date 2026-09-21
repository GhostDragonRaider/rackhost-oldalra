import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeCategoryScores,
  computeOverallScore,
  summarizeFindings,
} from "../lib/website-audit/score";
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
        title: "ok",
        detail: "ok",
      },
    ];
    const cats = computeCategoryScores(findings);
    assert.equal(cats.find((c) => c.id === "seo")?.score, 100);
    assert.equal(computeOverallScore(cats), 100);
  });

  it("applies critical and warning penalties", () => {
    const findings: AuditFinding[] = [
      {
        id: "c",
        category: "security",
        severity: "critical",
        title: "c",
        detail: "c",
      },
      {
        id: "w",
        category: "security",
        severity: "warning",
        title: "w",
        detail: "w",
      },
    ];
    const cats = computeCategoryScores(findings);
    const sec = cats.find((c) => c.id === "security");
    assert.equal(sec?.score, 50); // 100 - 35 - 15
    const summary = summarizeFindings(computeOverallScore(cats), findings);
    assert.match(summary, /1 kritikus/);
    assert.match(summary, /1 figyelmeztetés/);
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
