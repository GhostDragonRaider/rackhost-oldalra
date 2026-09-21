import { Article } from "../types";

export const articleEgyediVsSablon: Article = {
  slug: "egyedi-fejlesztes-vs-sablon",
  title: "Egyedi fejlesztés vs. sablon — mikor melyik? | AntiCode",
  description:
    "Sablon vagy egyedi fejlesztés: költség, idő, bővíthetőség, plugin-függőség és vendor lock-in — hipotetikus példákkal, nem ügynökségi közhellyel.",
  datePublished: "2026-09-20",
  dateModified: "2026-09-21",
  readingMinutes: 11,
  eyebrow: "Technológia",
  h1: "Egyedi fejlesztés vs. sablon — mikor melyik?",
  lead:
    "Sablon mellett szól a gyors indulás és az alacsonyabb belépő költség, ha a folyamatod standard. Egyedi mellett szól, ha a foglalás, admin, jogosultság vagy integráció a termék része — mert a plugin-halom hosszú távon drágább lehet, mint egy célzott rendszer.",
  cardExcerpt:
    "Egyszerű éttermi oldal vs. dokumentumfeltöltős, státuszos folyamat: költség, idő, bővíthetőség és karbantartás alapján — mikor elég a sablon, és mikor indokolt az egyedi.",
  sections: [
    {
      heading: "Összehasonlítás a döntési tengelyeken",
      blocks: [
        {
          type: "table",
          headers: ["Szempont", "Sablon / kész CMS", "Egyedi fejlesztés"],
          rows: [
            [
              "Induló költség",
              "Általában alacsonyabb bemutatkozó oldalaknál",
              "Magasabb belépő, ha van egyedi logika",
            ],
            [
              "Fejlesztési idő",
              "Gyorsabb, ha a sablonba beleférsz",
              "Hosszabb tervezés + építés",
            ],
            [
              "Testreszabhatóság",
              "Téma + plugin keretein belül",
              "A folyamathoz igazítható",
            ],
            [
              "Teljesítmény",
              "Jó lehet; pluginok könnyen lassítanak",
              "Kontrolláltabb, ha szándékosan épül",
            ],
            [
              "Karbantartás",
              "Frissítések, plugin-kompatibilitás",
              "Saját kód + függőségek frissítése",
            ],
            [
              "Bővíthetőség",
              "Amíg van plugin / hook",
              "Modulokban tervezhető",
            ],
            [
              "Vendor lock-in",
              "Téma/host/builder kötés lehetséges",
              "Más típusú kötés (saját stack)",
            ],
            [
              "Plugin függőség",
              "Gyakran magas",
              "Célzott integrációk",
            ],
            [
              "Egyedi üzleti logika",
              "Kerülőutakkal, törékenyen",
              "Első osztályú követelmény",
            ],
          ],
        },
      ],
    },
    {
      heading: "Példa 1 — sablon bőven elég",
      blocks: [
        {
          type: "note",
          text: "Hipotetikus példa.",
        },
        {
          type: "p",
          text: "Kis étterem: étlap, nyitvatartás, kapcsolat, galéria, esetleg asztalfoglalás külső widgettel. Nincs egyedi jogosultság, nincs belső státuszgép. Itt a sablon / egyszerű CMS + jó tartalom gyakran a racionális választás.",
        },
      ],
    },
    {
      heading: "Példa 2 — egyedi indokoltabb",
      blocks: [
        {
          type: "note",
          text: "Hipotetikus példa.",
        },
        {
          type: "p",
          text: "Logisztikai / jelentkezési folyamat: jelentkezés, dokumentumfeltöltés, admin átnézés, státusz, automatikus e-mail. Ha ezt WordPress + öt pluginnal „összerakod”, a következő fél év a kompatibilitásról és a kivételekről szólhat. Ilyenkor célzott egyedi modul (űrlap + admin + értesítés) átláthatóbb.",
        },
      ],
    },
    {
      heading: "AntiCode megközelítés",
      blocks: [
        {
          type: "p",
          text: "Először a folyamatot tisztázom. Ha elég a szolgáltatói weboldal, azt építem. Ha kell célzott rendszer, kis, bővíthető modulokban — nem „mindenre képes platform”. Részletek: [/egyedi-webfejlesztes](/egyedi-webfejlesztes). Platformválasztásról (WordPress, builder, egyedi): [WordPress, weboldalépítő vagy egyedi?](/tudastar/wordpress-builder-vagy-egyedi).",
        },
      ],
    },
  ],
  relatedArticles: [
    {
      slug: "wordpress-builder-vagy-egyedi",
      label: "WordPress, builder vagy egyedi?",
    },
    {
      slug: "weboldal-keszites-arak-2026",
      label: "Mennyibe kerül egy weboldal?",
    },
  ],
  relatedServices: [
    { href: "/egyedi-webfejlesztes", label: "Egyedi webfejlesztés" },
    { href: "/weboldal-keszites", label: "Weboldal készítés" },
    { href: "/weboldal-karbantartas", label: "Karbantartás" },
  ],
  closingCta: {
    text: "Ha leírod a folyamatodat (ki mit tölt fel, ki dönt, mi a következő státusz),",
    href: "/kapcsolat",
    label: "megmondom, sablon-e vagy egyedi →",
  },
};
