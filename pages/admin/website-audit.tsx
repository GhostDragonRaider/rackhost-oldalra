import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import LabShell from "../../components/admin/lab/LabShell";
import {
  AuditReveal,
  AuditSectionTitle,
  CategoryBarsSection,
  ScoreRing,
  SeverityDistribution,
  scoreTone,
} from "../../components/admin/audit/AuditDashboardParts";
import { DelayedHelpTip } from "../../components/admin/audit/DelayedHelpTip";
import AuditProgressList from "../../components/website-audit/AuditProgressList";
import { ExpandableFindingGrid } from "../../components/admin/audit/ExpandableFindingGrid";
import { QuoteRequestModal } from "../../components/admin/audit/QuoteRequestModal";
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
  SECTION_HELP,
  TECH_FIELD_HELP,
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
  const [openTiles, setOpenTiles] = useState<Record<string, boolean>>({});
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});
  const [quoteOpen, setQuoteOpen] = useState(false);

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
    setOpenTiles({});
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
    setOpenTiles({});
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

  function toggleTile(key: string) {
    setOpenTiles((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function togglePriority(key: string) {
    setOpenPriority((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function renderFindingGrid(
    items: AuditFinding[],
    opts?: { keyPrefix?: string; showCategory?: boolean }
  ) {
    return (
      <ExpandableFindingGrid
        items={items}
        openMap={openTiles}
        onToggle={toggleTile}
        keyPrefix={opts?.keyPrefix}
        showIndex={false}
        showCategory={opts?.showCategory ?? false}
        emptyText="Nincs találat a szűrőben."
      />
    );
  }

  function renderSecurityGroups(items: AuditFinding[]) {
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
              {groupItems.length === 0 ? (
                <p className="admin-muted" style={{ padding: "0 14px 12px" }}>
                  Nincs találat ebben a csoportban a jelenlegi szűrővel.
                </p>
              ) : (
                <ExpandableFindingGrid
                  items={groupItems}
                  openMap={openTiles}
                  onToggle={toggleTile}
                  keyPrefix={`sec-${key}-`}
                  showIndex={false}
                  showCategory={false}
                  listClassName="audit-sec-group__list"
                />
              )}
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

  const quoteContext = audit
    ? {
        auditId: audit.id,
        url: audit.normalizedUrl || audit.inputUrl || "",
        overallScore: audit.overallScore,
        overallLabel: audit.overallLabel || "",
        priorityTitles: priorityFixes.map((f) => f.title),
      }
    : null;

  return (
    <>
      <QuoteRequestModal
        open={quoteOpen && quoteContext != null}
        context={quoteContext}
        onClose={() => setQuoteOpen(false)}
        onActivity={bumpIdle}
      />
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
              intruzív security exposure. Kapcsolódó modulok:{" "}
              <Link href="/admin">Monitor</Link>
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
            <AuditReveal
              as="header"
              className="audit-dash-head"
              resetKey={audit.id}
              delayMs={40}
            >
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
                  <button
                    type="button"
                    className="admin-report-offer-cta"
                    onClick={() => {
                      bumpIdle();
                      setQuoteOpen(true);
                    }}
                  >
                    Árajánlatot kérek
                  </button>
                </div>
              </div>
            </AuditReveal>

            <AuditReveal
              as="section"
              aria-label="Súlyosság eloszlás"
              resetKey={audit.id}
              delayMs={90}
            >
              <AuditSectionTitle help={SECTION_HELP.severity}>
                Súlyosság eloszlás
              </AuditSectionTitle>
              <SeverityDistribution counts={severityCounts} />
            </AuditReveal>

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

            <AuditReveal
              as="section"
              className="audit-priority"
              aria-label="Mit javítsak először"
              resetKey={audit.id}
              delayMs={120}
            >
              <AuditSectionTitle help={SECTION_HELP.priority}>
                Mit javítsak először?
              </AuditSectionTitle>
              {priorityFixes.length === 0 ? (
                <p className="admin-report-ok">
                  Nincs prioritásos javítanivaló — erős állapot.
                </p>
              ) : (
                <ExpandableFindingGrid
                  items={priorityFixes}
                  openMap={openPriority}
                  onToggle={togglePriority}
                  keyPrefix="prio-"
                  showIndex
                  showCategory
                  asOrdered
                  listClassName="audit-priority-list"
                  emptyText="Nincs prioritásos javítanivaló — erős állapot."
                />
              )}
            </AuditReveal>

            {audit.technical.indexability ? (
              <AuditReveal
                as="section"
                className={`audit-indexability audit-indexability--${audit.technical.indexability.status}`}
                aria-label="Indexelhetőség"
                resetKey={audit.id}
                delayMs={140}
              >
                <AuditSectionTitle help={SECTION_HELP.indexability}>
                  Indexelhetőség
                </AuditSectionTitle>
                <p>{audit.technical.indexability.summary}</p>
              </AuditReveal>
            ) : null}

            <AuditReveal
              as="section"
              aria-label="Részletes audit"
              resetKey={audit.id}
              delayMs={160}
            >
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
                      className={`audit-acc audit-acc--${catTone}${
                        open ? " is-open" : ""
                      }`}
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
                        <div className="audit-acc__body">
                          {cat.id === "security"
                            ? renderSecurityGroups(items)
                            : renderFindingGrid(items, {
                                keyPrefix: `cat-${cat.id}-`,
                              })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </AuditReveal>

            <AuditReveal as="div" resetKey={audit.id} delayMs={200}>
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
            </AuditReveal>
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
          {" · "}
          <Link href="/admin/lab">Áttekintés</Link>
        </p>
      </section>
    </>
  );
}

export default function WebsiteAuditAdminPage() {
  return (
    <LabShell moduleId="website-audit" title="Weboldal-ellenőrző">
      {({ bumpIdle }) => <WebsiteAuditWorkspace bumpIdle={bumpIdle} />}
    </LabShell>
  );
}
