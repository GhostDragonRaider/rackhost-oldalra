import React from "react";
import Link from "next/link";
import LandingShell from "../components/landing/LandingShell";
import PricingTable from "../components/landing/PricingTable";
import { absoluteUrl, SITE_EMAIL, SITE_NAME, SITE_URL } from "../lib/site";

const TITLE = "Weboldal és webshop árak | AntiCode";
const DESCRIPTION =
  "Átlátható árkeretek weboldal készítéshez, webshophoz, egyedi fejlesztéshez és karbantartáshoz. Induló, jellemző és komplex projektméretek — AntiCode.";

export default function ArakPage() {
  const jsonLd = {
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
    },
  };

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
              Szolgáltatásonként három keretet mutatok. A pontos ajánlatot a tartalom,
              a funkciók és a határidő alapján állítom össze.
            </p>
          </div>

          <PricingTable />

          <div className="price-callout">
            <p>
              <strong>Így olvasd az árakat:</strong> az „Induló” egy tiszta,
              körülhatárolt feladat belépő díja. A „Jellemző” a legtöbb vállalkozás
              reális projektkerete. A „Komplex” több oldalt, több tartalmat vagy
              összetettebb működést jelent. A tárhely, domain, fizetős bővítmények,
              szövegírás és fotózás minden ajánlatban külön tételként szerepel.
            </p>
            <a className="btn" href="/#kapcsolat">
              Kérek pontos ajánlatot <span aria-hidden="true">→</span>
            </a>
          </div>

          <nav className="related-links" aria-label="Kapcsolódó szolgáltatások">
            <Link href="/weboldal-keszites">Weboldal készítés</Link>
            <Link href="/webshop-keszites">Webshop készítés</Link>
            <Link href="/egyedi-webfejlesztes">Egyedi webfejlesztés</Link>
            <Link href="/weboldal-karbantartas">Karbantartás</Link>
          </nav>
        </div>
      </section>
    </LandingShell>
  );
}
