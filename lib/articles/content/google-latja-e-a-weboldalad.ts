import { Article } from "../types";

export const articleGoogleLatja: Article = {
  slug: "google-latja-e-a-weboldalad",
  title: "Hogyan ellenőrizd, hogy a Google látja-e a weboldalad? | AntiCode",
  description:
    "Google indexelés ellenőrzése: site: keresés, Search Console, URL Inspection, sitemap, robots.txt, noindex, canonical — és miért nem ugyanaz a helyezés.",
  datePublished: "2026-09-21",
  dateModified: "2026-09-21",
  readingMinutes: 11,
  eyebrow: "SEO",
  h1: "Hogyan ellenőrizd, hogy a Google látja-e a weboldalad?",
  lead:
    "Indexelés ≠ jó helyezés. Először azt kell tudnod: egyáltalán bent van-e az URL a Google indexében. Ehhez elég a site: operátor, a Search Console URL Inspection, és a robots/noindex/canonical ellenőrzése.",
  cardExcerpt:
    "site:domain.hu, Search Console, URL Inspection, sitemap, robots, noindex, canonical — lépésről lépésre. Plusz: miért nem jelent rangsort az, hogy „indexelve”.",
  sections: [
    {
      heading: "1. Gyors ellenőrzés: site: operátor",
      blocks: [
        {
          type: "p",
          text: "A Google keresőbe írd: site:anticode.hu (a saját domaineddel). Ha megjelennek oldalak, van indexelt tartalom. Ha üres: vagy új a domain, vagy tiltás / technikai gond van.",
        },
        {
          type: "note",
          text: "A site: nem hivatalos API és nem teljes lista — iránytű. A pontos státuszhoz Search Console kell.",
        },
      ],
    },
    {
      heading: "2. Google Search Console — URL Inspection",
      blocks: [
        {
          type: "ol",
          items: [
            "Add hozzá a domain vagy URL-prefix property-t",
            "Igazold a tulajdonjogot (DNS / HTML / egyéb)",
            "URL Inspection: add meg a vizsgált URL-t",
            "Nézd: „URL is on Google” / hibák / crawled but not indexed",
          ],
        },
        {
          type: "p",
          text: "Hivatalos útmutató: [Google Search Console — URL Inspection](https://support.google.com/webmasters/answer/9012289).",
        },
      ],
    },
    {
      heading: "3. Sitemap, robots.txt, noindex, canonical",
      blocks: [
        {
          type: "ul",
          items: [
            "Sitemap: be van-e küldve a Search Console-ban, és 200-at ad-e /sitemap.xml?",
            "robots.txt: nem-e Disallow: / az egészre? Van-e Sitemap: sor?",
            "noindex: a publikus oldalak HTML-jében / HTTP headerben nincs-e robots noindex?",
            "Canonical: a kanonikus URL a kívánt publikus cím-e (ne staging, ne paraméteres)?",
          ],
        },
        {
          type: "code",
          caption: "Példa: noindex meta (staginghez — ne a publikus főoldalra)",
          code: `<meta name="robots" content="noindex,nofollow" />`,
        },
      ],
    },
    {
      heading: "Indexelés ≠ helyezés",
      blocks: [
        {
          type: "p",
          text: "Ha az oldal indexelve van, a Google tudja, hogy létezik. Az, hogy a „klímaszerelés Miskolc” kifejezésen hányadik leszel, más kérdés: tartalom, konkurencia, belső linkek, technikai minőség, idő.",
        },
        {
          type: "p",
          text: "Kapcsolódó: [SEO alapok](/tudastar/seo-alapok-uj-weboldalhoz), [technikai SEO](/tudastar/mi-az-a-technikai-seo), szolgáltatás: [/seo-optimalizalas](/seo-optimalizalas).",
        },
      ],
    },
  ],
  relatedArticles: [
    {
      slug: "seo-alapok-uj-weboldalhoz",
      label: "SEO alapok",
    },
    {
      slug: "mi-az-a-technikai-seo",
      label: "Technikai SEO",
    },
    {
      slug: "weboldal-inditas-checklist",
      label: "Élesítés checklist",
    },
  ],
  relatedServices: [
    { href: "/seo-optimalizalas", label: "SEO optimalizálás" },
    { href: "/kapcsolat", label: "Kapcsolat" },
  ],
  closingCta: {
    text: "Ha a Search Console hibát jelez, és nem egyértelmű a ok,",
    href: "/kapcsolat",
    label: "küldd el a jelentést — megnézem →",
  },
};
