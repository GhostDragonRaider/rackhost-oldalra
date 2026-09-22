import Link from "next/link";
import AdminShell from "../../components/admin/AdminShell";
import { useCallback, useEffect, useMemo, useState } from "react";

/* No public links to this page — open /admin directly. */
type Stats = {
  today: { views: number; visitors: number };
  week: { views: number; visitors: number };
  month: { views: number; visitors: number };
  weeks: Array<{ week: string; label: string; views: number; visitors: number }>;
  last7Days: Array<{ date: string; views: number; visitors: number }>;
};

type SeoIssue = {
  id: string;
  severity: "critical" | "warning" | "info";
  category: string;
  title: string;
  detail: string;
  url?: string;
};

type SeoReport = {
  summary: {
    score: number;
    criticalCount: number;
    warningCount: number;
    infoCount: number;
    sitemapOk: boolean;
    indexingOk: boolean;
    brokenLinkCount: number;
    missingMetaCount: number;
    pagesChecked: number;
    avgResponseMs: number;
    lastCheckedAt: string;
  };
  issues: SeoIssue[];
  pages: Array<{
    url: string;
    status: number;
    title: string | null;
    description: string | null;
    responseMs: number;
  }>;
  history: Array<{
    at: string;
    score: number;
    criticalCount: number;
    warningCount: number;
  }>;
  gscConnected: boolean;
  gsc: {
    connected: boolean;
    siteUrl: string | null;
    rangeDays: number;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    topQueries: Array<{
      query: string;
      clicks: number;
      impressions: number;
      ctr: number;
      position: number;
    }>;
    error: string | null;
  } | null;
  gscIndexing: {
    connected: boolean;
    siteUrl: string | null;
    checkedAt: string;
    total: number;
    indexedCount: number;
    notIndexedCount: number;
    unknownCount: number;
    errorCount: number;
    urls: Array<{
      url: string;
      indexed: boolean | null;
      verdict: string | null;
      coverageState: string | null;
      robotsTxtState: string | null;
      indexingState: string | null;
      lastCrawlTime: string | null;
      pageFetchState: string | null;
      crawledAs: string | null;
      googleCanonical: string | null;
      userCanonical: string | null;
      sitemaps: string[];
      referringUrls: string[];
      mobileUsabilityVerdict: string | null;
      inspectionResultLink: string | null;
      error: string | null;
    }>;
    error: string | null;
  } | null;
};

