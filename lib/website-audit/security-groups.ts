import type { AuditFinding } from "./types";

/**
 * Security exposure subgroups for the Website Audit UI.
 *
 * breach_risk — passive signals that can enable real compromise
 *   (no encryption, broken TLS, mixed content, stealable cookies).
 * hardening — missing headers, info disclosure, best practices, passes.
 *
 * This is still a non-intrusive external check, not a penetration test.
 */
export type SecurityExposureGroup = "breach_risk" | "hardening";

/** Check IDs whose FAIL state indicates concrete attack-enabling exposure. */
export const BREACH_RISK_CHECK_IDS = new Set([
  "http-only",
  "tls-fail",
  "tls-no-https",
  "mixed-content",
  "cookie-secure",
  "cookie-httponly",
]);

export const SECURITY_GROUP_META: Record<
  SecurityExposureGroup,
  { title: string; blurb: string }
> = {
  breach_risk: {
    title: "Aktív kockázat — feltörhetővé teheti az oldalt",
    blurb:
      "Olyan, kívülről látható hiányosságok, amelyek közvetlenül lehetővé tehetik a forgalom lehallgatását, a munkamenet ellopását vagy a tartalom meghamisítását. Ez nem penetrációs teszt — de ezek a jelek valós támadási utat jeleznek.",
  },
  hardening: {
    title: "Egyéb biztonsági jelek (hardening)",
    blurb:
      "Hiányzó védőfejlécek, technológia-kiszivárgás és egyéb erősítési javaslatok. Ezek önmagukban ritkán jelentik, hogy az oldal azonnal feltörhető — de érdemes javítani őket.",
  },
};

export function securityGroupFor(
  finding: Pick<AuditFinding, "id" | "severity" | "status" | "securityGroup">
): SecurityExposureGroup {
  if (finding.securityGroup === "breach_risk" || finding.securityGroup === "hardening") {
    return finding.securityGroup;
  }
  // Passes / N/A belong with "the rest"
  if (
    finding.severity === "pass" ||
    finding.status === "not_applicable" ||
    finding.status === "not_available" ||
    finding.status === "unknown"
  ) {
    return "hardening";
  }
  return BREACH_RISK_CHECK_IDS.has(finding.id) ? "breach_risk" : "hardening";
}

export function partitionSecurityFindings(findings: AuditFinding[]): {
  breachRisk: AuditFinding[];
  hardening: AuditFinding[];
} {
  const breachRisk: AuditFinding[] = [];
  const hardening: AuditFinding[] = [];
  for (const f of findings) {
    if (securityGroupFor(f) === "breach_risk") breachRisk.push(f);
    else hardening.push(f);
  }
  return { breachRisk, hardening };
}
