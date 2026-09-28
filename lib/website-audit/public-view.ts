import type { WebsiteAuditRecord } from "./types";

/**
 * Public-facing audit payload: overall score + category bars only.
 * Finding-level details stay admin-only.
 */
export function toPublicAuditView(audit: WebsiteAuditRecord) {
  return {
    id: audit.id,
    createdAt: audit.createdAt,
    updatedAt: audit.updatedAt,
    inputUrl: audit.inputUrl,
    normalizedUrl: audit.normalizedUrl,
    status: audit.status,
    overallScore: audit.overallScore,
    overallLabel: audit.overallLabel,
    summary: audit.summary,
    error: audit.error,
    categories: (audit.categories || []).map((c) => ({
      id: c.id,
      label: c.label,
      score: c.score,
      measurable: c.measurable,
      status: c.status,
    })),
    findings: [],
    priorityFixes: [],
    severityCounts: {
      pass: 0,
      info: 0,
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    },
    progress: audit.progress || [],
    beta: audit.beta,
    fromCache: audit.fromCache,
    cachedFromId: audit.cachedFromId,
    checkedAt: audit.checkedAt,
    scoringExplanation: null,
    responsiveMatrix: null,
    securityExposureNote: null,
    technical: null,
  };
}
