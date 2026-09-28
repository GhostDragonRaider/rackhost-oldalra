import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AdminShell from "../../components/admin/AdminShell";
import type { QuoteRequest, QuoteStatus } from "../../lib/quotes-store";

const SOURCE_LABEL: Record<string, string> = {
  landing: "Kezdőlap űrlap",
  kapcsolat: "Kapcsolat oldal",
  "audit-quote": "Admin weboldal-ellenőrző",
  "public-audit": "Publikus ellenőrző",
  other: "Egyéb",
};

const STATUS_LABEL: Record<QuoteStatus, string> = {
  new: "Új",
  read: "Olvasott",
  replied: "Válaszolva",
  archived: "Archivált",
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function QuotesWorkspace({ bumpIdle }: { bumpIdle: () => void }) {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [newCount, setNewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/quotes", {
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Az árajánlatok nem tölthetők be.");
        return;
      }
      setQuotes(data.quotes || []);
      setNewCount(data.newCount || 0);
    } catch {
      setError("Hálózati hiba az árajánlatok betöltésekor.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(id: string, status: QuoteStatus) {
    bumpIdle();
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/quotes", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Állapot mentése sikertelen.");
        return;
      }
      await load();
    } catch {
      setError("Hálózati hiba az állapot mentésekor.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="admin-card admin-quotes">
      <header className="admin-quotes__head">
        <div>
          <p className="lab-kicker">Árajánlatok</p>
          <h2>Beérkezett ajánlatkérések</h2>
          <p className="admin-muted">
            Ide érkezik a weboldal-ellenőrző árajánlat űrlapja és a publikus
            kapcsolat / kezdőlap ajánlatkérései.
            {newCount > 0 ? ` · ${newCount} új` : ""}
          </p>
        </div>
        <button
          type="button"
          className="admin-ghost"
          onClick={() => {
            bumpIdle();
            setLoading(true);
            void load();
          }}
        >
          Frissítés
        </button>
      </header>

      {error ? (
        <p className="admin-error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="admin-muted">Betöltés…</p>
      ) : quotes.length === 0 ? (
        <p className="admin-muted">
          Még nincs beérkezett árajánlat. Próbáld az admin ellenőrző „Árajánlatot
          kérek” gombját vagy a{" "}
          <Link href="/kapcsolat">/kapcsolat</Link> űrlapot.
        </p>
      ) : (
        <ul className="admin-quotes__list">
          {quotes.map((q) => (
            <li
              key={q.id}
              className={`admin-quotes__item${
                q.status === "new" ? " is-new" : ""
              }`}
            >
              <div className="admin-quotes__item-top">
                <div>
                  <strong>{q.name || "Névtelen"}</strong>
                  <span className="admin-quotes__meta">
                    {SOURCE_LABEL[q.source] || q.source} · {formatWhen(q.createdAt)}
                  </span>
                </div>
                <span
                  className={`admin-quotes__status admin-quotes__status--${q.status}`}
                >
                  {STATUS_LABEL[q.status]}
                </span>
              </div>

              <dl className="admin-quotes__grid">
                <div>
                  <dt>E-mail</dt>
                  <dd>
                    {q.email ? (
                      <a href={`mailto:${q.email}`}>{q.email}</a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Telefon</dt>
                  <dd>{q.phone || "—"}</dd>
                </div>
                <div>
                  <dt>Szolgáltatás</dt>
                  <dd>{q.service || "—"}</dd>
                </div>
                <div>
                  <dt>Weboldal</dt>
                  <dd>
                    {q.websiteUrl ? (
                      <a href={q.websiteUrl} target="_blank" rel="noreferrer">
                        {q.websiteUrl}
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                {q.auditId || q.overallScore != null ? (
                  <div className="admin-quotes__wide">
                    <dt>Audit</dt>
                    <dd>
                      {q.auditId ? (
                        <Link href="/admin/website-audit">{q.auditId}</Link>
                      ) : null}
                      {q.overallScore != null
                        ? `${q.auditId ? " · " : ""}${q.overallScore}/100`
                        : ""}
                      {q.overallLabel ? ` · ${q.overallLabel}` : ""}
                    </dd>
                  </div>
                ) : null}
                <div className="admin-quotes__wide">
                  <dt>Üzenet</dt>
                  <dd className="admin-quotes__message">{q.message || "—"}</dd>
                </div>
              </dl>

              <div className="admin-quotes__actions">
                {q.status === "new" ? (
                  <button
                    type="button"
                    className="admin-ghost"
                    disabled={busyId === q.id}
                    onClick={() => void setStatus(q.id, "read")}
                  >
                    Megnézve
                  </button>
                ) : null}
                {q.status !== "replied" ? (
                  <button
                    type="button"
                    className="admin-ghost"
                    disabled={busyId === q.id}
                    onClick={() => void setStatus(q.id, "replied")}
                  >
                    Válaszolva
                  </button>
                ) : null}
                {q.status !== "archived" ? (
                  <button
                    type="button"
                    className="admin-ghost"
                    disabled={busyId === q.id}
                    onClick={() => void setStatus(q.id, "archived")}
                  >
                    Archiválás
                  </button>
                ) : (
                  <button
                    type="button"
                    className="admin-ghost"
                    disabled={busyId === q.id}
                    onClick={() => void setStatus(q.id, "read")}
                  >
                    Visszaállítás
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function AdminQuotesPage() {
  return (
    <AdminShell active="quotes" title="Árajánlatok">
      {({ bumpIdle }) => (
        <>
          <Head>
            <title>Árajánlatok · AntiCode Admin</title>
          </Head>
          <QuotesWorkspace bumpIdle={bumpIdle} />
        </>
      )}
    </AdminShell>
  );
}
