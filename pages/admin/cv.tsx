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
    const sheet = document.querySelector(".cv-doc");
    if (!sheet) {
      window.print();
      return;
    }

    const title = pdfName.replace(/\.pdf$/i, "");
    const styleNodes = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]')
    )
      .map((node) => node.outerHTML)
      .join("\n");

    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.style.cssText =
      "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none";
    document.body.appendChild(frame);

    const win = frame.contentWindow;
    const doc = frame.contentDocument;
    if (!win || !doc) {
      frame.remove();
      window.print();
      return;
    }

    doc.open();
    doc.write(`<!doctype html>
<html class="cv-print-standalone" lang="${locale}">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<base href="${window.location.origin}/" />
${styleNodes}
<style>
  @page { size: A4; margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; }
  .cv-doc { box-shadow: none !important; border-radius: 0 !important; margin: 0 !important; }
</style>
</head>
<body>${sheet.outerHTML}</body>
</html>`);
    doc.close();

    const cleanup = () => {
      try {
        frame.remove();
      } catch {
        /* ignore */
      }
    };

    const runPrint = () => {
      try {
        win.focus();
        win.print();
      } finally {
        // Allow the print dialog a moment, then remove the frame
        window.setTimeout(cleanup, 1000);
      }
    };

    const imgs = Array.from(doc.images || []);
    if (!imgs.length) {
      window.setTimeout(runPrint, 120);
      return;
    }

    let left = imgs.length;
    const done = () => {
      left -= 1;
      if (left <= 0) runPrint();
    };
    imgs.forEach((img) => {
      if (img.complete) done();
      else {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      }
    });
    window.setTimeout(runPrint, 2500);
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
