/** Szolgáltatások / árcsoportok az akciós szabályozáshoz. */

export type PromoTier = "start" | "standard" | "complex";

export type PromoGroupId = "websites" | "custom" | "support";

export type PromoCatalogItem = {
  id: string;
  groupId: PromoGroupId;
  name: string;
  detail: string;
  prices: Record<PromoTier, string>;
};

export const PROMO_GROUP_LABELS: Record<PromoGroupId, string> = {
  websites: "Weboldalak és értékesítés",
  custom: "Egyedi funkciók",
  support: "Folyamatos támogatás",
};

/** Default discount by price-table group. */
export const PROMO_GROUP_DEFAULT_PERCENT: Record<PromoGroupId, number> = {
  websites: 25,
  custom: 10,
  support: 0,
};

export const PROMO_CATALOG: PromoCatalogItem[] = [
  {
    id: "start-page",
    groupId: "websites",
    name: "Start oldal",
    detail: "Egyoldalas, fókuszált bemutatkozás",
    prices: {
      start: "99 000 Ft",
      standard: "129 000 Ft",
      complex: "159 000 Ft",
    },
  },
  {
    id: "business-site",
    groupId: "websites",
    name: "Üzleti weboldal",
    detail: "Többoldalas szolgáltatói jelenlét",
    prices: {
      start: "127 000 Ft",
      standard: "178 000 Ft",
      complex: "250 000 Ft",
    },
  },
  {
    id: "redesign",
    groupId: "websites",
    name: "Weboldal megújítás",
    detail: "Tartalom, struktúra és felület újragondolása",
    prices: {
      start: "82 000 Ft",
      standard: "127 000 Ft",
      complex: "191 000 Ft",
    },
  },
  {
    id: "webshop",
    groupId: "websites",
    name: "Webshop",
    detail: "Katalógus, termékek és vásárlási út",
    prices: {
      start: "191 000 Ft",
      standard: "255 000 Ft",
      complex: "351 000 Ft",
    },
  },
  {
    id: "seo",
    groupId: "websites",
    name: "SEO optimalizálás",
    detail: "Technikai audit, meta, szerkezet és javítások",
    prices: {
      start: "39 000 Ft",
      standard: "69 000 Ft",
      complex: "119 000 Ft",
    },
  },
  {
    id: "lead-form",
    groupId: "custom",
    name: "Ajánlatkérő vagy jelentkezési rendszer",
    detail: "Űrlap, fájlfeltöltés, értesítési folyamat",
    prices: {
      start: "49 000 Ft",
      standard: "79 000 Ft",
      complex: "103 000 Ft",
    },
  },
  {
    id: "admin-panel",
    groupId: "custom",
    name: "Védett adminfelület",
    detail: "Belépés, szerepkörök és adatkezelés",
    prices: {
      start: "99 000 Ft",
      standard: "127 000 Ft",
      complex: "199 000 Ft",
    },
  },
  {
    id: "custom-feature",
    groupId: "custom",
    name: "Egyedi funkció vagy integráció",
    detail: "Külső szolgáltatás, automatizmus vagy egyedi logika",
    prices: {
      start: "29 000 Ft",
      standard: "59 000 Ft",
      complex: "Egyedi becslés",
    },
  },
  {
    id: "maintenance",
    groupId: "support",
    name: "Havi karbantartás",
    detail: "Frissítések, mentések és kisebb módosítások",
    prices: {
      start: "15 000 Ft / hó",
      standard: "25 000 Ft / hó",
      complex: "45 000 Ft / hó",
    },
  },
  {
    id: "auto-seo",
    groupId: "support",
    name: "Auto SEO",
    detail: "Napi technikai SEO ellenőrzés + riasztás",
    prices: {
      start: "12 000 Ft / hó",
      standard: "19 000 Ft / hó",
      complex: "29 000 Ft / hó",
    },
  },
  {
    id: "dev-day",
    groupId: "support",
    name: "Tartalmi és technikai fejlesztési nap",
    detail: "Előre egyeztetett fejlesztési feladatokra",
    prices: {
      start: "25 000 Ft",
      standard: "35 000 Ft",
      complex: "50 000 Ft",
    },
  },
];

export function parsePriceLabel(label: string): {
  amount: number | null;
  suffix: string;
} {
  const match = label.match(/^([\d\s]+)\s*Ft(.*)$/u);
  if (!match) return { amount: null, suffix: label };
  const amount = Number(match[1].replace(/\s+/g, ""));
  if (!Number.isFinite(amount)) return { amount: null, suffix: label };
  return { amount, suffix: ` Ft${match[2] || ""}` };
}

export function formatPriceAmount(amount: number, suffix: string): string {
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${formatted}${suffix}`;
}

export function applyDiscount(
  label: string,
  percent: number
): { original: string; promo: string; amount: number | null } {
  const { amount, suffix } = parsePriceLabel(label);
  if (amount == null || percent <= 0) {
    return { original: label, promo: label, amount };
  }
  const pct = Math.max(0, Math.min(90, percent));
  const promoAmount = Math.round(amount * (1 - pct / 100));
  return {
    original: label,
    promo: formatPriceAmount(promoAmount, suffix),
    amount: promoAmount,
  };
}
