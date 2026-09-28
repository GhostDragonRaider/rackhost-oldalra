/**
 * Authorized Security Assessment — Lab architecture stub.
 *
 * PUBLIC path must NEVER call startAuthorizedAssessment without
 * verified written authorization. This module only defines the workflow
 * shape and persistence for future Lab UI.
 *
 * Does NOT implement exploits, brute-force, injection, or DoS.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

export type AuthorizedAssessmentStatus =
  | "draft_quote"
  | "awaiting_scope"
  | "awaiting_written_permission"
  | "permission_verified"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "skipped_out_of_scope";

export type AuthorizedAssessment = {
  id: string;
  createdAt: string;
  updatedAt: string;
  clientName: string;
  targetHosts: string[];
  scopeNotes: string;
  /** Path or reference to written permission artifact (never auto-fetched). */
  permissionRef: string | null;
  permissionVerifiedAt: string | null;
  status: AuthorizedAssessmentStatus;
  linkedPublicAuditId: string | null;
  outOfScopeTargets: string[];
  notes: string;
};

type Store = { assessments: AuthorizedAssessment[] };

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "lab-authorized-assessments.json");

function load(): Store {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) {
    const empty: Store = { assessments: [] };
    fs.writeFileSync(FILE, JSON.stringify(empty, null, 2), "utf8");
    return empty;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(FILE, "utf8")) as Store;
    return { assessments: Array.isArray(parsed.assessments) ? parsed.assessments : [] };
  } catch {
    return { assessments: [] };
  }
}

function save(store: Store) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2), "utf8");
  fs.renameSync(tmp, FILE);
}

export function listAuthorizedAssessments(): AuthorizedAssessment[] {
  return load().assessments;
}

export function createAuthorizedAssessmentDraft(input: {
  clientName: string;
  targetHosts: string[];
  scopeNotes?: string;
  linkedPublicAuditId?: string | null;
}): AuthorizedAssessment {
  const now = new Date().toISOString();
  const row: AuthorizedAssessment = {
    id: `asa_${crypto.randomBytes(6).toString("hex")}`,
    createdAt: now,
    updatedAt: now,
    clientName: input.clientName.trim() || "Ismeretlen ügyfél",
    targetHosts: input.targetHosts.map((h) => h.trim()).filter(Boolean),
    scopeNotes: input.scopeNotes?.trim() || "",
    permissionRef: null,
    permissionVerifiedAt: null,
    status: "draft_quote",
    linkedPublicAuditId: input.linkedPublicAuditId || null,
    outOfScopeTargets: [],
    notes:
      "Workflow: Árajánlat → scope → írásos engedély → ellenőrzés → assessment → findings → report. Aktív exploit NINCS implementálva.",
  };
  const store = load();
  store.assessments.unshift(row);
  save(store);
  return row;
}

/**
 * Mark a target as skipped because it is outside the signed scope.
 * Never runs any scan.
 */
export function skipOutOfScopeTarget(
  id: string,
  host: string
): AuthorizedAssessment | null {
  const store = load();
  const row = store.assessments.find((a) => a.id === id);
  if (!row) return null;
  if (!row.outOfScopeTargets.includes(host)) {
    row.outOfScopeTargets.push(host);
  }
  row.updatedAt = new Date().toISOString();
  row.notes = `${row.notes}\nSKIPPED out-of-scope: ${host}`.trim();
  save(store);
  return row;
}

/**
 * Intentionally does NOT start any active assessment.
 * Returns a blocked result until permission is verified in Lab by a human.
 */
export function startAuthorizedAssessment(id: string): {
  ok: false;
  status: "blocked";
  reason: string;
} {
  const row = load().assessments.find((a) => a.id === id);
  if (!row) {
    return {
      ok: false,
      status: "blocked",
      reason: "Ismeretlen assessment.",
    };
  }
  if (!row.permissionVerifiedAt || row.status !== "permission_verified") {
    return {
      ok: false,
      status: "blocked",
      reason:
        "Írásos engedély nincs ellenőrizve. Aktív assessment nem indítható automatikusan.",
    };
  }
  return {
    ok: false,
    status: "blocked",
    reason:
      "Az aktív assessment motor még nincs bekapcsolva ebben a verzióban (architektúra stub). Exploit / intruzív tesztek szándékosan hiányoznak.",
  };
}

export const AUTHORIZED_ASSESSMENT_WORKFLOW = [
  "Árajánlat",
  "Scope rögzítése",
  "Írásos engedély",
  "Engedély ellenőrzése (ember)",
  "Authorized assessment (jövőbeli motor)",
  "Findings",
  "Report",
] as const;
