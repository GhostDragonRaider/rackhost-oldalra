import type { CvLocale } from "./types";

export function formatCvPeriod(
  start: string,
  end: string,
  locale: CvLocale
): string {
  const sep = locale === "hu" ? " – " : " – ";
  return `${start}${sep}${end}`;
}
