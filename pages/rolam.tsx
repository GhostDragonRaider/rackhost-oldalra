import React from "react";
import Link from "next/link";
import LandingShell from "../components/landing/LandingShell";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  SITE_EMAIL,
  SITE_NAME,
  SITE_URL,
} from "../lib/site";

const TITLE = "Rólam | AntiCode";
const DESCRIPTION =
  "AntiCode — egy kapcsolattartó, átlátható webfejlesztés: weboldalak, webshopok és egyedi rendszerek szolgáltató vállalkozásoknak.";

export default function RolamPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: TITLE,
      url: absoluteUrl("/rolam"),
      description: DESCRIPTION,
    },
    breadcrumbJsonLd([
      { name: "Kezdőlap", path: "/" },
      { name: "Rólam", path: "/rolam" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Anti",
      jobTitle: "Alapító és fejlesztő",
      worksFor: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      email: SITE_EMAIL,
      url: absoluteUrl("/rolam"),
    },
  ];

  return (
    <LandingShell
      title={TITLE}
      description={DESCRIPTION}
      path="/rolam"
      jsonLd={jsonLd}
    >
      <section className="hero container subpage-hero">
        <div>
          <div className="eyebrow">Rólam</div>
          <h1>Egy kapcsolattartó. Tiszta felelősség.</h1>
          <p>
            Az AntiCode mögött egy fejlesztő áll: Anti. Nem ügynökségi
            telefonközpont, hanem közvetlen egyeztetés a brief-től az
            átadásig — weboldalaknál, webshopoknál és egyedi rendszereknél.
          </p>
        </div>
      </section>

      <section className="content-block">
        <div className="container prose">
          <h2>Hogyan dolgozom?</h2>
          <p>
            Előbb a célt és a döntési helyzetet tisztázzuk, utána jön a
            szerkezet és a felület. Az ajánlat írásos: terjedelem, határidő,
            díj, és ami nincs benne. A portfólió demók élő példák — a te
            projekted a saját ajánlatodra szabott.
          </p>
          <p>
            Ha szeretnél együtt dolgozni, írj a{" "}
            <Link href="/kapcsolat">kapcsolat</Link> oldalon, vagy közvetlenül:{" "}
            <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>. Az árakról a{" "}
            <Link href="/arak">/arak</Link> oldalon tájékozódhatsz.
          </p>
          <ul className="related-links">
            <li>
              <Link href="/weboldal-keszites">Weboldal készítés</Link>
            </li>
            <li>
              <Link href="/tudastar">Tudástár</Link>
            </li>
            <li>
              <Link href="/kapcsolat">Ajánlatkérés</Link>
            </li>
          </ul>
        </div>
      </section>
    </LandingShell>
  );
}
