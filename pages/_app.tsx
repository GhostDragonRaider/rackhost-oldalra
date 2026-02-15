import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import "../styles/globals.scss";
import NavBar from "../components/Navbar";
import { LangProvider } from "../components/lang_context";
import { AuthProvider } from "../components/auth_context";


export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isProjectPage = router.pathname.startsWith("/projects/");

  return (
    <LangProvider>
      <AuthProvider>
        <div className={isProjectPage ? "project-page" : ""}>
          {!isProjectPage && <NavBar />}
          <Component {...pageProps} />
        </div>
      </AuthProvider>
    </LangProvider>
  );
}
