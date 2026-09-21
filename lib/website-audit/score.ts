import type {
  AuditCategoryId,
  AuditCategoryScore,
  AuditFinding,
} from "./types";
import { CATEGORY_LABELS as LABELS } from "./types";

const WEIGHTS: Record<AuditCategoryId, number> = {
  availability: 25,
  security: 20,
  seo: 20,
  content: 15,
  performance: 10,
  best_practices: 10,
};

function severityPenalty(severity: AuditFinding["severity"]): number {
  switch (severity) {
    case "critical":
      return 35;
    case "warning":
      return 15;
    case "info":
      return 4;
    default:
      return 0;
  }
}

export function computeCategoryScores(
  findings: AuditFinding[]
): AuditCategoryScore[] {
  const ids = Object.keys(WEIGHTS) as AuditCategoryId[];
  return ids.map((id) => {
    const related = findings.filter((f) => f.category === id);
    let score = 100;
    for (const f of related) {
      if (f.severity === "pass") continue;
      score -= severityPenalty(f.severity);
    }
    score = Math.max(0, Math.min(100, score));
    return {
      id,
      label: LABELS[id],
      score,
      maxScore: 100,
      findingCount: related.filter((f) => f.severity !== "pass").length,
    };
  });
}

export function computeOverallScore(categories: AuditCategoryScore[]): number {
  let totalWeight = 0;
  let weighted = 0;
  for (const cat of categories) {
    const w = WEIGHTS[cat.id] || 0;
    totalWeight += w;
    weighted += cat.score * w;
  }
  if (totalWeight === 0) return 0;
  return Math.round(weighted / totalWeight);
}

export function summarizeFindings(
  overall: number,
  findings: AuditFinding[]
): string {
  const critical = findings.filter((f) => f.severity === "critical").length;
  const warning = findings.filter((f) => f.severity === "warning").length;
  if (critical === 0 && warning === 0) {
    return `Erős eredmény (${overall}/100) — nincs kritikus vagy figyelmeztető találat.`;
  }
  return `Pontszám: ${overall}/100 · ${critical} kritikus · ${warning} figyelmeztetés.`;
}
