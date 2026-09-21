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

function WebsiteAuditWorkspace({
  bumpIdle,
}: {
  bumpIdle: () => void;
}) {
  const [url, setUrl] = useState("https://");
  const [force, setForce] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [audit, setAudit] = useState<WebsiteAuditRecord | null>(null);
  const [history, setHistory] = useState<WebsiteAuditSummary[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | AuditFinding["severity"]>("all");

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
    setDetailsOpen(false);
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

  const findings = (audit?.findings || []).filter((f) =>
    filter === "all" ? true : f.severity === filter
  );

  return (
    <>
      <section className="admin-card admin-audit" aria-label="Weboldal-ellenőrző">
        <div className="admin-seo-head">
          <div>
            <h2>Weboldal-ellenőrző</h2>
            <p className="admin-muted">
              Admin tesztverzió — tetszőleges publikus URL technikai auditja
              (SSRF-védelemmel). Nem publikus szolgáltatás.
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
            Csak publikus http(s) URL. Localhost / privát IP tiltott.
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

        <div
          className="admin-audit-status"
          aria-live="polite"
          role="status"
        >
          {statusMsg ? <p className="admin-muted">{statusMsg}</p> : null}
          {error ? <p className="admin-error">{error}</p> : null}
        </div>

        {audit?.progress?.length ? (
          <ol className="admin-progress" aria-label="Audit lépések">
            {audit.progress.map((step) => (
              <li
                key={step.id}
                className={`admin-progress-item admin-progress-item--${step.status}`}
              >
                <span className="admin-progress-state">
                  {step.status === "pending"
                    ? "vár"
                    : step.status === "running"
                      ? "fut"
                      : step.status === "done"
                        ? "kész"
                        : step.status === "skipped"
                          ? "kihagyva"
                          : "hiba"}
                </span>
                <span>
                  <strong>{step.label}</strong>
                  {step.detail ? (
                    <em className="admin-muted"> — {step.detail}</em>
                  ) : null}
                </span>
              </li>
            ))}
          </ol>
        ) : null}

        {audit ? (
          <>
            <div
              className={`admin-seo-status admin-audit-score admin-seo--${
                audit.overallScore >= 80
                  ? "good"
                  : audit.overallScore >= 55
                    ? "warn"
                    : "bad"
              }`}
            >
              <div className="admin-seo-score">
                <span>Összpontszám</span>
                <strong>{audit.overallScore}/100</strong>
              </div>
              <div>
                <p className="admin-muted" style={{ margin: 0 }}>
                  {audit.summary}
                </p>
                <p className="admin-muted">
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
                  <button
                    type="button"
                    className="admin-ghost"
                    aria-expanded={detailsOpen}
                    onClick={() => setDetailsOpen((o) => !o)}
                  >
                    {detailsOpen
                      ? "Technikai részletek elrejtése"
                      : "Technikai részletek"}
                  </button>
                </div>
              </div>
            </div>

            <div className="admin-score-grid" aria-label="Kategóriapontok">
              {audit.categories.map((cat) => (
                <article key={cat.id} className="admin-score-card">
                  <span>{cat.label}</span>
                  <strong>{cat.score}/100</strong>
                  <em>{cat.findingCount} találat</em>
                </article>
              ))}
            </div>

            <div className="admin-audit-filters" role="group" aria-label="Szűrés">
              {(["all", "critical", "warning", "info", "pass"] as const).map(
                (key) => (
                  <button
                    key={key}
                    type="button"
                    className={`admin-ghost${
                      filter === key ? " is-active-filter" : ""
                    }`}
                    aria-pressed={filter === key}
                    onClick={() => setFilter(key)}
                  >
                    {key === "all" ? "Összes" : severityLabel(key)}
                  </button>
                )
              )}
            </div>

            <ul className="admin-findings" aria-label="Találatok">
              {findings.length === 0 ? (
                <li className="admin-muted">Nincs találat ebben a szűrésben.</li>
              ) : (
                findings.map((f) => (
                  <li
                    key={f.id}
                    className={`admin-finding admin-finding--${f.severity}`}
                  >
                    <span className="admin-finding-tag">
                      {severityLabel(f.severity)}
                    </span>
                    <div>
                      <strong>{f.title}</strong>
                      <p>{f.detail}</p>
                      {f.evidence ? (
                        <pre className="admin-evidence">{f.evidence}</pre>
                      ) : null}
                    </div>
                  </li>
                ))
              )}
            </ul>

            {detailsOpen ? (
              <div className="admin-tech" aria-label="Technikai részletek">
                <h3>Technikai adatok</h3>
                <dl className="admin-tech-grid">
                  <div>
                    <dt>HTTP státusz</dt>
                    <dd>{audit.technical.statusCode ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Válaszidő</dt>
                    <dd>
                      {audit.technical.responseMs != null
                        ? `${audit.technical.responseMs} ms`
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt>Méret</dt>
                    <dd>
                      {audit.technical.responseBytes != null
                        ? `${audit.technical.responseBytes} B`
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt>Content-Type</dt>
                    <dd className="admin-break">
                      {audit.technical.contentType || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt>Végső URL</dt>
                    <dd className="admin-break">
                      {audit.technical.finalUrl || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt>Title</dt>
                    <dd>{audit.technical.title || "—"}</dd>
                  </div>
                  <div>
                    <dt>Meta description</dt>
                    <dd>{audit.technical.metaDescription || "—"}</dd>
                  </div>
                  <div>
                    <dt>H1</dt>
                    <dd>
                      {audit.technical.h1Count} ·{" "}
                      {audit.technical.h1Texts.join(" | ") || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt>Canonical</dt>
                    <dd className="admin-break">
                      {audit.technical.canonical || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt>robots.txt</dt>
                    <dd>
                      {audit.technical.robotsTxtOk == null
                        ? "—"
                        : audit.technical.robotsTxtOk
                          ? "OK"
                          : "hiányzik/hiba"}
                    </dd>
                  </div>
                  <div>
                    <dt>sitemap.xml</dt>
                    <dd>
                      {audit.technical.sitemapOk == null
                        ? "—"
                        : audit.technical.sitemapOk
                          ? "OK"
                          : "hiányzik/hiba"}
                    </dd>
                  </div>
                  <div>
                    <dt>TLS</dt>
                    <dd>
                      {audit.technical.tls.ok == null
                        ? "—"
                        : audit.technical.tls.ok
                          ? audit.technical.tls.protocol || "OK"
                          : audit.technical.tls.error || "hiba"}
                    </dd>
                  </div>
                  <div>
                    <dt>PageSpeed</dt>
                    <dd>
                      {audit.technical.pagespeed.attempted
                        ? audit.technical.pagespeed.ok
                          ? `${audit.technical.pagespeed.performanceScore}/100`
                          : audit.technical.pagespeed.error || "hiba"
                        : "kihagyva"}
                    </dd>
                  </div>
                </dl>

                {audit.technical.redirectChain.length > 0 ? (
                  <>
                    <h4>Redirect lánc</h4>
                    <ol className="admin-redirects">
                      {audit.technical.redirectChain.map((u) => (
                        <li key={u} className="admin-break">
                          {u}
                        </li>
                      ))}
                    </ol>
                  </>
                ) : null}

                <h4>HTTP headerek</h4>
                <ul className="admin-headers">
                  {Object.entries(audit.technical.headers).map(
                    ([key, value]) => (
                      <li key={key}>
                        <strong>{key}</strong>
                        <span className="admin-break">{value}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            ) : null}
          </>
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
