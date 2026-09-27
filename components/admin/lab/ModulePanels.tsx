import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ProvenanceBadge } from "./LabShell";
import type { LabFormDef } from "../../../lib/lab/forms-engine";
import type { LabClient } from "../../../lib/lab/clients-store";
import type { LabLead, LeadStatus } from "../../../lib/lab/leads-store";
import type { CareTarget } from "../../../lib/lab/care-monitor";
import type { AutomationRule } from "../../../lib/lab/automation-engine";
import type { AiSession } from "../../../lib/lab/ai-tools";
import type { LabExperiment } from "../../../lib/lab/experiments-store";
import type { LabContentItem } from "../../../lib/lab/content-store";
import type { SocialDraft } from "../../../lib/lab/social-hub";

type Bump = () => void;

async function labGet(section: string) {
  const res = await fetch(`/api/admin/lab/data?section=${section}`, {
    credentials: "same-origin",
  });
  return res.json();
}

async function labPost(section: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/admin/lab/data?section=${section}`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ section, ...body }),
  });
  return res.json();
}

function Loading() {
  return <p className="lab-muted">Betöltés…</p>;
}

export function FormsFlowsPanel({ bumpIdle }: { bumpIdle: Bump }) {
  const [forms, setForms] = useState<LabFormDef[]>([]);
  const [activeId, setActiveId] = useState("");
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const j = await labGet("forms");
    setForms(j.forms || []);
    if (!activeId && j.forms?.[0]) setActiveId(j.forms[0].id);
  }, [activeId]);

  useEffect(() => {
    void load();
  }, [load]);

  const form = forms.find((f) => f.id === activeId) || forms[0];
  const visible = form
    ? form.fields.filter((f) => {
        if (!f.showIf) return true;
        return answers[f.showIf.fieldId] === f.showIf.equals;
      })
    : [];

  return (
    <div className="lab-grid">
      <section className="lab-card lab-card--wide">
        <h2>Űrlapok &amp; feltételes mezők</h2>
        <p className="lab-muted">
          Élő előnézet: ha megváltozik egy válasz, más mezők jelennek meg. Lab
          adatok: <code>data/lab-forms.json</code>.
        </p>
        <div className="lab-main__actions" style={{ marginBottom: 12 }}>
          <select
            value={form?.id || ""}
            onChange={(e) => {
              setActiveId(e.target.value);
              setAnswers({});
            }}
          >
            {forms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="lab-btn"
            onClick={async () => {
              bumpIdle();
              const j = await labPost("forms", {
                action: "create",
                name: "Új Lab űrlap",
              });
              setForms(j.forms || []);
              if (j.form) setActiveId(j.form.id);
              setMsg("Új űrlap létrehozva.");
            }}
          >
            + Új űrlap
          </button>
        </div>
        {form ? (
          <>
            <p className="lab-muted">{form.description}</p>
            <div className="lab-form" style={{ marginTop: 12 }}>
              {visible.map((field) => (
                <label key={field.id}>
                  {field.label}
                  {field.required ? " *" : ""}
                  {field.type === "select" ? (
                    <select
                      value={String(answers[field.id] ?? "")}
                      onChange={(e) =>
                        setAnswers((a) => ({ ...a, [field.id]: e.target.value }))
                      }
                    >
                      <option value="">—</option>
                      {(field.options || []).map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "checkbox" ? (
                    <input
                      type="checkbox"
                      checked={Boolean(answers[field.id])}
                      onChange={(e) =>
                        setAnswers((a) => ({
                          ...a,
                          [field.id]: e.target.checked,
                        }))
                      }
                    />
                  ) : field.type === "textarea" ? (
                    <textarea
                      rows={3}
                      value={String(answers[field.id] ?? "")}
                      onChange={(e) =>
                        setAnswers((a) => ({ ...a, [field.id]: e.target.value }))
                      }
                    />
                  ) : (
                    <input
                      type={field.type === "email" ? "email" : "text"}
                      value={String(answers[field.id] ?? "")}
                      onChange={(e) =>
                        setAnswers((a) => ({ ...a, [field.id]: e.target.value }))
                      }
                    />
                  )}
                </label>
              ))}
            </div>
            <p className="lab-muted" style={{ marginTop: 12 }}>
              Látható mezők: {visible.map((f) => f.id).join(", ") || "—"}
            </p>
            <ProvenanceBadge provenance="real" />
          </>
        ) : (
          <Loading />
        )}
        {msg ? <p className="lab-muted">{msg}</p> : null}
      </section>
    </div>
  );
}

export function ClientHubPanel({ bumpIdle }: { bumpIdle: Bump }) {
  const [clients, setClients] = useState<LabClient[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectClient, setProjectClient] = useState("");

  const load = useCallback(async () => {
    const j = await labGet("clients");
    setClients(j.clients || []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    bumpIdle();
    const j = await labPost("clients", {
      action: "upsert",
      name,
      email,
      company,
    });
    setClients(j.clients || []);
    setName("");
    setEmail("");
    setCompany("");
  }

  return (
    <div className="lab-grid">
      <section className="lab-card">
        <h2>Új ügyfél</h2>
        <form className="lab-form" onSubmit={onCreate}>
          <label>
            Név
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Cég (opcionális)
            <input value={company} onChange={(e) => setCompany(e.target.value)} />
          </label>
          <button type="submit" className="lab-btn lab-btn--primary">
            Mentés
          </button>
        </form>
      </section>
      <section className="lab-card">
        <h2>Projekt hozzáadása</h2>
        <form
          className="lab-form"
          onSubmit={async (e) => {
            e.preventDefault();
            bumpIdle();
            const j = await labPost("clients", {
              action: "add-project",
              clientId: projectClient,
              name: projectName,
              status: "active",
            });
            setClients(j.clients || []);
            setProjectName("");
          }}
        >
          <label>
            Ügyfél
            <select
              value={projectClient}
              onChange={(e) => setProjectClient(e.target.value)}
              required
            >
              <option value="">—</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Projekt neve
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="lab-btn lab-btn--primary">
            Projekt mentése
          </button>
        </form>
      </section>
      <section className="lab-card lab-card--wide">
        <h2>Ügyfelek ({clients.length})</h2>
        {!clients.length ? (
          <div className="lab-empty">Még nincs ügyfél — add hozzá az elsőt.</div>
        ) : (
          <div className="lab-table-wrap">
            <table className="lab-table">
              <thead>
                <tr>
                  <th>Név</th>
                  <th>E-mail</th>
                  <th>Projektek</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id}>
                    <td>
                      {c.name}
                      {c.company ? (
                        <div className="lab-muted">{c.company}</div>
                      ) : null}
                    </td>
                    <td>{c.email}</td>
                    <td>
                      {c.projects.length
                        ? c.projects.map((p) => `${p.name} (${p.status})`).join(", ")
                        : "—"}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="lab-ghost"
                        onClick={async () => {
                          bumpIdle();
                          const j = await labPost("clients", {
                            action: "delete",
                            id: c.id,
                          });
                          setClients(j.clients || []);
                        }}
                      >
                        Törlés
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <ProvenanceBadge provenance="real" />
      </section>
    </div>
  );
}

export function LeadsCrmPanel({ bumpIdle }: { bumpIdle: Bump }) {
  const [leads, setLeads] = useState<LabLead[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("Weboldal");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const j = await labGet("leads");
    setLeads(j.leads || []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="lab-grid">
      <section className="lab-card">
        <h2>Manuális lead</h2>
        <p className="lab-muted">
          A nyilvános kapcsolat űrlap sikeres küldése is ide ír (forrás:
          contact-form).
        </p>
        <form
          className="lab-form"
          onSubmit={async (e) => {
            e.preventDefault();
            bumpIdle();
            const j = await labPost("leads", {
              action: "create",
              name,
              email,
              service,
              message,
            });
            setLeads(j.leads || []);
            setName("");
            setEmail("");
            setMessage("");
          }}
        >
          <label>
            Név
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Szolgáltatás
            <input
              value={service}
              onChange={(e) => setService(e.target.value)}
              required
            />
          </label>
          <label>
            Üzenet
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="lab-btn lab-btn--primary">
            Lead mentése
          </button>
        </form>
      </section>
      <section className="lab-card lab-card--wide">
        <h2>Leadek ({leads.length})</h2>
        {!leads.length ? (
          <div className="lab-empty">Még nincs lead.</div>
        ) : (
          <div className="lab-table-wrap">
            <table className="lab-table">
              <thead>
                <tr>
                  <th>Név</th>
                  <th>Szolgáltatás</th>
                  <th>Státusz</th>
                  <th>Forrás</th>
                  <th>Üzenet</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id}>
                    <td>
                      {l.name}
                      <div className="lab-muted">{l.email}</div>
                    </td>
                    <td>{l.service}</td>
                    <td>
                      <select
                        value={l.status}
                        onChange={async (e) => {
                          bumpIdle();
                          const j = await labPost("leads", {
                            action: "status",
                            id: l.id,
                            status: e.target.value as LeadStatus,
                          });
                          setLeads(j.leads || []);
                        }}
                      >
                        {(
                          [
                            "new",
                            "contacted",
                            "qualified",
                            "won",
                            "lost",
                          ] as LeadStatus[]
                        ).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{l.source}</td>
                    <td>{l.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <ProvenanceBadge provenance="real" />
      </section>
    </div>
  );
}

export function SocialHubPanel({ bumpIdle }: { bumpIdle: Bump }) {
  const [platforms, setPlatforms] = useState<
    Array<{
      platform: string;
      configured: boolean;
      missing: string[];
      provenance: "real" | "unavailable";
    }>
  >([]);
  const [drafts, setDrafts] = useState<SocialDraft[]>([]);
  const [platform, setPlatform] = useState("meta");
  const [text, setText] = useState("");
  const [last, setLast] = useState<SocialDraft | null>(null);

  const load = useCallback(async () => {
    const j = await labGet("social");
    setPlatforms(j.platforms || []);
    setDrafts(j.drafts || []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="lab-grid">
      <section className="lab-card">
        <h2>Platformok</h2>
        <div className="lab-table-wrap">
          <table className="lab-table">
            <thead>
              <tr>
                <th>Platform</th>
                <th>Állapot</th>
              </tr>
            </thead>
            <tbody>
              {platforms.map((p) => (
                <tr key={p.platform}>
                  <td>{p.platform}</td>
                  <td>
                    {p.configured ? "configured" : "unavailable"}{" "}
                    <ProvenanceBadge provenance={p.provenance} />
                    {!p.configured ? (
                      <div className="lab-muted">Hiányzik: {p.missing.join(", ")}</div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="lab-card">
        <h2>Dry-run poszt</h2>
        <p className="lab-muted">
          Soha nem megy ki élesen a Labból — még credential mellett sem.
        </p>
        <form
          className="lab-form"
          onSubmit={async (e) => {
            e.preventDefault();
            bumpIdle();
            const j = await labPost("social", { platform, text });
            setDrafts(j.drafts || []);
            setPlatforms(j.platforms || []);
            setLast(j.draft || null);
            setText("");
          }}
        >
          <label>
            Platform
            <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
              <option value="meta">Meta</option>
              <option value="linkedin">LinkedIn</option>
              <option value="x">X</option>
            </select>
          </label>
          <label>
            Szöveg
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="lab-btn lab-btn--primary">
            Dry-run futtatása
          </button>
        </form>
        {last ? (
          <p className="lab-muted" style={{ marginTop: 12 }}>
            {last.resultNote} · státusz: <strong>{last.status}</strong>
          </p>
        ) : null}
      </section>
      <section className="lab-card lab-card--wide">
        <h2>Korábbi dry-runok</h2>
        {!drafts.length ? (
          <div className="lab-empty">Még nincs dry-run.</div>
        ) : (
          <div className="lab-table-wrap">
            <table className="lab-table">
              <thead>
                <tr>
                  <th>Idő</th>
                  <th>Platform</th>
                  <th>Státusz</th>
                  <th>Szöveg</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map((d) => (
                  <tr key={d.id}>
                    <td>{new Date(d.createdAt).toLocaleString("hu-HU")}</td>
                    <td>{d.platform}</td>
                    <td>{d.status}</td>
                    <td>{d.text.slice(0, 120)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export function CareMonitorPanel({ bumpIdle }: { bumpIdle: Bump }) {
  const [targets, setTargets] = useState<CareTarget[]>([]);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const j = await labGet("care");
    setTargets(j.targets || []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="lab-grid">
      <section className="lab-card">
        <h2>Új figyelendő URL</h2>
        <p className="lab-muted">SSRF-védett HTTP ellenőrzés (ugyanaz a guard, mint az auditnál).</p>
        <form
          className="lab-form"
          onSubmit={async (e) => {
            e.preventDefault();
            bumpIdle();
            setError("");
            const j = await labPost("care", { action: "add", label, url });
            if (!j.ok) {
              setError(j.error || "Hiba");
              return;
            }
            setTargets(j.targets || []);
            setLabel("");
            setUrl("");
          }}
        >
          <label>
            Címke
            <input value={label} onChange={(e) => setLabel(e.target.value)} />
          </label>
          <label>
            URL
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://pelda.hu"
              required
            />
          </label>
          {error ? <p className="admin-error">{error}</p> : null}
          <button type="submit" className="lab-btn lab-btn--primary">
            Hozzáadás
          </button>
        </form>
      </section>
      <section className="lab-card lab-card--wide">
        <div className="lab-main__actions" style={{ marginBottom: 12 }}>
          <h2 style={{ margin: 0, flex: 1 }}>Célpontok</h2>
          <button
            type="button"
            className="lab-btn"
            disabled={busy || !targets.length}
            onClick={async () => {
              bumpIdle();
              setBusy(true);
              const j = await labPost("care", { action: "check-all" });
              setTargets(j.targets || []);
              setBusy(false);
            }}
          >
            {busy ? "Ellenőrzés…" : "Összes ellenőrzése"}
          </button>
        </div>
        {!targets.length ? (
          <div className="lab-empty">Adj hozzá egy URL-t a figyeléshez.</div>
        ) : (
          <div className="lab-table-wrap">
            <table className="lab-table">
              <thead>
                <tr>
                  <th>Célpont</th>
                  <th>Utolsó check</th>
                  <th>HTTP</th>
                  <th>Latency</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {targets.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.label}</strong>
                      <div className="lab-muted">{t.url}</div>
                    </td>
                    <td>
                      {t.lastCheck ? (
                        <>
                          {t.lastCheck.ok ? "OK" : "HIBA"}{" "}
                          <ProvenanceBadge provenance={t.lastCheck.provenance} />
                          <div className="lab-muted">
                            {new Date(t.lastCheck.checkedAt).toLocaleString("hu-HU")}
                            {t.lastCheck.error ? ` · ${t.lastCheck.error}` : ""}
                          </div>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{t.lastCheck?.statusCode ?? "—"}</td>
                    <td>
                      {t.lastCheck?.latencyMs != null
                        ? `${t.lastCheck.latencyMs} ms`
                        : "—"}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="lab-ghost"
                        onClick={async () => {
                          bumpIdle();
                          const j = await labPost("care", {
                            action: "check",
                            id: t.id,
                          });
                          setTargets(j.targets || []);
                        }}
                      >
                        Check
                      </button>{" "}
                      <button
                        type="button"
                        className="lab-ghost"
                        onClick={async () => {
                          bumpIdle();
                          const j = await labPost("care", {
                            action: "remove",
                            id: t.id,
                          });
                          setTargets(j.targets || []);
                        }}
                      >
                        Törlés
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export function AutomationPanel({ bumpIdle }: { bumpIdle: Bump }) {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [dryNote, setDryNote] = useState("");

  const load = useCallback(async () => {
    const j = await labGet("automation");
    setRules(j.rules || []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="lab-card lab-card--wide">
      <h2>Automation (Trigger → Action)</h2>
      <p className="lab-muted">
        Nincs tetszőleges kódfuttatás. Dry-run a jelenlegi Lab adatokon (leadek,
        Care).
      </p>
      <button
        type="button"
        className="lab-btn"
        style={{ marginBottom: 12 }}
        onClick={async () => {
          bumpIdle();
          const j = await labPost("automation", {
            action: "create",
            name: "Új szabály",
          });
          setRules(j.rules || []);
        }}
      >
        + Új szabály
      </button>
      {dryNote ? <p className="lab-muted">{dryNote}</p> : null}
      <div className="lab-table-wrap">
        <table className="lab-table">
          <thead>
            <tr>
              <th>Név</th>
              <th>Trigger</th>
              <th>BE</th>
              <th>Utolsó dry-run</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.name}
                  <div className="lab-muted">
                    {r.actions
                      .map((a) =>
                        a.type === "flag_priority"
                          ? `priority:${a.priority}`
                          : a.text
                      )
                      .join(" · ")}
                  </div>
                </td>
                <td>{r.trigger}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={r.enabled}
                    onChange={async (e) => {
                      bumpIdle();
                      const j = await labPost("automation", {
                        action: "toggle",
                        id: r.id,
                        enabled: e.target.checked,
                      });
                      setRules(j.rules || []);
                    }}
                  />
                </td>
                <td>
                  {r.lastDryRunNote || "—"}
                  {r.lastDryRunAt ? (
                    <div className="lab-muted">
                      {new Date(r.lastDryRunAt).toLocaleString("hu-HU")}
                    </div>
                  ) : null}
                </td>
                <td>
                  <button
                    type="button"
                    className="lab-btn"
                    onClick={async () => {
                      bumpIdle();
                      const j = await labPost("automation", {
                        action: "dry-run",
                        id: r.id,
                      });
                      setRules(j.rules || []);
                      setDryNote(
                        j.matched
                          ? `Illeszkedik: ${(j.wouldDo || []).join("; ")} — ${j.evidence}`
                          : `Nem illeszkedik — ${j.evidence}`
                      );
                    }}
                  >
                    Dry-run
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ProvenanceBadge provenance="real" />
    </div>
  );
}

export function AiToolsPanel({ bumpIdle }: { bumpIdle: Bump }) {
  const [input, setInput] = useState(
    "<html><head></head><body><img src=\"/x.png\"><p>Szia</p></body></html>"
  );
  const [session, setSession] = useState<AiSession | null>(null);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    void labGet("ai").then((j) => {
      setHasKey(Boolean(j.hasAiKey));
      if (j.sessions?.[0]) setSession(j.sessions[0]);
    });
  }, []);

  return (
    <div className="lab-grid">
      <section className="lab-card lab-card--wide">
        <h2>AI Tools — Detect → Diff → Approve</h2>
        <p className="lab-muted">
          Nincs auto-publish.{" "}
          {hasKey
            ? "AI_API_KEY jelen van, de külső hívás csak Approve után jöhetne — most helyi heurisztika fut."
            : "AI_API_KEY hiányzik (UNAVAILABLE külső modell) — helyi szabályok futnak."}
        </p>
        <div className="lab-form">
          <label>
            HTML vagy szöveg
            <textarea
              rows={8}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="lab-btn lab-btn--primary"
            onClick={async () => {
              bumpIdle();
              const j = await labPost("ai", { action: "detect", input });
              setSession(j.session || null);
              setHasKey(Boolean(j.hasAiKey));
            }}
          >
            Detect futtatása
          </button>
        </div>
      </section>
      {session ? (
        <section className="lab-card lab-card--wide">
          <h2>Találatok</h2>
          <p className="lab-muted">{session.note}</p>
          <ProvenanceBadge provenance={session.provenance} />
          <div className="lab-muted">{session.source}</div>
          <ul>
            {session.findings.map((f) => (
              <li key={f.id}>
                <strong>
                  [{f.severity}] {f.title}
                </strong>
                <div className="lab-muted">{f.detail}</div>
              </li>
            ))}
          </ul>
          {session.recommendations.length ? (
            <>
              <h3>Javaslatok (diff)</h3>
              {session.recommendations.map((r) => (
                <div key={r.id} className="lab-token-preview" style={{ marginBottom: 12 }}>
                  <p>
                    <strong>{r.summary}</strong>{" "}
                    {r.approved ? (
                      <span className="lab-pill">approved</span>
                    ) : null}
                  </p>
                  <p className="lab-muted">
                    Előtte: <code>{r.before}</code>
                  </p>
                  <p className="lab-muted">
                    Utána: <code>{r.after}</code>
                  </p>
                  {!r.approved ? (
                    <button
                      type="button"
                      className="lab-btn"
                      onClick={async () => {
                        bumpIdle();
                        const j = await labPost("ai", {
                          action: "approve",
                          sessionId: session.id,
                          recommendationId: r.id,
                        });
                        setSession(j.session || session);
                      }}
                    >
                      Approve
                    </button>
                  ) : null}
                </div>
              ))}
            </>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

export function ExperimentsPanel({ bumpIdle }: { bumpIdle: Bump }) {
  const [experiments, setExperiments] = useState<LabExperiment[]>([]);
  const [name, setName] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [pick, setPick] = useState("");

  const load = useCallback(async () => {
    const j = await labGet("experiments");
    setExperiments(j.experiments || []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="lab-grid">
      <section className="lab-card">
        <h2>Új kísérlet</h2>
        <form
          className="lab-form"
          onSubmit={async (e) => {
            e.preventDefault();
            bumpIdle();
            const j = await labPost("experiments", {
              action: "upsert",
              name,
              hypothesis,
            });
            setExperiments(j.experiments || []);
            setName("");
            setHypothesis("");
          }}
        >
          <label>
            Név
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Hipotézis
            <textarea
              rows={3}
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
            />
          </label>
          <button type="submit" className="lab-btn lab-btn--primary">
            Mentés
          </button>
        </form>
      </section>
      <section className="lab-card lab-card--wide">
        <h2>Kísérletek</h2>
        <div className="lab-table-wrap">
          <table className="lab-table">
            <thead>
              <tr>
                <th>Név</th>
                <th>Státusz</th>
                <th>Variánsok</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {experiments.map((exp) => (
                <tr key={exp.id}>
                  <td>
                    {exp.name}
                    <div className="lab-muted">{exp.hypothesis}</div>
                  </td>
                  <td>
                    <select
                      value={exp.status}
                      onChange={async (e) => {
                        bumpIdle();
                        const j = await labPost("experiments", {
                          action: "status",
                          id: exp.id,
                          status: e.target.value,
                        });
                        setExperiments(j.experiments || []);
                      }}
                    >
                      {(["draft", "running", "paused", "done"] as const).map(
                        (s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        )
                      )}
                    </select>
                  </td>
                  <td>
                    {exp.variants
                      .map((v) => `${v.label} ${v.weightPercent}%`)
                      .join(" / ")}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="lab-ghost"
                      onClick={async () => {
                        bumpIdle();
                        const j = await labPost("experiments", {
                          action: "pick",
                          id: exp.id,
                          visitorKey: `demo-${Date.now()}`,
                        });
                        setPick(
                          j.pick
                            ? `${exp.name} → ${j.pick.label} (${j.pick.variantId})`
                            : "—"
                        );
                      }}
                    >
                      Variáns próba
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pick ? <p className="lab-muted">{pick}</p> : null}
        <ProvenanceBadge provenance="real" />
      </section>
    </div>
  );
}

export function ContentPanel({ bumpIdle }: { bumpIdle: Bump }) {
  const [items, setItems] = useState<LabContentItem[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [utmSource, setUtmSource] = useState("lab");
  const [utmMedium, setUtmMedium] = useState("email");
  const [utmUrl, setUtmUrl] = useState("");

  const load = useCallback(async () => {
    const j = await labGet("content");
    setItems(j.items || []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="lab-grid">
      <section className="lab-card">
        <h2>Új tartalom</h2>
        <form
          className="lab-form"
          onSubmit={async (e) => {
            e.preventDefault();
            bumpIdle();
            const j = await labPost("content", {
              action: "upsert",
              title,
              slug,
              body,
              utmSource,
              utmMedium,
              utmCampaign: slug,
            });
            setItems(j.items || []);
            setTitle("");
            setSlug("");
            setBody("");
          }}
        >
          <label>
            Cím
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label>
            Slug
            <input value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </label>
          <label>
            Szöveg
            <textarea
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>
          <label>
            utm_source
            <input
              value={utmSource}
              onChange={(e) => setUtmSource(e.target.value)}
            />
          </label>
          <label>
            utm_medium
            <input
              value={utmMedium}
              onChange={(e) => setUtmMedium(e.target.value)}
            />
          </label>
          <button type="submit" className="lab-btn lab-btn--primary">
            Mentés
          </button>
        </form>
      </section>
      <section className="lab-card lab-card--wide">
        <h2>Tartalmak</h2>
        {!items.length ? (
          <div className="lab-empty">Még nincs tartalom-elem.</div>
        ) : (
          <div className="lab-table-wrap">
            <table className="lab-table">
              <thead>
                <tr>
                  <th>Cím</th>
                  <th>Slug</th>
                  <th>UTM</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>
                      <code>{item.slug}</code>
                    </td>
                    <td>
                      {item.utmSource}/{item.utmMedium}/{item.utmCampaign || item.slug}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="lab-ghost"
                        onClick={async () => {
                          bumpIdle();
                          const j = await labPost("content", {
                            action: "utm",
                            id: item.id,
                            baseUrl: "https://anticode.hu/",
                          });
                          setUtmUrl(j.url || "");
                        }}
                      >
                        UTM link
                      </button>{" "}
                      <button
                        type="button"
                        className="lab-ghost"
                        onClick={async () => {
                          bumpIdle();
                          const j = await labPost("content", {
                            action: "delete",
                            id: item.id,
                          });
                          setItems(j.items || []);
                        }}
                      >
                        Törlés
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {utmUrl ? (
          <p className="lab-muted" style={{ marginTop: 12 }}>
            UTM URL: <code>{utmUrl}</code>
          </p>
        ) : null}
        <ProvenanceBadge provenance="real" />
      </section>
    </div>
  );
}

export function PerformancePanel({ bumpIdle }: { bumpIdle: Bump }) {
  const [data, setData] = useState<{
    sampleCount: number;
    averageDurationMs: number | null;
    provenance: "real" | "unavailable";
    note: string;
    samples: Array<{
      id: string;
      url: string;
      durationMs: number | null;
      score: number | null;
      createdAt: string;
    }>;
  } | null>(null);

  useEffect(() => {
    void labGet("performance").then(setData);
  }, []);

  if (!data) return <Loading />;

  return (
    <div className="lab-card lab-card--wide">
      <h2>Performance Lab</h2>
      <p className="lab-muted">{data.note}</p>
      <ProvenanceBadge provenance={data.provenance} />
      <div className="lab-metric" style={{ marginTop: 12 }}>
        {data.averageDurationMs != null ? `${data.averageDurationMs} ms` : "—"}
      </div>
      <div className="lab-metric__label">átlag audit idő</div>
      {data.samples.length ? (
        <div className="lab-table-wrap" style={{ marginTop: 16 }}>
          <table className="lab-table">
            <thead>
              <tr>
                <th>URL</th>
                <th>Duration</th>
                <th>Score</th>
                <th>Idő</th>
              </tr>
            </thead>
            <tbody>
              {data.samples.map((s) => (
                <tr key={s.id}>
                  <td>{s.url}</td>
                  <td>{s.durationMs} ms</td>
                  <td>{s.score ?? "—"}</td>
                  <td>{new Date(s.createdAt).toLocaleString("hu-HU")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="lab-muted" style={{ marginTop: 12 }}>
          <Link href="/admin/website-audit" onClick={() => bumpIdle()}>
            Futtass egy auditot →
          </Link>
        </p>
      )}
    </div>
  );
}

export function AnalyticsPanel() {
  const [data, setData] = useState<{
    ok: boolean;
    provenance: "real" | "unavailable";
    error: string | null;
    data: {
      today?: { views: number; visitors: number };
      week?: { views: number; visitors: number };
      month?: { views: number; visitors: number };
    } | null;
  } | null>(null);

  useEffect(() => {
    void labGet("analytics").then(setData);
  }, []);

  if (!data) return <Loading />;

  return (
    <div className="lab-card lab-card--wide">
      <h2>Analytics</h2>
      <ProvenanceBadge provenance={data.provenance} />
      {!data.ok || !data.data ? (
        <div className="lab-empty">{data.error || "Nincs adat."}</div>
      ) : (
        <div className="lab-grid" style={{ marginTop: 16 }}>
          {(
            [
              ["Ma", data.data.today],
              ["Hét", data.data.week],
              ["Hónap", data.data.month],
            ] as const
          ).map(([label, row]) => (
            <div className="lab-card lab-card--sm" key={label}>
              <div className="lab-metric">{row?.views ?? "—"}</div>
              <div className="lab-metric__label">{label} · megtekintés</div>
              <p className="lab-muted">Látogatók: {row?.visitors ?? "—"}</p>
            </div>
          ))}
        </div>
      )}
      <p className="lab-muted" style={{ marginTop: 12 }}>
        Forrás: belső analytics-store (ugyanaz, mint a Monitor).
      </p>
    </div>
  );
}

export function TestingQaPanel() {
  const [data, setData] = useState<{
    implementedCount: number;
    totalModules: number;
    pendingTests: number;
    checklist: Array<{ id: string; label: string; hint: string }>;
    modules: Array<{
      id: string;
      name: string;
      implemented: boolean;
      testStatus: string;
      status: string;
    }>;
    provenance: "real";
  } | null>(null);

  useEffect(() => {
    void labGet("testing-qa").then(setData);
  }, []);

  if (!data) return <Loading />;

  return (
    <div className="lab-grid">
      <section className="lab-card lab-card--sm">
        <div className="lab-metric">
          {data.implementedCount}/{data.totalModules}
        </div>
        <div className="lab-metric__label">implementált modul</div>
        <ProvenanceBadge provenance={data.provenance} />
      </section>
      <section className="lab-card lab-card--sm">
        <div className="lab-metric">{data.pendingTests}</div>
        <div className="lab-metric__label">pending test státusz</div>
      </section>
      <section className="lab-card lab-card--wide">
        <h2>Production readiness checklist</h2>
        <ul>
          {data.checklist.map((c) => (
            <li key={c.id}>
              <strong>{c.label}</strong>
              <div className="lab-muted">{c.hint}</div>
            </li>
          ))}
        </ul>
      </section>
      <section className="lab-card lab-card--wide">
        <h2>Modul státuszok</h2>
        <div className="lab-table-wrap">
          <table className="lab-table">
            <thead>
              <tr>
                <th>Modul</th>
                <th>UI</th>
                <th>Status</th>
                <th>Test</th>
              </tr>
            </thead>
            <tbody>
              {data.modules.map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.implemented ? "igen" : "nem"}</td>
                  <td>{m.status}</td>
                  <td>{m.testStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export function DebugPanel() {
  const [data, setData] = useState<{
    nodeEnv: string;
    killSwitch: boolean;
    flagsUpdatedAt: string;
    recentModules: string[];
    envPresence: Array<{ key: string; present: boolean }>;
    note: string;
    provenance: "real";
  } | null>(null);

  useEffect(() => {
    void labGet("debug").then(setData);
  }, []);

  if (!data) return <Loading />;

  return (
    <div className="lab-grid">
      <section className="lab-card">
        <h2>Runtime</h2>
        <p>
          NODE_ENV: <code>{data.nodeEnv}</code>
        </p>
        <p>
          Kill switch: <strong>{data.killSwitch ? "BE" : "KI"}</strong>
        </p>
        <p className="lab-muted">Flags: {data.flagsUpdatedAt}</p>
        <ProvenanceBadge provenance={data.provenance} />
      </section>
      <section className="lab-card">
        <h2>Recent modulok</h2>
        <ul>
          {data.recentModules.length ? (
            data.recentModules.map((id) => <li key={id}>{id}</li>)
          ) : (
            <li className="lab-muted">—</li>
          )}
        </ul>
      </section>
      <section className="lab-card lab-card--wide">
        <h2>Env jelenlét (érték nélkül)</h2>
        <p className="lab-muted">{data.note}</p>
        <div className="lab-table-wrap">
          <table className="lab-table">
            <thead>
              <tr>
                <th>Kulcs</th>
                <th>Jelen</th>
              </tr>
            </thead>
            <tbody>
              {data.envPresence.map((row) => (
                <tr key={row.key}>
                  <td>
                    <code>{row.key}</code>
                  </td>
                  <td>{row.present ? "igen" : "nem"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
