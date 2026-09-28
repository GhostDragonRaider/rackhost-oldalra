import Head from "next/head";
import { FormEvent, useCallback, useEffect, useState } from "react";
import AdminShell from "../../components/admin/AdminShell";
import type {
  OutreachCampaign,
  OutreachContact,
  OutreachContactStatus,
  OutreachSendLog,
} from "../../lib/outreach-store";

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return "—";
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

const STATUS_LABEL: Record<OutreachContactStatus, string> = {
  active: "Aktív",
  paused: "Szünetel",
  unsubscribed: "Leiratkozott",
};

function OutreachWorkspace({ bumpIdle }: { bumpIdle: () => void }) {
  const [contacts, setContacts] = useState<OutreachContact[]>([]);
  const [campaign, setCampaign] = useState<OutreachCampaign | null>(null);
  const [logs, setLogs] = useState<OutreachSendLog[]>([]);
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [intervalDays, setIntervalDays] = useState(14);
  const [enabled, setEnabled] = useState(false);

  const load = useCallback(async () => {
    setError("");
    const res = await fetch("/api/admin/outreach", {
      credentials: "same-origin",
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data.error || "Az ügyfélszerzés adatok nem tölthetők be.");
      return;
    }
    setContacts(data.contacts || []);
    setLogs(data.logs || []);
    setSmtpConfigured(Boolean(data.smtpConfigured));
    const c = data.campaign as OutreachCampaign;
    setCampaign(c);
    setSubject(c.subject);
    setBody(c.body);
    setIntervalDays(c.intervalDays);
    setEnabled(c.enabled);
  }, []);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  async function post(action: string, payload: Record<string, unknown> = {}) {
    bumpIdle();
    setBusy(true);
    setError("");
    setMsg("");
    try {
      const res = await fetch("/api/admin/outreach", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Művelet sikertelen.");
        return null;
      }
      if (data.contacts) setContacts(data.contacts);
      if (data.campaign) {
        setCampaign(data.campaign);
        setSubject(data.campaign.subject);
        setBody(data.campaign.body);
        setIntervalDays(data.campaign.intervalDays);
        setEnabled(data.campaign.enabled);
      }
      if (data.logs) setLogs(data.logs);
      if (typeof data.smtpConfigured === "boolean") {
        setSmtpConfigured(data.smtpConfigured);
      }
      return data;
    } catch {
      setError("Hálózati hiba.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    const data = await post("add", { email, name, company, notes });
    if (data) {
      setEmail("");
      setName("");
      setCompany("");
      setNotes("");
      setMsg("E-mail cím hozzáadva.");
    }
  }

  async function onSaveCampaign(e: FormEvent) {
    e.preventDefault();
    const data = await post("campaign", {
      subject,
      body,
      intervalDays,
      enabled,
    });
    if (data) setMsg("Kampány beállítások mentve.");
  }

  async function onImportQuotes() {
    const data = await post("import-quotes");
    if (data) {
      setMsg(
        `Árajánlatokból: ${data.added} új, ${data.skipped} kihagyva (már megvolt / érvénytelen).`
      );
    }
  }

  async function onSendAll() {
    if (
      !window.confirm(
        `Elküldöd a levelet az összes aktív címzettnek (${
          contacts.filter((c) => c.status === "active").length
        } fő)?`
      )
    ) {
      return;
    }
    const data = await post("send");
    if (data) {
      setMsg(
        `Kiküldés: ${data.sent} sikeres, ${data.failed} sikertelen, ${data.skipped} kihagyva.`
      );
    }
  }

  async function onSendOne(id: string) {
    const data = await post("send", { contactId: id });
    if (data) {
      setMsg(
        `Egyedi kiküldés: ${data.sent} sikeres, ${data.failed} sikertelen, ${data.skipped} kihagyva.`
      );
    }
  }

  async function setStatus(id: string, status: OutreachContactStatus) {
    await post("update", { id, status });
  }

  async function removeContact(id: string) {
    if (!window.confirm("Törlöd ezt a címet a listából?")) return;
    const data = await post("delete", { id });
    if (data) setMsg("Kontakt törölve.");
  }

  return (
    <section className="admin-card admin-outreach">
      <header className="admin-quotes__head">
        <div>
          <p className="lab-kicker">Ügyfélszerzés</p>
          <h2>E-mail gyűjtés és időszakos levelek</h2>
          <p className="admin-muted">
            Itt gyűjtjük az e-mail címeket, és időközönként ügyfélszerző leveleket
            küldünk.{" "}
            {smtpConfigured
              ? "SMTP konfigurálva."
              : "SMTP_PASS nincs beállítva — a kiküldés naplózza, de nem küld."}
          </p>
        </div>
        <div className="admin-quotes__actions">
          <button
            type="button"
            className="admin-ghost"
            disabled={busy}
            onClick={() => {
              bumpIdle();
              setLoading(true);
              void load().finally(() => setLoading(false));
            }}
          >
            Frissítés
          </button>
          <button
            type="button"
            className="lab-btn lab-btn--primary"
            disabled={busy}
            onClick={() => void onImportQuotes()}
          >
            Árajánlatokból
          </button>
        </div>
      </header>

      {error ? (
        <p className="admin-error" role="alert">
          {error}
        </p>
      ) : null}
      {msg ? <p className="admin-muted">{msg}</p> : null}

      {loading ? (
        <p className="admin-muted">Betöltés…</p>
      ) : (
        <div className="admin-outreach__grid">
          <form className="admin-outreach__panel lab-form" onSubmit={onAdd}>
            <h3>Új e-mail cím</h3>
            <label>
              E-mail *
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              Név
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>
              Cég
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </label>
            <label>
              Megjegyzés
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
            <button
              type="submit"
              className="lab-btn lab-btn--primary"
              disabled={busy}
            >
              Hozzáadás
            </button>
          </form>

          <form
            className="admin-outreach__panel lab-form"
            onSubmit={onSaveCampaign}
          >
            <h3>Kampány / időszakos levél</h3>
            <label>
              Tárgy
              <input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </label>
            <label>
              Szöveg
              <textarea
                rows={8}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </label>
            <p className="admin-muted">
              Helyettesítők: {"{{name}}"}, {"{{email}}"}, {"{{company}}"}
            </p>
            <label>
              Időköz (nap)
              <input
                type="number"
                min={1}
                max={365}
                value={intervalDays}
                onChange={(e) => setIntervalDays(Number(e.target.value) || 1)}
              />
            </label>
            <label className="lab-forms__check">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              Időszakos kiküldés bekapcsolva
            </label>
            {campaign ? (
              <p className="admin-muted">
                Utolsó futás: {formatWhen(campaign.lastRunAt)} · Következő:{" "}
                {formatWhen(campaign.nextRunAt)}
              </p>
            ) : null}
            <div className="admin-quotes__actions">
              <button
                type="submit"
                className="lab-btn lab-btn--primary"
                disabled={busy}
              >
                Kampány mentése
              </button>
              <button
                type="button"
                className="lab-btn"
                disabled={busy}
                onClick={() => void onSendAll()}
              >
                Most kiküldés (aktívak)
              </button>
            </div>
          </form>

          <div className="admin-outreach__panel admin-outreach__panel--wide">
            <h3>Címlista ({contacts.length})</h3>
            {!contacts.length ? (
              <p className="admin-muted">
                Még nincs e-mail a listán. Add hozzá kézzel, vagy importáld az
                árajánlatokból.
              </p>
            ) : (
              <table className="lab-table">
                <thead>
                  <tr>
                    <th>E-mail</th>
                    <th>Név / cég</th>
                    <th>Forrás</th>
                    <th>Státusz</th>
                    <th>Utolsó levél</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.email}</strong>
                        {c.notes ? (
                          <div className="admin-muted">{c.notes}</div>
                        ) : null}
                      </td>
                      <td>
                        {c.name || "—"}
                        <div className="admin-muted">{c.company || "—"}</div>
                      </td>
                      <td>{c.source}</td>
                      <td>
                        <select
                          value={c.status}
                          onChange={(e) =>
                            void setStatus(
                              c.id,
                              e.target.value as OutreachContactStatus
                            )
                          }
                        >
                          {(
                            Object.keys(STATUS_LABEL) as OutreachContactStatus[]
                          ).map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABEL[s]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>{formatWhen(c.lastEmailedAt)}</td>
                      <td>
                        <div className="admin-quotes__actions">
                          <button
                            type="button"
                            className="admin-ghost"
                            disabled={busy || c.status !== "active"}
                            onClick={() => void onSendOne(c.id)}
                          >
                            Küldés
                          </button>
                          <button
                            type="button"
                            className="lab-btn lab-btn--danger"
                            disabled={busy}
                            onClick={() => void removeContact(c.id)}
                          >
                            Törlés
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="admin-outreach__panel admin-outreach__panel--wide">
            <h3>Kiküldési napló</h3>
            {!logs.length ? (
              <p className="admin-muted">Még nincs kiküldés.</p>
            ) : (
              <table className="lab-table">
                <thead>
                  <tr>
                    <th>Idő</th>
                    <th>Címzett</th>
                    <th>Tárgy</th>
                    <th>Státusz</th>
                    <th>Részlet</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id}>
                      <td>{formatWhen(l.createdAt)}</td>
                      <td>{l.email}</td>
                      <td>{l.subject}</td>
                      <td>{l.status}</td>
                      <td>{l.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default function OutreachPage() {
  return (
    <>
      <Head>
        <title>Ügyfélszerzés · AntiCode Admin</title>
      </Head>
      <AdminShell active="outreach" title="Ügyfélszerzés">
        {({ authed, bumpIdle }) =>
          authed ? <OutreachWorkspace bumpIdle={bumpIdle} /> : null
        }
      </AdminShell>
    </>
  );
}
