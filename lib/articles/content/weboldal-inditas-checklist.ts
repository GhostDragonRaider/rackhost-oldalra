import { Article } from "../types";

export const articleInditasChecklist: Article = {
  slug: "weboldal-inditas-checklist",
  title: "Weboldal indítás checklist | AntiCode",
  description:
    "Weboldal élesítés előtti checklist 35+ ponttal: SEO, technika, tartalom, űrlapok, analytics, social — végigkövethető listában.",
  datePublished: "2026-09-20",
  dateModified: "2026-09-21",
  readingMinutes: 12,
  eyebrow: "Élesítés",
  h1: "Weboldal indítás checklist — mielőtt nyilvánossá teszed",
  lead:
    "Az élesítés akkor kész, ha a tartalom, a technika, a mérés és az átadás is rendben van — nem akkor, amikor „feltöltöttük”. Az alábbi lista 35+ konkrét ellenőrzőpont.",
  cardExcerpt:
    "35+ ellenőrzőpont SEO, technika, tartalom, űrlapok, analytics és social szerint. Pipáld végig élesítés előtt — ne csak „majd megnézzük”.",
  sections: [
    {
      heading: "SEO",
      blocks: [
        {
          type: "checklist",
          items: [
            "Minden indexelendő oldalnak egyedi, értelmes title van",
            "Meta description kitöltve (nem sablonüdvözlés)",
            "Egy H1 oldalanként, logikus H2/H3",
            "Canonical URL beállítva az indexelendő oldalakon",
            "sitemap.xml elérhető és friss",
            "robots.txt nem tiltja az egész site-ot",
            "Structured data csak ott, ahol igaz (és valid)",
            "Nincs noindex a publikus főoldalakon",
            "Demó / staging / admin útvonalak noindexen vagy auth mögött",
          ],
        },
      ],
    },
    {
      heading: "Technikai",
      blocks: [
        {
          type: "checklist",
          items: [
            "HTTPS működik, nincs mixed content",
            "www ↔ non-www egy irányba redirectel (egy kanonikus host)",
            "http → https redirect",
            "Egyedi 404 oldal létezik és használható",
            "Favicon megjelenik",
            "Mobilnézet: olvasható szöveg, nem vágott gombok",
            "Főoldal és kulcsoldalak elfogadhatóan gyorsan betöltenek",
            "Böngésző konzol: nincs kritikus JS hiba a főútvonalakon",
            "Régi URL-ekről (ha volt előző oldal) 301 a megfelelőre",
          ],
        },
      ],
    },
    {
      heading: "Tartalom",
      blocks: [
        {
          type: "checklist",
          items: [
            "Nincs lorem ipsum / placeholder szöveg",
            "Nincs törött kép",
            "Telefonszám és e-mail helyes, kattintható",
            "Cím / terület (ha releváns) helyes",
            "CTA szövegek konkrétak („Ajánlatot kérek”, nem „Tovább”)",
            "Belső linkek működnek",
            "Helyesírás átnézve a főoldalakon",
          ],
        },
      ],
    },
    {
      heading: "Űrlapok",
      blocks: [
        {
          type: "checklist",
          items: [
            "Űrlap elküldhető (teszt küldés megtörtént)",
            "Kötelező mezők validációja működik",
            "Hibás input érthető hibaüzenetet ad",
            "Sikeres küldés után visszajelzés van",
            "Az értesítő e-mail megérkezik a célszámlafiókba",
            "Spam / üres küldés ellen van alapvédelem (ha van űrlap)",
          ],
        },
      ],
    },
    {
      heading: "Analytics és social",
      blocks: [
        {
          type: "checklist",
          items: [
            "Analytics / mérőkód be van kötve (ha használsz)",
            "Consent / cookie kezelés összhangban van a méréssel",
            "Fontos események (űrlapküldés) mérhetők vagy legalább tesztelhetők",
            "Open Graph title / description / kép beállítva",
            "Megosztási előnézet ellenőrizve (legalább egy eszközzel)",
          ],
        },
      ],
    },
    {
      heading: "Átadás",
      blocks: [
        {
          type: "checklist",
          items: [
            "Domain / DNS hozzáférés dokumentálva",
            "Tárhely / VPS / deploy hozzáférés átadva",
            "Search Console property létrehozva vagy meghívva",
            "Rövid kezelési útmutató (mit hol módosítasz)",
            "Következő 30 nap feladatai egyeztetve (tartalom, mérés, javítás)",
          ],
        },
        {
          type: "p",
          text: "Kapcsolódó: [SEO alapok](/tudastar/seo-alapok-uj-weboldalhoz), [Google látja-e?](/tudastar/google-latja-e-a-weboldalad), karbantartás: [/weboldal-karbantartas](/weboldal-karbantartas).",
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
      slug: "google-latja-e-a-weboldalad",
      label: "Google indexelés ellenőrzése",
    },
  ],
  relatedServices: [
    { href: "/weboldal-karbantartas", label: "Karbantartás" },
    { href: "/arak", label: "Árak" },
    { href: "/kapcsolat", label: "Kapcsolat" },
  ],
  closingCta: {
    text: "Ha élesítés előtt szeretnél egy külső szemet a listára,",
    href: "/kapcsolat",
    label: "írj — végigmegyünk a kritikus pontokon →",
  },
};
