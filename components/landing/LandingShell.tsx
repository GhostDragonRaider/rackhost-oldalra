import React, { ReactNode, useCallback, useLayoutEffect, useState } from "react";
import Link from "next/link";
import BrandMark from "./BrandMark";
import SeoHead from "./SeoHead";
import { SITE_EMAIL } from "../../lib/site";

type Theme = "dark" | "light";
const THEME_KEY = "anticode-theme";

const PAGE_NAV = [
  { href: "/#szolgaltatasok", label: "Szolgáltatások" },
  { href: "/arak", label: "Árak" },
  { href: "/tudastar", label: "Tudástár" },
  { href: "/#referenciak", label: "Referenciák" },
  { href: "/kapcsolat", label: "Kapcsolat" },
] as const;

function applyTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", next === "dark" ? "#081426" : "#f5f8fc");
}

type LandingShellProps = {
  title: string;
  description: string;
  path: string;
  children: ReactNode;
  noindex?: boolean;
  ogType?: "website" | "article";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

export default function LandingShell({
  title,
  description,
  path,
  children,
  noindex = false,
  ogType = "website",
  jsonLd,
}: LandingShellProps) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [year] = useState(() => new Date().getFullYear());

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  }, [theme]);

  useLayoutEffect(() => {
    document.body.classList.add("landing-active");
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    const initial: Theme = saved === "light" || saved === "dark" ? saved : "dark";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="landing-page landing-subpage">
      <SeoHead
        title={title}
        description={description}
        path={path}
        noindex={noindex}
        ogType={ogType}
        jsonLd={jsonLd}
      />

      <a className="skip-link" href="#tartalom">
        Ugrás a tartalomra
      </a>

      <header className="nav">
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "min(1180px, calc(100% - 40px))",
          }}
        >
          <BrandMark href="/" />
          <nav className="links" aria-label="Fő navigáció">
            {PAGE_NAV.map((link) =>
              link.href.startsWith("/") && !link.href.includes("#") ? (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ) : (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              )
            )}
          </nav>
          <div className="nav-actions">
            <button
              className="theme"
              type="button"
              aria-label="Világos vagy sötét mód váltása"
              aria-pressed={theme === "dark"}
              onClick={toggleTheme}
            >
              <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
            </button>
            <Link className="btn" href="/kapcsolat">
              <span className="btn-label">Ajánlatot kérek</span>{" "}
              <span aria-hidden="true">→</span>
            </Link>
            <button
              className="menu"
              type="button"
              aria-label={menuOpen ? "Menü bezárása" : "Menü megnyitása"}
              aria-controls="mobile-nav-sub"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span aria-hidden="true">☰</span>
            </button>
          </div>
        </div>
      </header>

      <nav
        className={`mobile-nav${menuOpen ? " open" : ""}`}
        id="mobile-nav-sub"
        aria-label="Mobil navigáció"
        aria-hidden={!menuOpen}
      >
        {PAGE_NAV.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={closeMenu}
            tabIndex={menuOpen ? undefined : -1}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <main id="tartalom" className="landing-main" tabIndex={-1}>
        {children}
      </main>

      <footer>
        <div className="container footer">
          <p>
            <BrandMark className="brand footer-brand" asLink={false} /> / weboldalak
            és egyedi rendszerek
          </p>
          <p>
            <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>
            {" · "}
            <Link href="/arak">Árak</Link>
            {" · "}
            <Link href="/tudastar">Tudástár</Link>
            {" · "}
            <Link href="/rolam">Rólam</Link>
            {" · "}
            <Link href="/kapcsolat">Kapcsolat</Link>
            {" · "}© {year} AntiCode
          </p>
        </div>
      </footer>
    </div>
  );
}
