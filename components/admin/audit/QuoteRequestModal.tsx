import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SITE_EMAIL } from "../../../lib/site";

export type QuoteRequestContext = {
  auditId: string;
  url: string;
  overallScore: number | null;
  overallLabel: string;
  priorityTitles: string[];
};

type QuoteRequestModalProps = {
  open: boolean;
  context: QuoteRequestContext | null;
  onClose: () => void;
  onActivity?: () => void;
};

const SERVICE = "Meglévő oldal megújítása";

function buildDefaultMessage(ctx: QuoteRequestContext): string {
  const score =
    ctx.overallScore != null
      ? `${ctx.overallScore}/100${ctx.overallLabel ? ` · ${ctx.overallLabel}` : ""}`
      : "—";
  return `Árajánlatot kérek a weboldal-ellenőrző alapján jelzett javításokra. URL: ${ctx.url} · ${score} · audit: ${ctx.auditId}`;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export function QuoteRequestModal({
  open,
  context,
  onClose,
  onActivity,
}: QuoteRequestModalProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  }>({});
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
    setMessage(buildDefaultMessage(context));
    setStatus("");
    setError("");
    setFieldErrors({});
    setSubmitted(null);
    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, [open, context]);

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
  const ctx = context;

  function validateFields(snapshot: {
    name: string;
    email: string;
    phone: string;
    message: string;
  }): boolean {
    const next: typeof fieldErrors = {};
    if (snapshot.name.length < 2 || snapshot.name.length > 100) {
      next.name = "Add meg a neved (legalább 2 karakter).";
    }
    if (!isValidEmail(snapshot.email)) {
      next.email = "Érvényes e-mail címet adj meg.";
    }
    if (
      snapshot.phone &&
      (snapshot.phone.length < 6 || snapshot.phone.length > 40)
    ) {
      next.phone = "A telefonszám túl rövid vagy túl hosszú.";
    }
    if (snapshot.message.length < 10 || snapshot.message.length > 2000) {
      next.message = "Írj röviden a projektről (legalább 10 karakter).";
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

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
    if (!validateFields(snapshot)) {
      setSending(false);
      return;
    }
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: snapshot.name,
          email: snapshot.email,
          phone: snapshot.phone || undefined,
          service: SERVICE,
          message: snapshot.message,
          website: honeypot,
          source: "audit-quote",
          auditId: ctx.auditId,
          websiteUrl: ctx.url,
          overallScore: ctx.overallScore,
          overallLabel: ctx.overallLabel || undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setError(
          json?.error ||
            `Nem sikerült elküldeni. Írj közvetlenül: ${SITE_EMAIL}`
        );
        return;
      }
      setSubmitted(snapshot);
      setStatus(
        json?.message ||
          "Megkaptam az üzeneted – 1 munkanapon belül jelentkezem."
      );
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
                <p className="quote-modal__kicker">Ajánlatkérés</p>
                <h2 id={titleId}>Árajánlat a javításokra</h2>
                <p id={descId} className="quote-modal__blurb">
                  Add meg az elérhetőséged — kötelezettség nélkül visszajelzek.
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
              <span>{ctx.url}</span>
              <span>
                {ctx.overallScore != null ? `${ctx.overallScore}/100` : "—"}
                {ctx.overallLabel ? ` · ${ctx.overallLabel}` : ""}
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
                      Javítási ajánlatkérés
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
                    <dd>{ctx.url || "—"}</dd>
                  </div>
                  <div className="quote-ticket__grid-wide">
                    <dt>Megjegyzés</dt>
                    <dd>{submitted.message || "—"}</dd>
                  </div>
                </dl>
              </div>

              <footer className="quote-ticket__footer">
                <p className="quote-ticket__promise">
                  Hamarosan felvesszük Önnel a kapcsolatot.
                </p>
                <p className="quote-ticket__footer-meta">
                  {ctx.auditId.slice(0, 8).toUpperCase()}
                  {ctx.overallScore != null
                    ? ` · ${ctx.overallScore}/100`
                    : ""}
                  {ctx.overallLabel ? ` · ${ctx.overallLabel}` : ""}
                </p>
              </footer>
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
          <form className="quote-modal__form" onSubmit={onSubmit}>
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
                aria-invalid={!!fieldErrors.name}
                onChange={(e) => {
                  onActivity?.();
                  setName(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Neved vagy céged"
              />
              {fieldErrors.name ? (
                <span className="quote-modal__field-error">{fieldErrors.name}</span>
              ) : null}
            </label>
            <label>
              E-mail
              <input
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                aria-invalid={!!fieldErrors.email}
                onChange={(e) => {
                  onActivity?.();
                  setEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="email@ceged.hu"
              />
              {fieldErrors.email ? (
                <span className="quote-modal__field-error">{fieldErrors.email}</span>
              ) : null}
            </label>
            <label>
              Telefon
              <input
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={40}
                value={phone}
                aria-invalid={!!fieldErrors.phone}
                onChange={(e) => {
                  onActivity?.();
                  setPhone(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                placeholder="+36 …"
              />
              {fieldErrors.phone ? (
                <span className="quote-modal__field-error">{fieldErrors.phone}</span>
              ) : null}
            </label>
            <label className="quote-modal__full">
              Üzenet
              <textarea
                name="message"
                required
                minLength={10}
                maxLength={2000}
                rows={3}
                value={message}
                aria-invalid={!!fieldErrors.message}
                onChange={(e) => {
                  onActivity?.();
                  setMessage(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, message: undefined }));
                }}
              />
              {fieldErrors.message ? (
                <span className="quote-modal__field-error">
                  {fieldErrors.message}
                </span>
              ) : null}
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
              Az űrlap az Árajánlatok menübe is beérkezik. · {SITE_EMAIL}
            </p>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
