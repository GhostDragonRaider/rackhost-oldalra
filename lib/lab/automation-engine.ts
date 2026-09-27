import { newLabId, readJsonFile, writeJsonFile } from "./json-file-store";
import { listLabLeads } from "./leads-store";
import { listCareTargets } from "./care-monitor";

export type AutomationTrigger =
  | "lead.created"
  | "care.down"
  | "manual";

export type AutomationAction =
  | { type: "flag_priority"; priority: "high" | "medium" }
  | { type: "note"; text: string };

export type AutomationRule = {
  id: string;
  name: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  /** Simple condition: field path equals value (optional) */
  condition?: { field: string; equals: string };
  actions: AutomationAction[];
  createdAt: string;
  updatedAt: string;
  lastDryRunAt?: string;
  lastDryRunNote?: string;
};

type Store = { rules: AutomationRule[] };
const FILE = "lab-automation.json";

function load(): Store {
  const s = readJsonFile<Store>(FILE, { rules: [] });
  if (!Array.isArray(s.rules) || s.rules.length === 0) {
    const seeded: Store = {
      rules: [
        {
          id: "rule_lead_new",
          name: "Új lead → magas prioritás",
          enabled: true,
          trigger: "lead.created",
          actions: [
            { type: "flag_priority", priority: "high" },
            { type: "note", text: "Írj vissza 24 órán belül." },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "rule_care_down",
          name: "Ügyfél oldal leállt → figyelmeztetés",
          enabled: true,
          trigger: "care.down",
          actions: [
            { type: "flag_priority", priority: "high" },
            { type: "note", text: "Ellenőrizd a Care Monitor eredményét." },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };
    writeJsonFile(FILE, seeded);
    return seeded;
  }
  return { rules: s.rules };
}

export function listAutomationRules(): AutomationRule[] {
  return load().rules;
}

export function saveAutomationRule(
  rule: Omit<AutomationRule, "createdAt" | "updatedAt"> & {
    createdAt?: string;
  }
): AutomationRule {
  const store = load();
  const now = new Date().toISOString();
  const next: AutomationRule = {
    ...rule,
    createdAt: rule.createdAt || now,
    updatedAt: now,
  };
  const idx = store.rules.findIndex((r) => r.id === next.id);
  if (idx >= 0) store.rules[idx] = next;
  else store.rules.unshift(next);
  writeJsonFile(FILE, store);
  return next;
}

export function createAutomationRule(name: string): AutomationRule {
  return saveAutomationRule({
    id: newLabId("rule"),
    name: name.trim() || "Új szabály",
    enabled: true,
    trigger: "manual",
    actions: [{ type: "note", text: "Dry-run jegyzet" }],
  });
}

export function toggleAutomationRule(id: string, enabled: boolean): AutomationRule | null {
  const store = load();
  const rule = store.rules.find((r) => r.id === id);
  if (!rule) return null;
  rule.enabled = enabled;
  rule.updatedAt = new Date().toISOString();
  writeJsonFile(FILE, store);
  return rule;
}

/**
 * Safe dry-run: evaluates against current Lab data, never executes arbitrary code
 * and never sends email / external HTTP.
 */
export function dryRunAutomation(ruleId: string): {
  rule: AutomationRule;
  matched: boolean;
  evidence: string;
  wouldDo: string[];
} | null {
  const store = load();
  const rule = store.rules.find((r) => r.id === ruleId);
  if (!rule) return null;

  let matched = false;
  let evidence = "";

  if (rule.trigger === "lead.created") {
    const leads = listLabLeads().filter((l) => l.status === "new");
    matched = leads.length > 0;
    evidence = matched
      ? `${leads.length} új lead a CRM-ben (pl. ${leads[0].email}).`
      : "Nincs „new” státuszú lead — a szabály most nem futna.";
  } else if (rule.trigger === "care.down") {
    const down = listCareTargets().filter((t) => t.lastCheck && !t.lastCheck.ok);
    matched = down.length > 0;
    evidence = matched
      ? `${down.length} Care célpont hibás (pl. ${down[0].url}).`
      : "Nincs leállt Care célpont (vagy még nem volt ellenőrzés).";
  } else {
    matched = true;
    evidence = "Manuális trigger — dry-run mindig „illeszkedik”.";
  }

  if (rule.condition && matched) {
    // Reserved for future field checks; currently informational only.
    evidence += ` Feltétel: ${rule.condition.field}=${rule.condition.equals}.`;
  }

  const wouldDo = rule.actions.map((a) =>
    a.type === "flag_priority"
      ? `Prioritás jelölés: ${a.priority}`
      : `Jegyzet: ${a.text}`
  );

  rule.lastDryRunAt = new Date().toISOString();
  rule.lastDryRunNote = matched
    ? `Illeszkedik — ${wouldDo.join("; ")}`
    : `Nem illeszkedik — ${evidence}`;
  writeJsonFile(FILE, store);

  return { rule, matched, evidence, wouldDo };
}
