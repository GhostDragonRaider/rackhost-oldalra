import React, { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import LandingShell from "../../components/landing/LandingShell";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  SITE_NAME,
  SITE_URL,
} from "../../lib/site";

const TITLE = "AntiCode Weboldal-ellenőrző";
const DESCRIPTION =
  "Valós, szerveroldali weboldal-ellenőrzés AntiCode-tól: technikai, SEO, biztonsági és tartalmi jelek — hamis pontszámok nélkül.";

function errorForStatus(status: number, fallback?: string): string {
  if (status === 400) {
    return (
      fallback ||
      "Érvénytelen URL. Csak publikus http(s) címet adj meg (localhost és privát IP nem engedélyezett)."
    );
  }
  if (status === 429) {
    return (
      fallback ||
      "Túl sok kérés érkezett. Kérlek várj egy kicsit, majd próbáld újra."
    );
  }
  if (status === 503) {
    return (
      fallback ||
      "Az ellenőrző szolgáltatás most nem elérhető. Próbáld meg később."
    );
  }
  return fallback || "Nem sikerült elindítani az ellenőrzést.";
}

export default function WebsiteAuditLandingPage() {
  const router = useRouter();
  const [url, setUrl] = useState("https://");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: TITLE,
      url: absoluteUrl("/weboldal-ellenorzo"),
      description: DESCRIPTION,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    },
    breadcrumbJsonLd([
      { name: "Kezdőlap", path: "/" },
      { name: "Weboldal-ellenőrző", path: "/weboldal-ellenorzo" },
    ]),
  ];

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/website-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      let data: {
        ok?: boolean;
        id?: string;
        audit?: { id?: string };
        error?: string;
        message?: string;
      } = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (!res.ok || data.ok === false) {
        setError(errorForStatus(res.status, data.error || data.message));
        return;
      }
      const id = data.audit?.id || data.id;
      if (!id) {
        setError("Az ellenőrzés elindult, de nem kaptunk azonosítót. Próbáld újra.");
        return;
      }
      await router.push(`/weboldal-ellenorzo/${encodeURIComponent(id)}`);
    } catch {
      setError("Hálózati hiba. Ellenőrizd a kapcsolatot, majd próbáld újra.");
    } finally {
      setSending(false);
    }
  }

  return (
    <LandingShell
      title={TITLE}
      description={DESCRIPTION}
      path="/weboldal-ellenorzo"
      jsonLd={jsonLd}
    >
      <div className="wa-page">
        <section className="hero container subpage-hero">
          <div>
            <div className="eyebrow">Eszköz</div>
            <h1>AntiCode Weboldal-ellenőrző</h1>
            <p>
              Valós, szerveroldali ellenőrzés egy publikus URL-re. Nincs hamis
              pontszám és nincs „feltörtük az oldaladat” színjáték — a biztonság
              itt nem behatolás, hanem nem-intruzív kitettségvizsgálat.
            </p>

            <form className="wa-audit-form" onSubmit={onSubmit} noValidate>
              <label htmlFor="wa-url">Weboldal URL</label>
              <div className="wa-audit-form__row">
                <input
                  id="wa-url"
                  name="url"
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://pelda.hu"
                  disabled={sending}
                  aria-describedby="wa-url-hint"
                />
                <button
                  className="btn"
                  type="submit"
                  disabled={sending}
                  aria-busy={sending}
                >
                  {sending ? "Indítás…" : "Weboldal ellenőrzése"}{" "}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
              <p id="wa-url-hint" className="wa-audit-form__hint">
                Csak publikus http(s) cím. Localhost / privát IP tiltott.
              </p>
              {error ? (
                <p className="form-status form-status-error" role="alert">
                  {error}
                </p>
              ) : null}
            </form>

            <div className="wa-honest">
              <h2>Mit nézünk — és mit nem</h2>
              <p>
                Technikai elérhetőség, SEO jelek, tartalmi szerkezet és
                biztonsági kitettség (HTTPS, fejlécek, cookie jelek). A pontszám
                a tényleges ellenőrzésekből jön — ha valamit nem tudunk
                megmérni, azt UNAVAILABLE-ként jelezzük, nem PASS-ként.
              </p>
              <p>
                Ez nem teljes biztonsági audit, nem feltörési teszt, és nem
                helyettesít kézi szakértői vizsgálatot.
              </p>
            </div>
          </div>
        </section>
      </div>
    </LandingShell>
  );
}
