import { newLabId, readJsonFile, writeJsonFile } from "./json-file-store";

export type LabContentItem = {
  id: string;
  title: string;
  slug: string;
  body: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  updatedAt: string;
  createdAt: string;
};

type Store = { items: LabContentItem[] };
const FILE = "lab-content.json";

function load(): Store {
  const s = readJsonFile<Store>(FILE, { items: [] });
  return { items: Array.isArray(s.items) ? s.items : [] };
}

export function listContentItems(): LabContentItem[] {
  return load().items;
}

export function upsertContentItem(input: {
  id?: string;
  title: string;
  slug: string;
  body: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}): LabContentItem {
  const store = load();
  const now = new Date().toISOString();
  const slug = input.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-|-$/g, "");
  if (input.id) {
    const idx = store.items.findIndex((i) => i.id === input.id);
    if (idx >= 0) {
      store.items[idx] = {
        ...store.items[idx],
        title: input.title.trim(),
        slug: slug || store.items[idx].slug,
        body: input.body,
        utmSource: input.utmSource?.trim() || undefined,
        utmMedium: input.utmMedium?.trim() || undefined,
        utmCampaign: input.utmCampaign?.trim() || undefined,
        updatedAt: now,
      };
      writeJsonFile(FILE, store);
      return store.items[idx];
    }
  }
  const item: LabContentItem = {
    id: newLabId("content"),
    title: input.title.trim(),
    slug: slug || newLabId("slug"),
    body: input.body,
    utmSource: input.utmSource?.trim() || undefined,
    utmMedium: input.utmMedium?.trim() || undefined,
    utmCampaign: input.utmCampaign?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };
  store.items.unshift(item);
  writeJsonFile(FILE, store);
  return item;
}

export function buildUtmUrl(
  baseUrl: string,
  item: Pick<LabContentItem, "utmSource" | "utmMedium" | "utmCampaign" | "slug">
): string {
  try {
    const u = new URL(baseUrl);
    if (item.utmSource) u.searchParams.set("utm_source", item.utmSource);
    if (item.utmMedium) u.searchParams.set("utm_medium", item.utmMedium);
    if (item.utmCampaign) u.searchParams.set("utm_campaign", item.utmCampaign);
    else if (item.slug) u.searchParams.set("utm_campaign", item.slug);
    return u.toString();
  } catch {
    return baseUrl;
  }
}

export function deleteContentItem(id: string): boolean {
  const store = load();
  const next = store.items.filter((i) => i.id !== id);
  if (next.length === store.items.length) return false;
  writeJsonFile(FILE, { items: next });
  return true;
}
