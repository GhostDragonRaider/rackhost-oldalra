import fs from "fs";
import path from "path";
import type { LabFlagsState, LabModuleFlags, LabModuleMeta } from "./types";
import { getLabModule, LAB_MODULES } from "./registry";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "lab-flags.json");

const DEFAULT_STATE: LabFlagsState = {
  killSwitch: false,
  updatedAt: new Date(0).toISOString(),
  modules: {},
  favorites: [],
  recent: [],
  dashboard: {
    hiddenWidgets: [],
    widgetOrder: [
      "system",
      "security",
      "seo",
      "vps",
      "actions",
      "audits",
      "favorites",
      "recent",
    ],
  },
};

function ensureState(): LabFlagsState {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    writeState(DEFAULT_STATE);
    return { ...DEFAULT_STATE };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as LabFlagsState;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      modules: parsed.modules || {},
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      recent: Array.isArray(parsed.recent) ? parsed.recent : [],
      dashboard: {
        ...DEFAULT_STATE.dashboard,
        ...(parsed.dashboard || {}),
      },
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function writeState(state: LabFlagsState) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2), "utf8");
  fs.renameSync(tmp, DATA_FILE);
}

export function getLabFlagsState(): LabFlagsState {
  return ensureState();
}

export function setLabKillSwitch(on: boolean): LabFlagsState {
  const state = ensureState();
  state.killSwitch = on;
  state.updatedAt = new Date().toISOString();
  writeState(state);
  return state;
}

export function patchModuleFlags(
  moduleId: string,
  patch: Partial<LabModuleFlags>
): LabFlagsState {
  if (!getLabModule(moduleId)) {
    throw new Error(`Ismeretlen Lab modul: ${moduleId}`);
  }
  const state = ensureState();
  state.modules[moduleId] = { ...(state.modules[moduleId] || {}), ...patch };
  state.updatedAt = new Date().toISOString();
  writeState(state);
  return state;
}

export function resolveModuleFlags(module: LabModuleMeta): LabModuleFlags {
  const state = ensureState();
  const override = state.modules[module.id] || {};
  const merged: LabModuleFlags = { ...module.flags, ...override };
  if (state.killSwitch) {
    // Kill switch disables experimental / non-core modules
    if (module.id !== "overview" && module.id !== "settings") {
      merged.enabled = false;
      merged.maintenanceMode = true;
    }
  }
  return merged;
}

export function listResolvedModules(): Array<
  LabModuleMeta & { resolvedFlags: LabModuleFlags; effectivelyAvailable: boolean }
> {
  const state = ensureState();
  return LAB_MODULES.map((m) => {
    const resolvedFlags = resolveModuleFlags(m);
    const effectivelyAvailable =
      resolvedFlags.enabled &&
      !resolvedFlags.maintenanceMode &&
      (!state.killSwitch || m.id === "overview" || m.id === "settings");
    return { ...m, resolvedFlags, effectivelyAvailable };
  });
}

export function touchRecent(moduleId: string): LabFlagsState {
  const state = ensureState();
  state.recent = [moduleId, ...state.recent.filter((id) => id !== moduleId)].slice(
    0,
    12
  );
  state.updatedAt = new Date().toISOString();
  writeState(state);
  return state;
}

export function toggleFavorite(moduleId: string): LabFlagsState {
  const state = ensureState();
  if (state.favorites.includes(moduleId)) {
    state.favorites = state.favorites.filter((id) => id !== moduleId);
  } else {
    state.favorites = [...state.favorites, moduleId];
  }
  state.updatedAt = new Date().toISOString();
  writeState(state);
  return state;
}

export function patchDashboard(partial: Partial<LabFlagsState["dashboard"]>) {
  const state = ensureState();
  state.dashboard = { ...state.dashboard, ...partial };
  state.updatedAt = new Date().toISOString();
  writeState(state);
  return state;
}

export function isLabKillSwitchOn(): boolean {
  return ensureState().killSwitch;
}
