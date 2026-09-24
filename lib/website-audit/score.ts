import type {
  AuditCategoryId,
  AuditCategoryScore,
  AuditFinding,
  AuditSeverity,
} from "./types";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "./types";
import {
  CATEGORY_IMPACT_RANK,
  CATEGORY_WEIGHTS,
  SEVERITY_PENALTIES,
  SEVERITY_RANK,
  categoryStatusFromScore,
  scoreBandLabel,
} from "./scoring-config";

export { scoreBandLabel };

function penaltyFor(finding: AuditFinding): number {
  if (finding.status === "not_available" || finding.status === "not_applicable") {
    return 0;
  }
  if (finding.severity === "pass") return 0;
  if (typeof finding.scoreImpact === "number" && Number.isFinite(finding.scoreImpact)) {
    return Math.max(0, finding.scoreImpact);
  }
  return SEVERITY_PENALTIES[finding.severity] ?? 0;
}

export function computeCategoryScores(
  findings: AuditFinding[]
): AuditCategoryScore[] {
  return CATEGORY_ORDER.map((id) => {
    const related = findings.filter((f) => f.category === id);
    let score = 100;
    for (const f of related) {
      score -= penaltyFor(f);
    }
    score = Math.max(0, Math.min(100, Math.round(score)));
    return {
      id,
      label: CATEGORY_LABELS[id],
      score,
      maxScore: 100,
      findingCount: related.filter(
        (f) =>
          f.severity !== "pass" &&
          f.status !== "not_available" &&
          f.status !== "not_applicable"
      ).length,
      status: categoryStatusFromScore(score),
    };
  });
}

export function computeOverallScore(categories: AuditCategoryScore[]): number {
  let totalWeight = 0;
  let weighted = 0;
  for (const cat of categories) {
    const w = CATEGORY_WEIGHTS[cat.id as AuditCategoryId] || 0;
    totalWeight += w;
    weighted += cat.score * w;
  }
  if (totalWeight === 0) return 0;
  return Math.round(weighted / totalWeight);
}

export function countSeverities(
  findings: AuditFinding[]
): Record<AuditSeverity, number> {
  const counts: Record<AuditSeverity, number> = {
    pass: 0,
    info: 0,
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };
  for (const f of findings) {
    if (f.status === "not_available" || f.status === "not_applicable") continue;
    counts[f.severity] = (counts[f.severity] || 0) + 1;
  }
  return counts;
}

/** Rank problems for "Mit javítsak először?" — excludes pass / N/A. */
export function prioritizeFixes(findings: AuditFinding[]): AuditFinding[] {
  return findings
    .filter(
      (f) =>
        f.severity !== "pass" &&
        f.status !== "not_available" &&
        f.status !== "not_applicable"
    )
    .slice()
    .sort((a, b) => {
      const sev = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
      if (sev !== 0) return sev;
      const cat =
        CATEGORY_IMPACT_RANK[a.category] - CATEGORY_IMPACT_RANK[b.category];
      if (cat !== 0) return cat;
      const impactA = penaltyFor(a);
      const impactB = penaltyFor(b);
      return impactB - impactA;
    });
}

export function summarizeFindings(
  overall: number,
  findings: AuditFinding[]
): string {
  const counts = countSeverities(findings);
  const label = scoreBandLabel(overall);
  if (
    counts.critical === 0 &&
    counts.high === 0 &&
    counts.medium === 0 &&
    counts.low === 0
  ) {
    return `${label} eredmény (${overall}/100) — nincs javítandó probléma.`;
  }
  const parts: string[] = [];
  if (counts.critical) parts.push(`${counts.critical} kritikus`);
  if (counts.high) parts.push(`${counts.high} magas`);
  if (counts.medium) parts.push(`${counts.medium} közepes`);
  if (counts.low) parts.push(`${counts.low} alacsony`);
  return `Pontszám: ${overall}/100 (${label}) · ${parts.join(" · ")}.`;
}
