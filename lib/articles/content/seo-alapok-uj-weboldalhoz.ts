import { Article } from "../types";

export const articleSeoAlapok: Article = {
  slug: "seo-alapok-uj-weboldalhoz",
  title: "SEO alapok új weboldalhoz | AntiCode",
  description:
    "SEO alapok új weboldal indításakor: title, meta description, H1, canonical, robots, sitemap, structured data — rossz→jobb példákkal és ellenőrzési módokkal.",
  datePublished: "2026-09-20",
  dateModified: "2026-09-21",
  readingMinutes: 14,
  eyebrow: "SEO",
  h1: "SEO alapok új weboldalhoz — amit az induláskor érdemes rendbe tenni",
  lead:
    "Új oldalnál az első cél: a Google megtalálja, megértse és indexelje az URL-eket. Ehhez kell HTTPS, egy kanonikus host, értelmes title/H1, sitemap, robots, és tiszta belső linkek — nem „kulcsszóplugin”.",
  cardExcerpt:
    "Title, description, H1, canonical, robots, sitemap, OG, structured data: mi ez, miért számít, hogyan ellenőrzöd, mi a gyakori hiba — rossz és jobb példákkal.",
  sections: [
    {
      heading: "Title — a keresőben megjelenő cím",
      blocks: [
        {
          type: "p",
          text: "Mi ez: a <title> elem, gyakran a találati lista címsora. Miért számít: ez az egyik legerősebb jelzés a témáról, és a kattintást is befolyásolja.",
        },
        {
          type: "compare",
          bad: "Kezdőlap",
          good: "Klímaszerelés Miskolcon | Példa Klíma",
          note: "Szemléltető példa. A „Kezdőlap” nem mondja meg a szolgáltatást és a területet.",
        },
        {
          type: "p",
          text: "Hogyan ellenőrzöd: böngésző fül szövege, vagy View Source / DevTools. Gyakori hiba: minden oldalnak ugyanaz a title, vagy a márkanév önmagában.",
        },
      ],
    },
    {
      heading: "Meta description",
      blocks: [
        {
          type: "p",
          text: "Mi ez: rövid összefoglaló a találati listához. Nem direkt rangsoroló tényező, de befolyásolja a CTR-t. Miért számít: ez a „reklámszöveged” a Google alatt.",
        },
        {
          type: "compare",
          bad: "Üdvözöljük cégünk weboldalán. Tekintse meg szolgáltatásainkat.",
          good: "Könyvelés egyéni vállalkozóknak Debrecenben. Bérszámfejtés, adóbevallás és havi könyvelés egy helyen. Kérj konzultációt.",
          note: "Szemléltető. A jobb változat: szolgáltatás + kinek + CTA.",
        },
        {
          type: "p",
          text: "Hogyan ellenőrzöd: Search Console URL Inspection / rich results előnézet, vagy a HTML <meta name=\"description\">. Gyakori hiba: üres description, vagy ugyanaz minden oldalon.",
        },
      ],
    },
    {
      heading: "H1 és heading struktúra",
      blocks: [
        {
          type: "p",
          text: "Mi ez: az oldal fő címe (egy H1), alatta H2/H3 a szekcióknak. Miért számít: segít az olvasónak és a keresőnek megérteni a hierarchiát.",
        },
        {
          type: "compare",
          bad: "H1: Üdvözöljük!",
          good: "H1: Könyvelés egyéni vállalkozóknak és kisvállalkozásoknak",
        },
        {
          type: "p",
          text: "Gyakori hiba: több H1, vagy H2-k „szép” de üres címkék nélkül (pl. csak vizuális nagy betű, semantika nélkül).",
        },
      ],
    },
    {
      heading: "Canonical, robots.txt, sitemap.xml",
      blocks: [
        {
          type: "ul",
          items: [
            "Canonical: melyik URL a „hivatalos” változat. Elkerüli a www/non-www és paraméteres duplikátumokat. Ellenőrzés: <link rel=\"canonical\"> a <head>-ben.",
            "robots.txt: mit crawlolhat a bot. Gyakori hiba: véletlen Disallow: / az egész site-ra, vagy fontos CSS/JS tiltása.",
            "sitemap.xml: URL-lista a keresőnek. Ellenőrzés: /sitemap.xml + Search Console sitemap beküldés.",
          ],
        },
        {
          type: "code",
          caption: "Egyszerű robots.txt példa (szerkeszd a saját domainedre)",
          code: `User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml`,
        },
        {
          type: "p",
          text: "Hivatalos háttér: [Google Search Central — sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview), [robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro).",
        },
      ],
    },
    {
      heading: "HTTPS, Open Graph, structured data, belső linkek",
      blocks: [
        {
          type: "ul",
          items: [
            "HTTPS: kötelező alap. Ellenőrzés: lakat a címsávban, nincs mixed content.",
            "Open Graph: megosztási cím, leírás, kép. Ellenőrzés: Facebook Sharing Debugger / hasonló eszköz, vagy og: meta tagek.",
            "Structured data (Schema.org): pl. Article, LocalBusiness, FAQ — csak ha igaz. Ellenőrzés: Rich Results Test.",
            "Belső linkek: a szolgáltatásoldalak és a Tudástár kapcsolódjanak. Egy kulcsszócsoport = egy elsődleges URL.",
            "Képek alt szövege: rövid, leíró — nem kulcsszóhalmaz.",
          ],
        },
        {
          type: "p",
          text: "Indexelés ≠ jó helyezés. Arról, hogy a Google egyáltalán látja-e az oldalt: [Hogyan ellenőrizd, hogy a Google látja-e a weboldalad?](/tudastar/google-latja-e-a-weboldalad). Technikai SEO mélyebben: [Mi az a technikai SEO?](/tudastar/mi-az-a-technikai-seo). Szolgáltatás: [/seo-optimalizalas](/seo-optimalizalas).",
        },
      ],
    },
    {
      heading: "Mit várj realisztikusan?",
      blocks: [
        {
          type: "p",
          text: "Az új domain indexelése napok–hetek kérdése lehet. Versenyképes főkulcsszavakon a rangsor hónapok alatt épül, ha van tartalom és technikai rend. A márkakeresés általában előbb jön, mint a generikus „weboldal készítés város”-típusú kifejezések.",
        },
      ],
    },
  ],
  relatedArticles: [
    {
      slug: "google-latja-e-a-weboldalad",
      label: "Látja-e a Google az oldalad?",
    },
    {
      slug: "mi-az-a-technikai-seo",
      label: "Mi az a technikai SEO?",
    },
    {
      slug: "weboldal-inditas-checklist",
      label: "Élesítés checklist",
    },
  ],
  relatedServices: [
    { href: "/seo-optimalizalas", label: "SEO optimalizálás" },
    { href: "/weboldal-keszites", label: "Weboldal készítés" },
    { href: "/kapcsolat", label: "Kapcsolat" },
  ],
  closingCta: {
    text: "Ha új oldalt indítasz, és szeretnéd, hogy a technikai alapok az élesítéskor rendben legyenek,",
    href: "/kapcsolat",
    label: "írj — átnézzük a listát →",
  },
};
