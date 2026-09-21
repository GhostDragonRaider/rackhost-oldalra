import { Article } from "../types";

export const articleMennyiIdo: Article = {
  slug: "mennyi-ido-alatt-keszul-el-egy-weboldal",
  title: "Mennyi idő alatt készül el egy weboldal? | AntiCode",
  description:
    "Weboldal készítés időtartama: igényfelméréstől élesítésig. Mi lassít (tartalom, visszajelzés, integráció), és milyen sorrendben épül a projekt.",
  datePublished: "2026-09-21",
  dateModified: "2026-09-21",
  readingMinutes: 9,
  eyebrow: "Folyamat",
  h1: "Mennyi idő alatt készül el egy weboldal?",
  lead:
    "Egy egyszerű start oldal hetek kérdése lehet, ha megvan a tartalom. Egy többoldalas üzleti oldal inkább 1–2 hónap. A webshop és az egyedi funkciók hosszabbak. A naptárat leggyakrabban nem a kód, hanem a késő tartalom és a visszajelzési körök tolják.",
  cardExcerpt:
    "Igényfelmérés → struktúra → design → fejlesztés → tartalom → teszt → élesítés. Mi lassít igazán: hiányzó szöveg, változó igények, extra integrációk.",
  sections: [
    {
      heading: "A tipikus sorrend",
      blocks: [
        {
          type: "ol",
          items: [
            "Igényfelmérés — cél, közönség, funkciók, határidő",
            "Struktúra — oldalak, CTA-út, tartalomváz",
            "Design — felület, mobil, komponensek",
            "Fejlesztés — front/back, űrlapok, integrációk",
            "Tartalom — végleges szöveg, képek, jogi",
            "Tesztelés — mobil, űrlap, SEO alap, böngészők",
            "Javítás — hibák + utolsó szövegpontok",
            "Élesítés — DNS, SSL, mérés, Search Console",
          ],
        },
        {
          type: "p",
          text: "Ezek átfedhetnek (pl. tartalomírás párhuzamosan a fejlesztéssel), de ha a szöveg az utolsó napra marad, a tesztelés is csúszik.",
        },
      ],
    },
    {
      heading: "Durva időkeretek (irányadó)",
      blocks: [
        {
          type: "table",
          headers: ["Típus", "Ha a tartalom kész", "Ha a tartalom késik"],
          rows: [
            ["Start / landing", "kb. 1–3 hét", "többszörösére nőhet"],
            ["Üzleti weboldal", "kb. 3–8 hét", "gyakran +2–4 hét"],
            ["Webshop", "kb. 6–12+ hét", "termékadat függvényében"],
            ["Egyedi funkciókkal", "projektfüggő", "integráció + UAT körök"],
          ],
        },
        {
          type: "note",
          text: "Ezek nem szerződéses SLA-k, hanem realisztikus sávok. A pontos határidő a briefből jön.",
        },
      ],
    },
    {
      heading: "Mi lassítja a projektet?",
      blocks: [
        {
          type: "ul",
          items: [
            "Későn érkező szöveg és fotó",
            "Menet közben változó igények („még egy modul”)",
            "Extra funkciók a scope után",
            "Külső API / fizetés / CRM késedelmes hozzáférés",
            "Lassú visszajelzési körök (egy kör = több nap várakozás)",
            "Hiányzó döntéshozó (több ember, ellentmondó instrukció)",
          ],
        },
        {
          type: "p",
          text: "Gyorsít, ha van egy döntéshozó, kész tartalomváz, és fagyasztott scope a fejlesztés közepén. Kapcsolódó: [árak](/tudastar/weboldal-keszites-arak-2026), [élesítés checklist](/tudastar/weboldal-inditas-checklist).",
        },
      ],
    },
  ],
  relatedArticles: [
    {
      slug: "weboldal-keszites-arak-2026",
      label: "Mennyibe kerül?",
    },
    {
      slug: "weboldal-inditas-checklist",
      label: "Élesítés checklist",
    },
  ],
  relatedServices: [
    { href: "/weboldal-keszites", label: "Weboldal készítés" },
    { href: "/arak", label: "Árak" },
    { href: "/kapcsolat", label: "Kapcsolat" },
  ],
  closingCta: {
    text: "Ha van határidőd (esemény, szezon), írd meg a briefben —",
    href: "/kapcsolat",
    label: "ehhez igazítom a realist ütemtervet →",
  },
};
