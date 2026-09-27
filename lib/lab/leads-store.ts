import { newLabId, readJsonFile, writeJsonFile } from "./json-file-store";

export type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost";

export type LabLead = {
  id: string;
  name: string;
  email: string;
  service: string;
  message: string;
  status: LeadStatus;
  source: string;
  createdAt: string;
  updatedAt: string;
};

type Store = { leads: LabLead[] };
const FILE = "lab-leads.json";
const MAX = 500;

function load(): Store {
  const s = readJsonFile<Store>(FILE, { leads: [] });
  return { leads: Array.isArray(s.leads) ? s.leads : [] };
}

function save(store: Store) {
  store.leads = store.leads.slice(0, MAX);
  writeJsonFile(FILE, store);
}

export function listLabLeads(): LabLead[] {
  return load().leads;
}

export function createLabLead(input: {
  name: string;
  email: string;
  service: string;
  message: string;
  source?: string;
  status?: LeadStatus;
}): LabLead {
  const store = load();
  const now = new Date().toISOString();
  const lead: LabLead = {
    id: newLabId("lead"),
    name: input.name.trim(),
    email: input.email.trim(),
    service: input.service.trim(),
    message: input.message.trim(),
    status: input.status || "new",
    source: input.source || "lab-manual",
    createdAt: now,
    updatedAt: now,
  };
  store.leads.unshift(lead);
  save(store);
  return lead;
}

/** Called from public contact form — never throws to caller. */
export function recordContactLead(input: {
  name: string;
  email: string;
  service: string;
  message: string;
}): void {
  try {
    createLabLead({ ...input, source: "contact-form", status: "new" });
  } catch {
    /* ignore store errors on public path */
  }
}

export function updateLabLeadStatus(
  id: string,
  status: LeadStatus
): LabLead | null {
  const store = load();
  const lead = store.leads.find((l) => l.id === id);
  if (!lead) return null;
  lead.status = status;
  lead.updatedAt = new Date().toISOString();
  save(store);
  return lead;
}
