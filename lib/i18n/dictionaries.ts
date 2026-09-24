import { hu } from "./hu";
import { en } from "./en";
import { de } from "./de";
import type { Dictionary, Locale } from "./types";

export const LOCALES: Locale[] = ["hu", "en", "de"];

export const dictionaries: Record<Locale, Dictionary> = { hu, en, de };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? hu;
}