function formatCheckedAt(iso: string): string {
  if (!iso) return "még nem futott";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const time = d.toLocaleTimeString("hu-HU", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (sameDay) return `ma ${time}`;
  return d.toLocaleString("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusOkLabel(ok: boolean): string {
  return ok ? "rendben" : "figyelem";
}

function formatCrawlTime(iso: string | null): string {
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

function indexedLabel(indexed: boolean | null, error: string | null): string {
  if (error) return "hiba";
  if (indexed === true) return "indexelve";
  if (indexed === false) return "nincs indexelve";
  return "ismeretlen";
}

function shortPath(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname === "/" ? "/" : u.pathname;
  } catch {
    return url;
  }
}

function MonitorWorkspace({
  bumpIdle,
}: {
  bumpIdle: () => void;
}) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsError, setStatsError] = useState("");
  const [seo, setSeo] = useState<SeoReport | null>(null);
  const [seoError, setSeoError] = useState("");
  const [seoRunning, setSeoRunning] = useState(false);

  const loadStats = useCallback(async () => {
    setStatsError("");
    const res = await fetch("/api/admin/stats", { credentials: "same-origin" });
    if (res.status === 401) {
      setStats(null);
      return;
    }
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setStatsError(data.error || "Nem sikerült betölteni a statisztikát.");
      return;
    }
    setStats(data.stats as Stats);
  }, []);

  const loadSeo = useCallback(async () => {
    setSeoError("");
    const res = await fetch("/api/admin/seo", { credentials: "same-origin" });
    if (res.status === 401) {
      setSeo(null);
      return;
    }
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setSeoError(data.error || "Nem sikerült betölteni az SEO jelentést.");
      return;
    }
    setSeo(data.report as SeoReport);
  }, []);

  const runSeoCheck = useCallback(async () => {
    setSeoRunning(true);
    setSeoError("");
    bumpIdle();
    try {
      const res = await fetch("/api/admin/seo", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendAlert: true }),
      });
      if (res.status === 401) return;

      const raw = await res.text();
      let data: {
        ok?: boolean;
        error?: string;
        report?: SeoReport;
        indexingRefresh?: string;
      } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        await loadSeo();
        setSeoError(
          res.ok
            ? ""
            : "Az ellenőrzés túl sokáig tartott a proxynál. A jelentés frissülhetett — próbáld újra, vagy frissíts."
        );
        return;
      }

      if (!res.ok || !data.ok) {
        setSeoError(data.error || "Az SEO ellenőrzés sikertelen.");
        await loadSeo();
        return;
      }
      if (data.report) setSeo(data.report);

      // GSC indexing finishes in the background — poll for the table.
      if (data.indexingRefresh === "started") {
        for (const delayMs of [2500, 6000, 12000]) {
          await new Promise((r) => setTimeout(r, delayMs));
          bumpIdle();
          await loadSeo();
        }
      }
    } catch {
      try {
        await loadSeo();
      } catch {
        /* ignore */
      }
      setSeoError("Hálózati hiba az SEO ellenőrzésnél.");
    } finally {
      setSeoRunning(false);
    }
  }, [bumpIdle, loadSeo]);

  useEffect(() => {
    void Promise.all([loadStats(), loadSeo()]);
  }, [loadStats, loadSeo]);

  const maxWeekViews = useMemo(() => {
    if (!stats?.weeks?.length) return 1;
    return Math.max(1, ...stats.weeks.map((w) => w.views));
  }, [stats]);

  const scoreTone =
    !seo?.summary.lastCheckedAt
      ? "neutral"
      : seo.summary.criticalCount > 0
        ? "bad"
        : seo.summary.warningCount > 0
          ? "warn"
          : "good";

  return (
    <>
      <div className="admin-toolbar">
        <button
          type="button"
          className="admin-ghost"
          onClick={() => {
            bumpIdle();
            void loadStats();
            void loadSeo();
          }}
        >
          Frissítés
        </button>
      </div>

      <section
        className={`admin-card admin-seo admin-seo--${scoreTone}`}
        aria-label="SEO Monitor"
      >
        <div className="admin-seo-head">
          <div>
            <h2>SEO Monitor</h2>
            <p className="admin-muted">
              Napi technikai ellenőrzés: 404, törött linkek, meta, teljesítmény,
              indexelés, sitemap. Tartalmat nem ír át automatikusan.
            </p>
          </div>
          <button
            type="button"
            className="admin-ghost"
            disabled={seoRunning}
            onClick={() => void runSeoCheck()}
          >
            {seoRunning ? "Ellenőrzés…" : "Ellenőrzés most"}
          </button>
        </div>

        {seoError ? <p className="admin-error">{seoError}</p> : null}

        {seo?.summary.lastCheckedAt ? (
          <>
            <div
              className="admin-seo-status"
              aria-label="SEO státusz összefoglaló"
            >
              <div className="admin-seo-score">
                <span>SEO státusz</span>
                <strong>
                  {seo.summary.score}/100
                  {seo.summary.criticalCount === 0 ? " ✓" : ""}
                </strong>
              </div>
              <ul className="admin-seo-metrics">
                <li>
                  <strong>{seo.summary.criticalCount}</strong> kritikus hiba
                </li>
                <li>
                  <strong>{seo.summary.warningCount}</strong> figyelmeztetés
                </li>
                <li>
                  Sitemap:{" "}
                  <strong>{statusOkLabel(seo.summary.sitemapOk)}</strong>
                </li>
                <li>
                  Indexelés:{" "}
                  <strong>{statusOkLabel(seo.summary.indexingOk)}</strong>
                </li>
                <li>
                  Hibás linkek: <strong>{seo.summary.brokenLinkCount}</strong>
                </li>
                <li>
                  Utolsó ellenőrzés:{" "}
                  <strong>{formatCheckedAt(seo.summary.lastCheckedAt)}</strong>
                </li>
              </ul>
            </div>

            <p className="admin-muted admin-seo-meta">
              {seo.summary.pagesChecked} oldal · átl. válasz{" "}
              {seo.summary.avgResponseMs} ms · hiányzó/gyenge meta:{" "}
              {seo.summary.missingMetaCount}
              {seo.gscConnected
                ? seo.gsc?.error
                  ? " · GSC: hiba"
                  : " · GSC csatlakoztatva"
                : " · GSC: nincs API (opcionális)"}
            </p>

            {seo.gscConnected && seo.gsc && !seo.gsc.error ? (
              <div className="admin-gsc" aria-label="Google Search Console">
                <h3>Keresési forgalom (GSC · {seo.gsc.rangeDays} nap)</h3>
                <ul className="admin-seo-metrics">
                  <li>
                    Kattintás: <strong>{seo.gsc.clicks}</strong>
                  </li>
                  <li>
                    Megjelenés: <strong>{seo.gsc.impressions}</strong>
                  </li>
                  <li>
                    CTR: <strong>{(seo.gsc.ctr * 100).toFixed(1)}%</strong>
                  </li>
                  <li>
                    Átl. pozíció: <strong>{seo.gsc.position}</strong>
                  </li>
                </ul>
                {seo.gsc.topQueries.length > 0 ? (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Keresés</th>
                          <th>Katt.</th>
                          <th>Megj.</th>
                          <th>Poz.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seo.gsc.topQueries.slice(0, 8).map((q) => (
                          <tr key={q.query}>
                            <td>{q.query}</td>
                            <td>{q.clicks}</td>
                            <td>{q.impressions}</td>
                            <td>{q.position.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="admin-muted">
                    Még nincs keresési adat ebben az időszakban.
                  </p>
                )}
              </div>
            ) : null}

            {seo.gscConnected && seo.gscIndexing ? (
              <div
                className="admin-gsc admin-gsc-indexing"
                aria-label="GSC indexeltség"
              >
                <h3>Indexeltség (GSC · folyamatos ellenőrzés)</h3>
                {seo.gscIndexing.error ? (
                  <p className="admin-error">{seo.gscIndexing.error}</p>
                ) : (
                  <>
                    <ul className="admin-seo-metrics">
                      <li>
                        Indexelve:{" "}
                        <strong>
                          {seo.gscIndexing.indexedCount}/{seo.gscIndexing.total}
                        </strong>
                      </li>
                      <li>
                        Nincs indexelve:{" "}
                        <strong>{seo.gscIndexing.notIndexedCount}</strong>
                      </li>
                      <li>
                        Ismeretlen:{" "}
                        <strong>{seo.gscIndexing.unknownCount}</strong>
                      </li>
                      <li>
                        Hiba: <strong>{seo.gscIndexing.errorCount}</strong>
                      </li>
                    </ul>
                    <p className="admin-muted admin-seo-meta">
                      Utolsó GSC index-ellenőrzés:{" "}
                      <strong>
                        {formatCheckedAt(seo.gscIndexing.checkedAt)}
                      </strong>
                      {seo.gscIndexing.siteUrl
                        ? ` · ${seo.gscIndexing.siteUrl}`
                        : ""}
                      . A napi SEO cron teljes indexelést futtat; az „Ellenőrzés
                      most” a technikát azonnal, a GSC indexelést háttérben
                      frissíti.
                    </p>
                    {seo.gscIndexing.urls.length > 0 ? (
                      <div className="admin-gsc-index-table-wrap">
                        <table className="admin-table admin-gsc-index-table">
                          <thead>
                            <tr>
                              <th>Oldal</th>
                              <th>Állapot</th>
                              <th>Lefedettség</th>
                              <th>Utolsó crawl</th>
                              <th>Robots</th>
                              <th>Fetch</th>
                              <th>Canonical</th>
                              <th>Mobil</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {seo.gscIndexing.urls.map((row) => (
                              <tr
                                key={row.url}
                                className={
                                  row.indexed === true
                                    ? "is-indexed"
                                    : row.indexed === false
                                      ? "is-not-indexed"
                                      : row.error
                                        ? "is-error"
                                        : "is-unknown"
                                }
                              >
                                <td>
                                  <a
                                    href={row.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    title={row.url}
                                  >
                                    {shortPath(row.url)}
                                  </a>
                                </td>
                                <td>
                                  <span
                                    className={`admin-index-badge admin-index-badge--${
                                      row.error
                                        ? "error"
                                        : row.indexed === true
                                          ? "ok"
                                          : row.indexed === false
                                            ? "bad"
                                            : "unknown"
                                    }`}
                                  >
                                    {indexedLabel(row.indexed, row.error)}
                                  </span>
                                  {row.verdict ? (
                                    <span className="admin-index-verdict">
                                      {row.verdict}
                                    </span>
                                  ) : null}
                                  {row.error ? (
                                    <span className="admin-index-error">
                                      {row.error}
                                    </span>
                                  ) : null}
                                </td>
                                <td>{row.coverageState || "—"}</td>
                                <td>{formatCrawlTime(row.lastCrawlTime)}</td>
                                <td>{row.robotsTxtState || "—"}</td>
                                <td>
                                  {[
                                    row.pageFetchState,
                                    row.crawledAs
                                      ? `(${row.crawledAs})`
                                      : null,
                                  ]
                                    .filter(Boolean)
                                    .join(" ") || "—"}
                                </td>
                                <td className="admin-index-canonical">
                                  {row.googleCanonical ||
                                    row.userCanonical ||
                                    "—"}
                                  {row.sitemaps.length > 0 ? (
                                    <span className="admin-muted">
                                      {" "}
                                      · sitemap: {row.sitemaps.length}
                                    </span>
                                  ) : null}
                                </td>
                                <td>
                                  {row.mobileUsabilityVerdict || "—"}
                                </td>
                                <td>
                                  {row.inspectionResultLink ? (
                                    <a
                                      href={row.inspectionResultLink}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      GSC
                                    </a>
                                  ) : (
                                    "—"
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="admin-muted">
                        Az indexeltségi lista még töltődik (háttérben fut), vagy
                        indítsd újra az „Ellenőrzés most” gombbal.
                      </p>
                    )}
                  </>
                )}
              </div>
            ) : null}

            {seo.issues.length > 0 ? (
              <div className="admin-seo-issues">
                <h3>Találatok</h3>
                <ul>
                  {seo.issues
                    .filter((i) => i.severity !== "info")
                    .concat(seo.issues.filter((i) => i.severity === "info"))
                    .slice(0, 40)
                    .map((issue) => (
                      <li
                        key={issue.id}
                        className={`admin-seo-issue admin-seo-issue--${issue.severity}`}
                      >
                        <span className="admin-seo-issue-tag">
                          {issue.severity === "critical"
                            ? "kritikus"
                            : issue.severity === "warning"
                              ? "figyelmeztetés"
                              : "infó"}
                        </span>
                        <div>
                          <strong>{issue.title}</strong>
                          <p>{issue.detail}</p>
                          {issue.url ? (
                            <a
                              href={issue.url}
                              target="_blank"
                              rel="noreferrer"
                              className="admin-break"
                            >
                              {issue.url}
                            </a>
                          ) : null}
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            ) : (
              <p className="admin-muted">Nincs jelzett hiba.</p>
            )}
          </>
        ) : (
          <p className="admin-muted">
            Még nem futott ellenőrzés. Nyomd meg az „Ellenőrzés most” gombot,
            vagy várd a napi cron futást.
          </p>
        )}
      </section>

      {statsError ? <p className="admin-error">{statsError}</p> : null}

            <header className="admin-section-label">
              <h2>Látogatottság</h2>
              <p className="admin-muted">
                A saját böngésződ megtekintései (admin belépés után) nem
                számítanak bele.
              </p>
            </header>

      {stats ? (
        <>
          <section className="admin-kpis" aria-label="Összesítők">
            <article>
              <span>Ma</span>
              <strong>{stats.today.visitors}</strong>
              <em>{stats.today.views} megtekintés</em>
            </article>
            <article>
              <span>Elmúlt 7 nap</span>
              <strong>{stats.week.visitors}</strong>
              <em>{stats.week.views} megtekintés</em>
            </article>
            <article>
              <span>Elmúlt 30 nap</span>
              <strong>{stats.month.visitors}</strong>
              <em>{stats.month.views} megtekintés</em>
            </article>
          </section>

          <section className="admin-card" aria-label="Heti grafikon">
            <h2>Heti megtekintések</h2>
            <p className="admin-muted">Az utolsó 12 hét oldalletöltései</p>
            <div
              className="admin-chart"
              role="img"
              aria-label="Heti megtekintések oszlopdiagramja"
            >
              {stats.weeks.map((w) => {
                const h = Math.round((w.views / maxWeekViews) * 100);
                return (
                  <div key={w.week} className="admin-bar-col">
                    <div className="admin-bar-wrap">
                      <div
                        className="admin-bar"
                        style={{
                          height: `${Math.max(h, w.views > 0 ? 6 : 0)}%`,
                        }}
                        title={`${w.label}: ${w.views} megtekintés, ${w.visitors} látogató`}
                      />
                    </div>
                    <span className="admin-bar-val">{w.views}</span>
                    <span className="admin-bar-label">
                      {w.label.replace(/^\d+-W/, "W")}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="admin-card" aria-label="Utolsó 7 nap">
            <h2>Utolsó 7 nap</h2>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Dátum</th>
                    <th>Látogatók</th>
                    <th>Megtekintések</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.last7Days.map((d) => (
                    <tr key={d.date}>
                      <td>{d.date}</td>
                      <td>{d.visitors}</td>
                      <td>{d.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <p className="admin-muted">Nincs még látogatottsági adat.</p>
      )}

      <p className="admin-muted admin-tool-jump">
        <Link href="/admin/website-audit">Weboldal-ellenőrző megnyitása →</Link>
      </p>
    </>
  );
}

export default function AdminPage() {
  return (
    <AdminShell active="monitor" title="AntiCode Monitor">
      {({ authed, bumpIdle }) =>
        authed ? <MonitorWorkspace bumpIdle={bumpIdle} /> : null
      }
    </AdminShell>
  );
}
