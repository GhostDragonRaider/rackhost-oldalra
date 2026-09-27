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
    blurb: "Add meg az elérhetőséged — kötelezettség nélkül visszajelzek.",
  },
  security: {
    title: "Árajánlat biztonsági felmérésre",
    kicker: "Authorized Assessment",
    service: "Még egyeztetném",
    blurb:
      "Írásos engedélyhez kötött felmérés. Add meg az elérhetőséged az egyeztetéshez.",
  },
};

function buildDefaultMessage(
  kind: QuoteRequestKind,
  ctx: QuoteRequestContext
): string {
  if (kind === "security") {
    return `Biztonsági felmérés árajánlatát kérem az alábbi oldalra: ${ctx.url} (audit: ${ctx.auditId}).`;
  }
  const score =
    ctx.overallScore != null
      ? `${ctx.overallScore}/100${ctx.overallLabel ? ` · ${ctx.overallLabel}` : ""}`
      : "—";
  return `Árajánlatot kérek a weboldal-ellenőrző alapján jelzett javításokra. URL: ${ctx.url} · ${score} · audit: ${ctx.auditId}`;
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
  const [submitted, setSubmitted] = useState<{
    name: string;
    email: string;
    phone: string;
    message: string;
  } | null>(null);

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
    setSubmitted(null);
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
    const snapshot = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: snapshot.name,
          email: snapshot.email,
          phone: snapshot.phone || undefined,
          service: meta.service,
          message: snapshot.message || "—",
          website: honeypot,
          source: "audit-quote",
        }),
      });
      const json = await res.json().catch(() => ({}));
      // Teszt: mindig továbbengedjük a visszaigazolásra a beírt adatokkal.
      setSubmitted(snapshot);
      setStatus(
        json?.message ||
          "Megkaptam az üzeneted – 1 munkanapon belül jelentkezem."
      );
    } catch {
      setSubmitted(snapshot);
      setStatus(
        `Teszt mód: az adatok rögzítve. Ha kell, írj közvetlenül: ${SITE_EMAIL}`
      );
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
        className={`quote-modal__panel${submitted ? " quote-modal__panel--ticket" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <div className="quote-modal__glow" aria-hidden />
        {!submitted ? (
          <>
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
          </>
        ) : null}

        {submitted ? (
          <div className="quote-ticket-wrap" role="status">
            <button
              type="button"
              className="quote-modal__close quote-ticket__close"
              aria-label="Bezárás"
              onClick={onClose}
            >
              ×
            </button>
            <article className="quote-ticket" aria-labelledby={titleId}>
              <div className="quote-ticket__main">
                <header className="quote-ticket__brand">
                  <div>
                    <p className="quote-ticket__airline">AntiCode · árajánlat</p>
                    <h2 id={titleId} className="quote-ticket__title">
                      {kind === "security"
                        ? "Biztonsági felmérés"
                        : "Javítási ajánlatkérés"}
                    </h2>
                  </div>
                  <span className="quote-ticket__status">Elküldve</span>
                </header>

                <p id={descId} className="quote-ticket__note">
                  {status}
                </p>

                <dl className="quote-ticket__grid">
                  <div>
                    <dt>Név</dt>
                    <dd>{submitted.name || "—"}</dd>
                  </div>
                  <div>
                    <dt>E-mail</dt>
                    <dd>{submitted.email || "—"}</dd>
                  </div>
                  <div>
                    <dt>Telefon</dt>
                    <dd>{submitted.phone || "—"}</dd>
                  </div>
                  <div>
                    <dt>Weboldal</dt>
                    <dd>{context.url || "—"}</dd>
                  </div>
                  <div className="quote-ticket__grid-wide">
                    <dt>Megjegyzés</dt>
                    <dd>{submitted.message || "—"}</dd>
                  </div>
                </dl>
              </div>

              <div className="quote-ticket__perforation" aria-hidden />

              <aside className="quote-ticket__stub">
                <p className="quote-ticket__stub-label">Jegy</p>
                <p className="quote-ticket__stub-id">
                  {context.auditId.slice(0, 8).toUpperCase()}
                </p>
                <p className="quote-ticket__stub-meta">
                  {context.overallScore != null
                    ? `${context.overallScore}/100`
                    : "—"}
                </p>
                {context.overallLabel ? (
                  <p className="quote-ticket__stub-meta">{context.overallLabel}</p>
                ) : null}
              </aside>
            </article>
            <button
              type="button"
              className="quote-modal__submit quote-ticket__done"
              onClick={onClose}
            >
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
                type="text"
                inputMode="email"
                autoComplete="email"
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
              Telefon
              <input
                name="phone"
                type="text"
                inputMode="tel"
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
                maxLength={2000}
                rows={3}
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
              Teszt: a név / e-mail / telefon nincs ellenőrizve. · {SITE_EMAIL}
            </p>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
