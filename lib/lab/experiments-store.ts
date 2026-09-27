import { newLabId, readJsonFile, writeJsonFile } from "./json-file-store";

export type ExperimentStatus = "draft" | "running" | "paused" | "done";

export type LabExperiment = {
  id: string;
  name: string;
  hypothesis: string;
  status: ExperimentStatus;
  variants: Array<{ id: string; label: string; weightPercent: number }>;
  createdAt: string;
  updatedAt: string;
};

type Store = { experiments: LabExperiment[] };
const FILE = "lab-experiments.json";

function load(): Store {
  const s = readJsonFile<Store>(FILE, { experiments: [] });
  if (!Array.isArray(s.experiments) || !s.experiments.length) {
    const seeded: Store = {
      experiments: [
        {
          id: "exp_cta_copy",
          name: "CTA szöveg A/B",
          hypothesis: "A „Kérek ajánlatot” több kattintást hoz, mint a „Kapcsolat”.",
          status: "draft",
          variants: [
            { id: "a", label: "Kapcsolat", weightPercent: 50 },
            { id: "b", label: "Kérek ajánlatot", weightPercent: 50 },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };
    writeJsonFile(FILE, seeded);
    return seeded;
  }
  return { experiments: s.experiments };
}

export function listExperiments(): LabExperiment[] {
  return load().experiments;
}

export function upsertExperiment(
  input: Partial<LabExperiment> & { name: string }
): LabExperiment {
  const store = load();
  const now = new Date().toISOString();
  if (input.id) {
    const idx = store.experiments.findIndex((e) => e.id === input.id);
    if (idx >= 0) {
      store.experiments[idx] = {
        ...store.experiments[idx],
        ...input,
        name: input.name.trim(),
        updatedAt: now,
      } as LabExperiment;
      writeJsonFile(FILE, store);
      return store.experiments[idx];
    }
  }
  const exp: LabExperiment = {
    id: newLabId("exp"),
    name: input.name.trim(),
    hypothesis: input.hypothesis?.trim() || "",
    status: input.status || "draft",
    variants: input.variants?.length
      ? input.variants
      : [
          { id: "a", label: "A", weightPercent: 50 },
          { id: "b", label: "B", weightPercent: 50 },
        ],
    createdAt: now,
    updatedAt: now,
  };
  store.experiments.unshift(exp);
  writeJsonFile(FILE, store);
  return exp;
}

export function setExperimentStatus(
  id: string,
  status: ExperimentStatus
): LabExperiment | null {
  const store = load();
  const exp = store.experiments.find((e) => e.id === id);
  if (!exp) return null;
  exp.status = status;
  exp.updatedAt = new Date().toISOString();
  writeJsonFile(FILE, store);
  return exp;
}

/** Deterministic variant pick for a visitor key — Lab sandbox only. */
export function pickExperimentVariant(
  experimentId: string,
  visitorKey: string
): { variantId: string; label: string } | null {
  const exp = load().experiments.find((e) => e.id === experimentId);
  if (!exp || !exp.variants.length) return null;
  let hash = 0;
  const s = `${experimentId}:${visitorKey}`;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  const bucket = hash % 100;
  let acc = 0;
  for (const v of exp.variants) {
    acc += Math.max(0, v.weightPercent);
    if (bucket < acc) return { variantId: v.id, label: v.label };
  }
  const last = exp.variants[exp.variants.length - 1];
  return { variantId: last.id, label: last.label };
}
