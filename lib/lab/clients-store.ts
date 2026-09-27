import { newLabId, readJsonFile, writeJsonFile } from "./json-file-store";

export type LabProject = {
  id: string;
  name: string;
  status: "lead" | "active" | "paused" | "done";
  url?: string;
  notes?: string;
  updatedAt: string;
};

export type LabClient = {
  id: string;
  name: string;
  email: string;
  company?: string;
  projects: LabProject[];
  createdAt: string;
  updatedAt: string;
};

type Store = { clients: LabClient[] };
const FILE = "lab-clients.json";

function load(): Store {
  const s = readJsonFile<Store>(FILE, { clients: [] });
  return { clients: Array.isArray(s.clients) ? s.clients : [] };
}

function save(store: Store) {
  writeJsonFile(FILE, store);
}

export function listLabClients(): LabClient[] {
  return load().clients;
}

export function upsertLabClient(input: {
  id?: string;
  name: string;
  email: string;
  company?: string;
}): LabClient {
  const store = load();
  const now = new Date().toISOString();
  if (input.id) {
    const idx = store.clients.findIndex((c) => c.id === input.id);
    if (idx >= 0) {
      store.clients[idx] = {
        ...store.clients[idx],
        name: input.name.trim(),
        email: input.email.trim(),
        company: input.company?.trim() || undefined,
        updatedAt: now,
      };
      save(store);
      return store.clients[idx];
    }
  }
  const client: LabClient = {
    id: newLabId("client"),
    name: input.name.trim(),
    email: input.email.trim(),
    company: input.company?.trim() || undefined,
    projects: [],
    createdAt: now,
    updatedAt: now,
  };
  store.clients.unshift(client);
  save(store);
  return client;
}

export function addLabProject(
  clientId: string,
  project: { name: string; status?: LabProject["status"]; url?: string; notes?: string }
): LabClient | null {
  const store = load();
  const client = store.clients.find((c) => c.id === clientId);
  if (!client) return null;
  const now = new Date().toISOString();
  client.projects.push({
    id: newLabId("proj"),
    name: project.name.trim(),
    status: project.status || "lead",
    url: project.url?.trim() || undefined,
    notes: project.notes?.trim() || undefined,
    updatedAt: now,
  });
  client.updatedAt = now;
  save(store);
  return client;
}

export function deleteLabClient(id: string): boolean {
  const store = load();
  const next = store.clients.filter((c) => c.id !== id);
  if (next.length === store.clients.length) return false;
  save({ clients: next });
  return true;
}
