import React, { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import LandingShell from "../components/landing/LandingShell";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  SITE_EMAIL,
  SITE_NAME,
  SITE_URL,
} from "../lib/site";

const TITLE = "Kapcsolat | AntiCode";
const DESCRIPTION =
  "Ajánlatkérés AntiCode-tól: írd meg röviden a projekted, és 1 munkanapon belül visszajelzek. Weboldal, webshop, egyedi fejlesztés.";

const SERVICE_OPTIONS = [
  "Üzletszerző weboldal",
  "Webshop vagy egyedi rendszer",
  "Meglévő oldal megújítása",
  "Még egyeztetném",
] as const;

export default function KapcsolatPage() {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const prefill = useMemo(() => {
    const q = router.query;
    const message = typeof q.message === "string" ? q.message : "";
    const serviceRaw = typeof q.service === "string" ? q.service : "";
    const websiteUrl =
      typeof q.website_url === "string" ? q.website_url.trim() : "";
    const service = SERVICE_OPTIONS.includes(
      serviceRaw as (typeof SERVICE_OPTIONS)[number]
    )
      ? serviceRaw
      : "";
    const messageWithUrl =
      websiteUrl && message && !message.includes(websiteUrl)
        ? `${message}\nURL: ${websiteUrl}`
        : message;
    return { message: messageWithUrl, service };
  }, [router.query]);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: TITLE,
      url: absoluteUrl("/kapcsolat"),
      description: DESCRIPTION,
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    },
    breadcrumbJsonLd([
      { name: "Kezdőlap", path: "/" },
      { name: "Kapcsolat", path: "/kapcsolat" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: SITE_NAME,
      url: SITE_URL,
      email: SITE_EMAIL,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        email: SITE_EMAIL,
        availableLanguage: ["Hungarian"],
      },
    },
  ];

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setStatus("");
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          service: data.get("service"),
          message: data.get("message"),
          website: data.get("website"),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Nem sikerült elküldeni.");
        return;
      }
      setStatus(json.message || "Elküldve.");
      form.reset();
    } catch {
      setError(`Váratlan hiba. Írj közvetlenül: ${SITE_EMAIL}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <LandingShell
      title={TITLE}
      description={DESCRIPTION}
      path="/kapcsolat"
      jsonLd={jsonLd}
    >
      <section className="hero container subpage-hero">
        <div>
          <div className="eyebrow">Kapcsolat</div>
          <h1>Mondd el röviden, min szeretnél változtatni.</h1>
          <p>
            Néhány mondat alapján visszajelzek, hogy látok-e értelmes irányt.
            Ha igen, kapsz egy tiszta következő lépést és projektkeretet —
            kötelezettség nélkül. Közvetlen e-mail:{" "}
            <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>
          </p>
        </div>
      </section>

      <section className="contact" id="urlap">
        <div className="container">
          <div className="contact-inner contact-inner-stack">
            <div className="contact-copy">
              <div className="eyebrow">Ajánlatkérés</div>
              <h2>Projektindító űrlap</h2>
              <p>
                Az adatokat csak az ajánlatkérés kezeléséhez használom. Válasz: 1
                munkanapon belül. Az árakról előzetesen a{" "}
                <Link href="/arak">/arak</Link> oldalon tájékozódhatsz.
              </p>
            </div>
            <form className="lead-form" onSubmit={onSubmit} noValidate>
              <label htmlFor="kapcsolat-name">
                Név
                <input
                  id="kapcsolat-name"
                  name="name"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="Neved"
                />
              </label>
              <label htmlFor="kapcsolat-email">
                E-mail
                <input
                  id="kapcsolat-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  placeholder="email@ceged.hu"
                />
              </label>
              <label className="full" htmlFor="kapcsolat-service">
                Mire van szükséged?
                <select
                  id="kapcsolat-service"
                  name="service"
                  required
                  key={prefill.service || "empty"}
                  defaultValue={prefill.service || ""}
                >
                  <option value="" disabled>
                    Válassz egy irányt
                  </option>
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
              <label className="full" htmlFor="kapcsolat-message">
                Röviden a projektről
                <textarea
                  id="kapcsolat-message"
                  name="message"
                  required
                  minLength={10}
                  maxLength={2000}
                  key={prefill.message || "empty-msg"}
                  defaultValue={prefill.message}
                  placeholder="Mivel foglalkozol, mi nem működik most jól, és mit szeretnél elérni?"
                />
              </label>
              <div className="hp-field" aria-hidden="true">
                <label htmlFor="kapcsolat-website">
                  Weboldal
                  <input
                    id="kapcsolat-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>
              </div>
              <button className="btn" type="submit" disabled={sending}>
                {sending ? "Küldés..." : "Üzenet küldése"}{" "}
                <span aria-hidden="true">→</span>
              </button>
              {error ? (
                <p className="form-status form-status-error" role="alert">
                  {error}
                </p>
              ) : null}
              {status ? (
                <p className="form-status" role="status">
                  {status}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </section>
    </LandingShell>
  );
}
