import fs from "fs";
import path from "path";
import crypto from "crypto";

export type LabAuditLogEntry = {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  module: string;
  detail: string;
  correlationId: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "lab-audit-log.json");
const MAX = 500;

type Store = { entries: LabAuditLogEntry[] };

function ensure(): Store {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    const empty: Store = { entries: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(empty, null, 2), "utf8");
    return empty;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as Store;
    return { entries: Array.isArray(parsed.entries) ? parsed.entries : [] };
  } catch {
    return { entries: [] };
  }
}

function write(store: Store) {
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2), "utf8");
  fs.renameSync(tmp, DATA_FILE);
}

const SECRET_RE =
  /(password|passwd|secret|token|authorization|cookie|api[_-]?key|private[_-]?key)/i;

/** Strip obvious secret-like keys from arbitrary detail objects before logging. */
export function sanitizeForLog(input: unknown): unknown {
  if (input == null) return input;
  if (typeof input === "string") {
    if (SECRET_RE.test(input) && input.length > 8) return "[redacted]";
    return input;
  }
  if (Array.isArray(input)) return input.map(sanitizeForLog);
  if (typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      out[k] = SECRET_RE.test(k) ? "[redacted]" : sanitizeForLog(v);
    }
    return out;
  }
  return input;
}

export function appendLabAuditLog(args: {
  actor: string;
  action: string;
  module: string;
  detail?: string;
  correlationId?: string;
}): LabAuditLogEntry {
  const store = ensure();
  const entry: LabAuditLogEntry = {
    id: crypto.randomBytes(6).toString("hex"),
    timestamp: new Date().toISOString(),
    actor: args.actor,
    action: args.action,
    module: args.module,
    detail: String(args.detail || "").slice(0, 500),
    correlationId: args.correlationId || crypto.randomBytes(4).toString("hex"),
  };
  store.entries.unshift(entry);
  store.entries = store.entries.slice(0, MAX);
  write(store);
  return entry;
}

export function listLabAuditLog(limit = 100): LabAuditLogEntry[] {
  return ensure().entries.slice(0, limit);
}
