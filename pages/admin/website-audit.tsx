import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "../../components/admin/AdminShell";
import {
  CategoryBars,
  ScoreRing,
  SeverityDistribution,
  severityIcon,
  severityLabel,
  scoreTone,
} from "../../components/admin/audit/AuditDashboardParts";
import type {
  AuditCategoryId,
  AuditFinding,
  AuditSeverity,
  WebsiteAuditRecord,
  WebsiteAuditSummary,
} from "../../lib/website-audit/types";
import { CATEGORY_LABELS } from "../../lib/website-audit/types";

type FindingFilter = "all" | "problems" | "pass" | "critical_high";

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
    case "skipped":
      return "kihagyva";
    default:
      return status;
  }
}

function normalizeSeverity(s: string): AuditSeverity {
  if (s === "warning") return "medium";
  if (
    s === "pass" ||
    s === "info" ||
    s === "low" ||
    s === "medium" ||
    s === "high" ||
    s === "critical"
  ) {
    return s;
  }
  return "info";
}

function isProblem(f: AuditFinding): boolean {
  const sev = normalizeSeverity(f.severity);
  return (
    sev !== "pass" &&
    f.status !== "not_available" &&
    f.status !== "not_applicable"
  );
}

function WebsiteAuditWorkspace({ bumpIdle }: { bumpIdle: () => void }) {
  const [url, setUrl] = useState("https://");
  const [force, setForce] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [audit, setAudit] = useState<WebsiteAuditRecord | null>(null);
  const [history, setHistory] = useState<WebsiteAuditSummary[]>([]);
  const [filter, setFilter] = useState<FindingFilter>("problems");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});

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
    setFilter("problems");
    setActiveCategory(null);
  }

  async function startAudit(e?: FormEvent, opts?: { force?: boolean }) {
    e?.preventDefault();
    setRunning(true);
    setError("");
    setStatusMsg("Ellenőrzés fut…");
    setAudit(null);
    setActiveCategory(null);
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

  const tone = audit ? scoreTone(audit.overallScore) : "neutral";

  const severityCounts = useMemo(() => {
    if (!audit) return {};
    if (audit.severityCounts) return audit.severityCounts;
    const counts: Record<string, number> = {};
    for (const f of audit.findings || []) {
      const s = normalizeSeverity(f.severity);
      counts[s] = (counts[s] || 0) + 1;
    }
    return counts;
  }, [audit]);

  const priorityFixes = useMemo(() => {
    if (!audit) return [];
    if (audit.priorityFixes?.length) return audit.priorityFixes;
    return (audit.findings || [])
      .filter(isProblem)
      .slice()
      .sort((a, b) => {
        const rank: Record<string, number> = {
          critical: 0,
          high: 1,
          medium: 2,
          warning: 2,
          low: 3,
          info: 4,
        };
        return (
          (rank[normalizeSeverity(a.severity)] ?? 9) -
          (rank[normalizeSeverity(b.severity)] ?? 9)
        );
      })
      .slice(0, 12);
  }, [audit]);

  const categoriesSorted = useMemo(() => {
    if (!audit) return [];
    return [...(audit.categories || [])].sort((a, b) => b.score - a.score);
  }, [audit]);

  function matchesFilter(f: AuditFinding): boolean {
    const sev = normalizeSeverity(f.severity);
    if (filter === "all") return true;
    if (filter === "pass") return sev === "pass";
    if (filter === "critical_high") return sev === "critical" || sev === "high";
    return isProblem(f);
  }

  function toggleCat(id: string) {
    setOpenCats((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  useEffect(() => {
    if (!audit) return;
    // Auto-open categories that have problems
    const next: Record<string, boolean> = {};
    for (const cat of audit.categories || []) {
      const hasProblem = (audit.findings || []).some(
        (f) => f.category === cat.id && isProblem(f)
      );
      next[cat.id] = hasProblem;
    }
    setOpenCats(next);
  }, [audit?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const offerHref = audit
    ? `/kapcsolat?${new URLSearchParams({
        service: "Meglévő oldal megújítása",
        website_url: audit.normalizedUrl || audit.inputUrl || "",
        message: [
          "Weboldal-ellenőrző alapján szeretnék ajánlatot kérni a hibák javítására.",
          `Ellenőrzött URL: ${audit.normalizedUrl || audit.inputUrl}`,
          `Összpontszám: ${audit.overallScore}/100 (${audit.overallLabel || ""})`,
          `Prioritás: ${priorityFixes
            .slice(0, 5)
            .map((f) => f.title)
            .join("; ")}`,
        ].join("\n"),
      }).toString()}`
    : "/kapcsolat";

  return (
    <>
      <section className="admin-card admin-audit" aria-label="Weboldal-ellenőrző">
        <div className="admin-seo-head admin-audit-head">
          <div>
            <div className="admin-audit-title-row">
              <h2>Weboldal-ellenőrző</h2>
              <span className="admin-audit-beta" title="Teszt verzió">
                BETA
              </span>
            </div>
            <p className="admin-muted">
              Admin tesztverzió — egyetlen publikus URL részletes technikai
              auditja (SSRF-védelemmel). Nem publikus szolgáltatás, nem
              website-crawl.
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

        <div className="admin-audit-status" aria-live="polite" role="status">
          {statusMsg ? <p className="admin-muted">{statusMsg}</p> : null}
          {error ? <p className="admin-error">{error}</p> : null}
        </div>

        {running ? (
          <div className="audit-loading" aria-busy="true" aria-live="polite">
            <p className="audit-loading__title">Audit folyamatban…</p>
            <p className="admin-muted">
              URL → lekérés → biztonság → SEO / tartalom → akadálymentesség →
              robots/sitemap → PageSpeed → pontszámítás
            </p>
            <ol className="audit-loading__steps">
              {[
                "URL ellenőrzése",
                "Weboldal lekérése",
                "Biztonság ellenőrzése",
                "SEO elemzés",
                "Tartalom elemzése",
                "Akadálymentesség",
                "robots.txt / sitemap",
                "PageSpeed",
                "Pontszámítás",
              ].map((label, i) => (
                <li key={label} className="audit-loading__step is-pulse">
                  <span className="audit-loading__dot" aria-hidden />
                  {label}
                  <span className="admin-sr-only"> — fázis {i + 1}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {audit ? (
          <article
            className={`admin-audit-report admin-seo--${tone} audit-dashboard`}
            aria-label="Audit dashboard"
          >
            <header className="audit-dash-head">
              <ScoreRing
                score={audit.overallScore}
                label={audit.overallLabel || "Eredmény"}
              />
              <div className="audit-dash-meta">
                <div className="admin-audit-title-row">
                  <h3>Weboldal health</h3>
                  <span className="admin-audit-beta">Teszt verzió</span>
                </div>
                <p className="audit-dash-summary">{audit.summary}</p>
                <p className="admin-muted admin-break">
                  {formatWhen(audit.createdAt)} · {audit.status}
                  {audit.error ? ` · ${audit.error}` : ""}
                </p>
                <p className="admin-break">
                  <a
                    href={audit.normalizedUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {audit.normalizedUrl}
                  </a>
                </p>
                <p className="admin-muted">
                  Egy URL pillanatképe — nem a Monitor teljes site crawl
                  skálája.
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
                  <Link href={offerHref} className="admin-report-offer-cta">
                    Kérj ajánlatot
                  </Link>
                </div>
              </div>
            </header>

            <section aria-label="Súlyosság eloszlás">
              <h4 className="audit-section-title">Súlyosság eloszlás</h4>
              <SeverityDistribution counts={severityCounts} />
            </section>

            <section aria-label="Kategóriák">
              <h4 className="audit-section-title">Kategóriák</h4>
              <CategoryBars
                categories={categoriesSorted}
                activeId={activeCategory}
                onSelect={(id) => {
                  setActiveCategory(id);
                  setOpenCats((prev) => ({ ...prev, [id]: true }));
                  const el = document.getElementById(`audit-cat-${id}`);
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              />
            </section>

            <section
              className="audit-priority"
              aria-label="Mit javítsak először"
            >
              <h4 className="audit-section-title">Mit javítsak először?</h4>
              {priorityFixes.length === 0 ? (
                <p className="admin-report-ok">
                  Nincs prioritásos javítanivaló — erős állapot.
                </p>
              ) : (
                <ol className="audit-priority-list">
                  {priorityFixes.map((f, i) => {
                    const sev = normalizeSeverity(f.severity);
                    return (
                      <li
                        key={`${f.id}-${i}`}
                        className={`audit-priority-item audit-sev--${sev}${
                          sev === "critical" ? " is-critical" : ""
                        }`}
                      >
                        <div className="audit-priority-item__top">
                          <span className="audit-priority-item__n" aria-hidden>
                            {i + 1}
                          </span>
                          <strong>{f.title}</strong>
                          <span
                            className={`admin-finding-tag audit-sev--${sev}`}
                          >
                            <span aria-hidden>{severityIcon(sev)} </span>
                            {severityLabel(sev)}
                          </span>
                          <span className="audit-cat-pill">
                            {CATEGORY_LABELS[f.category as AuditCategoryId] ||
                              f.category}
                          </span>
                        </div>
                        <p>{f.detail}</p>
                        {f.detectedValue ? (
                          <p className="admin-muted admin-break">
                            Detektált: {f.detectedValue}
                          </p>
                        ) : null}
                        {f.recommendation ? (
                          <p className="audit-fix">
                            <strong>Javaslat:</strong> {f.recommendation}
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>

            {audit.technical.indexability ? (
              <section
                className={`audit-indexability audit-indexability--${audit.technical.indexability.status}`}
                aria-label="Indexelhetőség"
              >
                <h4 className="audit-section-title">Indexelhetőség</h4>
                <p>{audit.technical.indexability.summary}</p>
              </section>
            ) : null}

            <section aria-label="Részletes audit">
              <div className="audit-detail-head">
                <h4 className="audit-section-title">Részletes ellenőrzések</h4>
                <div
                  className="admin-audit-filters"
                  role="group"
                  aria-label="Szűrés"
                >
                  {(
                    [
                      ["problems", "Problémák"],
                      ["critical_high", "Kritikus / magas"],
                      ["pass", "Sikeres"],
                      ["all", "Összes"],
                    ] as Array<[FindingFilter, string]>
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      className={filter === id ? "is-active" : ""}
                      onClick={() => setFilter(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="audit-accordions">
                {(audit.categories || []).map((cat) => {
                  const items = (audit.findings || []).filter(
                    (f) => f.category === cat.id && matchesFilter(f)
                  );
                  if (filter !== "all" && items.length === 0) return null;
                  const open = openCats[cat.id] ?? false;
                  const catTone = scoreTone(cat.score);
                  return (
                    <div
                      key={cat.id}
                      id={`audit-cat-${cat.id}`}
                      className={`audit-acc audit-acc--${catTone}`}
                    >
                      <button
                        type="button"
                        className="audit-acc__summary"
                        aria-expanded={open}
                        onClick={() => toggleCat(cat.id)}
                      >
                        <span>
                          {cat.label} — {cat.score}/100
                        </span>
                        <span className="admin-muted">
                          {items.length} tétel · {open ? "bezár" : "kinyit"}
                        </span>
                      </button>
                      {open ? (
                        <ul className="audit-acc__list">
                          {items.length === 0 ? (
                            <li className="admin-muted">Nincs találat a szűrőben.</li>
                          ) : (
                            items.map((f) => {
                              const sev = normalizeSeverity(f.severity);
                              return (
                                <li
                                  key={f.id}
                                  className={`audit-finding audit-sev--${sev}${
                                    sev === "critical" ? " is-critical" : ""
                                  }`}
                                >
                                  <div className="audit-finding__top">
                                    <span
                                      className={`admin-finding-tag audit-sev--${sev}`}
                                      title={severityLabel(sev)}
                                    >
                                      <span aria-hidden>
                                        {severityIcon(sev)}{" "}
                                      </span>
                                      {severityLabel(sev)}
                                    </span>
                                    <strong>{f.title}</strong>
                                    {f.source === "pagespeed_api" ? (
                                      <span className="audit-source">
                                        PageSpeed / Lighthouse mérés
                                      </span>
                                    ) : null}
                                    {f.source === "local_estimate" ? (
                                      <span className="audit-source audit-source--local">
                                        Helyi becslés
                                      </span>
                                    ) : null}
                                  </div>
                                  <p>{f.detail}</p>
                                  {f.detectedValue ? (
                                    <p className="admin-muted admin-break">
                                      Érték: {f.detectedValue}
                                    </p>
                                  ) : null}
                                  {f.recommendation ? (
                                    <p className="audit-fix">
                                      <strong>Javaslat:</strong>{" "}
                                      {f.recommendation}
                                    </p>
                                  ) : null}
                                  {f.evidence ? (
                                    <pre className="admin-evidence">
                                      {f.evidence}
                                    </pre>
                                  ) : null}
                                </li>
                              );
                            })
                          )}
                        </ul>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>

            <details className="audit-tech-details">
              <summary>Technikai részletek</summary>
              <div className="admin-report-table-wrap">
                <table className="admin-report-table">
                  <tbody>
                    <tr>
                      <th scope="row">Eredeti URL</th>
                      <td className="admin-break">{audit.inputUrl}</td>
                    </tr>
                    <tr>
                      <th scope="row">Végső URL</th>
                      <td className="admin-break">
                        {audit.technical.finalUrl || "—"}
                      </td>
                    </tr>
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
                      <th scope="row">Canonical</th>
                      <td className="admin-break">
                        {audit.technical.canonical || "—"}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">html lang</th>
                      <td>{audit.technical.htmlLang || "—"}</td>
                    </tr>
                    <tr>
                      <th scope="row">robots / X-Robots</th>
                      <td className="admin-break">
                        {audit.technical.indexability
                          ? [
                              audit.technical.indexability.metaRobots,
                              audit.technical.indexability.xRobotsTag,
                            ]
                              .filter(Boolean)
                              .join(" · ") || "—"
                          : "—"}
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
                      <th scope="row">PageSpeed forrás</th>
                      <td className="admin-break">
                        {audit.technical.pagespeed.source === "pagespeed_api"
                          ? "PageSpeed / Lighthouse mérés"
                          : audit.technical.pagespeed.source ===
                              "local_estimate"
                            ? "Helyi becslés"
                            : "—"}
                        {audit.technical.pagespeed.performanceScore != null
                          ? ` · ${audit.technical.pagespeed.performanceScore}/100`
                          : ""}
                        {audit.technical.pagespeed.error ? (
                          <span className="admin-muted">
                            {" "}
                            — {audit.technical.pagespeed.error}
                          </span>
                        ) : null}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Audit időpont</th>
                      <td>{formatWhen(audit.createdAt)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {(audit.progress || []).length > 0 ? (
                <>
                  <h5 className="audit-tech-sub">Futási lépések</h5>
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
                        {audit.progress.map((step) => (
                          <tr
                            key={step.id}
                            className={`admin-report-row--${step.status}`}
                          >
                            <td>{stepLabel(step.status)}</td>
                            <td>{step.label}</td>
                            <td className="admin-break">
                              {step.detail || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : null}

              {audit.technical.redirectChain.length > 0 ? (
                <>
                  <h5 className="audit-tech-sub">Redirect lánc</h5>
                  <ol className="audit-redirect-list">
                    {audit.technical.redirectChain.map((u, i) => (
                      <li key={`${i}-${u}`} className="admin-break">
                        {u}
                      </li>
                    ))}
                  </ol>
                </>
              ) : null}
            </details>
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
                  <span className="admin-history-score">
                    {item.overallScore}
                  </span>
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
    <AdminShell active="audit" title="Weboldal-ellenőrző (BETA)">
      {({ authed, bumpIdle }) =>
        authed ? <WebsiteAuditWorkspace bumpIdle={bumpIdle} /> : null
      }
    </AdminShell>
  );
}
