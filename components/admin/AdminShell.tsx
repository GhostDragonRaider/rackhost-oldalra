import Head from "next/head";
import Link from "next/link";
import { FormEvent, ReactNode, useCallback, useEffect, useRef, useState } from "react";

export type AdminNavId = "monitor" | "audit";

type AdminShellProps = {
  active: AdminNavId;
  title?: string;
  children: (ctx: {
    authed: boolean;
    checking: boolean;
    bumpIdle: () => void;
  }) => ReactNode;
  onAuthedChange?: (authed: boolean) => void;
};

const IDLE_MS = 5 * 60 * 1000;

const NAV: Array<{ id: AdminNavId; href: string; label: string; icon: string }> = [
  { id: "monitor", href: "/admin", label: "Monitor", icon: "▣" },
  {
    id: "audit",
    href: "/admin/website-audit",
    label: "Weboldal-ellenőrző",
    icon: "⌀",
  },
];

export default function AdminShell({
  active,
  title = "AntiCode Admin",
  children,
  onAuthedChange,
}: AdminShellProps) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [idleNotice, setIdleNotice] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setAuthedSafe = useCallback(
    (value: boolean) => {
      setAuthed(value);
      onAuthedChange?.(value);
    },
    [onAuthedChange]
  );

  const onLogout = useCallback(
    async (reason?: "idle") => {
      if (idleTimer.current) {
        clearTimeout(idleTimer.current);
        idleTimer.current = null;
      }
      await fetch("/api/admin/login", {
        method: "DELETE",
        credentials: "same-origin",
      });
      setAuthedSafe(false);
      setIdleNotice(reason === "idle");
      setNavOpen(false);
    },
    [setAuthedSafe]
  );

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
        const res = await fetch("/api/admin/session", {
          credentials: "same-origin",
        });
        if (!cancelled && res.ok) {
          const data = await res.json();
          setAuthedSafe(Boolean(data.authenticated));
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
  }, [setAuthedSafe]);

  useEffect(() => {
    if (!authed) return;
    bumpIdle();
    const onActivity = () => bumpIdle();
    window.addEventListener("pointerdown", onActivity);
    window.addEventListener("keydown", onActivity);
    return () => {
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [authed, bumpIdle]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 801px)");
    const sync = () => {
      if (mq.matches) setNavOpen(true);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [authed]);

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
      setAuthedSafe(true);
    } catch {
      setError("Hálózati hiba a belépésnél.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>{title} · AntiCode</title>
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
                <h1>AntiCode Admin</h1>
                <p className="admin-muted">
                  Belső eszközök · 5 perc inaktivitás után kilép
                </p>
              </div>
              <div className="admin-top-actions">
                <Link href="/" className="admin-ghost admin-site-btn">
                  Weboldal
                </Link>
                <button
                  type="button"
                  className="admin-ghost admin-nav-toggle"
                  aria-expanded={navOpen}
                  aria-controls="admin-nav"
                  onClick={() => setNavOpen((o) => !o)}
                >
                  Menü
                </button>
                <button
                  type="button"
                  className="admin-ghost"
                  onClick={() => void onLogout()}
                >
                  Kijelentkezés
                </button>
              </div>
            </header>

            <nav
              id="admin-nav"
              className={`admin-nav${navOpen ? " is-open" : ""}`}
              aria-label="Admin navigáció"
            >
              {NAV.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`admin-nav-link${
                    active === item.id ? " is-active" : ""
                  }`}
                  aria-current={active === item.id ? "page" : undefined}
                  onClick={() => setNavOpen(false)}
                >
                  <span className="admin-nav-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {children({ authed, checking, bumpIdle })}
          </div>
        )}
      </div>
    </>
  );
}
