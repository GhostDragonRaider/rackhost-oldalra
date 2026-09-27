/** Flexible public audit shape — tolerates engine/API drift via optional fields. */

export type PublicAuditProgressStep = {
  id: string;
  label: string;
  status: string;
  detail?: string;
};

export type PublicAuditCategory = {
  id: string;
  label: string;
  score: number | null;
  measurable?: boolean;
  status?: string;
  maxScore?: number;
};

export type PublicAuditFinding = {
  id: string;
  checkId?: string;
  category?: string;
  severity?: string;
  status?: string;
  title: string;
  detail?: string;
  description?: string;
  recommendation?: string | null;
  evidence?: string | null;
  technicalDetails?: string | null;
  whyItMatters?: string | null;
  measuredAt?: string;
  detectedValue?: string | null;
  reliability?: string | null;
  source?: string | null;
  /** security category only: breach_risk | hardening */
  securityGroup?: "breach_risk" | "hardening" | null;
};

export type PublicMatrixIssue = {
  title: string;
  detail?: string;
  selector?: string;
};

export type PublicMatrixCell = {
  status: string;
  issues?: PublicMatrixIssue[];
  screenshot?: string | null;
};

export type PublicResponsiveMatrix = {
  viewports: number[];
  pages: Array<{
    path: string;
    cells: Record<string, PublicMatrixCell>;
  }>;
  screenshotStatus?: string;
  screenshotNote?: string;
};

export type PublicWebsiteAudit = {
  id: string;
  status: string;
  overallScore?: number | null;
  overallLabel?: string | null;
  summary?: string | null;
  error?: string | null;
  inputUrl?: string;
  normalizedUrl?: string;
  fromCache?: boolean;
  cachedFromId?: string;
  checkedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  categories?: PublicAuditCategory[];
  findings?: PublicAuditFinding[];
  progress?: PublicAuditProgressStep[];
  severityCounts?: Record<string, number>;
  responsiveMatrix?: PublicResponsiveMatrix;
  technical?: Record<string, unknown>;
  priorityFixes?: PublicAuditFinding[];
  screenshot?: { status?: string; url?: string | null } | string | null;
  securityExposureNote?: string | null;
};

/** Primary public category order + display labels. */
export const PRIMARY_CATEGORY_META: Array<{
  id: string;
  label: string;
}> = [
  { id: "availability", label: "Technikai" },
  { id: "seo", label: "SEO" },
  { id: "security", label: "Biztonság" },
  { id: "content", label: "Tartalom" },
  { id: "responsive", label: "Reszponzív" },
];

export function scoreTone(
  score: number | null | undefined
): "good" | "warn" | "bad" | "neutral" | "na" {
  if (score == null || Number.isNaN(score)) return "na";
  if (score >= 80) return "good";
  if (score >= 55) return "warn";
  return "bad";
}

export function formatCheckedAt(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Map finding statuses into public count buckets. */
export function countFindingBuckets(findings: PublicAuditFinding[] = []) {
  const buckets = {
    pass: 0,
    warning: 0,
    fail: 0,
    unavailable: 0,
  };
  for (const f of findings) {
    const status = String(f.status || "").toLowerCase();
    const severity = String(f.severity || "").toLowerCase();

    if (
      status === "not_available" ||
      status === "unavailable" ||
      status === "unknown" ||
      status === "not_applicable"
    ) {
      buckets.unavailable += 1;
      continue;
    }
    if (status === "fail") {
      buckets.fail += 1;
      continue;
    }
    if (status === "pass" || severity === "pass") {
      buckets.pass += 1;
      continue;
    }
    // warning | info severity (and legacy warning status)
    if (
      status === "warning" ||
      severity === "warning" ||
      severity === "info" ||
      severity === "low" ||
      severity === "medium"
    ) {
      buckets.warning += 1;
      continue;
    }
    if (severity === "high" || severity === "critical") {
      buckets.fail += 1;
      continue;
    }
    // Unknown residual → unavailable rather than inventing PASS
    buckets.unavailable += 1;
  }
  return buckets;
}

export function pickPrimaryCategories(
  categories: PublicAuditCategory[] = []
): PublicAuditCategory[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  return PRIMARY_CATEGORY_META.map((meta) => {
    const existing = byId.get(meta.id);
    if (existing) {
      return {
        ...existing,
        label: meta.label,
        score:
          existing.measurable === false
            ? null
            : existing.score == null
              ? null
              : existing.score,
      };
    }
    // Responsive may be absent until engine ships it — show as N/A
    return {
      id: meta.id,
      label: meta.label,
      score: null,
      measurable: false,
      status: "not_available",
    };
  });
}

export function isUnavailableStatus(status?: string | null): boolean {
  const s = String(status || "").toLowerCase();
  return (
    s === "not_available" ||
    s === "unavailable" ||
    s === "unknown" ||
    s === "not_applicable" ||
    s === "na" ||
    s === "n/a"
  );
}
