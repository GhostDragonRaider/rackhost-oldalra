/**
 * Akciós ajánlatok store — admin szabályozás + előnézet.
 */

import fs from "fs";
import path from "path";
import { PROMO_CATALOG } from "./promos-catalog";

export type PromoOffer = {
  serviceId: string;
  enabled: boolean;
  /** Which price columns get the promo mark */
  tiers: {
    start: boolean;
    standard: boolean;
    complex: boolean;
  };
};

export type PromosState = {
  /** Master switch — if false, no public promo marks */
  active: boolean;
  badge: string;
  discountPercent: number;
  headline: string;
  note: string;
  offers: PromoOffer[];
  updatedAt: string | null;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "promos.json");

function defaultOffers(): PromoOffer[] {
  return PROMO_CATALOG.map((item, index) => ({
    serviceId: item.id,
    enabled: index === 0 || index === 1,
    tiers: {
      start: true,
      standard: true,
      complex: false,
    },
  }));
}

function emptyState(): PromosState {
  return {
    active: true,
    badge: "Akció",
    discountPercent: 15,
    headline: "Tavaszi induló kedvezmény",
    note: "Az akciós ár a választott keretre vonatkozik. Az ajánlat írásos egyeztetés után érvényes.",
    offers: defaultOffers(),
    updatedAt: null,
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
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as PromosState;
    const base = emptyState();
    const byId = new Map(
      (Array.isArray(parsed.offers) ? parsed.offers : []).map((o) => [
        o.serviceId,
        o,
      ])
    );
    return {
      ...base,
      ...parsed,
      badge: String(parsed.badge || base.badge).trim().slice(0, 24) || base.badge,
      discountPercent: Number.isFinite(Number(parsed.discountPercent))
        ? Math.max(1, Math.min(90, Math.round(Number(parsed.discountPercent))))
        : base.discountPercent,
      headline: String(parsed.headline || base.headline).trim().slice(0, 120),
      note: String(parsed.note || base.note).trim().slice(0, 400),
      active: Boolean(parsed.active),
      offers: base.offers.map((offer) => {
        const existing = byId.get(offer.serviceId);
        if (!existing) return offer;
        return {
          serviceId: offer.serviceId,
          enabled: Boolean(existing.enabled),
          tiers: {
            start: Boolean(existing.tiers?.start),
            standard: Boolean(existing.tiers?.standard),
            complex: Boolean(existing.tiers?.complex),
          },
        };
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

export function updatePromosState(
  patch: Partial<{
    active: boolean;
    badge: string;
    discountPercent: number;
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
  if (patch.discountPercent != null) {
    const pct = Number(patch.discountPercent);
    if (!Number.isFinite(pct) || pct < 1 || pct > 90) {
      throw new Error("A kedvezmény 1–90% között legyen.");
    }
    next.discountPercent = Math.round(pct);
  }
  if (patch.headline != null) {
    next.headline = String(patch.headline).trim().slice(0, 120);
  }
  if (patch.note != null) {
    next.note = String(patch.note).trim().slice(0, 400);
  }
  if (Array.isArray(patch.offers)) {
    const byId = new Map(patch.offers.map((o) => [o.serviceId, o]));
    next.offers = current.offers.map((offer) => {
      const incoming = byId.get(offer.serviceId);
      if (!incoming) return offer;
      return {
        serviceId: offer.serviceId,
        enabled: Boolean(incoming.enabled),
        tiers: {
          start: Boolean(incoming.tiers?.start),
          standard: Boolean(incoming.tiers?.standard),
          complex: Boolean(incoming.tiers?.complex),
        },
      };
    });
  }

  writeState(next);
  return next;
}
