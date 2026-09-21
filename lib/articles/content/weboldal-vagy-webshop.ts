import { Article } from "../types";

export const articleWeboldalVagyWebshop: Article = {
  slug: "weboldal-vagy-webshop",
  title: "Weboldal vagy webshop — melyik kell? | AntiCode",
  description:
    "Weboldal vagy webshop? Konkrét vállalkozástípusokkal, döntési táblázattal és rövid döntési fával — mikor elég a szolgáltatói oldal, és mikor kell kosár.",
  datePublished: "2026-09-20",
  dateModified: "2026-09-21",
  readingMinutes: 10,
  eyebrow: "Döntés",
  h1: "Weboldal vagy webshop — melyik kell neked?",
  lead:
    "Ha a vásárlás beszélgetésen, felmérésen vagy egyedi ajánlaton zárul, általában weboldal kell. Ha a vevő maga választ terméket, kosárba teszi és fizet — webshop. A rossz választás vagy felesleges komplexitás, vagy elveszett rendelés.",
  cardExcerpt:
    "Fodrászat, alkatrész-kereskedő, egyedi bútorgyártó, digitális termék: konkrét példákon és döntési táblázaton, hogy mikor elég a szolgáltatói weboldal, és mikor indokolt a webshop vagy egyedi folyamat.",
  sections: [
    {
      heading: "Először a tranzakciót nézd, ne a „modern” hangzást",
      blocks: [
        {
          type: "p",
          text: "A webshop nem „komolyabb weboldal”. Más adatmodell: termékek, készlet vagy változatok, kosár, fizetés, rendelésállapot. Ha ezekre nincs szükséged, a shop csak költséget és karbantartást ad.",
        },
        {
          type: "p",
          text: "Fordítva: ha már e-mailben „melyik méret / melyik szín / utalás” folyik, és ezt naponta ismétled, a bemutatkozó oldal nem skálázódik — ott a shop vagy egy célzott rendelési folyamat indokolt.",
        },
      ],
    },
    {
      heading: "Konkrét vállalkozástípusok",
      blocks: [
        {
          type: "note",
          text: "Hipotetikus példák — nem ügyfélreferenciák.",
        },
        {
          type: "p",
          text: "Fodrászat: jellemzően weboldal. Szolgáltatások, árlista vagy sávok, bemutatkozás, időpont / kapcsolat. A „kosár” ritkán a fő út — az időpont és a személyes szolgáltatás a termék.",
        },
        {
          type: "p",
          text: "Autóalkatrész-kereskedő: valószínűleg webshop. Sok SKU, keresés, kosár, fizetés, rendeléskövetés. Itt a katalógus a termék.",
        },
        {
          type: "p",
          text: "Egyedi bútorgyártó: gyakran nem webshop. Referencia, anyagok, folyamat, méret / igény bekérése, ajánlat. A „kosárba” gomb félrevezető, ha minden darab egyedi.",
        },
        {
          type: "p",
          text: "Digitális termék (sablon, tananyag, licence): webshop vagy speciális értékesítési oldal. Itt a szállítás digitális, de a fizetés és a hozzáférés-kezelés mégis shop-szerű logika.",
        },
      ],
    },
    {
      heading: "Döntési táblázat",
      blocks: [
        {
          type: "table",
          headers: ["Ha ezt szeretnéd", "Valószínű megoldás"],
          rows: [
            ["Bemutatni a vállalkozást", "Weboldal"],
            ["Érdeklődőket / ajánlatkérést gyűjteni", "Weboldal"],
            ["Időpontot vagy felmérést egyeztetni", "Weboldal (+ foglaló / űrlap)"],
            ["Online rendelést fogadni standard termékekre", "Webshop"],
            ["Online fizetést ismétlődő vásárlásokra", "Webshop"],
            ["Egyedi ajánlatot + dokumentumfeltöltést automatizálni", "Egyedi webalkalmazás"],
            ["Kevesebb mint ~10 termék, ritka rendelés", "Weboldal + egyszerű rendelési űrlap (köztes)"],
          ],
        },
      ],
    },
    {
      heading: "Rövid döntési fa",
      blocks: [
        {
          type: "ol",
          items: [
            "A vevő a weboldalon fizet és „kész” a rendelés? → Igen: webshop felé. Nem: tovább.",
            "Minden megrendelés egyedi (méret, helyszín, felmérés)? → Igen: weboldal + ajánlatkérő. Nem: tovább.",
            "Van ismételhető termékkatalógus (ára, változat, kiszállítás)? → Igen: webshop. Nem: weboldal.",
            "A folyamatban fiók, státusz, feltöltés, jogosultság kell? → Egyedi fejlesztés (lásd [/egyedi-webfejlesztes](/egyedi-webfejlesztes)).",
          ],
        },
        {
          type: "p",
          text: "Részletesebben a [/weboldal-keszites](/weboldal-keszites) és a [/webshop-keszites](/webshop-keszites) oldalakon. Árkeretek: weboldal 99 000 Ft-tól, webshop 191 000 Ft-tól — lásd [/arak](/arak) és a [Mennyibe kerül egy weboldal?](/tudastar/weboldal-keszites-arak-2026) cikk.",
        },
      ],
    },
  ],
  relatedArticles: [
    {
      slug: "weboldal-keszites-arak-2026",
      label: "Mennyibe kerül egy weboldal?",
    },
    {
      slug: "szolgaltatoi-weboldal-elemei",
      label: "Mit tartalmazzon egy szolgáltatói oldal?",
    },
  ],
  relatedServices: [
    { href: "/weboldal-keszites", label: "Weboldal készítés" },
    { href: "/webshop-keszites", label: "Webshop készítés" },
    { href: "/egyedi-webfejlesztes", label: "Egyedi fejlesztés" },
  ],
  closingCta: {
    text: "Ha még bizonytalan a határ weboldal és shop között,",
    href: "/kapcsolat",
    label: "írd le a folyamatot — segítek kategorizálni →",
  },
};
