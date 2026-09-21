import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import AdminShell from "../../components/admin/AdminShell";
import type {
  AuditFinding,
  WebsiteAuditRecord,
  WebsiteAuditSummary,
} from "../../lib/website-audit/types";

function severityLabel(s: AuditFinding["severity"]): string {
  switch (s) {
    case "critical":
      return "kritikus";
    case "warning":
      return "figyelmeztetés";
    case "info":
      return "infó";
    case "pass":
      return "rendben";
    default:
      return s;
  }
}

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

function stepLabel(status: string): string {
  switch (status) {
    case "pending":
      return "vár";
    case "running":
      return "fut";
    case "done":
      return "kész";
    case "error":
      return "hiba";
    default:
      return status;
  }
}

function WebsiteAuditWorkspace({ bumpIdle }: { bumpIdle: () => void }) {
  const [url, setUrl] = useState("https://");
  const [force, setForce] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [audit, setAudit] = useState<WebsiteAuditRecord | null>(null);
  const [history, setHistory] = useState<WebsiteAuditSummary[]>([]);

  const loadHistory = useCallback(async () => {
    const res = await fetch("/api/admin/website-audit", {
      credentials: "same-origin",
    });
    if (res.status === 401) return;
    const data = await res.json();
    if (res.ok && data.ok) setHistory(data.items || []);
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  async function loadAudit(id: string) {
    setError("");
    setStatusMsg("Korábbi audit betöltése…");
    const res = await fetch(`/api/admin/website-audit/${id}`, {
      credentials: "same-origin",
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data.error || "Az audit nem tölthető be.");
      setStatusMsg("");
      return;
    }
    setAudit(data.audit as WebsiteAuditRecord);
    setUrl(data.audit.inputUrl || data.audit.normalizedUrl || "https://");
    setStatusMsg(`Betöltve: ${formatWhen(data.audit.createdAt)}`);
  }

  async function startAudit(e?: FormEvent, opts?: { force?: boolean }) {
    e?.preventDefault();
    setRunning(true);
    setError("");
    setStatusMsg("Ellenőrzés fut…");
    setAudit(null);
    try {
      const res = await fetch("/api/admin/website-audit", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          force: opts?.force ?? force,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Az ellenőrzés sikertelen.");
        setStatusMsg("");
        return;
      }
      setAudit(data.audit as WebsiteAuditRecord);
      setStatusMsg(
        data.audit.status === "failed"
          ? "Az ellenőrzés hibával zárult."
          : "Kész."
      );
      await loadHistory();
    } catch {
      setError("Hálózati hiba az ellenőrzésnél.");
      setStatusMsg("");
    } finally {
      setRunning(false);
    }
  }

  const tone =
    !audit
      ? "neutral"
      : audit.overallScore >= 80
        ? "good"
        : audit.overallScore >= 55
          ? "warn"
          : "bad";

  return (
    <>
      <section className="admin-card admin-audit" aria-label="Weboldal-ellenőrző">
        <div className="admin-seo-head">
          <div>
            <h2>Weboldal-ellenőrző</h2>
            <p className="admin-muted">
              Admin tesztverzió — tetszőleges publikus URL teljes technikai
              auditja (SSRF-védelemmel). Nem publikus szolgáltatás.
            </p>
          </div>
        </div>

        <form
          className="admin-audit-form"
          onSubmit={(e) => {
            bumpIdle();
            void startAudit(e);
          }}
        >
          <label className="admin-audit-label" htmlFor="audit-url">
            Ellenőrizendő URL
          </label>
          <div className="admin-audit-row">
            <input
              id="audit-url"
              name="url"
              type="url"
              inputMode="url"
              autoComplete="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://pelda.hu"
              disabled={running}
              aria-describedby="audit-url-hint"
            />
            <button
              type="submit"
              className="admin-audit-run"
              disabled={running}
              aria-busy={running}
            >
              {running ? "Ellenőrzés…" : "Ellenőrzés indítása"}
            </button>
          </div>
          <p id="audit-url-hint" className="admin-muted">
            Csak publikus http(s) URL. Localhost / privát IP tiltott. Minden
            lépés lefut (PageSpeed is).
          </p>
          <label className="admin-audit-check">
            <input
              type="checkbox"
              checked={force}
              onChange={(e) => setForce(e.target.checked)}
              disabled={running}
            />
            Újraellenőrzés cache nélkül (10 perces cache kihagyása)
          </label>
        </form>

        <div className="admin-audit-status" aria-live="polite" role="status">
          {statusMsg ? <p className="admin-muted">{statusMsg}</p> : null}
          {error ? <p className="admin-error">{error}</p> : null}
        </div>

        {audit ? (
          <article
            className={`admin-audit-report admin-seo--${tone}`}
            aria-label="Audit jelentés"
          >
            <header className="admin-report-head">
              <div className="admin-report-score">
                <span>Összpontszám</span>
                <strong>{audit.overallScore}/100</strong>
              </div>
              <div className="admin-report-meta">
                <h3>Audit jelentés</h3>
                <p>{audit.summary}</p>
                <p className="admin-muted">
                  {formatWhen(audit.createdAt)} · {audit.status}
                </p>
                <p>
                  Cél:{" "}
                  <a
                    href={audit.normalizedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-break"
                  >
                    {audit.normalizedUrl}
                  </a>
                </p>
                <div className="admin-audit-actions">
                  <button
                    type="button"
                    className="admin-ghost"
                    disabled={running}
                    onClick={() => {
                      bumpIdle();
                      void startAudit(undefined, { force: true });
                    }}
                  >
                    Újraellenőrzés
                  </button>
                </div>
              </div>
            </header>

            <section className="admin-report-block">
              <h4>Lépések</h4>
              <div className="admin-report-table-wrap">
                <table className="admin-report-table">
                  <thead>
                    <tr>
                      <th scope="col">Állapot</th>
                      <th scope="col">Lépés</th>
                      <th scope="col">Részlet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(audit.progress || []).map((step) => (
                      <tr
                        key={step.id}
                        className={`admin-report-row--${step.status}`}
                      >
                        <td>{stepLabel(step.status)}</td>
                        <td>{step.label}</td>
                        <td className="admin-break">{step.detail || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="admin-report-block">
              <h4>Kategóriapontok</h4>
              <div className="admin-report-table-wrap">
                <table className="admin-report-table">
                  <thead>
                    <tr>
                      <th scope="col">Kategória</th>
                      <th scope="col">Pont</th>
                      <th scope="col">Találatok</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audit.categories.map((cat) => (
                      <tr key={cat.id}>
                        <td>{cat.label}</td>
                        <td>
                          <strong>{cat.score}/100</strong>
                        </td>
                        <td>{cat.findingCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="admin-report-block">
              <h4>Technikai adatok</h4>
              <div className="admin-report-table-wrap">
                <table className="admin-report-table">
                  <tbody>
                    <tr>
                      <th scope="row">HTTP státusz</th>
                      <td>{audit.technical.statusCode ?? "—"}</td>
                    </tr>
                    <tr>
                      <th scope="row">Válaszidő</th>
                      <td>
                        {audit.technical.responseMs != null
                          ? `${audit.technical.responseMs} ms`
                          : "—"}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Méret</th>
                      <td>
                        {audit.technical.responseBytes != null
                          ? `${audit.technical.responseBytes} B`
                          : "—"}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Content-Type</th>
                      <td className="admin-break">
                        {audit.technical.contentType || "—"}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Végső URL</th>
                      <td className="admin-break">
                        {audit.technical.finalUrl || "—"}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Title</th>
                      <td className="admin-break">
                        {audit.technical.title || "—"}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Meta description</th>
                      <td className="admin-break">
                        {audit.technical.metaDescription || "—"}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">H1</th>
                      <td className="admin-break">
                        {audit.technical.h1Count} ·{" "}
                        {audit.technical.h1Texts.join(" | ") || "—"}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Canonical</th>
                      <td className="admin-break">
                        {audit.technical.canonical || "—"}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">robots.txt</th>
                      <td>
                        {audit.technical.robotsTxtOk == null
                          ? "—"
                          : audit.technical.robotsTxtOk
                            ? "OK"
                            : "hiányzik/hiba"}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">sitemap.xml</th>
                      <td>
                        {audit.technical.sitemapOk == null
                          ? "—"
                          : audit.technical.sitemapOk
                            ? "OK"
                            : "hiányzik/hiba"}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">TLS</th>
                      <td className="admin-break">
                        {audit.technical.tls.ok == null
                          ? "—"
                          : audit.technical.tls.ok
                            ? audit.technical.tls.protocol || "OK"
                            : audit.technical.tls.error || "hiba"}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">PageSpeed</th>
                      <td className="admin-break">
                        {audit.technical.pagespeed.ok
                          ? `${audit.technical.pagespeed.performanceScore}/100`
                          : audit.technical.pagespeed.error || "hiba"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {audit.technical.redirectChain.length > 0 ? (
              <section className="admin-report-block">
                <h4>Redirect lánc</h4>
                <div className="admin-report-table-wrap">
                  <table className="admin-report-table">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">URL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {audit.technical.redirectChain.map((u, i) => (
                        <tr key={`${i}-${u}`}>
                          <td>{i + 1}</td>
                          <td className="admin-break">{u}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}

            <section className="admin-report-block">
              <h4>HTTP headerek</h4>
              <div className="admin-report-table-wrap">
                <table className="admin-report-table">
                  <thead>
                    <tr>
                      <th scope="col">Header</th>
                      <th scope="col">Érték</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(audit.technical.headers).length === 0 ? (
                      <tr>
                        <td colSpan={2}>Nincs header adat.</td>
                      </tr>
                    ) : (
                      Object.entries(audit.technical.headers).map(
                        ([key, value]) => (
                          <tr key={key}>
                            <th scope="row">{key}</th>
                            <td className="admin-break">{value}</td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="admin-report-block">
              <h4>Találatok ({audit.findings.length})</h4>
              <div className="admin-report-table-wrap">
                <table className="admin-report-table admin-report-findings">
                  <thead>
                    <tr>
                      <th scope="col">Súlyosság</th>
                      <th scope="col">Kategória</th>
                      <th scope="col">Cím</th>
                      <th scope="col">Részlet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audit.findings.map((f) => (
                      <tr
                        key={f.id}
                        className={`admin-finding--${f.severity}`}
                      >
                        <td>
                          <span
                            className={`admin-finding-tag admin-finding-tag--inline`}
                          >
                            {severityLabel(f.severity)}
                          </span>
                        </td>
                        <td>{f.category}</td>
                        <td>{f.title}</td>
                        <td className="admin-break">
                          {f.detail}
                          {f.evidence ? (
                            <pre className="admin-evidence">{f.evidence}</pre>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </article>
        ) : null}
      </section>

      <section className="admin-card" aria-label="Audit előzmények">
        <h2>Audit history</h2>
        <p className="admin-muted">
          Az utolsó ellenőrzések (max. 50 mentés a szerveren).
        </p>
        {history.length === 0 ? (
          <p className="admin-muted">Még nincs mentett audit.</p>
        ) : (
          <ul className="admin-history">
            {history.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="admin-history-item"
                  onClick={() => {
                    bumpIdle();
                    void loadAudit(item.id);
                  }}
                >
                  <span className="admin-history-score">{item.overallScore}</span>
                  <span>
                    <strong className="admin-break">{item.inputUrl}</strong>
                    <em className="admin-muted">
                      {formatWhen(item.createdAt)} · {item.status}
                    </em>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="admin-muted" style={{ marginTop: 12 }}>
          <Link href="/admin">← Vissza a Monitorhoz</Link>
        </p>
      </section>
    </>
  );
}

export default function WebsiteAuditAdminPage() {
  return (
    <AdminShell active="audit" title="Weboldal-ellenőrző">
      {({ authed, bumpIdle }) =>
        authed ? <WebsiteAuditWorkspace bumpIdle={bumpIdle} /> : null
      }
    </AdminShell>
  );
}
