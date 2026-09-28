import type { AuditCategoryId, AuditSeverity } from "./types";
import { PUBLIC_CATEGORY_IDS } from "./types";

/**
 * Central scoring configuration for Website Audit.
 * Keep all weights / penalties here — no magic numbers in check modules.
 */

/** Full category weights (admin detail). Public overall uses PUBLIC_CATEGORY_WEIGHTS. */
export const CATEGORY_WEIGHTS: Record<AuditCategoryId, number> = {
  availability: 18,
  security: 16,
  seo: 16,
  content: 12,
  responsive: 16,
  performance: 10,
  accessibility: 8,
  best_practices: 4,
};

/** Weights for the public 5-category overall score (must be > 0 each). */
export const PUBLIC_CATEGORY_WEIGHTS: Record<
  (typeof PUBLIC_CATEGORY_IDS)[number],
  number
> = {
  availability: 22,
  seo: 22,
  security: 20,
  content: 16,
  responsive: 20,
};

export const SCORING_EXPLANATION_HU = [
  "Az összesített pontszám csak a ténylegesen lefuttatott, mérhető ellenőrzésekből készül.",
  "Kategóriák (nyilvános): Technikai állapot 22%, SEO 22%, Biztonsági kitettség 20%, Tartalom 16%, Responsive 20%.",
  "Egy finding levonása súlyosság szerint: kritikus 40, magas 25, közepes 15, alacsony 8, info 3 pont a kategóriából.",
  "UNAVAILABLE / UNKNOWN / N/A finding soha nem számít PASS-nak, és nem ad automatikusan 100 pontot a kategóriának.",
  "Ha egy kategóriában nincs mérhető finding, a kategória „nem mérhető”, és nem kerül be az átlagba 100-ként.",
].join(" ");

/** Points deducted from a category score per finding of that severity. */
export const SEVERITY_PENALTIES: Record<AuditSeverity, number> = {
  critical: 40,
  high: 25,
  medium: 15,
  low: 8,
  info: 3,
  pass: 0,
};

/** Rank for priority fix sorting (lower = fix first). */
export const SEVERITY_RANK: Record<AuditSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
  pass: 5,
};

/** Soft impact hints for tie-breaking within the same severity. */
export const CATEGORY_IMPACT_RANK: Record<AuditCategoryId, number> = {
  availability: 0,
  security: 1,
  seo: 2,
  responsive: 3,
  performance: 4,
  accessibility: 5,
  content: 6,
  best_practices: 7,
};

export const SCORE_BANDS = [
  { min: 90, label: "Kiváló" },
  { min: 75, label: "Jó" },
  { min: 55, label: "Közepes" },
  { min: 35, label: "Gyenge" },
  { min: 0, label: "Kritikus" },
] as const;

export function scoreBandLabel(score: number | null): string {
  if (score == null || Number.isNaN(score)) return "Nem mérhető";
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  for (const band of SCORE_BANDS) {
    if (clamped >= band.min) return band.label;
  }
  return "Kritikus";
}

export function categoryStatusFromScore(
  score: number | null,
  measurable: boolean
): "good" | "ok" | "warn" | "bad" | "unavailable" {
  if (!measurable || score == null) return "unavailable";
  if (score >= 85) return "good";
  if (score >= 70) return "ok";
  if (score >= 50) return "warn";
  return "bad";
}
