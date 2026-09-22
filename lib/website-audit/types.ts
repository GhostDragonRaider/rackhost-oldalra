export type AuditSeverity =
  | "pass"
  | "info"
  | "low"
  | "medium"
  | "high"
  | "critical";

/** Outcome of a single check — independent from severity weighting. */
export type AuditCheckStatus =
  | "pass"
  | "fail"
  | "not_available"
  | "not_applicable";

export type AuditCategoryId =
  | "availability"
  | "security"
  | "seo"
  | "content"
  | "performance"
  | "accessibility"
  | "best_practices";

export type AuditFindingSource =
  | "pagespeed_api"
  | "local_estimate"
  | "static_html"
  | "http"
  | "tls"
  | "robots"
  | "sitemap"
  | null;

export type AuditFinding = {
  id: string;
  category: AuditCategoryId;
  severity: AuditSeverity;
  status: AuditCheckStatus;
  title: string;
  /** What we found / why it matters */
  detail: string;
  /** Concrete fix suggestion */
  recommendation?: string | null;
  /** Detected value shown in UI */
  detectedValue?: string | null;
  evidence?: string | null;
  technicalDetails?: string | null;
  source?: AuditFindingSource;
  /** Optional penalty override (absolute points deducted in category) */
  scoreImpact?: number | null;
};

export type AuditCategoryScore = {
  id: AuditCategoryId;
  label: string;
  score: number;
  maxScore: number;
  findingCount: number;
  status: "good" | "ok" | "warn" | "bad";
};

export type AuditProgressStep = {
  id: string;
  label: string;
  status: "pending" | "running" | "done" | "skipped" | "error";
  detail?: string;
};

export type PageSpeedMetrics = {
  lcpMs: number | null;
  cls: number | null;
  inpMs: number | null;
  tbtMs: number | null;
  fcpMs: number | null;
  speedIndexMs: number | null;
  totalByteWeight: number | null;
  jsBytes: number | null;
  cssBytes: number | null;
  imageBytes: number | null;
  renderBlockingCount: number | null;
  accessibilityScore: number | null;
};

export type IndexabilityResult = {
  status: "ok" | "blocked" | "caution" | "unknown";
  summary: string;
  metaRobots: string | null;
  xRobotsTag: string | null;
  hasNoindex: boolean;
  hasNofollow: boolean;
  robotsTxtBlocks: boolean;
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
  htmlLang: string | null;
  robotsTxtUrl: string | null;
  robotsTxtOk: boolean | null;
  robotsTxtStatus: number | null;
  sitemapUrl: string | null;
  sitemapOk: boolean | null;
  sitemapStatus: number | null;
  sitemapKind: "urlset" | "index" | "unknown" | "invalid" | null;
  indexability: IndexabilityResult | null;
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
    metrics: PageSpeedMetrics | null;
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
  overallLabel: string;
  summary: string;
  error: string | null;
  categories: AuditCategoryScore[];
  findings: AuditFinding[];
  priorityFixes: AuditFinding[];
  severityCounts: Record<AuditSeverity, number>;
  technical: AuditTechnical;
  progress: AuditProgressStep[];
  beta: true;
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
  accessibility: "Akadálymentesség",
  best_practices: "Best practices",
};

export const SEVERITY_LABELS: Record<AuditSeverity, string> = {
  pass: "Rendben",
  info: "Információ",
  low: "Alacsony",
  medium: "Közepes",
  high: "Magas",
  critical: "Kritikus",
};

export const CATEGORY_ORDER: AuditCategoryId[] = [
  "availability",
  "security",
  "seo",
  "content",
  "performance",
  "accessibility",
  "best_practices",
];
