import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import AdminShell from "../../components/admin/AdminShell";
import {
  AuditSectionTitle,
  CategoryBarsSection,
  ScoreRing,
  SeverityDistribution,
  severityIcon,
  severityLabel,
  scoreTone,
} from "../../components/admin/audit/AuditDashboardParts";
import { DelayedHelpTip } from "../../components/admin/audit/DelayedHelpTip";
import AuditProgressList from "../../components/website-audit/AuditProgressList";
import type {
  AuditCategoryId,
  AuditFinding,
  AuditSeverity,
  WebsiteAuditRecord,
  WebsiteAuditSummary,
} from "../../lib/website-audit/types";
import { CATEGORY_LABELS } from "../../lib/website-audit/types";
import {
  CATEGORY_HELP,
  FINDING_HELP,
  SECTION_HELP,
  SEVERITY_HELP,
  SOURCE_HELP,
  TECH_FIELD_HELP,
  findingHelpText,
} from "../../lib/website-audit/help-texts";
import {
  partitionSecurityFindings,
  SECURITY_GROUP_META,
} from "../../lib/website-audit/security-groups";

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
  /** Live poll record while an audit job is in flight (progress staging). */
  const [liveAudit, setLiveAudit] = useState<WebsiteAuditRecord | null>(null);
  const [progressCaughtUp, setProgressCaughtUp] = useState(true);
  const [history, setHistory] = useState<WebsiteAuditSummary[]>([]);
  const [filter, setFilter] = useState<FindingFilter>("problems");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openPriority, setOpenPriority] = useState<Record<string, boolean>>({});
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
    setRunning(false);
    setLiveAudit(null);
    setProgressCaughtUp(true);
    setOpenPriority({});
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
    setStatusMsg("Audit folyamatban…");
    setAudit(null);
    setLiveAudit(null);
    setProgressCaughtUp(false);
    setActiveCategory(null);
    setOpenPriority({});
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
        setRunning(false);
        setProgressCaughtUp(true);
        return;
      }

      const jobId = String(data.id || data.audit?.id || "");
      if (!jobId) {
        setError("Hiányzó audit azonosító.");
        setRunning(false);
        setProgressCaughtUp(true);
        return;
      }

      if (data.audit) {
        setLiveAudit(data.audit as WebsiteAuditRecord);
      }

      // Async job (202) or legacy sync (200 with completed audit)
      if (res.status === 200 && data.audit?.status === "completed") {
        setLiveAudit(data.audit as WebsiteAuditRecord);
        setStatusMsg("Kész — lépések kipipálása…");
        return;
      }

      const POLL_MS = 900;
      for (;;) {
        await new Promise((r) => setTimeout(r, POLL_MS));
        const poll = await fetch(`/api/admin/website-audit/${encodeURIComponent(jobId)}`, {
          credentials: "same-origin",
        });
        const body = await poll.json();
        if (!poll.ok || !body.ok || !body.audit) {
          setError(body.error || "Az audit állapot nem olvasható.");
          setRunning(false);
          setProgressCaughtUp(true);
          return;
        }
        const next = body.audit as WebsiteAuditRecord;
        setLiveAudit(next);
        const st = String(next.status || "").toLowerCase();
        if (st === "completed" || st === "complete") {
          setStatusMsg(
            next.fromCache
              ? "Kész (cache) — lépések kipipálása…"
              : "Kész — lépések kipipálása…"
          );
          break;
        }
        if (st === "failed") {
          setStatusMsg("Az ellenőrzés hibával zárult — lépések kipipálása…");
          break;
        }
        setStatusMsg(
          st === "queued" ? "Sorban vár…" : "Weboldal vizsgálata…"
        );
      }
      await loadHistory();
    } catch {
      setError("Hálózati hiba az ellenőrzésnél.");
      setStatusMsg("");
      setRunning(false);
      setProgressCaughtUp(true);
    }
  }

  // When every checklist item is checked off AND the job finished, reveal report.
  useEffect(() => {
    if (!liveAudit) return;
    const st = String(liveAudit.status || "").toLowerCase();
    const finished = st === "completed" || st === "complete" || st === "failed";
    if (!finished || !progressCaughtUp) return;
    setAudit(liveAudit);
    setLiveAudit(null);
    setRunning(false);
    setStatusMsg(
      st === "failed" ? "Az ellenőrzés hibával zárult." : "Kész."
    );
  }, [liveAudit, progressCaughtUp]);

  const liveFinished = useMemo(() => {
    const st = String(liveAudit?.status || "").toLowerCase();
    return st === "completed" || st === "complete" || st === "failed";
  }, [liveAudit?.status]);

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
    return [...(audit.categories || [])].sort((a, b) => {
      const as = a.score == null ? -1 : a.score;
      const bs = b.score == null ? -1 : b.score;
      return bs - as;
    });
  }, [audit]);

  function matchesFilter(f: AuditFinding): boolean {
    const sev = normalizeSeverity(f.severity);
    if (filter === "all") return true;
    if (filter === "pass") return sev === "pass";
    if (filter === "critical_high") return sev === "critical" || sev === "high";
    return isProblem(f);
  }

  function renderFindingItem(f: AuditFinding, catHelp: string) {
    const sev = normalizeSeverity(f.severity);
    const help =
      findingHelpText(f.id) || FINDING_HELP[f.id] || catHelp || f.detail;
    return (
      <li
        key={f.id}
        className={`audit-finding audit-sev--${sev}${
          sev === "critical" ? " is-critical" : ""
        }`}
      >
        <DelayedHelpTip text={help} placement="top" display="block">
          <div className="audit-finding__body">
            <div className="audit-finding__top">
              <DelayedHelpTip text={SEVERITY_HELP[sev]} placement="top">
                <span
                  className={`admin-finding-tag audit-sev--${sev}`}
                  tabIndex={0}
                >
                  <span aria-hidden>{severityIcon(sev)} </span>
                  {severityLabel(sev)}
                </span>
              </DelayedHelpTip>
              <strong tabIndex={0}>{f.title}</strong>
              {f.source === "pagespeed_api" ? (
                <DelayedHelpTip
                  text={SOURCE_HELP.pagespeed_api}
                  placement="top"
                >
                  <span className="audit-source" tabIndex={0}>
                    PageSpeed / Lighthouse mérés
                  </span>
                </DelayedHelpTip>
              ) : null}
              {f.source === "local_estimate" ? (
                <DelayedHelpTip
                  text={SOURCE_HELP.local_estimate}
                  placement="top"
                >
                  <span
                    className="audit-source audit-source--local"
                    tabIndex={0}
                  >
                    Helyi becslés
                  </span>
                </DelayedHelpTip>
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
                <strong>Javaslat:</strong> {f.recommendation}
              </p>
            ) : null}
            {f.evidence ? (
              <pre className="admin-evidence">{f.evidence}</pre>
            ) : null}
          </div>
        </DelayedHelpTip>
      </li>
    );
  }

  function renderFindingList(items: AuditFinding[], catHelp: string) {
    if (items.length === 0) {
      return (
        <li className="admin-muted">Nincs találat a szűrőben.</li>
      );
    }
    return items.map((f) => renderFindingItem(f, catHelp));
  }

  function renderSecurityGroups(items: AuditFinding[], catHelp: string) {
    const { breachRisk, hardening } = partitionSecurityFindings(items);
    const groups: Array<{
      key: "breach_risk" | "hardening";
      items: AuditFinding[];
    }> = [
      { key: "breach_risk", items: breachRisk },
      { key: "hardening", items: hardening },
    ];
    return (
      <div className="audit-sec-groups">
        {groups.map(({ key, items: groupItems }) => {
          if (filter !== "all" && groupItems.length === 0) return null;
          const meta = SECURITY_GROUP_META[key];
          return (
            <div
              key={key}
              className={`audit-sec-group audit-sec-group--${key}`}
            >
              <div className="audit-sec-group__head">
                <h4 className="audit-sec-group__title">{meta.title}</h4>
                <p className="audit-sec-group__blurb">{meta.blurb}</p>
                <span className="admin-muted audit-sec-group__count">
                  {groupItems.length} tétel
                </span>
              </div>
              <ul className="audit-acc__list audit-sec-group__list">
                {groupItems.length === 0 ? (
                  <li className="admin-muted">
                    Nincs találat ebben a csoportban a jelenlegi szűrővel.
                  </li>
                ) : (
                  groupItems.map((f) => renderFindingItem(f, catHelp))
                )}
              </ul>
            </div>
          );
        })}
      </div>
    );
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
        audit_id: audit.id,
        message: [
          "Weboldal-ellenőrző alapján szeretnék ajánlatot kérni a hibák javítására.",
          `Audit ID: ${audit.id}`,
          `Ellenőrzött URL: ${audit.normalizedUrl || audit.inputUrl}`,
          `Összpontszám: ${audit.overallScore ?? "—"}/100 (${audit.overallLabel || ""})`,
          `Prioritás: ${priorityFixes
            .slice(0, 5)
            .map((f) => f.title)
            .join("; ")}`,
        ].join("\n"),
      }).toString()}`
    : "/kapcsolat";

  const securityOfferHref = audit
    ? `/kapcsolat?${new URLSearchParams({
        service: "Még egyeztetném",
        website_url: audit.normalizedUrl || audit.inputUrl || "",
        audit_id: audit.id,
        message: [
          "Biztonsági felmérést kérek (Authorized Security Assessment).",
          "Tudom, hogy ez írásos engedélyhez és scope-hoz kötött, nem automatikus scan.",
          `Audit ID (public exposure check): ${audit.id}`,
          `URL: ${audit.normalizedUrl || audit.inputUrl}`,
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
              Admin tesztverzió — nem publikus szolgáltatás. SSRF-védelem, nem
              intruzív security exposure. Kapcsolódó Lab:{" "}
              <Link href="/admin/lab/website-audit">Website Audit</Link>
              {" · "}
              <Link href="/admin/lab/seo-lab">SEO Lab</Link>
              {" · "}
              <Link href="/admin/lab/security-center">Security Center</Link>.
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

        {running || liveAudit ? (
          <div className="audit-loading" aria-busy={!progressCaughtUp} aria-live="polite">
            <p className="audit-loading__title">Audit folyamatban…</p>
            <p className="admin-muted">
              Folyamatszerű ellenőrzés: egyszerre egy szempont fut. Az eredmény
              csak a teljes folyamat után jelenik meg (0,5 mp / lépés).
            </p>
            <AuditProgressList
              steps={liveAudit?.progress || []}
              stepDelayMs={500}
              unlockAll={liveFinished}
              onVisualCaughtUp={setProgressCaughtUp}
            />
          </div>
        ) : null}

        {audit && !liveAudit && progressCaughtUp ? (
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
                  skálája.{" "}
                  <span className="audit-help-hint">
                    Magyarázat: tartsd az egeret ~2 mp-ig egy elemen (pontszám,
                    kategória, súlyosság, ellenőrzés).
                  </span>
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
                    Segítséget kérek a javításhoz
                  </Link>
                  <Link href={securityOfferHref} className="admin-ghost">
                    Biztonsági felmérést kérek
                  </Link>
                </div>
              </div>
            </header>

            <section aria-label="Súlyosság eloszlás">
              <AuditSectionTitle help={SECTION_HELP.severity}>
                Súlyosság eloszlás
              </AuditSectionTitle>
              <SeverityDistribution counts={severityCounts} />
            </section>

            <CategoryBarsSection
              title={
                <AuditSectionTitle help={SECTION_HELP.categories}>
                  Kategóriák
                </AuditSectionTitle>
              }
              categories={categoriesSorted}
              activeId={activeCategory}
              onSelect={(id) => {
                setActiveCategory(id);
                setOpenCats((prev) => ({ ...prev, [id]: true }));
                const el = document.getElementById(`audit-cat-${id}`);
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />

            <section
              className="audit-priority"
              aria-label="Mit javítsak először"
            >
              <AuditSectionTitle help={SECTION_HELP.priority}>
                Mit javítsak először?
              </AuditSectionTitle>
              {priorityFixes.length === 0 ? (
                <p className="admin-report-ok">
                  Nincs prioritásos javítanivaló — erős állapot.
                </p>
              ) : (
                <ol className="audit-priority-list">
                  {priorityFixes.map((f, i) => {
                    const sev = normalizeSeverity(f.severity);
                    const key = `${f.id}-${i}`;
                    const open = openPriority[key] ?? false;
                    const help =
                      findingHelpText(f.id) ||
                      CATEGORY_HELP[f.category as AuditCategoryId] ||
                      f.detail;
                    return (
                      <li
                        key={key}
                        className={`audit-priority-item audit-sev--${sev}${
                          sev === "critical" ? " is-critical" : ""
                        }${open ? " is-open" : ""}`}
                      >
                        <button
                          type="button"
                          className="audit-priority-item__summary"
                          aria-expanded={open}
                          onClick={() =>
                            setOpenPriority((prev) => ({
                              ...prev,
                              [key]: !prev[key],
                            }))
                          }
                        >
                          <span className="audit-priority-item__n" aria-hidden>
                            {i + 1}
                          </span>
                          <span className="audit-priority-item__main">
                            <span className="audit-priority-item__title">
                              {f.title}
                            </span>
                            <span className="audit-priority-item__meta">
                              <DelayedHelpTip
                                text={SEVERITY_HELP[sev]}
                                placement="top"
                              >
                                <span
                                  className={`admin-finding-tag audit-sev--${sev}`}
                                  tabIndex={0}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span aria-hidden>{severityIcon(sev)} </span>
                                  {severityLabel(sev)}
                                </span>
                              </DelayedHelpTip>
                              <DelayedHelpTip
                                text={
                                  CATEGORY_HELP[f.category as AuditCategoryId] ||
                                  ""
                                }
                                placement="top"
                              >
                                <span
                                  className="audit-cat-pill"
                                  tabIndex={0}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {CATEGORY_LABELS[
                                    f.category as AuditCategoryId
                                  ] || f.category}
                                </span>
                              </DelayedHelpTip>
                            </span>
                          </span>
                          <span className="audit-priority-item__chev" aria-hidden>
                            {open ? "▾" : "▸"}
                          </span>
                        </button>
                        {open ? (
                          <DelayedHelpTip
                            text={help}
                            placement="top"
                            display="block"
                          >
                            <div className="audit-priority-item__body">
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
                            </div>
                          </DelayedHelpTip>
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
                <AuditSectionTitle help={SECTION_HELP.indexability}>
                  Indexelhetőség
                </AuditSectionTitle>
                <p>{audit.technical.indexability.summary}</p>
              </section>
            ) : null}

            <section aria-label="Részletes audit">
              <div className="audit-detail-head">
                <AuditSectionTitle help={SECTION_HELP.details}>
                  Részletes ellenőrzések
                </AuditSectionTitle>
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
                  const catHelp =
                    CATEGORY_HELP[cat.id as AuditCategoryId] || "";
                  return (
                    <div
                      key={cat.id}
                      id={`audit-cat-${cat.id}`}
                      className={`audit-acc audit-acc--${catTone}`}
                    >
                      <DelayedHelpTip text={catHelp} placement="bottom" display="block">
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
                      </DelayedHelpTip>
                      {open ? (
                        cat.id === "security" ? (
                          items.length === 0 ? (
                            <ul className="audit-acc__list">
                              <li className="admin-muted">
                                Nincs találat a szűrőben.
                              </li>
                            </ul>
                          ) : (
                            renderSecurityGroups(items, catHelp)
                          )
                        ) : (
                          <ul className="audit-acc__list">
                            {renderFindingList(items, catHelp)}
                          </ul>
                        )
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>

            <details className="audit-tech-details">
              <summary>
                <DelayedHelpTip text={SECTION_HELP.technical} placement="bottom">
                  <span tabIndex={0}>Technikai részletek</span>
                </DelayedHelpTip>
              </summary>
              <div className="admin-report-table-wrap">
                <table className="admin-report-table">
                  <tbody>
                    {(
                      [
                        ["inputUrl", "Eredeti URL", audit.inputUrl],
                        [
                          "finalUrl",
                          "Végső URL",
                          audit.technical.finalUrl || "—",
                        ],
                        [
                          "statusCode",
                          "HTTP státusz",
                          audit.technical.statusCode ?? "—",
                        ],
                        [
                          "responseMs",
                          "Válaszidő",
                          audit.technical.responseMs != null
                            ? `${audit.technical.responseMs} ms`
                            : "—",
                        ],
                        [
                          "responseBytes",
                          "Méret",
                          audit.technical.responseBytes != null
                            ? `${audit.technical.responseBytes} B`
                            : "—",
                        ],
                        [
                          "contentType",
                          "Content-Type",
                          audit.technical.contentType || "—",
                        ],
                        [
                          "canonical",
                          "Canonical",
                          audit.technical.canonical || "—",
                        ],
                        [
                          "htmlLang",
                          "html lang",
                          audit.technical.htmlLang || "—",
                        ],
                        [
                          "robots",
                          "robots / X-Robots",
                          audit.technical.indexability
                            ? [
                                audit.technical.indexability.metaRobots,
                                audit.technical.indexability.xRobotsTag,
                              ]
                                .filter(Boolean)
                                .join(" · ") || "—"
                            : "—",
                        ],
                        [
                          "tls",
                          "TLS",
                          audit.technical.tls.ok == null
                            ? "—"
                            : audit.technical.tls.ok
                              ? audit.technical.tls.protocol || "OK"
                              : audit.technical.tls.error || "hiba",
                        ],
                        [
                          "pagespeed",
                          "PageSpeed forrás",
                          [
                            audit.technical.pagespeed.source ===
                            "pagespeed_api"
                              ? "PageSpeed / Lighthouse mérés"
                              : audit.technical.pagespeed.source ===
                                  "local_estimate"
                                ? "Helyi becslés"
                                : "—",
                            audit.technical.pagespeed.performanceScore != null
                              ? `${audit.technical.pagespeed.performanceScore}/100`
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" · "),
                        ],
                        [
                          "auditedAt",
                          "Audit időpont",
                          formatWhen(audit.createdAt),
                        ],
                      ] as Array<[string, string, string | number]>
                    ).map(([key, label, value]) => (
                      <tr key={key}>
                        <th scope="row">
                          <DelayedHelpTip
                            text={TECH_FIELD_HELP[key] || ""}
                            placement="top"
                          >
                            <span tabIndex={0}>{label}</span>
                          </DelayedHelpTip>
                        </th>
                        <td className="admin-break">
                          {value}
                          {key === "pagespeed" &&
                          audit.technical.pagespeed.error ? (
                            <span className="admin-muted">
                              {" "}
                              — {audit.technical.pagespeed.error}
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
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
