import Head from "next/head";
import { useCallback, useEffect, useRef, useState } from "react";
import AdminShell from "../../components/admin/AdminShell";
import CvDocument from "../../components/admin/cv/CvDocument";
import { CV_CONTENT } from "../../lib/cv/content";
import type { CvLocale } from "../../lib/cv/types";

function CvWorkspace({ bumpIdle }: { bumpIdle: () => void }) {
  const [locale, setLocale] = useState<CvLocale>("hu");
  const previewRef = useRef<HTMLDivElement>(null);

  const pdfName = CV_CONTENT.pdfFileName[locale];

  const setLocaleSafe = useCallback(
    (next: CvLocale) => {
      bumpIdle();
      setLocale(next);
    },
    [bumpIdle]
  );

  useEffect(() => {
    const prev = document.title;
    document.title = pdfName.replace(/\.pdf$/i, "");
    return () => {
      document.title = prev;
    };
  }, [pdfName]);

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
          >
            Előnézet
          </button>
          <button type="button" className="cv-download" onClick={downloadPdf}>
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
        <CvDocument locale={locale} />
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
