import React from "react";
import Link from "next/link";
import LandingShell from "../components/landing/LandingShell";
import PricingTable from "../components/landing/PricingTable";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  faqJsonLd,
  SITE_EMAIL,
  SITE_NAME,
  SITE_URL,
} from "../lib/site";

const TITLE = "Weboldal és webshop árak | AntiCode";
const DESCRIPTION =
  "Átlátható árkeretek weboldal készítéshez, webshophoz, egyedi fejlesztéshez és karbantartáshoz. Induló, jellemző és komplex projektméretek — AntiCode.";

const AR_FAQS = [
  {
    q: "Mi a különbség az induló, jellemző és komplex sáv között?",
    a: "Az induló egy körülhatárolt, kisebb terjedelmű feladat belépő díja. A jellemző a legtöbb vállalkozás reális projektkerete. A komplex több oldalt, több tartalmat vagy összetettebb működést jelent.",
  },
  {
    q: "Benne van a tárhely és a domain az árban?",
    a: "Nem automatikusan. A tárhely, domain, fizetős bővítmények, szövegírás és fotózás az ajánlatban külön tételként szerepel — így nincs rejtett költség.",
  },
  {
    q: "Kaphatok fix árat?",
    a: "Igen, a brief után írásos ajánlatot kapsz: terjedelem, határidő és díj. A scope változása esetén egyeztetünk, mielőtt továbbmennénk.",
  },
  {
    q: "Van-e részletfizetés vagy ütemezett számlázás?",
    a: "A tipikus modell előleg + átadáskori rész. A pontos ütemezést a szerződésben rögzítjük.",
  },
] as const;

export default function ArakPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "OfferCatalog",
      name: "AntiCode árkatalógus",
      description: DESCRIPTION,
      url: absoluteUrl("/arak"),
      provider: {
        "@type": "ProfessionalService",
        name: SITE_NAME,
        url: SITE_URL,
        email: SITE_EMAIL,
        image: absoluteUrl("/logo.png"),
      },
      itemListElement: [
        {
          "@type": "Offer",
          name: "Weboldal készítés — induló sávtól",
          url: absoluteUrl("/weboldal-keszites"),
          category: "Weboldal készítés",
        },
        {
          "@type": "Offer",
          name: "Webshop készítés — induló sávtól",
          url: absoluteUrl("/webshop-keszites"),
          category: "Webshop készítés",
        },
        {
          "@type": "Offer",
          name: "Egyedi webfejlesztés — moduláris keret",
          url: absoluteUrl("/egyedi-webfejlesztes"),
          category: "Egyedi fejlesztés",
        },
        {
          "@type": "Offer",
          name: "Weboldal karbantartás — havi keret",
          url: absoluteUrl("/weboldal-karbantartas"),
          category: "Karbantartás",
        },
      ],
    },
    breadcrumbJsonLd([
      { name: "Kezdőlap", path: "/" },
      { name: "Árak", path: "/arak" },
    ]),
    faqJsonLd(AR_FAQS, absoluteUrl("/arak")),
  ];

  return (
    <LandingShell
      title={TITLE}
      description={DESCRIPTION}
      path="/arak"
      jsonLd={jsonLd}
    >
      <section className="pricing" id="arak">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Árkatalógus</div>
              <h1>Válassz projektméretet, ne zsákbamacskát.</h1>
            </div>
            <p>
              Szolgáltatásonként három keretet mutatok. A pontos ajánlatot a
              tartalom, a funkciók és a határidő alapján állítom össze — írásban,
              kötelezettség nélkül.
            </p>
          </div>

          <PricingTable />

          <div className="price-callout">
            <p>
              <strong>Így olvasd az árakat:</strong> az „Induló” egy tiszta,
              körülhatárolt feladat belépő díja. A „Jellemző” a legtöbb
              vállalkozás reális projektkerete. A „Komplex” több oldalt, több
              tartalmat vagy összetettebb működést jelent. A tárhely, domain,
              fizetős bővítmények, szövegírás és fotózás minden ajánlatban külön
              tételként szerepel.
            </p>
            <Link className="btn" href="/kapcsolat">
              Kérek pontos ajánlatot <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="prose price-extra">
            <h2>Mi befolyásolja a végleges díjat?</h2>
            <p>
              A sávok iránymutatásnak valók. A végleges ajánlatot növeli a több
              oldal, az egyedi logika, az integrációk, a szűk határidő és a
              tartalomkészítés. Csökkenti, ha tiszta a brief, kész a szöveg, és
              a scope jól körül van határolva. Részletesebben a{" "}
              <Link href="/tudastar/weboldal-keszites-arak-2026">
                weboldal árak 2026
              </Link>{" "}
              cikkben.
            </p>
            <h2>Mi nincs benne automatikusan?</h2>
            <ul>
              <li>Domain regisztráció és éves megújítás</li>
              <li>Tárhely / hosting díjak</li>
              <li>Fizetős pluginok, fizetési szolgáltatói díjak</li>
              <li>Professzionális fotózás és hosszabb szövegírás</li>
              <li>Folyamatos marketing / hirdetéskezelés</li>
            </ul>
            <p>
              Ha inkább a szolgáltatások részleteire vagy kíváncsi, nézd meg a{" "}
              <Link href="/weboldal-keszites">weboldal készítés</Link>,{" "}
              <Link href="/webshop-keszites">webshop</Link>,{" "}
              <Link href="/egyedi-webfejlesztes">egyedi fejlesztés</Link> vagy{" "}
              <Link href="/weboldal-karbantartas">karbantartás</Link> oldalakat.
            </p>
          </div>

          <section className="faq" id="gyik">
            <div className="section-head">
              <div>
                <div className="eyebrow">GYIK</div>
                <h2>Árazással kapcsolatos kérdések</h2>
              </div>
            </div>
            <div className="faq-list faq-list-single">
              {AR_FAQS.map((item) => (
                <details className="faq-item" key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          <nav className="related-links" aria-label="Kapcsolódó szolgáltatások">
            <Link href="/weboldal-keszites">Weboldal készítés</Link>
            <Link href="/webshop-keszites">Webshop készítés</Link>
            <Link href="/egyedi-webfejlesztes">Egyedi webfejlesztés</Link>
            <Link href="/weboldal-karbantartas">Karbantartás</Link>
            <Link href="/tudastar">Tudástár</Link>
            <Link href="/kapcsolat">Kapcsolat</Link>
          </nav>
        </div>
      </section>
    </LandingShell>
  );
}
