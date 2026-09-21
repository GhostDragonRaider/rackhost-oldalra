import { Article } from "../types";

export const articleSzolgaltatoi: Article = {
  slug: "szolgaltatoi-weboldal-elemei",
  title: "Mit tartalmazzon egy szolgáltatói weboldal? | AntiCode",
  description:
    "Szolgáltatói weboldal struktúra: hero, szolgáltatások, bizalom, FAQ, CTA — rossz és jobb példákkal, nem általános checklisttel.",
  datePublished: "2026-09-20",
  dateModified: "2026-09-21",
  readingMinutes: 11,
  eyebrow: "Checklist",
  h1: "Mit tartalmazzon egy szolgáltatói weboldal?",
  lead:
    "Egy szolgáltatói oldal akkor működik, ha 5–10 másodperc alatt kiderül: kinek szól, mit kapsz, és mi a következő lépés. Az alábbi struktúra tipikus szolgáltatói vállalkozásokra (helyi és B2B) van szabva — nem „minél több szöveg” célra.",
  cardExcerpt:
    "Ajánlott főoldal-struktúra 9 blokkban, rossz→jobb hero és CTA példákkal. Segít eldönteni, hol lyukas a jelenlegi oldalad — üzenet, bizalom vagy következő lépés.",
  sections: [
    {
      heading: "Ajánlott főoldal-struktúra",
      blocks: [
        {
          type: "ol",
          items: [
            "Hero — kinek + mit + CTA",
            "Mit kínál a vállalkozás? (rövid, konkrét)",
            "Kinek szól? (és kinek nem)",
            "Miért ezt a vállalkozást? (differenciáló)",
            "Szolgáltatások (bontva, nem egy fal szöveg)",
            "Referenciák / bizalmi elemek (ami ténylegesen van)",
            "Gyakori kérdések",
            "CTA ismétlés (ajánlat / időpont)",
            "Kapcsolat / elérhetőség",
          ],
        },
        {
          type: "p",
          text: "Nem kell mind a kilenc minden vállalkozásnak ugyanolyan súllyal. Ha nincs még referenciafotó, ne találj ki ügyfelet — írd a folyamatot, a garanciát, a válaszidőt, a területet.",
        },
      ],
    },
    {
      heading: "Hero: rossz vs. jobb",
      blocks: [
        {
          type: "note",
          text: "Szemléltető példák, nem valós vállalkozások.",
        },
        {
          type: "compare",
          bad: "„Üdvözöljük weboldalunkon!”",
          good: "„Klímaszerelés Miskolcon és környékén – felmérés és telepítés rövid határidővel.”",
          note: "Az első nem mond semmit. A második: szolgáltatás + terület + következő lépés hangulata.",
        },
        {
          type: "compare",
          bad: "H1: „Üdvözöljük!”",
          good: "H1: „Könyvelés egyéni vállalkozóknak és kisvállalkozásoknak”",
          note: "A H1 legyen az ajánlat, ne a köszönés.",
        },
      ],
    },
    {
      heading: "CTA: mit írjon a gomb?",
      blocks: [
        {
          type: "compare",
          bad: "„Tovább”",
          good: "„Időpontot kérek” / „Árajánlatot kérek” / „Megnézem a szolgáltatásokat”",
          note: "A gomb szövege a cselekvést nevezze meg. A „Tovább” nem döntés.",
        },
        {
          type: "p",
          text: "Tegyél CTA-t a hero után, a szolgáltatások után, és a FAQ után — de ne minden bekezdés végén. Egy fő elsődleges akció elég; a másodlagos lehet „árak” vagy „munkáim”.",
        },
      ],
    },
    {
      heading: "Szolgáltatások és bizalom — konkrétan",
      blocks: [
        {
          type: "ul",
          items: [
            "Szolgáltatásonként: mi ez, kinek, milyen eredmény, mi a következő lépés",
            "Folyamat 3–5 lépésben (pl. felmérés → ajánlat → kivitelezés)",
            "GYIK: ár, határidő, terület, mit hozzon az ügyfél",
            "Elérhetőség: telefon, e-mail, válaszidő ígéret (amit tartani tudsz)",
          ],
        },
        {
          type: "p",
          text: "Technikai minimum (röviden): egy H1, tiszta H2-k, mobilbarát űrlap, értelmes title/description. Részletesebben: [SEO alapok új weboldalhoz](/tudastar/seo-alapok-uj-weboldalhoz) és [/weboldal-keszites](/weboldal-keszites).",
        },
      ],
    },
  ],
  relatedArticles: [
    {
      slug: "weboldal-vagy-webshop",
      label: "Weboldal vagy webshop?",
    },
    {
      slug: "seo-alapok-uj-weboldalhoz",
      label: "SEO alapok új oldalhoz",
    },
  ],
  relatedServices: [
    { href: "/weboldal-keszites", label: "Weboldal készítés" },
    { href: "/arak", label: "Árak" },
    { href: "/kapcsolat", label: "Kapcsolat" },
  ],
  closingCta: {
    text: "Ha szeretnéd, hogy az oldalad ezen a struktúrán fusson,",
    href: "/kapcsolat",
    label: "nézzük át együtt a briefet →",
  },
};
