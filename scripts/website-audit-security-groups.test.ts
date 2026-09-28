import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  partitionSecurityFindings,
  securityGroupFor,
} from "../lib/website-audit/security-groups";
import type { AuditFinding } from "../lib/website-audit/types";

function stub(
  partial: Partial<AuditFinding> & Pick<AuditFinding, "id">
): AuditFinding {
  return {
    category: "security",
    severity: "medium",
    status: "fail",
    title: partial.id,
    detail: "",
    ...partial,
  };
}

describe("security exposure groups", () => {
  it("classifies breach-risk check ids on fail", () => {
    assert.equal(
      securityGroupFor(stub({ id: "http-only", severity: "critical" })),
      "breach_risk"
    );
    assert.equal(
      securityGroupFor(stub({ id: "tls-fail", severity: "critical" })),
      "breach_risk"
    );
    assert.equal(
      securityGroupFor(stub({ id: "mixed-content", severity: "high" })),
      "breach_risk"
    );
    assert.equal(
      securityGroupFor(stub({ id: "cookie-secure", severity: "medium" })),
      "breach_risk"
    );
    assert.equal(
      securityGroupFor(stub({ id: "cookie-httponly", severity: "medium" })),
      "breach_risk"
    );
  });

  it("puts passes and hardening checks into hardening", () => {
    assert.equal(
      securityGroupFor(
        stub({ id: "http-only", severity: "pass", status: "pass" })
      ),
      "hardening"
    );
    assert.equal(
      securityGroupFor(stub({ id: "hdr-csp", severity: "medium" })),
      "hardening"
    );
    assert.equal(
      securityGroupFor(stub({ id: "hdr-x-powered-by", severity: "low" })),
      "hardening"
    );
    assert.equal(
      securityGroupFor(
        stub({
          id: "security-disclaimer",
          severity: "info",
          status: "not_applicable",
        })
      ),
      "hardening"
    );
  });

  it("partitions findings into two buckets", () => {
    const { breachRisk, hardening } = partitionSecurityFindings([
      stub({ id: "tls-fail", severity: "critical" }),
      stub({ id: "hdr-csp", severity: "medium" }),
      stub({ id: "mixed-content-ok", severity: "pass", status: "pass" }),
    ]);
    assert.equal(breachRisk.length, 1);
    assert.equal(breachRisk[0]?.id, "tls-fail");
    assert.equal(hardening.length, 2);
  });

  it("respects explicit securityGroup override", () => {
    assert.equal(
      securityGroupFor(
        stub({
          id: "hdr-csp",
          severity: "medium",
          securityGroup: "breach_risk",
        })
      ),
      "breach_risk"
    );
  });
});
