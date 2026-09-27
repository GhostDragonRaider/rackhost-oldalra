import type {
  AuditCategoryId,
  AuditCheckStatus,
  AuditFinding,
  AuditFindingSource,
  AuditSeverity,
} from "../types";

export function finding(partial: {
  id: string;
  category: AuditCategoryId;
  severity: AuditSeverity;
  status?: AuditCheckStatus;
  title: string;
  detail: string;
  recommendation?: string | null;
  detectedValue?: string | null;
  evidence?: string | null;
  technicalDetails?: string | null;
  source?: AuditFindingSource;
  scoreImpact?: number | null;
  measuredAt?: string | null;
}): AuditFinding {
  const status: AuditCheckStatus =
    partial.status ??
    (partial.severity === "pass"
      ? "pass"
      : partial.severity === "info"
        ? "pass"
        : "fail");
  const reliability =
    status === "not_available" || status === "not_applicable"
      ? ("unavailable" as const)
      : status === "unknown"
        ? ("unknown" as const)
        : partial.source === "static_html" ||
            partial.source === "responsive_engine"
          ? ("heuristic" as const)
          : ("measured" as const);
  return {
    id: partial.id,
    checkId: partial.id,
    category: partial.category,
    severity: partial.severity,
    status,
    title: partial.title,
    detail: partial.detail,
    description: partial.detail,
    recommendation: partial.recommendation ?? null,
    detectedValue: partial.detectedValue ?? null,
    evidence: partial.evidence ?? null,
    technicalDetails: partial.technicalDetails ?? null,
    source: partial.source ?? null,
    reliability,
    scoreImpact: partial.scoreImpact ?? null,
    measuredAt: partial.measuredAt ?? new Date().toISOString(),
  };
}
