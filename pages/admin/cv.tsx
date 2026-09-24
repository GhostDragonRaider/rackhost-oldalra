import Head from "next/head";
import { useCallback, useEffect, useRef, useState } from "react";
import AdminShell from "../../components/admin/AdminShell";
import CvDocument from "../../components/admin/cv/CvDocument";
import type { CvContent, CvLocale } from "../../lib/cv/types";

function CvWorkspace({ bumpIdle }: { bumpIdle: () => void }) {
  const [locale, setLocale] = useState<CvLocale>("hu");
  const [cv, setCv] = useState<CvContent | null>(null);
  const [loadError, setLoadError] = useState("");
  const [loadingCv, setLoadingCv] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingCv(true);
      setLoadError("");
      try {
        const res = await fetch("/api/admin/cv/content", {
          credentials: "same-origin",
        });
        if (!res.ok) {
          throw new Error(
            res.status === 401
              ? "Nincs jogosultság a CV betöltéséhez."
              : "A CV tartalom betöltése sikertelen."
          );
        }
        const data = (await res.json()) as { ok: boolean; cv: CvContent };
        if (!cancelled) {
          if (!data.ok || !data.cv) throw new Error("Érvénytelen CV válasz.");
          setCv(data.cv);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Ismeretlen hiba.");
        }
      } finally {
        if (!cancelled) setLoadingCv(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pdfName = cv?.pdfFileName[locale] || "CV.pdf";

  const setLocaleSafe = useCallback(
    (next: CvLocale) => {
      bumpIdle();
      setLocale(next);
    },
    [bumpIdle]
  );

  useEffect(() => {
    if (!cv) return;
    const prev = document.title;
    document.title = pdfName.replace(/\.pdf$/i, "");
    return () => {
      document.title = prev;
    };
  }, [pdfName, cv]);

  function scrollToPreview() {
    bumpIdle();
    previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function downloadPdf() {
    bumpIdle();
    window.print();
  }

  return (
    <section
      className="admin-card cv-print-root cv-workspace"
      aria-label="Önéletrajz kezelése"
    >
      <div className="cv-workspace-head">
        <h2>Önéletrajzom elküldése</h2>
        <p className="admin-muted">
          Önéletrajz kezelése, letöltése és álláspályázatok előkészítése.
        </p>
      </div>

      <div className="cv-toolbar" role="toolbar" aria-label="CV műveletek">
        <div className="cv-toolbar__group">
          <div className="cv-lang-toggle" role="group" aria-label="CV nyelve">
            <button
              type="button"
              className={locale === "hu" ? "is-active" : ""}
              aria-pressed={locale === "hu"}
              onClick={() => setLocaleSafe("hu")}
            >
              Magyar CV
            </button>
            <button
              type="button"
              className={locale === "en" ? "is-active" : ""}
              aria-pressed={locale === "en"}
              onClick={() => setLocaleSafe("en")}
            >
              English CV
            </button>
          </div>
        </div>
        <div className="cv-toolbar__group">
          <button
            type="button"
            className="admin-ghost"
            onClick={scrollToPreview}
            disabled={!cv}
          >
            Előnézet
          </button>
          <button
            type="button"
            className="cv-download"
            onClick={downloadPdf}
            disabled={!cv}
          >
            PDF letöltése ({locale === "hu" ? "HU" : "EN"})
          </button>
        </div>
      </div>

      <p className="cv-future-note">
        A pályázatküldés (cél e-mail, cég, pozíció, kapcsolattartó, kísérőlevél,
        PDF csatolmány, státusz) adatmodellje és validációja előkészítve (
        <code>lib/cv/applications.ts</code>
        ). Ebben a körben nincs e-mail küldő űrlap, és nincsenek beégetett
        SMTP-hitelesítők — a meglévő <code>SMTP_*</code> környezeti változók
        később újrahasznosíthatók.
      </p>

      <div className="cv-preview-shell" ref={previewRef}>
        {loadingCv ? (
          <p className="admin-muted">Önéletrajz betöltése…</p>
        ) : loadError ? (
          <p className="admin-error">{loadError}</p>
        ) : cv ? (
          <CvDocument locale={locale} content={cv} />
        ) : null}
      </div>
    </section>
  );
}

export default function AdminCvPage() {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AdminShell active="cv" title="Önéletrajzom elküldése">
        {({ authed, bumpIdle }) =>
          authed ? <CvWorkspace bumpIdle={bumpIdle} /> : null
        }
      </AdminShell>
    </>
  );
}
