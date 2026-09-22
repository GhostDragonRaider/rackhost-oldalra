import type { AuditCategoryId, AuditSeverity } from "./types";

/**
 * Central scoring configuration for Website Audit.
 * Keep all weights / penalties here — no magic numbers in check modules.
 */

/** Category contribution to overall 0–100 score (must sum conceptually; normalized at runtime). */
export const CATEGORY_WEIGHTS: Record<AuditCategoryId, number> = {
  availability: 20,
  security: 18,
  seo: 18,
  content: 12,
  performance: 12,
  accessibility: 12,
  best_practices: 8,
};

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
  performance: 3,
  accessibility: 4,
  content: 5,
  best_practices: 6,
};

export const SCORE_BANDS = [
  { min: 90, label: "Kiváló" },
  { min: 75, label: "Jó" },
  { min: 55, label: "Közepes" },
  { min: 35, label: "Gyenge" },
  { min: 0, label: "Kritikus" },
] as const;

export function scoreBandLabel(score: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  for (const band of SCORE_BANDS) {
    if (clamped >= band.min) return band.label;
  }
  return "Kritikus";
}

export function categoryStatusFromScore(
  score: number
): "good" | "ok" | "warn" | "bad" {
  if (score >= 85) return "good";
  if (score >= 70) return "ok";
  if (score >= 50) return "warn";
  return "bad";
}
