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
  const isLandingShell = isLandingPath(router.pathname);
  const isAdminPage =
    router.pathname === "/admin" || router.pathname.startsWith("/admin/");

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
    const previous = history.scrollRestoration;
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const goTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    const shouldForceTop = (url?: string) => {
      const hash = url?.includes("#")
        ? url.slice(url.indexOf("#"))
        : window.location.hash;
      if (!hash || hash === "#" || hash === "#tartalom") return true;
      const id = decodeURIComponent(hash.slice(1));
      return !id || !document.getElementById(id);
    };

    const timers: number[] = [];
    let frame = 0;
    if (shouldForceTop()) {
      goTop();
      frame = requestAnimationFrame(goTop);
      timers.push(window.setTimeout(goTop, 0));
      timers.push(window.setTimeout(goTop, 50));
      timers.push(window.setTimeout(goTop, 200));
    }

    const onRoute = (url: string) => {
      if (shouldForceTop(url)) goTop();
    };
    router.events.on("routeChangeComplete", onRoute);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      timers.forEach((id) => window.clearTimeout(id));
      router.events.off("routeChangeComplete", onRoute);
      if ("scrollRestoration" in history) {
        history.scrollRestoration = previous || "auto";
      }
    };
  }, [router.events, router.asPath]);

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
