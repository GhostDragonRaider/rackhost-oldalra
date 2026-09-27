import crypto from "crypto";
import fs from "fs";
import path from "path";

export type LabFormFieldType =
  | "text"
  | "email"
  | "textarea"
  | "select"
  | "checkbox";

export type LabFormField = {
  id: string;
  label: string;
  type: LabFormFieldType;
  required?: boolean;
  options?: string[];
  showIf?: { fieldId: string; equals: string | boolean | number };
};

export type LabFormDefinition = {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  fields: LabFormField[];
};

export type LabFormSubmission = {
  id: string;
  formId: string;
  name: string;
  email: string;
  service: string;
  message: string;
  answers: Record<string, string | boolean | number>;
  status: "new" | "contacted" | "archived";
  source: string;
  createdAt: string;
  updatedAt: string;
};

type FormsFile = { forms: LabFormDefinition[] };
type LeadsFile = { leads: LabFormSubmission[] };

const DATA_DIR = path.join(process.cwd(), "data");
const FORMS_FILE = path.join(DATA_DIR, "lab-forms.json");
const LEADS_FILE = path.join(DATA_DIR, "lab-leads.json");

const FIELD_TYPES = new Set<LabFormFieldType>([
  "text",
  "email",
  "textarea",
  "select",
  "checkbox",
]);

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function writeJson(file: string, data: unknown) {
  ensureDir();
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, file);
}

function readFormsFile(): FormsFile {
  ensureDir();
  if (!fs.existsSync(FORMS_FILE)) {
    const empty: FormsFile = { forms: [] };
    writeJson(FORMS_FILE, empty);
    return empty;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(FORMS_FILE, "utf8")) as FormsFile;
    if (!parsed || !Array.isArray(parsed.forms)) return { forms: [] };
    return parsed;
  } catch {
    return { forms: [] };
  }
}

