import fs from "fs";
import path from "path";
import crypto from "crypto";
import type {
  AuditProgressStep,
  WebsiteAuditRecord,
  WebsiteAuditSummary,
} from "./types";
import { scoreBandLabel } from "./scoring-config";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "website-audits.json");
const MAX_HISTORY = 50;

type Store = {
  audits: WebsiteAuditRecord[];
};

function ensureStore(): Store {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    const empty: Store = { audits: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(empty, null, 2), "utf8");
    return empty;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as Store;
    if (!parsed || !Array.isArray(parsed.audits)) return { audits: [] };
    return parsed;
  } catch {
    return { audits: [] };
  }
}

function writeStore(store: Store) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2), "utf8");
  fs.renameSync(tmp, DATA_FILE);
}

export function newAuditId(): string {
  return crypto.randomBytes(8).toString("hex");
}

export function listAuditSummaries(limit = 30): WebsiteAuditSummary[] {
  const store = ensureStore();
  return store.audits
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map((a) => ({
      id: a.id,
      createdAt: a.createdAt,
      inputUrl: a.inputUrl,
      normalizedUrl: a.normalizedUrl,
      status: a.status,
      overallScore: a.overallScore,
      summary: a.summary,
      error: a.error,
    }));
}

export function getAuditById(id: string): WebsiteAuditRecord | null {
  const store = ensureStore();
  return store.audits.find((a) => a.id === id) || null;
}

export function saveAudit(record: WebsiteAuditRecord): WebsiteAuditRecord {
  const store = ensureStore();
  const idx = store.audits.findIndex((a) => a.id === record.id);
  if (idx >= 0) store.audits[idx] = record;
  else store.audits.unshift(record);
  store.audits = store.audits
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, MAX_HISTORY);
  writeStore(store);
  return record;
}

export function emptyTechnical(): WebsiteAuditRecord["technical"] {
  return {
    finalUrl: null,
    statusCode: null,
    contentType: null,
    responseBytes: null,
    responseMs: null,
    redirectChain: [],
    headers: {},
    title: null,
    metaDescription: null,
    h1Count: 0,
    h1Texts: [],
    canonical: null,
    htmlLang: null,
    robotsTxtUrl: null,
    robotsTxtOk: null,
    robotsTxtStatus: null,
    sitemapUrl: null,
    sitemapOk: null,
    sitemapStatus: null,
    sitemapKind: null,
    indexability: null,
    tls: {
      ok: null,
      protocol: null,
      authorized: null,
      error: null,
    },
    pagespeed: {
      attempted: false,
      ok: false,
      performanceScore: null,
      error: null,
      source: null,
      metrics: null,
    },
  };
}

export function initialAuditProgress(): AuditProgressStep[] {
  return [
    { id: "validate", label: "URL ellenőrzése", status: "pending" },
    { id: "fetch", label: "Elérhetőség / HTTP", status: "pending" },
    { id: "tls", label: "HTTPS / TLS", status: "pending" },
    { id: "headers", label: "Biztonsági kitettség (headerek)", status: "pending" },
    { id: "html", label: "SEO", status: "pending" },
    { id: "content", label: "Tartalom", status: "pending" },
    { id: "responsive", label: "Responsive", status: "pending" },
    { id: "a11y", label: "Akadálymentesség", status: "pending" },
    { id: "robots", label: "robots.txt / sitemap", status: "pending" },
    { id: "pagespeed", label: "Teljesítmény", status: "pending" },
    { id: "score", label: "Pontszámítás", status: "pending" },
  ];
}

/** Shell record for async queue + progress polling. */
export function createQueuedAuditRecord(inputUrl: string): WebsiteAuditRecord {
  const now = new Date().toISOString();
  return {
    id: newAuditId(),
    createdAt: now,
    updatedAt: now,
    inputUrl,
    normalizedUrl: inputUrl,
    status: "queued",
    overallScore: null,
    overallLabel: scoreBandLabel(null),
    summary: "Sorban vár…",
    error: null,
    categories: [],
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
    technical: emptyTechnical(),
    progress: initialAuditProgress(),
    beta: true,
    fromCache: false,
    cachedFromId: null,
    checkedAt: null,
    scoringExplanation: null,
    responsiveMatrix: null,
    securityExposureNote: null,
  };
}
