import type {
  AuditCategoryId,
  AuditCategoryScore,
  AuditFinding,
  AuditSeverity,
} from "./types";
import { CATEGORY_LABELS, CATEGORY_ORDER, PUBLIC_CATEGORY_IDS } from "./types";
import {
  CATEGORY_IMPACT_RANK,
  CATEGORY_WEIGHTS,
  PUBLIC_CATEGORY_WEIGHTS,
  SCORING_EXPLANATION_HU,
  SEVERITY_PENALTIES,
  SEVERITY_RANK,
  categoryStatusFromScore,
  scoreBandLabel,
} from "./scoring-config";

export { scoreBandLabel, SCORING_EXPLANATION_HU };

function isNonMeasurable(finding: AuditFinding): boolean {
  return (
    finding.status === "not_available" ||
    finding.status === "not_applicable" ||
    finding.status === "unknown"
  );
}

function penaltyFor(finding: AuditFinding): number {
  if (isNonMeasurable(finding)) return 0;
  if (finding.severity === "pass") return 0;
  if (finding.status === "warning" && finding.severity === "info") {
    return SEVERITY_PENALTIES.info;
  }
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
    const measurableFindings = related.filter((f) => !isNonMeasurable(f));
    const measurable = measurableFindings.length > 0;

    if (!measurable) {
      return {
        id,
        label: CATEGORY_LABELS[id],
        score: null,
        maxScore: 100,
        findingCount: related.length,
        status: "unavailable" as const,
        measurable: false,
      };
    }

    let score = 100;
    for (const f of measurableFindings) {
      score -= penaltyFor(f);
    }
    score = Math.max(0, Math.min(100, Math.round(score)));
    return {
      id,
      label: CATEGORY_LABELS[id],
      score,
      maxScore: 100,
      findingCount: measurableFindings.filter((f) => f.severity !== "pass").length,
      status: categoryStatusFromScore(score, true),
      measurable: true,
    };
  });
}

export function computeOverallScore(
  categories: AuditCategoryScore[],
  opts?: { publicOnly?: boolean }
): number | null {
  const publicOnly = opts?.publicOnly !== false;
  const ids = publicOnly ? PUBLIC_CATEGORY_IDS : CATEGORY_ORDER;
  const weights = publicOnly ? PUBLIC_CATEGORY_WEIGHTS : CATEGORY_WEIGHTS;

  let totalWeight = 0;
  let weighted = 0;
  for (const id of ids) {
    const cat = categories.find((c) => c.id === id);
    if (!cat || !cat.measurable || cat.score == null) continue;
    const w =
      (weights as Record<string, number>)[id] ??
      CATEGORY_WEIGHTS[id as AuditCategoryId] ??
      0;
    if (w <= 0) continue;
    totalWeight += w;
    weighted += cat.score * w;
  }
  if (totalWeight === 0) return null;
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
    if (isNonMeasurable(f)) continue;
    counts[f.severity] = (counts[f.severity] || 0) + 1;
  }
  return counts;
}

export function countCheckOutcomes(findings: AuditFinding[]): {
  pass: number;
  warning: number;
  fail: number;
  unavailable: number;
} {
  let pass = 0;
  let warning = 0;
  let fail = 0;
  let unavailable = 0;
  for (const f of findings) {
    if (isNonMeasurable(f)) {
      unavailable += 1;
      continue;
    }
    if (f.status === "warning" || (f.severity === "info" && f.status !== "pass")) {
      warning += 1;
      continue;
    }
    if (f.status === "pass" || f.severity === "pass") {
      pass += 1;
      continue;
    }
    fail += 1;
  }
  return { pass, warning, fail, unavailable };
}

/** Rank problems for "Mit javítsak először?" — excludes pass / N/A. */
export function prioritizeFixes(findings: AuditFinding[]): AuditFinding[] {
  return findings
    .filter(
      (f) =>
        f.severity !== "pass" &&
        !isNonMeasurable(f)
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
  overall: number | null,
  findings: AuditFinding[]
): string {
  const counts = countSeverities(findings);
  const outcomes = countCheckOutcomes(findings);
  const label = scoreBandLabel(overall);
  if (overall == null) {
    return `Nem mérhető összesített pontszám · ${outcomes.unavailable} ellenőrzés nem értékelhető.`;
  }
  if (
    counts.critical === 0 &&
    counts.high === 0 &&
    counts.medium === 0 &&
    counts.low === 0
  ) {
    return `${label} eredmény (${overall}/100) — nincs javítandó probléma · ${outcomes.unavailable} nem ellenőrizhető.`;
  }
  const parts: string[] = [];
  if (counts.critical) parts.push(`${counts.critical} kritikus`);
  if (counts.high) parts.push(`${counts.high} magas`);
  if (counts.medium) parts.push(`${counts.medium} közepes`);
  if (counts.low) parts.push(`${counts.low} alacsony`);
  return `Pontszám: ${overall}/100 (${label}) · ${parts.join(" · ")} · ${outcomes.unavailable} nem ellenőrizhető.`;
}
