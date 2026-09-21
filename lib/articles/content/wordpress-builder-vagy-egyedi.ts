import { Article } from "../types";

export const articleWordpressBuilder: Article = {
  slug: "wordpress-builder-vagy-egyedi",
  title: "WordPress, weboldalépítő vagy egyedi fejlesztés? | AntiCode",
  description:
    "WordPress, Wix/Squarespace jellegű builder vagy egyedi fejlesztés: költség, idő, karbantartás, kontroll és tipikus használati helyzetek — nem univerzális győztes.",
  datePublished: "2026-09-21",
  dateModified: "2026-09-21",
  readingMinutes: 12,
  eyebrow: "Technológia",
  h1: "WordPress, weboldalépítő vagy egyedi fejlesztés?",
  lead:
    "Nincs univerzálisan „legjobb” stack. A WordPress erős ökoszisztéma bemutatkozó és tartalomcentrikus oldalakhoz. A builderek (Wix, Squarespace és hasonlók) gyors indulást adnak szűkebb kontrollal. Az egyedi fejlesztés akkor indokolt, ha a folyamatod nem fér bele a kész dobozba.",
  cardExcerpt:
    "WordPress vs. builder vs. egyedi: költség, idő, karbantartás, bővíthetőség és kontroll. Tipikus helyzetekkel — anélkül, hogy bármelyiket univerzális győztesnek állítanánk.",
  sections: [
    {
      heading: "Három út — miben különböznek?",
      blocks: [
        {
          type: "table",
          headers: ["", "WordPress", "Weboldalépítő", "Egyedi"],
          rows: [
            [
              "Induló költség",
              "Téma + hosting + esetleg fejlesztő",
              "Előfizetés + idő",
              "Fejlesztési projekt",
            ],
            [
              "Idő első verzióig",
              "Gyors–közepes",
              "Gyakran a leggyorsabb",
              "Hosszabb",
            ],
            [
              "Kontroll a kód felett",
              "Közepes–magas (self-host)",
              "Alacsonyabb (platform)",
              "Magas",
            ],
            [
              "Karbantartás",
              "Frissítések, pluginok",
              "Platform intézi a stacket",
              "Saját függőségek",
            ],
            [
              "Bővíthetőség",
              "Plugin + custom code",
              "Amit a builder enged",
              "Amit megtervezel",
            ],
            [
              "Vendor lock-in",
              "Téma/plugin kötés",
              "Erős platformkötés",
              "Stack-kötés",
            ],
          ],
        },
      ],
    },
    {
      heading: "Tipikus helyzetek",
      blocks: [
        {
          type: "ul",
          items: [
            "Blog + bemutatkozás, gyakori tartalomfrissítés → WordPress gyakran racionális",
            "Egyszerű portfólió / kis helyi szolgáltató, minimális egyedi logika → builder vagy egyszerű WP",
            "Egyedi ajánlatkérés, fájlfeltöltés, admin státuszok → egyedi vagy erősen custom WP (utóbbi hosszabb távon drágább lehet)",
            "Webshop sok termékkel → WP+Woo vagy dedikált shop / egyedi — a katalógus mérete és a folyamat dönt",
          ],
        },
        {
          type: "note",
          text: "Ezek iránytűk, nem szabályok. Ugyanaz a vállalkozás más stackbe is illeszkedhet a csapatod és a költségkereted szerint.",
        },
      ],
    },
    {
      heading: "AntiCode kontextus",
      blocks: [
        {
          type: "p",
          text: "Én jellemzően egyedi, modern webstackkel dolgozom szolgáltatói oldalakra és célzott rendszerekre — nem azért, mert a WordPress „rossz”, hanem mert a projektjeimben a kontrollált teljesítmény és a célzott funkciók a prioritás. Ha a briefbe a WP vagy a builder illik jobban, azt is kimondom. Kapcsolódó: [Egyedi vs. sablon](/tudastar/egyedi-fejlesztes-vs-sablon), [/egyedi-webfejlesztes](/egyedi-webfejlesztes).",
        },
      ],
    },
  ],
  relatedArticles: [
    {
      slug: "egyedi-fejlesztes-vs-sablon",
      label: "Egyedi vs. sablon",
    },
    {
      slug: "weboldal-keszites-arak-2026",
      label: "Weboldal árak",
    },
  ],
  relatedServices: [
    { href: "/egyedi-webfejlesztes", label: "Egyedi webfejlesztés" },
    { href: "/weboldal-keszites", label: "Weboldal készítés" },
    { href: "/kapcsolat", label: "Kapcsolat" },
  ],
  closingCta: {
    text: "Írd le, mit kell tudnia az oldalnak (nem melyik CMS-t szeretnéd),",
    href: "/kapcsolat",
    label: "és javaslok stacket →",
  },
};
