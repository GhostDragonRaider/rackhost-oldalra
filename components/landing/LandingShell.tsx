import React, {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import BrandMark from "./BrandMark";
import LangSwitcher from "./LangSwitcher";
import SeoHead from "./SeoHead";
import { useNavCollapse } from "./useNavCollapse";
import { useLocale } from "../../lib/i18n/LocaleContext";
import { SITE_EMAIL } from "../../lib/site";

type Theme = "dark" | "light";
const THEME_KEY = "anticode-theme";

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
  const { t } = useLocale();
  const [theme, setTheme] = useState<Theme>("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const [year] = useState(() => new Date().getFullYear());
  const navContainerRef = useRef<HTMLDivElement>(null);
  const navCollapsed = useNavCollapse(navContainerRef, [t.pageNav]);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  }, [theme]);

  useLayoutEffect(() => {
    document.body.classList.add("landing-active");
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    const initial: Theme =
      saved === "light" || saved === "dark" ? saved : "light";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  useEffect(() => {
    if (navCollapsed) return;
    setMenuOpen(false);
  }, [navCollapsed]);

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
        {t.chrome.skip}
      </a>

      <header className={`nav${navCollapsed ? " nav-collapsed" : ""}`}>
        <div className="container" ref={navContainerRef}>
          <BrandMark href="/" />
          <nav className="links" aria-label={t.chrome.navAria}>
            {t.pageNav.map((link) =>
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
              aria-label={t.chrome.theme}
              aria-pressed={theme === "dark"}
              title={t.chrome.themeTitle}
              onClick={toggleTheme}
            >
              <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
            </button>
            <Link className="btn" href="/kapcsolat">
              <span className="btn-label">{t.chrome.cta}</span>{" "}
              <span aria-hidden="true">→</span>
            </Link>
            <LangSwitcher />
            <button
              className="menu"
              type="button"
              aria-label={menuOpen ? t.chrome.menuClose : t.chrome.menuOpen}
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
        aria-label={t.chrome.mobileNavAria}
        aria-hidden={!menuOpen}
      >
        {t.pageNav.map((link) => (
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
            <BrandMark className="brand footer-brand" asLink={false} /> /{" "}
            {t.chrome.footerTag}
          </p>
          <p>
            <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>
            {" · "}
            <Link href="/arak">{t.chrome.prices}</Link>
            {" · "}
            <Link href="/tudastar">Tudástár</Link>
            {" · "}
            <Link href="/kapcsolat">{t.chrome.cta}</Link>
            {" · "}© {year} AntiCode
          </p>
        </div>
      </footer>
    </div>
  );
}
