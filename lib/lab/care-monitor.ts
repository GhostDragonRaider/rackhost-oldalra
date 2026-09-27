import { validateAuditUrlInput } from "../website-audit/ssrf";
import { newLabId, readJsonFile, writeJsonFile } from "./json-file-store";
import type { DataProvenance } from "./integrity";

export type CareTarget = {
  id: string;
  label: string;
  url: string;
  createdAt: string;
  lastCheck?: CareCheckResult;
};

export type CareCheckResult = {
  checkedAt: string;
  ok: boolean;
  statusCode: number | null;
  latencyMs: number | null;
  sslOk: boolean | null;
  error: string | null;
  provenance: DataProvenance;
  source: string;
};

type Store = { targets: CareTarget[] };
const FILE = "lab-care.json";

function load(): Store {
  const s = readJsonFile<Store>(FILE, { targets: [] });
  return { targets: Array.isArray(s.targets) ? s.targets : [] };
}

function save(store: Store) {
  writeJsonFile(FILE, store);
}

export function listCareTargets(): CareTarget[] {
  return load().targets;
}

export function addCareTarget(label: string, url: string): CareTarget | { error: string } {
  const validated = validateAuditUrlInput(url);
  if (validated.ok === false) {
    return { error: validated.error };
  }
  const store = load();
  if (store.targets.some((t) => t.url === validated.normalized)) {
    return { error: "Ez az URL már a listán van." };
  }
  const target: CareTarget = {
    id: newLabId("care"),
    label: label.trim() || validated.url.hostname,
    url: validated.normalized,
    createdAt: new Date().toISOString(),
  };
  store.targets.unshift(target);
  save(store);
  return target;
}

export function removeCareTarget(id: string): boolean {
  const store = load();
  const next = store.targets.filter((t) => t.id !== id);
  if (next.length === store.targets.length) return false;
  save({ targets: next });
  return true;
}

export async function checkCareTarget(id: string): Promise<CareTarget | null> {
  const store = load();
  const target = store.targets.find((t) => t.id === id);
  if (!target) return null;

  const validated = validateAuditUrlInput(target.url);
  if (validated.ok === false) {
    target.lastCheck = {
      checkedAt: new Date().toISOString(),
      ok: false,
      statusCode: null,
      latencyMs: null,
      sslOk: null,
      error: validated.error,
      provenance: "real",
      source: "care-monitor/ssrf-guard",
    };
    save(store);
    return target;
  }

  const started = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(validated.normalized, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "AntiCode-CareMonitor/1.0" },
    });
    clearTimeout(timer);
    const latencyMs = Date.now() - started;
    target.lastCheck = {
      checkedAt: new Date().toISOString(),
      ok: res.status >= 200 && res.status < 400,
      statusCode: res.status,
      latencyMs,
      sslOk: validated.url.protocol === "https:",
      error: null,
      provenance: "real",
      source: "care-monitor/http-get",
    };
  } catch (e) {
    target.lastCheck = {
      checkedAt: new Date().toISOString(),
      ok: false,
      statusCode: null,
      latencyMs: Date.now() - started,
      sslOk: validated.url.protocol === "https:" ? null : false,
      error: e instanceof Error ? e.message : "Ellenőrzés sikertelen",
      provenance: "real",
      source: "care-monitor/http-get",
    };
  }
  save(store);
  return target;
}

export async function checkAllCareTargets(): Promise<CareTarget[]> {
  const ids = load().targets.map((t) => t.id);
  for (const id of ids) {
    await checkCareTarget(id);
  }
  return listCareTargets();
}
