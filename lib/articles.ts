export type Article = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingMinutes: number;
  eyebrow: string;
  h1: string;
  lead: string;
  sections: { heading: string; paragraphs: string[]; bullets?: string[] }[];
  relatedServices: { href: string; label: string }[];
};

export const ARTICLES: Article[] = [
  {
    slug: "weboldal-keszites-arak-2026",
    title: "Mennyibe kerül egy weboldal 2026-ban? | AntiCode",
    description:
      "Weboldal készítés árak 2026-ban: mi befolyásolja a díjat, mit tartalmaz egy ajánlat, és hogyan olvasd az induló–jellemző–komplex sávokat.",
    date: "2026-09-20",
    readingMinutes: 8,
    eyebrow: "Árazás",
    h1: "Mennyibe kerül egy weboldal 2026-ban?",
    lead:
      "A rövid válasz: attól függ, mit kell eladnia az oldalnak. A hosszú válasz: a díjat a terjedelem, a tartalom, a funkciók és a határidő együtt határozza meg — nem egy „átlagár” a reklámokban.",
    sections: [
      {
        heading: "Miért nincs egyetlen „weboldal ár”?",
        paragraphs: [
          "Egy egyoldalas start oldal és egy több szolgáltatást bemutató, űrlapos, SEO-kész jelenlét más munka. Ugyanígy más a meglévő oldal megújítása és egy teljesen új építés. Ezért az AntiCode árkatalógusában sávokat látsz: induló, jellemző, komplex.",
          "A tárhely, domain, szövegírás, fotózás és fizetős bővítmények jellemzően külön tételek — ezeket az ajánlatban külön, érthetően jelölöm.",
        ],
      },
      {
        heading: "Mitől lesz olcsóbb vagy drágább a projekt?",
        paragraphs: [
          "Olcsóbb felé tolja az árat, ha tiszta a brief, kész a tartalom, kevés az oldal, és nincs egyedi logika. Drágábbá teszi a sok oldal, a bonyolult űrlapok, az integrációk, a többnyelvűség, a szűk határidő és a gyakori irányváltás.",
        ],
        bullets: [
          "Oldalak és szekciók száma",
          "Tartalomkészültség",
          "Egyedi funkciók",
          "Design igényessége",
          "Határidő és egyeztetési körök",
        ],
      },
      {
        heading: "Hol nézd meg az AntiCode kereteket?",
        paragraphs: [
          "Az aktuális sávokat a /arak oldalon találod. A /weboldal-keszites oldalon pedig azt, hogy mit tartalmaz egy üzletszerző szolgáltatói jelenlét. Ha webshop kell, inkább a /webshop-keszites és a shop sávok relevánsak.",
        ],
      },
    ],
    relatedServices: [
      { href: "/arak", label: "Árak" },
      { href: "/weboldal-keszites", label: "Weboldal készítés" },
      { href: "/kapcsolat", label: "Ajánlatkérés" },
    ],
  },
  {
    slug: "weboldal-vagy-webshop",
    title: "Weboldal vagy webshop — melyik kell? | AntiCode",
    description:
      "Mikor elég egy szolgáltatói weboldal, és mikor indokolt a webshop? Döntési szempontok vállalkozásoknak.",
    date: "2026-09-20",
    readingMinutes: 7,
    eyebrow: "Döntés",
    h1: "Weboldal vagy webshop — melyik kell neked?",
    lead:
      "Sok vállalkozás webshopot kér, amikor valójában érdeklődőt és bizalmat kellene gyűjtenie. Másik véglet: van kész terméklista és rendelési igény, de csak egy bemutatkozó oldal fut — és a vásárlás e-mailben fullad el.",
    sections: [
      {
        heading: "Válassz weboldalt, ha…",
        paragraphs: [
          "A fő cél a kapcsolatfelvétel, az ajánlatkérés, az időpont vagy a bizalomépítés. Tipikus szolgáltatói és B2B helyzet: a zárás beszélgetésen vagy ajánlaton történik, nem kosárban.",
        ],
        bullets: [
          "Szolgáltatást adsz el, nem polcról levehető terméket",
          "Az ár projektfüggő / egyedi",
          "A döntéshez több információ és bizalom kell",
        ],
      },
      {
        heading: "Válassz webshopot, ha…",
        paragraphs: [
          "Rendszeresen, ismételhetően értékesítesz termékeket vagy csomagokat, és a rendelés + admin fontos. Ilyenkor a termékút, a kosár és a háttérkezelés a termék része — nem „extra”.",
        ],
      },
      {
        heading: "Köztes megoldások",
        paragraphs: [
          "Gyakran jó út: erős szolgáltatói weboldal + egyszerű foglaló vagy ajánlatkérő, és csak később webshop. Az egyedi fejlesztés akkor jön képbe, ha a folyamatod nem fér bele a kész sablonokba.",
        ],
      },
    ],
    relatedServices: [
      { href: "/weboldal-keszites", label: "Weboldal készítés" },
      { href: "/webshop-keszites", label: "Webshop készítés" },
      { href: "/egyedi-webfejlesztes", label: "Egyedi fejlesztés" },
    ],
  },
  {
    slug: "szolgaltatoi-weboldal-elemei",
    title: "Mit tartalmazzon egy szolgáltatói weboldal? | AntiCode",
    description:
      "A szolgáltatói weboldal kötelező elemei: üzenet, szolgáltatások, bizalom, CTA és technikai SEO-alap — checklist vállalkozásoknak.",
    date: "2026-09-20",
    readingMinutes: 9,
    eyebrow: "Checklist",
    h1: "Mit tartalmazzon egy szolgáltatói weboldal?",
    lead:
      "A jó szolgáltatói oldal nem „sok szöveg”. Hanem: gyorsan érthető ajánlat, logikus szerkezet, és egyértelmű következő lépés. Ez a checklist segít eldönteni, hol lyukas most a jelenléted.",
    sections: [
      {
        heading: "Üzenet az első képernyőn",
        paragraphs: [
          "5–10 másodperc alatt derüljön ki: kinek szól az oldal, mit kínálsz, és mi a következő lépés. Ha a hero csak szép, de nem döntésképes, a látogató elmegy.",
        ],
      },
      {
        heading: "Szolgáltatások és bizonyíték",
        paragraphs: [
          "A szolgáltatások legyenek bontva, ne egy óriás bekezdések. Mellé: folyamat, referenciák, GYIK — ezek csökkentik a „még ráérek” érzést.",
        ],
        bullets: [
          "Egy H1 és tiszta H2 szerkezet",
          "CTA a döntési pontokon",
          "Elérhetőség és válaszidő ígérete",
          "Mobilbarát űrlap",
        ],
      },
      {
        heading: "Technikai minimum",
        paragraphs: [
          "Indexelhető HTML, canonical, értelmes title/description, gyors mobilélmény. Erről részletesebben a weboldal készítés oldalon és a többi tudástár cikkben is írok.",
        ],
      },
    ],
    relatedServices: [
      { href: "/weboldal-keszites", label: "Weboldal készítés" },
      { href: "/arak", label: "Árak" },
      { href: "/kapcsolat", label: "Kapcsolat" },
    ],
  },
  {
    slug: "egyedi-fejlesztes-vs-sablon",
    title: "Egyedi fejlesztés vs. sablon — mikor melyik? | AntiCode",
    description:
      "Sablon weboldal vagy egyedi fejlesztés? Döntési szempontok költségre, időre és üzleti folyamatra.",
    date: "2026-09-20",
    readingMinutes: 8,
    eyebrow: "Technológia",
    h1: "Egyedi fejlesztés vs. sablon — mikor melyik?",
    lead:
      "A sablon nem „rossz”, és az egyedi nem „mindig jobb”. A kérdés: mennyire egyedi a folyamatod, és mennyibe kerül a kompromisszum hosszú távon.",
    sections: [
      {
        heading: "Sablon mellett szól",
        paragraphs: [
          "Gyors indulás, ismert admin, kisebb belépő költség bemutatkozó oldalaknál. Ha a folyamatod standard, a sablon + jó tartalom gyakran nyer.",
        ],
      },
      {
        heading: "Egyedi mellett szól",
        paragraphs: [
          "Ha a foglalás, az admin, az integráció vagy a jogosultságok a termék részei. Ilyenkor a sablon körül bypassok és plugin-halmok születnek — drágább karbantartással.",
        ],
      },
      {
        heading: "AntiCode megközelítés",
        paragraphs: [
          "Előbb a folyamatot tisztázzuk. Ha elég a szolgáltatói weboldal, azt csináljuk. Ha kell célzott rendszer, kis, bővíthető modulokban építünk — lásd /egyedi-webfejlesztes.",
        ],
      },
    ],
    relatedServices: [
      { href: "/egyedi-webfejlesztes", label: "Egyedi webfejlesztés" },
      { href: "/weboldal-keszites", label: "Weboldal készítés" },
      { href: "/weboldal-karbantartas", label: "Karbantartás" },
    ],
  },
  {
    slug: "seo-alapok-uj-weboldalhoz",
    title: "SEO alapok új weboldalhoz | AntiCode",
    description:
      "Technikai és tartalmi SEO alapok új weboldal indításakor: title, canonical, sitemap, tartalom és indexelés.",
    date: "2026-09-20",
    readingMinutes: 10,
    eyebrow: "SEO",
    h1: "SEO alapok új weboldalhoz — amit az induláskor érdemes rendbe tenni",
    lead:
      "A SEO nem egy „plugin bekapcsolása”. Induláskor a cél: a Google egyáltalán megtalálja, megértse és indexelje az oldalakat — majd a tartalommal versenyképessé tenni őket.",
    sections: [
      {
        heading: "Technikai checklist",
        paragraphs: [
          "HTTPS, egy kanonikus host (www nélkül vagy vele — de ne mindkettő 200-zal), robots.txt, sitemap, egyedi title/description, egy H1, OG kép, és tiszta belső linkek.",
        ],
        bullets: [
          "Google Search Console + sitemap",
          "Canonical minden indexelendő oldalon",
          "Ne indexeld a demókat és az API-t",
          "Gyors mobilélmény",
        ],
      },
      {
        heading: "Tartalmi SEO",
        paragraphs: [
          "Egy kulcsszócsoport = egy elsődleges URL. A szolgáltatásoldalakon legyen elég mélység (nem 100 szó), FAQ, és belső link az árakhoz / kapcsolathoz. A tudástár cikkek a döntést segítik, és a pilléroldalakat erősítik.",
        ],
      },
      {
        heading: "Mit várj realisztikusan?",
        paragraphs: [
          "Az indexelés hetek kérdése lehet. A versenyképes főkulcsszavakon a rangsor hónapok alatt épül, ha van tartalom és technikai rend. A márkakeresés általában előbb jön.",
        ],
      },
    ],
    relatedServices: [
      { href: "/weboldal-keszites", label: "Weboldal készítés" },
      { href: "/tudastar", label: "Tudástár" },
      { href: "/kapcsolat", label: "Kapcsolat" },
    ],
  },
  {
    slug: "weboldal-inditas-checklist",
    title: "Weboldal indítás checklist | AntiCode",
    description:
      "Weboldal élesítés előtti checklist: tartalom, technika, SEO, jogi szövegek, mérés és átadás.",
    date: "2026-09-20",
    readingMinutes: 6,
    eyebrow: "Élesítés",
    h1: "Weboldal indítás checklist — mielőtt nyilvánossá teszed",
    lead:
      "Az élesítés nem az a nap, amikor „feltöltjük az oldalt”. Hanem amikor a tartalom, a technika, a mérés és az átadás is rendben van.",
    sections: [
      {
        heading: "Tartalom és UX",
        paragraphs: [
          "Minden CTA működik, az űrlap tesztelve van, a legfontosabb oldalak mobilnézetben is olvashatók, nincsenek lorem ipsumok és törött képek.",
        ],
      },
      {
        heading: "SEO és indexelés",
        paragraphs: [
          "Title/description, canonical, sitemap, robots, 404 oldal, és Search Console várja a domain property-t. A demó útvonalak noindexen.",
        ],
      },
      {
        heading: "Átadás",
        paragraphs: [
          "Hozzáférések, rövid kezelési útmutató, mi a következő 30 nap feladata (tartalom, mérés, kisebb igazítások). Ha kell, a karbantartási csomag itt kapcsolódik be.",
        ],
      },
    ],
    relatedServices: [
      { href: "/weboldal-karbantartas", label: "Karbantartás" },
      { href: "/arak", label: "Árak" },
      { href: "/kapcsolat", label: "Kapcsolat" },
    ],
  },
];

export function getArticle(slug: string) {
  return ARTICLES.find((article) => article.slug === slug);
}
