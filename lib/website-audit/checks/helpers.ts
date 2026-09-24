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
}): AuditFinding {
  const status: AuditCheckStatus =
    partial.status ??
    (partial.severity === "pass"
      ? "pass"
      : partial.severity === "info"
        ? "pass"
        : "fail");
  return {
    id: partial.id,
    category: partial.category,
    severity: partial.severity,
    status,
    title: partial.title,
    detail: partial.detail,
    recommendation: partial.recommendation ?? null,
    detectedValue: partial.detectedValue ?? null,
    evidence: partial.evidence ?? null,
    technicalDetails: partial.technicalDetails ?? null,
    source: partial.source ?? null,
    scoreImpact: partial.scoreImpact ?? null,
  };
}
