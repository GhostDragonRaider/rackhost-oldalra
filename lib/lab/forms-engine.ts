import { newLabId, readJsonFile, writeJsonFile } from "./json-file-store";

export type LabFormField = {
  id: string;
  label: string;
  type: "text" | "email" | "textarea" | "select" | "checkbox";
  required?: boolean;
  options?: string[];
  /** Show this field only when another field equals value */
  showIf?: { fieldId: string; equals: string | boolean };
};

export type LabFormDef = {
  id: string;
  name: string;
  description: string;
  fields: LabFormField[];
  updatedAt: string;
};

type Store = { forms: LabFormDef[] };

const FILE = "lab-forms.json";

function seed(): Store {
  return {
    forms: [
      {
        id: "contact-flow",
        name: "Kapcsolat űrlap (Lab)",
        description:
          "Példa feltételes mezőkre: ha „Webshop”-ot választasz, megjelenik a termékek száma.",
        updatedAt: new Date().toISOString(),
        fields: [
          {
            id: "name",
            label: "Név",
            type: "text",
            required: true,
          },
          {
            id: "email",
            label: "E-mail",
            type: "email",
            required: true,
          },
          {
            id: "service",
            label: "Mit szeretnél?",
            type: "select",
            required: true,
            options: ["Weboldal", "Webshop", "SEO", "Egyéb"],
          },
          {
            id: "products",
            label: "Hány termék lesz a webshopban?",
            type: "text",
            showIf: { fieldId: "service", equals: "Webshop" },
          },
          {
            id: "seoGoal",
            label: "SEO cél (pl. Google első oldal)",
            type: "textarea",
            showIf: { fieldId: "service", equals: "SEO" },
          },
          {
            id: "message",
            label: "Üzenet",
            type: "textarea",
            required: true,
          },
          {
            id: "newsletter",
            label: "Kérek hírlevelet",
            type: "checkbox",
          },
        ],
      },
    ],
  };
}

function load(): Store {
  const store = readJsonFile<Store>(FILE, seed());
  if (!Array.isArray(store.forms) || store.forms.length === 0) return seed();
  return store;
}

export function listLabForms(): LabFormDef[] {
  return load().forms;
}

export function getLabForm(id: string): LabFormDef | undefined {
  return load().forms.find((f) => f.id === id);
}

export function saveLabForm(form: LabFormDef): LabFormDef {
  const store = load();
  const next = { ...form, updatedAt: new Date().toISOString() };
  const idx = store.forms.findIndex((f) => f.id === next.id);
  if (idx >= 0) store.forms[idx] = next;
  else store.forms.unshift(next);
  writeJsonFile(FILE, store);
  return next;
}

export function createLabForm(name: string): LabFormDef {
  const form: LabFormDef = {
    id: newLabId("form"),
    name: name.trim() || "Új űrlap",
    description: "Lab űrlap — feltételes mezőkkel.",
    updatedAt: new Date().toISOString(),
    fields: [
      { id: "title", label: "Cím", type: "text", required: true },
      { id: "notes", label: "Megjegyzés", type: "textarea" },
    ],
  };
  return saveLabForm(form);
}

/** Which fields are visible given current answers (conditional logic). */
export function visibleFormFields(
  form: LabFormDef,
  answers: Record<string, string | boolean>
): LabFormField[] {
  return form.fields.filter((f) => {
    if (!f.showIf) return true;
    const v = answers[f.showIf.fieldId];
    return v === f.showIf.equals;
  });
}
