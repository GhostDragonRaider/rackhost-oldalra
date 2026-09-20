import type { AppProps } from "next/app";
import { useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/router";
import "../styles/globals.scss";
import "../styles/landing.scss";
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

  useLayoutEffect(() => {
    document.body.classList.toggle("landing-active", isLandingShell);
    if (!isLandingShell) {
      document.documentElement.removeAttribute("data-theme");
    }
    return () => {
      document.body.classList.remove("landing-active");
    };
  }, [isLandingShell]);

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

  return (
    <LocaleProvider>
      <LangProvider>
        <AuthProvider>
          <div className={isProjectPage ? "project-page" : ""}>
            {!isProjectPage && !isLandingShell && <NavBar />}
            <Component {...pageProps} />
          </div>
        </AuthProvider>
      </LangProvider>
    </LocaleProvider>
  );
}