function readLeadsFile(): LeadsFile {
  ensureDir();
  if (!fs.existsSync(LEADS_FILE)) {
    const empty: LeadsFile = { leads: [] };
    writeJson(LEADS_FILE, empty);
    return empty;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(LEADS_FILE, "utf8")) as LeadsFile;
    if (!parsed || !Array.isArray(parsed.leads)) return { leads: [] };
    return parsed;
  } catch {
    return { leads: [] };
  }
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${crypto
    .randomBytes(3)
    .toString("hex")}`;
}

function slugify(raw: string): string {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function isFieldVisible(
  field: LabFormField,
  answers: Record<string, string | boolean | number | undefined>
): boolean {
  if (!field.showIf) return true;
  const current = answers[field.showIf.fieldId];
  return current === field.showIf.equals;
}

export function listLabForms(): LabFormDefinition[] {
  return [...readFormsFile().forms].sort((a, b) =>
    a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0
  );
}

export function getLabForm(id: string): LabFormDefinition | null {
  return readFormsFile().forms.find((f) => f.id === id) || null;
}

function sanitizeField(raw: Partial<LabFormField>, index: number): LabFormField | null {
  const type = String(raw.type || "text") as LabFormFieldType;
  if (!FIELD_TYPES.has(type)) return null;
  const label = String(raw.label || "").trim().slice(0, 120);
  if (!label) return null;
  const id =
    slugify(String(raw.id || label)) || `field_${index + 1}`;
  const field: LabFormField = {
    id,
    label,
    type,
  };
  if (raw.required) field.required = true;
  if (type === "select") {
    const options = Array.isArray(raw.options)
      ? raw.options.map((o) => String(o).trim()).filter(Boolean).slice(0, 40)
      : [];
    field.options = options.length ? options : ["Egyéb"];
  }
  if (
    raw.showIf &&
    typeof raw.showIf === "object" &&
    String(raw.showIf.fieldId || "").trim()
  ) {
    field.showIf = {
      fieldId: String(raw.showIf.fieldId).trim().slice(0, 64),
      equals:
        typeof raw.showIf.equals === "boolean" ||
        typeof raw.showIf.equals === "number"
          ? raw.showIf.equals
          : String(raw.showIf.equals ?? "").slice(0, 120),
    };
  }
  return field;
}

export function saveLabForm(input: {
  id?: string;
  name?: string;
  description?: string;
  fields?: Partial<LabFormField>[];
}): LabFormDefinition {
  const store = readFormsFile();
  const name = String(input.name || "").trim().slice(0, 120);
  if (name.length < 2) {
    throw new Error("Az űrlap neve legalább 2 karakter legyen.");
  }
  const description = String(input.description || "").trim().slice(0, 500);
  const fields = (input.fields || [])
    .map((f, i) => sanitizeField(f, i))
    .filter((f): f is LabFormField => Boolean(f))
    .slice(0, 40);

  if (!fields.length) {
    throw new Error("Legalább egy mező kell az űrlaphoz.");
  }

  const ids = new Set<string>();
  for (const f of fields) {
    if (ids.has(f.id)) {
      throw new Error(`Duplikált mezőazonosító: ${f.id}`);
    }
    ids.add(f.id);
  }

  const now = new Date().toISOString();
  const existingId = String(input.id || "").trim();
  const idx = existingId
    ? store.forms.findIndex((f) => f.id === existingId)
    : -1;

  const form: LabFormDefinition = {
    id:
      idx >= 0
        ? store.forms[idx].id
        : slugify(existingId) || slugify(name) || newId("form"),
    name,
    description,
    updatedAt: now,
    fields,
  };

  if (idx >= 0) {
    store.forms[idx] = form;
  } else {
    if (store.forms.some((f) => f.id === form.id)) {
      form.id = newId("form");
    }
    store.forms.unshift(form);
  }

  writeJson(FORMS_FILE, store);
  return form;
}

export function deleteLabForm(id: string): boolean {
  const store = readFormsFile();
  const next = store.forms.filter((f) => f.id !== id);
  if (next.length === store.forms.length) return false;
  writeJson(FORMS_FILE, { forms: next });
  return true;
}

export function listLabFormSubmissions(formId?: string): LabFormSubmission[] {
  const leads = readLeadsFile().leads;
  const filtered = formId
    ? leads.filter((l) => l.formId === formId || (!l.formId && formId === "contact-flow"))
    : leads;
  return [...filtered].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0
  );
}

export function submitLabForm(
  formId: string,
  answers: Record<string, string | boolean | number | undefined>,
  source = "lab-preview"
): LabFormSubmission {
  const form = getLabForm(formId);
  if (!form) throw new Error("Nincs ilyen űrlap.");

  const visible = form.fields.filter((f) => isFieldVisible(f, answers));
  const cleaned: Record<string, string | boolean | number> = {};

  for (const field of visible) {
    const raw = answers[field.id];
    if (field.type === "checkbox") {
      cleaned[field.id] = Boolean(raw);
      continue;
    }
    const value =
      typeof raw === "boolean" || typeof raw === "number"
        ? String(raw)
        : String(raw ?? "").trim();
    if (field.required && !value) {
      throw new Error(`A(z) „${field.label}” mező kötelező.`);
    }
    if (field.type === "email" && value) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value.length > 254) {
        throw new Error("Érvényes e-mail címet adj meg.");
      }
    }
    if (field.type === "select" && value && field.options?.length) {
      if (!field.options.includes(value)) {
        throw new Error(`Érvénytelen érték: ${field.label}`);
      }
    }
    if (value) cleaned[field.id] = value.slice(0, 2000);
  }

  const now = new Date().toISOString();
  const submission: LabFormSubmission = {
    id: newId("lead"),
    formId: form.id,
    name: String(cleaned.name || "").slice(0, 100),
    email: String(cleaned.email || "").slice(0, 254),
    service: String(cleaned.service || "").slice(0, 120),
    message: String(cleaned.message || "").slice(0, 2000),
    answers: cleaned,
    status: "new",
    source,
    createdAt: now,
    updatedAt: now,
  };

  const store = readLeadsFile();
  store.leads.unshift(submission);
  if (store.leads.length > 500) store.leads = store.leads.slice(0, 500);
  writeJson(LEADS_FILE, store);
  return submission;
}

export function updateLabSubmissionStatus(
  id: string,
  status: LabFormSubmission["status"]
): LabFormSubmission | null {
  const store = readLeadsFile();
  const idx = store.leads.findIndex((l) => l.id === id);
  if (idx < 0) return null;
  store.leads[idx] = {
    ...store.leads[idx],
    status,
    updatedAt: new Date().toISOString(),
  };
  writeJson(LEADS_FILE, store);
  return store.leads[idx];
}
