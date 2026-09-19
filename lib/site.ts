export const SITE_URL = "https://anticode.hu";
export const SITE_EMAIL = "info@anticode.hu";
export const SITE_NAME = "AntiCode";

export const DEFAULT_TITLE =
  "Weboldal készítés vállalkozásoknak | AntiCode";
export const DEFAULT_DESCRIPTION =
  "Üzletszerző weboldal készítés, webshop és egyedi webfejlesztés szolgáltató vállalkozásoknak. Átlátható folyamat, érthető projektkeret — AntiCode.";

export const SERVICE_PATHS = [
  "/weboldal-keszites",
  "/webshop-keszites",
  "/egyedi-webfejlesztes",
  "/weboldal-karbantartas",
  "/arak",
] as const;

export function absoluteUrl(path = "/") {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
