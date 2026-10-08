/** Szolgáltatások, amelyekre akciós ár kapcsolható. */

export type PromoTier = "start" | "standard" | "complex";

export type PromoCatalogItem = {
  id: string;
  name: string;
  detail: string;
  /** Normal display prices (HU) */
  prices: Record<PromoTier, string>;
};

export const PROMO_CATALOG: PromoCatalogItem[] = [
  {
    id: "start-page",
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
    name: "SEO optimalizálás",
    detail: "Technikai audit, meta, szerkezet és javítások",
    prices: {
      start: "39 000 Ft",
      standard: "69 000 Ft",
      complex: "119 000 Ft",
    },
  },
  {
    id: "maintenance",
    name: "Havi karbantartás",
    detail: "Frissítések, mentések és kisebb módosítások",
    prices: {
      start: "15 000 Ft / hó",
      standard: "25 000 Ft / hó",
      complex: "45 000 Ft / hó",
    },
  },
];

/** Parse "129 000 Ft" / "15 000 Ft / hó" → amount + suffix. */
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
  if (amount == null) {
    return { original: label, promo: label, amount: null };
  }
  const pct = Math.max(0, Math.min(90, percent));
  const promoAmount = Math.round(amount * (1 - pct / 100));
  return {
    original: label,
    promo: formatPriceAmount(promoAmount, suffix),
    amount: promoAmount,
  };
}
