export const SITE_URL = "https://anticode.hu";
export const SITE_EMAIL = "info@anticode.hu";
export const SITE_NAME = "AntiCode";

/** Home-only title — must stay distinct from /weboldal-keszites. */
export const HOME_TITLE =
  "AntiCode — Üzletszerző weboldalak és egyedi rendszerek";

export const DEFAULT_TITLE = HOME_TITLE;

export const DEFAULT_DESCRIPTION =
  "Üzletszerző weboldal készítés, webshop és egyedi webfejlesztés szolgáltató vállalkozásoknak. Átlátható folyamat, érthető projektkeret — AntiCode.";

export const DEFAULT_OG_IMAGE_PATH = "/og/default.png";
export const LOGO_PATH = "/logo.png";

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

export function buildTitle(pageTitle: string) {
  const trimmed = pageTitle.trim();
  if (!trimmed) return HOME_TITLE;
  if (trimmed.includes(SITE_NAME)) return trimmed;
  return `${trimmed} | ${SITE_NAME}`;
}

export function defaultOgImage() {
  return absoluteUrl(DEFAULT_OG_IMAGE_PATH);
}

export function faqJsonLd(
  items: readonly { q: string; a: string }[],
  pageUrl?: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(pageUrl ? { url: pageUrl } : {}),
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: SITE_NAME,
    url: SITE_URL,
    email: SITE_EMAIL,
    description: DEFAULT_DESCRIPTION,
    areaServed: "HU",
    image: absoluteUrl(LOGO_PATH),
    logo: absoluteUrl(LOGO_PATH),
    serviceType: [
      "Weboldal készítés",
      "Webshop fejlesztés",
      "Egyedi webes rendszerek",
      "Weboldal karbantartás",
    ],
  };
}

export function breadcrumbJsonLd(
  crumbs: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}
