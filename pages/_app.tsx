import type { AppProps } from "next/app";
import { useEffect } from "react";
import { useRouter } from "next/router";
import "../styles/globals.scss";
import "../styles/landing.scss";
import NavBar from "../components/Navbar";
import { LangProvider } from "../components/lang_context";
import { AuthProvider } from "../components/auth_context";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isProjectPage = router.pathname.startsWith("/projects/");
  const isHomePage = router.pathname === "/";

  useEffect(() => {
    document.body.classList.toggle("landing-active", isHomePage);
    if (!isHomePage) {
      document.documentElement.removeAttribute("data-theme");
    }
    return () => {
      document.body.classList.remove("landing-active");
    };
  }, [isHomePage]);

  // Homepage load / refresh always starts at the top
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
    <LangProvider>
      <AuthProvider>
        <div className={isProjectPage ? "project-page" : ""}>
          {!isProjectPage && !isHomePage && <NavBar />}
          <Component {...pageProps} />
        </div>
      </AuthProvider>
    </LangProvider>
  );
}
