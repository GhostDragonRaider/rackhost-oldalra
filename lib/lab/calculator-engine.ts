/**
 * Configurable Calculator Engine — Lab-only.
 * Rules are data-driven; no hardcoded pricing presented as "live quotes".
 */

export type CalculatorFieldType =
  | "number"
  | "select"
  | "multiselect"
  | "boolean"
  | "text";

export type CalculatorField = {
  id: string;
  label: string;
  type: CalculatorFieldType;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  defaultValue?: string | number | boolean | string[];
  showIf?: { fieldId: string; equals: string | boolean | number };
};

export type CalculatorRule = {
  id: string;
  when?: { fieldId: string; equals?: string | number | boolean; gte?: number };
  add?: number;
  multiply?: number;
  label: string;
};

export type CalculatorDefinition = {
  id: string;
  name: string;
  description: string;
  currency: "HUF" | "EUR";
  /** Provenance for all outputs of this calculator */
  resultProvenance: "estimated";
  estimateNote: string;
  fields: CalculatorField[];
  rules: CalculatorRule[];
  baseAmount: number;
};

export type CalculatorAnswers = Record<
  string,
  string | number | boolean | string[] | undefined
>;

export type CalculatorResult = {
  calculatorId: string;
  total: number;
  currency: string;
  lineItems: Array<{ label: string; amount: number }>;
  provenance: "estimated";
  estimateNote: string;
  computedAt: string;
};

export const LAB_CALCULATORS: CalculatorDefinition[] = [
  {
    id: "website-quote",
    name: "Weboldal árkalkulátor",
    description:
      "Belső becslés — NEM hivatalos árajánlat. Az összegek ESTIMATED szabályokból jönnek.",
    currency: "HUF",
    resultProvenance: "estimated",
    estimateNote:
      "Lab szabálymotor becslés; nem szerződéses ár. Admin módosíthatja a szabályokat.",
    baseAmount: 180000,
    fields: [
      {
        id: "pages",
        label: "Oldalszám",
        type: "number",
        min: 1,
        max: 40,
        defaultValue: 5,
        required: true,
      },
      {
        id: "cms",
        label: "Szerkeszthető tartalom (CMS)",
        type: "boolean",
        defaultValue: false,
      },
      {
        id: "complexity",
        label: "Komplexitás",
        type: "select",
        options: [
          { value: "simple", label: "Egyszerű" },
          { value: "standard", label: "Átlagos" },
          { value: "complex", label: "Összetett" },
        ],
        defaultValue: "standard",
      },
    ],
    rules: [
      {
        id: "per-page",
        when: { fieldId: "pages", gte: 1 },
        add: 25000,
        label: "Oldalankénti alap",
      },
      {
        id: "cms",
        when: { fieldId: "cms", equals: true },
        add: 80000,
        label: "CMS",
      },
      {
        id: "complex",
        when: { fieldId: "complexity", equals: "complex" },
        multiply: 1.35,
        label: "Összetett multiplikátor",
      },
      {
        id: "simple",
        when: { fieldId: "complexity", equals: "simple" },
        multiply: 0.9,
        label: "Egyszerű multiplikátor",
      },
    ],
  },
  {
    id: "webshop-quote",
    name: "Webshop kalkulátor",
    description: "Belső becslés termék/katalogus méret alapján (ESTIMATED).",
    currency: "HUF",
    resultProvenance: "estimated",
    estimateNote: "Lab szabálymotor becslés; nem hivatalos webshop árajánlat.",
    baseAmount: 320000,
    fields: [
      {
        id: "products",
        label: "Termékek száma (kb.)",
        type: "number",
        min: 1,
        max: 5000,
        defaultValue: 50,
      },
      {
        id: "payments",
        label: "Online fizetés",
        type: "boolean",
        defaultValue: true,
      },
    ],
    rules: [
      {
        id: "products-tier",
        when: { fieldId: "products", gte: 100 },
        add: 120000,
        label: "100+ termék",
      },
      {
        id: "pay",
        when: { fieldId: "payments", equals: true },
        add: 90000,
        label: "Fizetési integráció",
      },
    ],
  },
];

function matchRule(
  rule: CalculatorRule,
  answers: CalculatorAnswers
): boolean {
  if (!rule.when) return true;
  const v = answers[rule.when.fieldId];
  if (rule.when.equals !== undefined) return v === rule.when.equals;
  if (rule.when.gte !== undefined) {
    return typeof v === "number" && v >= rule.when.gte;
  }
  return false;
}

export function evaluateCalculator(
  def: CalculatorDefinition,
  answers: CalculatorAnswers
): CalculatorResult {
  let total = def.baseAmount;
  const lineItems: Array<{ label: string; amount: number }> = [
    { label: "Alap", amount: def.baseAmount },
  ];

  for (const rule of def.rules) {
    if (!matchRule(rule, answers)) continue;
    if (typeof rule.add === "number") {
      let amount = rule.add;
      // per-page style: multiply add by pages count when field is pages
      if (rule.id === "per-page" && typeof answers.pages === "number") {
        amount = rule.add * answers.pages;
      }
      total += amount;
      lineItems.push({ label: rule.label, amount });
    }
    if (typeof rule.multiply === "number") {
      const before = total;
      total = Math.round(total * rule.multiply);
      lineItems.push({
        label: rule.label,
        amount: total - before,
      });
    }
  }

  return {
    calculatorId: def.id,
    total,
    currency: def.currency,
    lineItems,
    provenance: "estimated",
    estimateNote: def.estimateNote,
    computedAt: new Date().toISOString(),
  };
}

export function getCalculator(id: string): CalculatorDefinition | undefined {
  return LAB_CALCULATORS.find((c) => c.id === id);
}
