import crypto from "crypto";
import fs from "fs";
import path from "path";
import { OUTREACH_BUSINESS_SEED } from "./outreach-business-seed";

export type OutreachContactStatus = "active" | "paused" | "unsubscribed";

export type OutreachContact = {
  id: string;
  email: string;
  name: string;
  /** Vállalkozás neve */
  company: string;
  /** Telephely / cím */
  location: string;
  notes: string;
  source: string;
  status: OutreachContactStatus;
  createdAt: string;
  updatedAt: string;
  lastEmailedAt: string | null;
};

export type OutreachCampaign = {
  subject: string;
  body: string;
  intervalDays: number;
  enabled: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
};

export type OutreachSendLog = {
  id: string;
  contactId: string;
  email: string;
  subject: string;
  status: "sent" | "failed" | "skipped";
  detail: string;
  createdAt: string;
};

type Store = {
  contacts: OutreachContact[];
  campaign: OutreachCampaign;
  logs: OutreachSendLog[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "outreach.json");
const MAX_CONTACTS = 2000;
const MAX_LOGS = 500;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emptyStore(): Store {
  return {
    contacts: [],
    campaign: {
      subject: "AntiCode — weboldal, ami ügyfelet hoz",
      body: [
        "Kedves {{company}}!",
        "",
        "Az AntiCode üzletszerző weboldalakat és egyedi rendszereket készít.",
        "Ha van egy projekted, amiben segíthetek, írj nyugodtan.",
      ].join("\n"),
      intervalDays: 14,
      enabled: false,
      lastRunAt: null,
      nextRunAt: null,
    },
    logs: [],
  };
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
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as Store;
    if (!parsed || !Array.isArray(parsed.contacts)) return emptyStore();
    return {
      ...emptyStore(),
      ...parsed,
      contacts: parsed.contacts.map(normalizeContact),
      campaign: { ...emptyStore().campaign, ...(parsed.campaign || {}) },
      logs: Array.isArray(parsed.logs) ? parsed.logs : [],
    };
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

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${crypto
    .randomBytes(3)
    .toString("hex")}`;
}

function normalizeEmail(raw: string): string {
  return String(raw || "").trim().toLowerCase().slice(0, 254);
}

function normalizeContact(raw: Partial<OutreachContact>): OutreachContact {
  const now = new Date().toISOString();
  return {
    id: String(raw.id || newId("oc")),
    email: normalizeEmail(String(raw.email || "")),
    name: String(raw.name || "").trim().slice(0, 100),
    company: String(raw.company || "").trim().slice(0, 160),
    location: String(raw.location || "").trim().slice(0, 240),
    notes: String(raw.notes || "").trim().slice(0, 1000),
    source: String(raw.source || "manual").trim().slice(0, 60) || "manual",
    status:
      raw.status === "paused" || raw.status === "unsubscribed"
        ? raw.status
        : "active",
    createdAt: String(raw.createdAt || now),
    updatedAt: String(raw.updatedAt || now),
    lastEmailedAt: raw.lastEmailedAt ? String(raw.lastEmailedAt) : null,
  };
}

export function listOutreachContacts(): OutreachContact[] {
  ensureBusinessSeedIfEmpty();
  return [...ensureStore().contacts].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0
  );
}

/** Ha a tartós címlista üres, betölti a commitolt vállalkozás-seedet. */
export function ensureBusinessSeedIfEmpty(): {
  seeded: boolean;
  added: number;
} {
  const store = ensureStore();
  if (store.contacts.length > 0) {
    return { seeded: false, added: 0 };
  }
  const result = upsertBusinessContacts(
    OUTREACH_BUSINESS_SEED.map((row) => ({
      ...row,
      source: "business-seed",
    }))
  );
  return { seeded: result.added > 0, added: result.added };
}

/** Seed / import: újat ad hozzá, meglévőnél frissíti a vállalkozást és telephelyet. */
export function upsertBusinessContacts(
  entries: Array<{
    email?: string;
    name?: string;
    company?: string;
    location?: string;
    notes?: string;
    source?: string;
  }>
): { added: number; updated: number; skipped: number; contacts: OutreachContact[] } {
  let added = 0;
  let updated = 0;
  let skipped = 0;
  const touched: OutreachContact[] = [];

  for (const entry of entries) {
    const email = normalizeEmail(String(entry.email || ""));
    if (!EMAIL_RE.test(email)) {
      skipped += 1;
      continue;
    }
    const store = ensureStore();
    const existing = store.contacts.find((c) => c.email === email);
    if (!existing) {
      try {
        const c = addOutreachContact(entry);
        touched.push(c);
        added += 1;
      } catch {
        skipped += 1;
      }
      continue;
    }

    const company = String(entry.company || "").trim().slice(0, 160);
    const location = String(entry.location || "").trim().slice(0, 240);
    const name = entry.name != null ? String(entry.name).trim().slice(0, 100) : undefined;
    const patch: {
      company?: string;
      location?: string;
      name?: string;
    } = {};
    if (company && company !== existing.company) patch.company = company;
    if (location && location !== existing.location) patch.location = location;
    if (name != null && name !== existing.name) patch.name = name;

    if (Object.keys(patch).length) {
      const c = updateOutreachContact(existing.id, patch);
      if (c) {
        touched.push(c);
        updated += 1;
      } else skipped += 1;
    } else {
      touched.push(existing);
      skipped += 1;
    }
  }

  return { added, updated, skipped, contacts: touched };
}

export function getOutreachCampaign(): OutreachCampaign {
  return ensureStore().campaign;
}

export function listOutreachLogs(limit = 100): OutreachSendLog[] {
  return ensureStore().logs.slice(0, Math.max(1, Math.min(limit, MAX_LOGS)));
}

export function addOutreachContact(input: {
  email?: string;
  name?: string;
  company?: string;
  location?: string;
  notes?: string;
  source?: string;
}): OutreachContact {
  const email = normalizeEmail(String(input.email || ""));
  if (!EMAIL_RE.test(email)) {
    throw new Error("Érvényes e-mail címet adj meg.");
  }
  const store = ensureStore();
  const existing = store.contacts.find((c) => c.email === email);
  if (existing) {
    throw new Error("Ez az e-mail cím már szerepel a listán.");
  }
  const now = new Date().toISOString();
  const contact: OutreachContact = {
    id: newId("oc"),
    email,
    name: String(input.name || "").trim().slice(0, 100),
    company: String(input.company || "").trim().slice(0, 160),
    location: String(input.location || "").trim().slice(0, 240),
    notes: String(input.notes || "").trim().slice(0, 1000),
    source: String(input.source || "manual").trim().slice(0, 60) || "manual",
    status: "active",
    createdAt: now,
    updatedAt: now,
    lastEmailedAt: null,
  };
  store.contacts.unshift(contact);
  if (store.contacts.length > MAX_CONTACTS) {
    store.contacts = store.contacts.slice(0, MAX_CONTACTS);
  }
  writeStore(store);
  return contact;
}

export function updateOutreachContact(
  id: string,
  patch: Partial<{
    name: string;
    company: string;
    location: string;
    notes: string;
    status: OutreachContactStatus;
  }>
): OutreachContact | null {
  const store = ensureStore();
  const idx = store.contacts.findIndex((c) => c.id === id);
  if (idx < 0) return null;
  const current = store.contacts[idx];
  const next: OutreachContact = {
    ...current,
    updatedAt: new Date().toISOString(),
  };
  if (patch.name != null) next.name = String(patch.name).trim().slice(0, 100);
  if (patch.company != null)
    next.company = String(patch.company).trim().slice(0, 160);
  if (patch.location != null)
    next.location = String(patch.location).trim().slice(0, 240);
  if (patch.notes != null) next.notes = String(patch.notes).trim().slice(0, 1000);
  if (
    patch.status === "active" ||
    patch.status === "paused" ||
    patch.status === "unsubscribed"
  ) {
    next.status = patch.status;
  }
  store.contacts[idx] = next;
  writeStore(store);
  return next;
}

export function deleteOutreachContact(id: string): boolean {
  const store = ensureStore();
  const next = store.contacts.filter((c) => c.id !== id);
  if (next.length === store.contacts.length) return false;
  store.contacts = next;
  writeStore(store);
  return true;
}

export function updateOutreachCampaign(input: {
  subject?: string;
  body?: string;
  intervalDays?: number;
  enabled?: boolean;
}): OutreachCampaign {
  const store = ensureStore();
  const campaign = { ...store.campaign };
  if (input.subject != null) {
    const subject = String(input.subject).trim().slice(0, 180);
    if (subject.length < 3) throw new Error("A tárgy legalább 3 karakter legyen.");
    campaign.subject = subject;
  }
  if (input.body != null) {
    const body = String(input.body).trim().slice(0, 8000);
    if (body.length < 10) throw new Error("A levél szövege túl rövid.");
    campaign.body = body;
  }
  if (input.intervalDays != null) {
    const days = Number(input.intervalDays);
    if (!Number.isFinite(days) || days < 1 || days > 365) {
      throw new Error("Az időköz 1–365 nap között legyen.");
    }
    campaign.intervalDays = Math.round(days);
  }
  if (typeof input.enabled === "boolean") {
    campaign.enabled = input.enabled;
    if (input.enabled && !campaign.nextRunAt) {
      const next = new Date();
      next.setDate(next.getDate() + campaign.intervalDays);
      campaign.nextRunAt = next.toISOString();
    }
    if (!input.enabled) {
      campaign.nextRunAt = null;
    }
  }
  store.campaign = campaign;
  writeStore(store);
  return campaign;
}

export function importEmails(entries: Array<{
  email?: string;
  name?: string;
  company?: string;
  location?: string;
  notes?: string;
  source?: string;
}>): { added: number; updated: number; skipped: number; contacts: OutreachContact[] } {
  return upsertBusinessContacts(entries);
}

/**
 * Parse bulk rows: Vállalkozás / E-mail / Telephely
 * (tab, pipe, or semicolon separated; optional leading index column).
 */
export function parseBusinessContactRows(raw: string): Array<{
  company: string;
  email: string;
  location: string;
}> {
  const lines = String(raw || "")
    .replaceAll("\r\n", "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const rows: Array<{ company: string; email: string; location: string }> = [];
  for (const line of lines) {
    if (/^(#?\s*)?(vállalkozás|company|cég|e-?mail)/i.test(line)) continue;

    const parts = (
      line.includes("\t")
        ? line.split("\t")
        : line.includes("|")
          ? line.split("|")
          : line.split(";")
    )
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (parts.length < 2) continue;
    const start = /^\d+$/.test(parts[0]) ? 1 : 0;
    const slice = parts.slice(start);
    const emailIdx = slice.findIndex((p) => EMAIL_RE.test(normalizeEmail(p)));
    if (emailIdx < 0) continue;

    const email = normalizeEmail(slice[emailIdx]);
    const company = slice.slice(0, emailIdx).join(" ").trim();
    const location = slice.slice(emailIdx + 1).join(" ").trim();
    if (!company || !EMAIL_RE.test(email)) continue;

    rows.push({
      company: company.slice(0, 160),
      email,
      location: location.slice(0, 240),
    });
  }
  return rows;
}

export function renderOutreachBody(
  template: string,
  contact: Pick<OutreachContact, "name" | "email" | "company" | "location">
): string {
  const namePart = contact.name ? ` ${contact.name}` : "";
  const company = contact.company || contact.name || "Ügyfelünk";
  return template
    .replaceAll("{{name}}", namePart)
    .replaceAll("{{email}}", contact.email)
    .replaceAll("{{company}}", company)
    .replaceAll("{{location}}", contact.location || "");
}

export function markOutreachSent(params: {
  contactId: string;
  email: string;
  subject: string;
  status: OutreachSendLog["status"];
  detail: string;
}): OutreachSendLog {
  const store = ensureStore();
  const now = new Date().toISOString();
  const log: OutreachSendLog = {
    id: newId("os"),
    contactId: params.contactId,
    email: params.email,
    subject: params.subject,
    status: params.status,
    detail: params.detail.slice(0, 500),
    createdAt: now,
  };
  store.logs.unshift(log);
  if (store.logs.length > MAX_LOGS) store.logs = store.logs.slice(0, MAX_LOGS);

  const idx = store.contacts.findIndex((c) => c.id === params.contactId);
  if (idx >= 0 && params.status === "sent") {
    store.contacts[idx] = {
      ...store.contacts[idx],
      lastEmailedAt: now,
      updatedAt: now,
    };
  }

  if (params.status === "sent") {
    store.campaign.lastRunAt = now;
    if (store.campaign.enabled) {
      const next = new Date(now);
      next.setDate(next.getDate() + store.campaign.intervalDays);
      store.campaign.nextRunAt = next.toISOString();
    }
  }

  writeStore(store);
  return log;
}

export function getActiveOutreachContacts(): OutreachContact[] {
  return ensureStore().contacts.filter((c) => c.status === "active");
}
