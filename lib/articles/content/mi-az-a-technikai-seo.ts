import { Article } from "../types";

export const articleTechnikaiSeo: Article = {
  slug: "mi-az-a-technikai-seo",
  title: "Mi az a technikai SEO? | AntiCode",
  description:
    "Technikai SEO közérthetően: HTTP státusz, redirect, canonical, robots, sitemap, structured data, Core Web Vitals, mobil, belső linkek — példákkal.",
  datePublished: "2026-09-21",
  dateModified: "2026-09-21",
  readingMinutes: 13,
  eyebrow: "SEO",
  h1: "Mi az a technikai SEO?",
  lead:
    "A technikai SEO azoknak a feltételeknek a rendbetétele, hogy a kereső botjai be tudják járni, megértsék és indexeljék az oldaladat. Nem kulcsszóírás — hanem státuszkódok, kanonikalizáció, sitemap, mobilhasználhatóság, sebességjelzők és tiszta belső hálózat.",
  cardExcerpt:
    "HTTP státusz, redirect, canonical, robots, sitemap, structured data, Core Web Vitals, mobil, belső linkek — mi a baj, ha rossz, és hogyan ellenőrzöd.",
  sections: [
    {
      heading: "HTTP státusz és redirectek",
      blocks: [
        {
          type: "p",
          text: "A 200 azt jelenti: az oldal elérhető. A 301/308 végleges átirányítás (pl. http→https). A 404 hiányzó oldal. A 500 szerverhiba. Ha a fontos URL 404 vagy láncolt redirect, a crawl és a ranking szenved.",
        },
        {
          type: "p",
          text: "Ellenőrzés: böngésző Network fül, vagy curl -I. Gyakori hiba: www és non-www is 200-zal él, canonical nélkül.",
        },
      ],
    },
    {
      heading: "Canonical, robots, sitemap",
      blocks: [
        {
          type: "ul",
          items: [
            "Canonical: melyik URL a fő változat",
            "robots.txt: crawl engedélyek (nem helyettesíti a noindexet)",
            "sitemap.xml: a fontos URL-ek listája a keresőnek",
          ],
        },
        {
          type: "p",
          text: "Részletesebben gyakorlati lépésekkel: [SEO alapok](/tudastar/seo-alapok-uj-weboldalhoz) és [Google látja-e?](/tudastar/google-latja-e-a-weboldalad).",
        },
      ],
    },
    {
      heading: "Structured data",
      blocks: [
        {
          type: "p",
          text: "A Schema.org jelölés (JSON-LD) segít a keresőnek értelmezni a típust: Article, Organization, FAQPage stb. Csak igaz adatot jelölj. Ellenőrzés: [Rich Results Test](https://search.google.com/test/rich-results). Dokumentáció: [Schema.org](https://schema.org/), [Google structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data).",
        },
      ],
    },
    {
      heading: "Core Web Vitals és mobil",
      blocks: [
        {
          type: "p",
          text: "A Core Web Vitals (LCP, INP, CLS) a felhasználói élmény mérőszámai. Nem az egyetlen SEO-tényező, de a lassú, ugráló mobiloldal rontja a használhatóságot. Ellenőrzés: PageSpeed Insights / CrUX, [web.dev](https://web.dev/articles/vitals).",
        },
        {
          type: "p",
          text: "Mobil usability: olvasható betűméret, nem egymásra csúszó gombok, nincs horizontális scroll a főtartalmon.",
        },
      ],
    },
    {
      heading: "Belső linkelés",
      blocks: [
        {
          type: "p",
          text: "A belső linkek mutatják, mely oldalak a fontosak, és hogyan kapcsolódnak. Egy szolgáltatásnak legyen egy elsődleges URL-je; a Tudástár erre hivatkozzon, ne hozzon létre öt egymást kannibalizáló „ugyanaz a téma” oldalt.",
        },
        {
          type: "p",
          text: "AntiCode szolgáltatás (technikai audit + javítás): [/seo-optimalizalas](/seo-optimalizalas). Napi technikai ellenőrzés termékként: [/auto-seo](/auto-seo).",
        },
      ],
    },
  ],
  relatedArticles: [
    {
      slug: "seo-alapok-uj-weboldalhoz",
      label: "SEO alapok új oldalhoz",
    },
    {
      slug: "google-latja-e-a-weboldalad",
      label: "Google indexelés",
    },
  ],
  relatedServices: [
    { href: "/seo-optimalizalas", label: "SEO optimalizálás" },
    { href: "/auto-seo", label: "Auto SEO" },
    { href: "/kapcsolat", label: "Kapcsolat" },
  ],
  closingCta: {
    text: "Ha technikai SEO auditot szeretnél a saját domainedre,",
    href: "/kapcsolat",
    label: "írd meg a URL-t →",
  },
};
