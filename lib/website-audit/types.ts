export type AuditSeverity = "critical" | "warning" | "info" | "pass";

export type AuditCategoryId =
  | "availability"
  | "security"
  | "seo"
  | "content"
  | "performance"
  | "best_practices";

export type AuditFinding = {
  id: string;
  category: AuditCategoryId;
  severity: AuditSeverity;
  title: string;
  detail: string;
  evidence?: string | null;
};

export type AuditCategoryScore = {
  id: AuditCategoryId;
  label: string;
  score: number;
  maxScore: number;
  findingCount: number;
};

export type AuditProgressStep = {
  id: string;
  label: string;
  status: "pending" | "running" | "done" | "skipped" | "error";
  detail?: string;
};

export type AuditTechnical = {
  finalUrl: string | null;
  statusCode: number | null;
  contentType: string | null;
  responseBytes: number | null;
  responseMs: number | null;
  redirectChain: string[];
  headers: Record<string, string>;
  title: string | null;
  metaDescription: string | null;
  h1Count: number;
  h1Texts: string[];
  canonical: string | null;
  robotsTxtUrl: string | null;
  robotsTxtOk: boolean | null;
  sitemapUrl: string | null;
  sitemapOk: boolean | null;
  tls: {
    ok: boolean | null;
    protocol: string | null;
    authorized: boolean | null;
    error: string | null;
  };
  pagespeed: {
    attempted: boolean;
    ok: boolean;
    performanceScore: number | null;
    error: string | null;
    /** pagespeed_api = Google PSI; local_estimate = saját mérés fallback */
    source: "pagespeed_api" | "local_estimate" | null;
  };
};

export type WebsiteAuditRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  inputUrl: string;
  normalizedUrl: string;
  status: "queued" | "running" | "completed" | "failed";
  overallScore: number;
  summary: string;
  error: string | null;
  categories: AuditCategoryScore[];
  findings: AuditFinding[];
  technical: AuditTechnical;
  progress: AuditProgressStep[];
};

export type WebsiteAuditSummary = {
  id: string;
  createdAt: string;
  inputUrl: string;
  normalizedUrl: string;
  status: WebsiteAuditRecord["status"];
  overallScore: number;
  summary: string;
  error: string | null;
};

export const CATEGORY_LABELS: Record<AuditCategoryId, string> = {
  availability: "Elérhetőség",
  security: "Biztonság",
  seo: "SEO",
  content: "Tartalom",
  performance: "Teljesítmény",
  best_practices: "Best practice",
};
