import type { AppProps } from "next/app";
import { useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/router";
import "../styles/globals.scss";
import "../styles/landing.scss";
import "../styles/admin.scss";
import AnalyticsBeacon from "../components/AnalyticsBeacon";
import NavBar from "../components/Navbar";
import { LangProvider } from "../components/lang_context";
import { AuthProvider } from "../components/auth_context";
import { LocaleProvider } from "../lib/i18n/LocaleContext";
import { SERVICE_PATHS } from "../lib/site";

const LANDING_PATHS = new Set<string>([
  "/",
  ...SERVICE_PATHS,
  "/kapcsolat",
  "/rolam",
  "/tudastar",
]);

function isLandingPath(pathname: string) {
  if (LANDING_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/tudastar/")) return true;
  return false;
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isProjectPage = router.pathname.startsWith("/projects/");
  const isHomePage = router.pathname === "/";
  const isLandingShell = isLandingPath(router.pathname);
  const isAdminPage = router.pathname === "/admin";

  useLayoutEffect(() => {
    document.body.classList.toggle("landing-active", isLandingShell);
    document.body.classList.toggle("admin-active", isAdminPage);
    if (!isLandingShell) {
      document.documentElement.removeAttribute("data-theme");
    }
    return () => {
      document.body.classList.remove("landing-active");
      document.body.classList.remove("admin-active");
    };
  }, [isLandingShell, isAdminPage]);

  useEffect(() => {
    if (!isHomePage) return;

    const previous = history.scrollRestoration;
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const goTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    goTop();
    const frame = requestAnimationFrame(goTop);
    const timer = window.setTimeout(goTop, 0);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      if ("scrollRestoration" in history) {
        history.scrollRestoration = previous || "auto";
      }
    };
  }, [isHomePage]);

  const inner = (
    <div className={isProjectPage ? "project-page" : ""}>
      {!isProjectPage && !isLandingShell && !isAdminPage && <NavBar />}
      <Component {...pageProps} />
      {!isAdminPage && !isProjectPage && <AnalyticsBeacon />}
    </div>
  );

  if (isAdminPage) {
    return <AuthProvider>{inner}</AuthProvider>;
  }

  return (
    <LocaleProvider>
      <LangProvider>
        <AuthProvider>{inner}</AuthProvider>
      </LangProvider>
    </LocaleProvider>
  );
}
