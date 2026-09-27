import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SITE_EMAIL } from "../../../lib/site";

export type QuoteRequestKind = "fix" | "security";

export type QuoteRequestContext = {
  auditId: string;
  url: string;
  overallScore: number | null;
  overallLabel: string;
  priorityTitles: string[];
};

type QuoteRequestModalProps = {
  open: boolean;
  kind: QuoteRequestKind;
  context: QuoteRequestContext | null;
  onClose: () => void;
  onActivity?: () => void;
};

const KIND_META: Record<
  QuoteRequestKind,
  { title: string; kicker: string; service: string; blurb: string }
> = {
  fix: {
    title: "Árajánlat a javításokra",
    kicker: "Ajánlatkérés",
    service: "Meglévő oldal megújítása",
    blurb:
      "Add meg az elérhetőséged — az audit alapján visszajelzek a javítási keretről, kötelezettség nélkül.",
  },
  security: {
    title: "Árajánlat biztonsági felmérésre",
    kicker: "Authorized Assessment",
    service: "Még egyeztetném",
    blurb:
      "Írásos engedélyhez és scope-hoz kötött felmérés. Add meg az elérhetőséged, és egyeztetünk a következő lépésről.",
  },
};

function buildDefaultMessage(
  kind: QuoteRequestKind,
  ctx: QuoteRequestContext
): string {
  if (kind === "security") {
    return [
      "Biztonsági felmérés árajánlatát kérem (Authorized Security Assessment).",
      "Tudom, hogy ez írásos engedélyhez és scope-hoz kötött, nem automatikus scan.",
      `Audit ID (public exposure check): ${ctx.auditId}`,
      `URL: ${ctx.url}`,
    ].join("\n");
  }
  return [
    "Weboldal-ellenőrző alapján árajánlatot kérek a hibák javítására.",
    `Audit ID: ${ctx.auditId}`,
    `Ellenőrzött URL: ${ctx.url}`,
    `Összpontszám: ${ctx.overallScore ?? "—"}/100 (${ctx.overallLabel || ""})`,
    `Prioritás: ${ctx.priorityTitles.slice(0, 5).join("; ") || "—"}`,
  ].join("\n");
}

export function QuoteRequestModal({
  open,
  kind,
  context,
  onClose,
  onActivity,
}: QuoteRequestModalProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const meta = KIND_META[kind];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !context) return;
    setName("");
    setEmail("");
    setPhone("");
    setHoneypot("");
    setMessage(buildDefaultMessage(kind, context));
    setStatus("");
    setError("");
    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, [open, kind, context]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open || !context) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    onActivity?.();
    setSending(true);
    setStatus("");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone.trim() || undefined,
          service: meta.service,
          message: message.trim(),
          website: honeypot,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Nem sikerült elküldeni.");
        return;
      }
      setStatus(json.message || "Elküldve.");
      setName("");
      setEmail("");
      setPhone("");
    } catch {
      setError(`Váratlan hiba. Írj közvetlenül: ${SITE_EMAIL}`);
    } finally {
      setSending(false);
    }
  }

  return createPortal(
    <div className="quote-modal" role="presentation">
      <button
        type="button"
        className="quote-modal__backdrop"
        aria-label="Ablak bezárása"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="quote-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <div className="quote-modal__glow" aria-hidden />
        <header className="quote-modal__head">
          <div>
            <p className="quote-modal__kicker">{meta.kicker}</p>
            <h2 id={titleId}>{meta.title}</h2>
            <p id={descId} className="quote-modal__blurb">
              {meta.blurb}
            </p>
          </div>
          <button
            type="button"
            className="quote-modal__close"
            aria-label="Bezárás"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="quote-modal__meta">
          <span>{context.url}</span>
          <span>
            {context.overallScore != null
              ? `${context.overallScore}/100`
              : "—"}
            {context.overallLabel ? ` · ${context.overallLabel}` : ""}
          </span>
        </div>

        {status ? (
          <div className="quote-modal__success" role="status">
            <strong>Köszönöm!</strong>
            <p>{status}</p>
            <button type="button" className="quote-modal__submit" onClick={onClose}>
              Bezárás
            </button>
          </div>
        ) : (
          <form className="quote-modal__form" onSubmit={onSubmit} noValidate>
            <label>
              Név
              <input
                ref={firstFieldRef}
                name="name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={100}
                value={name}
                onChange={(e) => {
                  onActivity?.();
                  setName(e.target.value);
                }}
                placeholder="Neved vagy céged"
              />
            </label>
            <label>
              E-mail
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(e) => {
                  onActivity?.();
                  setEmail(e.target.value);
                }}
                placeholder="email@ceged.hu"
              />
            </label>
            <label>
              Telefon <span className="quote-modal__optional">(opcionális)</span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={40}
                value={phone}
                onChange={(e) => {
                  onActivity?.();
                  setPhone(e.target.value);
                }}
                placeholder="+36 …"
              />
            </label>
            <label className="quote-modal__full">
              Üzenet
              <textarea
                name="message"
                required
                minLength={10}
                maxLength={2000}
                rows={6}
                value={message}
                onChange={(e) => {
                  onActivity?.();
                  setMessage(e.target.value);
                }}
              />
            </label>
            <label className="quote-modal__hp" aria-hidden="true">
              Website
              <input
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </label>
            {error ? <p className="quote-modal__error">{error}</p> : null}
            <div className="quote-modal__actions">
              <button
                type="button"
                className="quote-modal__ghost"
                onClick={onClose}
              >
                Mégse
              </button>
              <button
                type="submit"
                className="quote-modal__submit"
                disabled={sending}
                aria-busy={sending}
              >
                {sending ? "Küldés…" : "Árajánlat kérése"}
              </button>
            </div>
            <p className="quote-modal__fine">
              Az adatokat csak az ajánlatkéréshez használom. Válasz: 1 munkanapon
              belül · {SITE_EMAIL}
            </p>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
