import type { MeasuredValue } from "./integrity";

export type LabModuleStatus =
  | "idea"
  | "prototype"
  | "development"
  | "testing"
  | "ready_for_production"
  | "live"
  | "archived";

export type LabCategoryId =
  | "overview"
  | "monitor"
  | "favorites"
  | "recent"
  | "action-center"
  | "website-tools"
  | "seo-lab"
  | "security-center"
  | "performance"
  | "vps-monitor"
  | "calculators"
  | "forms-flows"
  | "client-hub"
  | "care-monitor"
  | "social-hub"
  | "content"
  | "analytics"
  | "leads-crm"
  | "automation"
  | "ai-tools"
  | "design-system"
  | "experiments"
  | "testing-qa"
  | "debug"
  | "logs"
  | "integrations"
  | "settings";

export type LabModuleFlags = {
  enabled: boolean;
  public: boolean;
  adminOnly: boolean;
  beta: boolean;
  maintenanceMode: boolean;
};

export type LabModuleMeta = {
  id: string;
  name: string;
  nameHu: string;
  category: LabCategoryId;
  version: string;
  status: LabModuleStatus;
  description: string;
  href: string;
  flags: LabModuleFlags;
  changelog: string[];
  testStatus: "pass" | "fail" | "pending" | "n/a";
  securityStatus: "pass" | "fail" | "pending" | "n/a";
  performanceStatus: "pass" | "fail" | "pending" | "n/a";
  createdAt: string;
  updatedAt: string;
  /** If true, module UI is fully interactive; otherwise setup/unavailable shell */
  implemented: boolean;
  requiresExternalCreds?: string[];
};

export type LabActionPriority =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "info";

export type LabActionItem = {
  id: string;
  title: string;
  detail: string;
  priority: LabActionPriority;
  category: string;
  moduleId: string | null;
  createdAt: string;
  acknowledged: boolean;
  href: string | null;
  source: string;
  provenance: MeasuredValue<unknown>["provenance"];
};

export type LabFlagsState = {
  killSwitch: boolean;
  updatedAt: string;
  /** Per-module flag overrides keyed by module id */
  modules: Record<string, Partial<LabModuleFlags>>;
  favorites: string[];
  recent: string[];
  dashboard: {
    hiddenWidgets: string[];
    widgetOrder: string[];
  };
};

export type LabCommandItem = {
  id: string;
  label: string;
  keywords: string[];
  href?: string;
  action?: "kill-switch-on" | "kill-switch-off" | "refresh";
  group: string;
};
