/**
 * Akciós ajánlatok store — admin szabályozás + előnézet.
 */

import fs from "fs";
import path from "path";
import {
  PROMO_CATALOG,
  PROMO_GROUP_DEFAULT_PERCENT,
  type PromoGroupId,
} from "./promos-catalog";

export type PromoOffer = {
  serviceId: string;
  enabled: boolean;
  /** Per-service discount; 0 = no promo */
  discountPercent: number;
  tiers: {
    start: boolean;
    standard: boolean;
    complex: boolean;
  };
};

export type PromosState = {
  active: boolean;
  badge: string;
  headline: string;
  note: string;
  offers: PromoOffer[];
  updatedAt: string | null;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "promos.json");

function defaultOfferFor(
  serviceId: string,
  groupId: PromoGroupId
): PromoOffer {
  const percent = PROMO_GROUP_DEFAULT_PERCENT[groupId];
  const enabled = percent > 0;
  return {
    serviceId,
    enabled,
    discountPercent: percent,
    tiers: {
      start: enabled,
      standard: enabled,
      complex: enabled,
    },
  };
}

function defaultOffers(): PromoOffer[] {
  return PROMO_CATALOG.map((item) =>
    defaultOfferFor(item.id, item.groupId)
  );
}

function emptyState(): PromosState {
  return {
    active: true,
    badge: "Akció",
    headline: "Aktuális kedvezmények",
    note: "Az akciós ár a választott keretre vonatkozik. Az ajánlat írásos egyeztetés után érvényes.",
    offers: defaultOffers(),
    updatedAt: null,
  };
}

function normalizeOffer(
  serviceId: string,
  groupId: PromoGroupId,
  existing?: Partial<PromoOffer>
): PromoOffer {
  const fallback = defaultOfferFor(serviceId, groupId);
  if (!existing) return fallback;

  const rawPct = Number(existing.discountPercent);
  const discountPercent = Number.isFinite(rawPct)
    ? Math.max(0, Math.min(90, Math.round(rawPct)))
    : fallback.discountPercent;

  return {
    serviceId,
    enabled: Boolean(existing.enabled) && discountPercent > 0,
    discountPercent,
    tiers: {
      start: Boolean(existing.tiers?.start ?? fallback.tiers.start),
      standard: Boolean(existing.tiers?.standard ?? fallback.tiers.standard),
      complex: Boolean(existing.tiers?.complex ?? fallback.tiers.complex),
    },
  };
}

function ensureState(): PromosState {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    const empty = emptyState();
    fs.writeFileSync(DATA_FILE, JSON.stringify(empty, null, 2), "utf8");
    return empty;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as PromosState & {
      discountPercent?: number;
    };
    const base = emptyState();
    const byId = new Map(
      (Array.isArray(parsed.offers) ? parsed.offers : []).map((o) => [
        o.serviceId,
        o,
      ])
    );

    // Migrate old global discountPercent onto offers lacking per-service value
    const legacyGlobal = Number(parsed.discountPercent);

    return {
      ...base,
      badge: String(parsed.badge || base.badge).trim().slice(0, 24) || base.badge,
      headline: String(parsed.headline || base.headline).trim().slice(0, 120),
      note: String(parsed.note || base.note).trim().slice(0, 400),
      active: Boolean(parsed.active),
      offers: PROMO_CATALOG.map((item) => {
        const existing = byId.get(item.id);
        if (!existing) return defaultOfferFor(item.id, item.groupId);
        const withLegacy =
          existing.discountPercent == null && Number.isFinite(legacyGlobal)
            ? { ...existing, discountPercent: legacyGlobal }
            : existing;
        return normalizeOffer(item.id, item.groupId, withLegacy);
      }),
      updatedAt: parsed.updatedAt || null,
    };
  } catch {
    return emptyState();
  }
}

function writeState(state: PromosState) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2), "utf8");
  fs.renameSync(tmp, DATA_FILE);
}

export function getPromosState(): PromosState {
  return ensureState();
}

/** Reset to group defaults: websites 25%, custom 10%, support none. */
export function resetPromosToGroupDefaults(): PromosState {
  const next = emptyState();
  next.updatedAt = new Date().toISOString();
  writeState(next);
  return next;
}

export function updatePromosState(
  patch: Partial<{
    active: boolean;
    badge: string;
    headline: string;
    note: string;
    offers: PromoOffer[];
  }>
): PromosState {
  const current = ensureState();
  const next: PromosState = {
    ...current,
    updatedAt: new Date().toISOString(),
  };

  if (typeof patch.active === "boolean") next.active = patch.active;
  if (patch.badge != null) {
    const badge = String(patch.badge).trim().slice(0, 24);
    if (!badge) throw new Error("Az akciós jelvény szövege nem lehet üres.");
    next.badge = badge;
  }
  if (patch.headline != null) {
    next.headline = String(patch.headline).trim().slice(0, 120);
  }
  if (patch.note != null) {
    next.note = String(patch.note).trim().slice(0, 400);
  }
  if (Array.isArray(patch.offers)) {
    const byId = new Map(patch.offers.map((o) => [o.serviceId, o]));
    next.offers = PROMO_CATALOG.map((item) => {
      const incoming = byId.get(item.id);
      return normalizeOffer(item.id, item.groupId, incoming || undefined);
    });
  }

  writeState(next);
  return next;
}
