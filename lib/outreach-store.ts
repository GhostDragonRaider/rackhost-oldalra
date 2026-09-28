import crypto from "crypto";
import fs from "fs";
import path from "path";

export type OutreachContactStatus = "active" | "paused" | "unsubscribed";

export type OutreachContact = {
  id: string;
  email: string;
  name: string;
  company: string;
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
        "Szia{{name}}!",
        "",
        "Az AntiCode üzletszerző weboldalakat és egyedi rendszereket készít.",
        "Ha van egy projekted, amiben segíthetek, írj nyugodtan.",
        "",
        "Üdv,",
        "AntiCode",
        "https://anticode.hu",
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

export function listOutreachContacts(): OutreachContact[] {
  return [...ensureStore().contacts].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0
  );
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
    company: String(input.company || "").trim().slice(0, 120),
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
    next.company = String(patch.company).trim().slice(0, 120);
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
  source?: string;
}>): { added: number; skipped: number; contacts: OutreachContact[] } {
  let added = 0;
  let skipped = 0;
  const contacts: OutreachContact[] = [];
  for (const entry of entries) {
    try {
      const c = addOutreachContact(entry);
      contacts.push(c);
      added += 1;
    } catch {
      skipped += 1;
    }
  }
  return { added, skipped, contacts };
}

export function renderOutreachBody(
  template: string,
  contact: Pick<OutreachContact, "name" | "email" | "company">
): string {
  const namePart = contact.name ? ` ${contact.name}` : "";
  return template
    .replaceAll("{{name}}", namePart)
    .replaceAll("{{email}}", contact.email)
    .replaceAll("{{company}}", contact.company || "");
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
