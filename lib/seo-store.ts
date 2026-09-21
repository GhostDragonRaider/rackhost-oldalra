import fs from "fs";
import path from "path";
import type { GscIndexingSummary, GscTrafficSummary } from "./gsc-client";

export type SeoIssueSeverity = "critical" | "warning" | "info";

export type SeoIssue = {
  id: string;
  severity: SeoIssueSeverity;
  category:
    | "404"
    | "broken_link"
    | "metadata"
    | "performance"
    | "indexing"
    | "sitemap"
    | "gsc"
    | "traffic";
  title: string;
  detail: string;
  url?: string;
};

export type SeoCheckSummary = {
  score: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  sitemapOk: boolean;
  indexingOk: boolean;
  brokenLinkCount: number;
  missingMetaCount: number;
  pagesChecked: number;
  avgResponseMs: number;
  lastCheckedAt: string;
};

export type SeoReport = {
  summary: SeoCheckSummary;
  issues: SeoIssue[];
  pages: Array<{
    url: string;
    status: number;
    title: string | null;
    description: string | null;
    responseMs: number;
  }>;
  history: Array<{
    at: string;
    score: number;
    criticalCount: number;
    warningCount: number;
  }>;
  alertSentAt: string | null;
  gscConnected: boolean;
  gsc: GscTrafficSummary | null;
  gscIndexing: GscIndexingSummary | null;
};

type Store = {
  latest: SeoReport | null;
  history: SeoReport["history"];
  alertSentAt: string | null;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "seo-report.json");
const MAX_HISTORY = 30;

function emptySummary(): SeoCheckSummary {
  return {
    score: 0,
    criticalCount: 0,
    warningCount: 0,
    infoCount: 0,
    sitemapOk: false,
    indexingOk: false,
    brokenLinkCount: 0,
    missingMetaCount: 0,
    pagesChecked: 0,
    avgResponseMs: 0,
    lastCheckedAt: "",
  };
}

function ensureStore(): Store {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const empty: Store = { latest: null, history: [], alertSentAt: null };
    fs.writeFileSync(DATA_FILE, JSON.stringify(empty, null, 2), "utf8");
    return empty;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Store;
    if (!parsed || typeof parsed !== "object") {
      return { latest: null, history: [], alertSentAt: null };
    }
    return {
      latest: parsed.latest || null,
      history: Array.isArray(parsed.history) ? parsed.history : [],
      alertSentAt: parsed.alertSentAt || null,
    };
  } catch {
    return { latest: null, history: [], alertSentAt: null };
  }
}

function writeStore(store: Store) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2), "utf8");
  fs.renameSync(tmp, DATA_FILE);
}

export function getSeoReport(): SeoReport {
  const store = ensureStore();
  if (store.latest) {
    return {
      ...store.latest,
      gscIndexing: store.latest.gscIndexing ?? null,
      gsc: store.latest.gsc ?? null,
      history: store.history,
      alertSentAt: store.alertSentAt,
    };
  }
  return {
    summary: emptySummary(),
    issues: [],
    pages: [],
    history: store.history,
    alertSentAt: store.alertSentAt,
    gscConnected: false,
    gsc: null,
    gscIndexing: null,
  };
}

export function saveSeoReport(
  report: Omit<SeoReport, "history" | "alertSentAt">,
  options?: { alertSent?: boolean }
): SeoReport {
  const store = ensureStore();
  const historyEntry = {
    at: report.summary.lastCheckedAt,
    score: report.summary.score,
    criticalCount: report.summary.criticalCount,
    warningCount: report.summary.warningCount,
  };
  const history = [...store.history, historyEntry].slice(-MAX_HISTORY);
  const alertSentAt = options?.alertSent
    ? new Date().toISOString()
    : store.alertSentAt;

  const latest: SeoReport = {
    ...report,
    history,
    alertSentAt,
  };

  writeStore({
    latest,
    history,
    alertSentAt,
  });

  return latest;
}

export function markAlertSent(at = new Date().toISOString()) {
  const store = ensureStore();
  store.alertSentAt = at;
  if (store.latest) store.latest.alertSentAt = at;
  writeStore(store);
}

/** Patch GSC indexing on the latest report; optionally refresh issues/summary. */
export function patchSeoGscIndexing(
  gscIndexing: GscIndexingSummary,
  extras?: {
    issues?: SeoReport["issues"];
    summary?: SeoReport["summary"];
  }
): SeoReport | null {
  const store = ensureStore();
  if (!store.latest) return null;

  const latest: SeoReport = {
    ...store.latest,
    gscIndexing,
    issues: extras?.issues ?? store.latest.issues,
    summary: extras?.summary ?? store.latest.summary,
    history: store.history,
    alertSentAt: store.alertSentAt,
  };

  writeStore({
    latest,
    history: store.history,
    alertSentAt: store.alertSentAt,
  });

  return latest;
}
