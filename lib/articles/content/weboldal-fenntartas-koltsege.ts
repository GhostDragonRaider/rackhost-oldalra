import { Article } from "../types";

export const articleFenntartas: Article = {
  slug: "weboldal-fenntartas-koltsege",
  title: "Mennyibe kerül egy weboldal fenntartása? | AntiCode",
  description:
    "Weboldal fenntartás költségei: domain, tárhely/VPS, e-mail, SSL, karbantartás, frissítések, külső API-k — AntiCode havi sávokkal, kitalált piaci árak nélkül.",
  datePublished: "2026-09-21",
  dateModified: "2026-09-21",
  readingMinutes: 10,
  eyebrow: "Árazás",
  h1: "Mennyibe kerül egy weboldal fenntartása?",
  lead:
    "A fejlesztés egyszeri díj. A fenntartás: domain, tárhely vagy VPS, e-mail, biztonsági frissítések, kisebb szövegmódosítások, és opcionálisan monitoring. Az AntiCode havi karbantartása 15–45 000 Ft / hó; az Auto SEO 12–29 000 Ft / hó — a domain és a szerver külön.",
  cardExcerpt:
    "Domain, VPS, e-mail, SSL, karbantartás, API-k, monitoring: miből áll a havi költség. AntiCode karbantartási sávokkal — kitalált „piaci átlagár” nélkül.",
  sections: [
    {
      heading: "A költségtípusok",
      blocks: [
        {
          type: "table",
          headers: ["Tétel", "Mit fed", "Megjegyzés"],
          rows: [
            ["Domain", "Éves névregisztráció", "Szolgáltatótól függ — nem AntiCode listaár"],
            ["Tárhely / VPS", "Szerver, sávszélesség, IP", "Shared hosting ≠ VPS; ár szolgáltatófüggő"],
            ["E-mail", "Postafiók / továbbítás", "Gyakran a domain/host csomag része"],
            ["SSL", "HTTPS tanúsítvány", "Let's Encrypt gyakran 0 Ft; egyébként szolgáltató"],
            ["Karbantartás", "Frissítés, mentés, kisebb módosítás", "AntiCode: 15–45 000 Ft / hó"],
            ["Auto SEO", "Napi technikai SEO ellenőrzés + riasztás", "AntiCode: 12–29 000 Ft / hó"],
            ["Külső API-k", "Térkép, e-mail, fizetés, CRM", "Saját előfizetésük van"],
            ["Fejlesztési nap", "Nagyobb módosítás", "AntiCode: 25–50 000 Ft / nap"],
          ],
        },
        {
          type: "p",
          text: "A domain- és tárhelyárakat szándékosan nem találom ki „piaci átlagként” — ezek szolgáltatótól és csomagtól változnak. Az AntiCode saját sávjai a [/arak](/arak) oldalon vannak.",
        },
      ],
    },
    {
      heading: "Mit tartalmaz a havi karbantartás nálam?",
      blocks: [
        {
          type: "p",
          text: "A lista szerinti havi karbantartás: frissítések, mentések és kisebb módosítások. Ami nem „kisebb” (új modul, redesign, új integráció), az fejlesztési nap vagy külön becslés.",
        },
        {
          type: "ul",
          items: [
            "Induló: 15 000 Ft / hó",
            "Jellemző: 25 000 Ft / hó",
            "Komplex: 45 000 Ft / hó",
          ],
        },
        {
          type: "p",
          text: "Részletek: [/weboldal-karbantartas](/weboldal-karbantartas). Fejlesztési díjak egyszeri projektként: [Mennyibe kerül egy weboldal?](/tudastar/weboldal-keszites-arak-2026).",
        },
      ],
    },
    {
      heading: "Mit tervezz be az első évben?",
      blocks: [
        {
          type: "ol",
          items: [
            "Egyszeri: fejlesztés (árlista szerint)",
            "Éves: domain (+ esetleg e-mail)",
            "Havi: tárhely/VPS + opcionális karbantartás / Auto SEO",
            "Eseti: tartalomfrissítés, új funkció (fejlesztési nap)",
          ],
        },
        {
          type: "note",
          text: "Ha nincs karbantartási szerződés, a biztonsági frissítések és a „elromlott űrlap” javítása eseti díjas — tervezd be.",
        },
      ],
    },
  ],
  relatedArticles: [
    {
      slug: "weboldal-keszites-arak-2026",
      label: "Fejlesztési árak",
    },
    {
      slug: "mennyi-ido-alatt-keszul-el-egy-weboldal",
      label: "Mennyi idő a készítés?",
    },
  ],
  relatedServices: [
    { href: "/weboldal-karbantartas", label: "Karbantartás" },
    { href: "/arak", label: "Árak" },
    { href: "/kapcsolat", label: "Kapcsolat" },
  ],
  closingCta: {
    text: "Ha szeretnéd tudni, a te stackedhez milyen havi csomag indokolt,",
    href: "/kapcsolat",
    label: "írd le a jelenlegi hostingot →",
  },
};
