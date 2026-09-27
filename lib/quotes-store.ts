import crypto from "crypto";
import fs from "fs";
import path from "path";

export type QuoteSource =
  | "landing"
  | "kapcsolat"
  | "audit-quote"
  | "public-audit"
  | "other";

export type QuoteStatus = "new" | "read" | "replied" | "archived";

export type QuoteRequest = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: QuoteStatus;
  source: QuoteSource;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  auditId: string | null;
  websiteUrl: string | null;
  overallScore: number | null;
  overallLabel: string | null;
};

type Store = {
  quotes: QuoteRequest[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "quotes.json");
const MAX_QUOTES = 500;

function emptyStore(): Store {
  return { quotes: [] };
}

function ensureStore(): Store {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const empty = emptyStore();
    fs.writeFileSync(DATA_FILE, JSON.stringify(empty, null, 2), "utf8");
    return empty;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Store;
    if (!parsed || !Array.isArray(parsed.quotes)) return emptyStore();
    return parsed;
  } catch {
    return emptyStore();
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

function newId(): string {
  return `quote_${Date.now().toString(36)}_${crypto
    .randomBytes(4)
    .toString("hex")}`;
}

function normalizeSource(raw: string | undefined): QuoteSource {
  const s = String(raw || "").trim();
  if (
    s === "landing" ||
    s === "kapcsolat" ||
    s === "audit-quote" ||
    s === "public-audit"
  ) {
    return s;
  }
  return "other";
}

export function listQuotes(): QuoteRequest[] {
  const store = ensureStore();
  return [...store.quotes].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0
  );
}

export function countNewQuotes(): number {
  return ensureStore().quotes.filter((q) => q.status === "new").length;
}

export function saveQuoteRequest(input: {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  message?: string;
  source?: string;
  auditId?: string | null;
  websiteUrl?: string | null;
  overallScore?: number | null;
  overallLabel?: string | null;
}): QuoteRequest {
  const now = new Date().toISOString();
  const quote: QuoteRequest = {
    id: newId(),
    createdAt: now,
    updatedAt: now,
    status: "new",
    source: normalizeSource(input.source),
    name: String(input.name || "").trim().slice(0, 100),
    email: String(input.email || "").trim().slice(0, 254),
    phone: String(input.phone || "").trim().slice(0, 40),
    service: String(input.service || "").trim().slice(0, 120),
    message: String(input.message || "").trim().slice(0, 2000),
    auditId: input.auditId ? String(input.auditId).slice(0, 64) : null,
    websiteUrl: input.websiteUrl
      ? String(input.websiteUrl).trim().slice(0, 500)
      : null,
    overallScore:
      typeof input.overallScore === "number" &&
      Number.isFinite(input.overallScore)
        ? Math.round(input.overallScore)
        : null,
    overallLabel: input.overallLabel
      ? String(input.overallLabel).slice(0, 80)
      : null,
  };

  const store = ensureStore();
  store.quotes.unshift(quote);
  if (store.quotes.length > MAX_QUOTES) {
    store.quotes = store.quotes.slice(0, MAX_QUOTES);
  }
  writeStore(store);
  return quote;
}

export function updateQuoteStatus(
  id: string,
  status: QuoteStatus
): QuoteRequest | null {
  const store = ensureStore();
  const idx = store.quotes.findIndex((q) => q.id === id);
  if (idx < 0) return null;
  const next: QuoteRequest = {
    ...store.quotes[idx],
    status,
    updatedAt: new Date().toISOString(),
  };
  store.quotes[idx] = next;
  writeStore(store);
  return next;
}
