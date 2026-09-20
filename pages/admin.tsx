import Head from "next/head";
import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* No public links to this page — open /admin directly. */
type Stats = {
  today: { views: number; visitors: number };
  week: { views: number; visitors: number };
  month: { views: number; visitors: number };
  weeks: Array<{ week: string; label: string; views: number; visitors: number }>;
  last7Days: Array<{ date: string; views: number; visitors: number }>;
};

const IDLE_MS = 5 * 60 * 1000;

export default function AdminPage() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsError, setStatsError] = useState("");
  const [idleNotice, setIdleNotice] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadStats = useCallback(async () => {
    setStatsError("");
    const res = await fetch("/api/admin/stats", { credentials: "same-origin" });
    if (res.status === 401) {
      setAuthed(false);
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

  const onLogout = useCallback(async (reason?: "idle") => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
      idleTimer.current = null;
    }
    await fetch("/api/admin/login", {
      method: "DELETE",
      credentials: "same-origin",
    });
    setAuthed(false);
    setStats(null);
    setIdleNotice(reason === "idle");
  }, []);

  const bumpIdle = useCallback(() => {
    if (!authed) return;
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      void onLogout("idle");
    }, IDLE_MS);
  }, [authed, onLogout]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/session", { credentials: "same-origin" });
        if (!cancelled && res.ok) {
          const data = await res.json();
          setAuthed(Boolean(data.authenticated));
          if (data.authenticated) await loadStats();
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadStats]);

  useEffect(() => {
    if (!authed) {
      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
        idleTimer.current = null;
      }
      return;
    }

    bumpIdle();
    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];
    const onActivity = () => bumpIdle();
    for (const ev of events) {
      window.addEventListener(ev, onActivity, { passive: true });
    }
    return () => {
      for (const ev of events) {
        window.removeEventListener(ev, onActivity);
      }
      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
        idleTimer.current = null;
      }
    };
  }, [authed, bumpIdle]);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setIdleNotice(false);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Belépés sikertelen.");
        return;
      }
      setPassword("");
      setAuthed(true);
      await loadStats();
    } catch {
      setError("Hálózati hiba a belépésnél.");
    } finally {
      setLoading(false);
    }
  }

  const maxWeekViews = useMemo(() => {
    if (!stats?.weeks?.length) return 1;
    return Math.max(1, ...stats.weeks.map((w) => w.views));
  }, [stats]);

  return (
    <>
      <Head>
        <title>Admin · AntiCode</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="admin-shell">
        {checking ? (
          <p className="admin-muted">Betöltés…</p>
        ) : !authed ? (
          <form className="admin-card admin-login" onSubmit={onLogin}>
            <h1>Admin belépés</h1>
            <p className="admin-muted">Csak belső használatra.</p>
            {idleNotice ? (
              <p className="admin-warn">
                Kijelentkeztél 5 perc inaktivitás miatt.
              </p>
            ) : null}
            <label>
              Felhasználónév
              <input
                autoComplete="username"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                required
              />
            </label>
            <label>
              Jelszó
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {error ? <p className="admin-error">{error}</p> : null}
            <button type="submit" disabled={loading}>
              {loading ? "Belépés…" : "Belépés"}
            </button>
            <Link href="/" className="admin-site-link">
              ← Weboldal
            </Link>
          </form>
        ) : (
          <div className="admin-dash">
            <header className="admin-top">
              <div>
                <h1>Látogatottság</h1>
                <p className="admin-muted">
                  AntiCode · napi / heti / havi áttekintés · 5 perc inaktivitás után kilép
                </p>
              </div>
              <div className="admin-top-actions">
                <Link href="/" className="admin-ghost admin-site-btn">
                  Weboldal
                </Link>
                <button type="button" className="admin-ghost" onClick={() => loadStats()}>
                  Frissítés
                </button>
                <button type="button" className="admin-ghost" onClick={() => onLogout()}>
                  Kijelentkezés
                </button>
              </div>
            </header>

            {statsError ? <p className="admin-error">{statsError}</p> : null}

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
                  <div className="admin-chart" role="img" aria-label="Heti megtekintések oszlopdiagramja">
                    {stats.weeks.map((w) => {
                      const h = Math.round((w.views / maxWeekViews) * 100);
                      return (
                        <div key={w.week} className="admin-bar-col">
                          <div className="admin-bar-wrap">
                            <div
                              className="admin-bar"
                              style={{ height: `${Math.max(h, w.views > 0 ? 6 : 0)}%` }}
                              title={`${w.label}: ${w.views} megtekintés, ${w.visitors} látogató`}
                            />
                          </div>
                          <span className="admin-bar-val">{w.views}</span>
                          <span className="admin-bar-label">{w.label.replace(/^\d+-W/, "W")}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="admin-card" aria-label="Utolsó 7 nap">
                  <h2>Utolsó 7 nap</h2>
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
                </section>
              </>
            ) : (
              <p className="admin-muted">Nincs még adat.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
