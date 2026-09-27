import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import LandingShell from "../../components/landing/LandingShell";
import AuditProgressList from "../../components/website-audit/AuditProgressList";
import FindingCard from "../../components/website-audit/FindingCard";
import ResponsiveMatrix from "../../components/website-audit/ResponsiveMatrix";
import ScoreBars from "../../components/website-audit/ScoreBars";
import {
  countFindingBuckets,
  formatCheckedAt,
  pickPrimaryCategories,
  scoreTone,
  type PublicWebsiteAudit,
} from "../../components/website-audit/publicTypes";

const POLL_MS = 1200;

function isActiveStatus(status?: string): boolean {
  const s = String(status || "").toLowerCase();
  return s === "queued" || s === "running" || s === "pending";
}

function screenshotUnavailable(audit: PublicWebsiteAudit | null): boolean {
  if (!audit) return false;
  const matrixShot = (audit.responsiveMatrix as
    | { screenshotStatus?: string }
    | undefined)?.screenshotStatus;
  if (
    matrixShot &&
    (matrixShot === "unavailable" ||
      matrixShot === "skipped" ||
      matrixShot === "not_available")
  ) {
    return true;
  }
  const shot = audit.screenshot;
  if (shot == null) return false;
  if (typeof shot === "string") {
    const s = shot.toLowerCase();
    return s === "unavailable" || s === "not_available" || s === "na";
  }
  if (typeof shot === "object") {
    const st = String(shot.status || "").toLowerCase();
    if (
      st === "unavailable" ||
      st === "not_available" ||
      st === "failed" ||
      st === "error" ||
      st === "skipped"
    ) {
      return true;
    }
    if (shot.url == null && st && st !== "ok" && st !== "ready") return true;
  }
  return false;
}

export default function WebsiteAuditResultPage() {
  const router = useRouter();
  const idParam = router.query.id;
  const id = typeof idParam === "string" ? idParam : "";

  const [audit, setAudit] = useState<PublicWebsiteAudit | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [forceBusy, setForceBusy] = useState(false);

  const load = useCallback(async (auditId: string) => {
    const res = await fetch(`/api/website-audit/${encodeURIComponent(auditId)}`, {
      headers: { Accept: "application/json" },
    });
    let data: {
      ok?: boolean;
      audit?: PublicWebsiteAudit;
      error?: string;
      message?: string;
    } = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    if (res.status === 404) {
      setError(data.error || data.message || "Ez az ellenőrzés nem található.");
      setAudit(null);
      setLoading(false);
      return null;
    }
    if (res.status === 429) {
      setError(
        data.error ||
          data.message ||
          "Túl sok kérés. Az automatikus frissítés szünetel egy pillanatra."
      );
      setLoading(false);
      return null;
    }
    if (res.status === 503) {
      setError(
        data.error ||
          data.message ||
          "Az ellenőrző szolgáltatás most nem elérhető."
      );
      setLoading(false);
      return null;
    }
    if (!res.ok || data.ok === false) {
      setError(data.error || data.message || "Nem sikerült betölteni az eredményt.");
      setLoading(false);
      return null;
    }
    const next = data.audit || null;
    if (!next) {
      setError("Üres válasz az ellenőrző API-tól.");
      setLoading(false);
      return null;
    }
    setAudit(next);
    setError("");
    setLoading(false);
    return next;
  }, []);

  useEffect(() => {
    if (!id || !router.isReady) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      if (cancelled) return;
      const next = await load(id);
      if (cancelled) return;
      if (next && isActiveStatus(next.status)) {
        timer = setTimeout(tick, POLL_MS);
      }
    };

    void tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [id, router.isReady, load]);

  const primaryCategories = useMemo(
    () => pickPrimaryCategories(audit?.categories || []),
    [audit?.categories]
  );

  const buckets = useMemo(
    () => countFindingBuckets(audit?.findings || []),
    [audit?.findings]
  );

  const findings = audit?.findings || [];
  const problemFindings = findings.filter((f) => {
    const status = String(f.status || "").toLowerCase();
    const sev = String(f.severity || "").toLowerCase();
    if (status === "pass" || sev === "pass") return false;
    return true;
  });
  const showFindings = problemFindings.length ? problemFindings : findings;

  const websiteUrl = audit?.normalizedUrl || audit?.inputUrl || "";
  const checkedAt = formatCheckedAt(
    audit?.checkedAt || audit?.updatedAt || audit?.createdAt
  );
  const overall = audit?.overallScore;
  const tone = scoreTone(overall ?? null);
  const active = isActiveStatus(audit?.status);
  const completed =
    String(audit?.status || "").toLowerCase() === "completed" ||
    String(audit?.status || "").toLowerCase() === "complete";
  const failed = String(audit?.status || "").toLowerCase() === "failed";

  const helpHref = `/kapcsolat?${new URLSearchParams({
    service: "Meglévő oldal megújítása",
    ...(audit?.id ? { audit_id: audit.id } : {}),
    ...(websiteUrl ? { website_url: websiteUrl } : {}),
    message: [
      "Segítséget kérek a weboldal-ellenőrzőben talált problémák javításához.",
      websiteUrl ? `URL: ${websiteUrl}` : "",
      audit?.id ? `Audit ID: ${audit.id}` : "",
      overall != null ? `Pontszám: ${overall}/100` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  }).toString()}`;

  const securityHref = `/kapcsolat?${new URLSearchParams({
    service: "Meglévő oldal megújítása",
    ...(audit?.id ? { audit_id: audit.id } : {}),
    ...(websiteUrl ? { website_url: websiteUrl } : {}),
    message: [
      "Biztonsági felmérést kérek a weboldal-ellenőrző alapján.",
      websiteUrl ? `URL: ${websiteUrl}` : "",
      audit?.id ? `Audit ID: ${audit.id}` : "",
      "Megjegyzés: a publikus ellenőrző nem-intruzív kitettségvizsgálat, nem teljes pentest.",
    ]
      .filter(Boolean)
      .join("\n"),
  }).toString()}`;

  async function forceRerun() {
    if (!websiteUrl) return;
    setForceBusy(true);
    setError("");
    try {
      const res = await fetch("/api/website-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl, force: true }),
      });
      let data: {
        ok?: boolean;
        id?: string;
        audit?: { id?: string };
        error?: string;
        message?: string;
      } = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (!res.ok || data.ok === false) {
        if (res.status === 400) {
          setError(data.error || "Érvénytelen URL az újraellenőrzéshez.");
        } else if (res.status === 429) {
          setError(data.error || "Túl sok kérés. Várj egy kicsit.");
        } else if (res.status === 503) {
          setError(data.error || "A szolgáltatás most nem elérhető.");
        } else {
          setError(data.error || data.message || "Nem sikerült újraindítani.");
        }
        return;
      }
      const nextId = data.audit?.id || data.id;
      if (!nextId) {
        setError("Az újraindítás nem adott vissza azonosítót.");
        return;
      }
      await router.push(`/weboldal-ellenorzo/${encodeURIComponent(nextId)}`);
    } catch {
      setError("Hálózati hiba az újraellenőrzésnél.");
    } finally {
      setForceBusy(false);
    }
  }

  const pageTitle = audit
    ? `Ellenőrzés eredménye · AntiCode Weboldal-ellenőrző`
    : `Ellenőrzés · AntiCode Weboldal-ellenőrző`;

  return (
    <LandingShell
      title={pageTitle}
      description="Weboldal-ellenőrzés eredménye — személyes futás, nem indexelhető."
      path={id ? `/weboldal-ellenorzo/${id}` : "/weboldal-ellenorzo"}
      noindex
    >
      <div className="wa-page wa-result">
        <section className="hero container subpage-hero">
          <div>
            <div className="eyebrow">Eredmény</div>
            <h1>Weboldal-ellenőrzés</h1>
            <p>
              {websiteUrl
                ? `Ellenőrzött cím: ${websiteUrl}`
                : "Az ellenőrzés állapota lent frissül."}
            </p>
            <div className="wa-result-meta">
              {audit?.status ? <span>Állapot: {audit.status}</span> : null}
              {checkedAt ? <span>Utolsó ellenőrzés: {checkedAt}</span> : null}
              {audit?.id ? <span>ID: {audit.id}</span> : null}
            </div>

            {audit?.fromCache ? (
              <div className="wa-cache-notice" role="status">
                <p>
                  <strong>Last checked:</strong>{" "}
                  {checkedAt || "korábbi cache eredmény"}. Ez egy cache-elt
                  futás{audit.cachedFromId ? ` (${audit.cachedFromId})` : ""}.
                </p>
                <button
                  type="button"
                  className="btn secondary"
                  disabled={forceBusy}
                  onClick={() => void forceRerun()}
                >
                  {forceBusy ? "Újraindítás…" : "Újraellenőrzés (force)"}
                </button>
              </div>
            ) : null}

            {error ? (
              <p className="wa-error-banner" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </section>

        <div className="container">
          {loading && !audit ? (
            <p className="wa-running-note" role="status">
              Eredmény betöltése…
            </p>
          ) : null}

          {audit && (active || (!completed && !failed && audit.progress?.length)) ? (
            <section className="wa-section" aria-busy={active}>
              <div className="wa-section-head">
                <h2>Folyamat</h2>
                <p>
                  Valós szerveroldali lépések — nem időzített „fake” progress.
                </p>
              </div>
              {active ? (
                <p className="wa-running-note" role="status">
                  Az ellenőrzés fut. Az állapot ~1,2 másodpercenként frissül.
                </p>
              ) : null}
              <AuditProgressList steps={audit.progress || []} />
            </section>
          ) : null}

          {failed ? (
            <section className="wa-section">
              <div className="wa-error-banner" role="alert">
                {audit?.error ||
                  "Az ellenőrzés hibával zárult. Próbáld újra később, vagy írj a kapcsolaton."}
              </div>
              <div className="wa-cta-row">
                <Link className="btn secondary" href="/weboldal-ellenorzo">
                  Új ellenőrzés
                </Link>
                <Link className="btn" href={helpHref}>
                  Segítséget kérek a javításhoz
                </Link>
              </div>
            </section>
          ) : null}

          {completed ? (
            <>
              <section className="wa-section">
                <div className={`wa-overall wa-overall--${tone}`}>
                  <div className="wa-overall__score">
                    <strong>
                      {overall == null || Number.isNaN(overall)
                        ? "—"
                        : Math.round(overall)}
                    </strong>
                    <span>/ 100</span>
                  </div>
                  <div className="wa-overall__copy">
                    <h2>{audit?.overallLabel || "Összesített eredmény"}</h2>
                    <p>
                      {audit?.summary ||
                        "A pontszám a ténylegesen lefuttatott ellenőrzésekből készült."}
                    </p>
                  </div>
                </div>
              </section>

              <section className="wa-section">
                <div className="wa-section-head">
                  <h2>Fő területek</h2>
                  <p>
                    Technikai, SEO, biztonság, tartalom és reszponzív — ahol nem
                    mérhető, ott N/A (nem PASS).
                  </p>
                </div>
                <ScoreBars categories={primaryCategories} animate />
              </section>

              <section className="wa-section">
                <div className="wa-section-head">
                  <h2>Összesítés</h2>
                </div>
                <ul className="wa-counts" aria-label="Találatok száma">
                  <li className="wa-counts__pass">
                    <b>{buckets.pass}</b>
                    <span>sikeres</span>
                  </li>
                  <li className="wa-counts__warning">
                    <b>{buckets.warning}</b>
                    <span>figyelmeztetés</span>
                  </li>
                  <li className="wa-counts__fail">
                    <b>{buckets.fail}</b>
                    <span>hiba</span>
                  </li>
                  <li className="wa-counts__unavailable">
                    <b>{buckets.unavailable}</b>
                    <span>nem ellenőrizhető</span>
                  </li>
                </ul>
              </section>

              {screenshotUnavailable(audit) ? (
                <section className="wa-section">
                  <p className="wa-shot-na" role="status">
                    Képernyőkép: UNAVAILABLE
                    {audit.responsiveMatrix?.screenshotNote
                      ? ` — ${audit.responsiveMatrix.screenshotNote}`
                      : " — nem jelenítünk meg hamis PASS-t."}
                  </p>
                </section>
              ) : null}

              {audit?.responsiveMatrix ? (
                <section className="wa-section">
                  <div className="wa-section-head">
                    <h2>Reszponzív mátrix</h2>
                    <p>Oldalak × nézetméretek. Kattints egy cellára.</p>
                  </div>
                  <ResponsiveMatrix matrix={audit.responsiveMatrix} />
                </section>
              ) : null}

              <section className="wa-section">
                <div className="wa-section-head">
                  <h2>Találatok</h2>
                  <p>
                    Érthető magyarázat, miért fontos, és mit érdemes tenni.
                  </p>
                </div>
                {showFindings.length ? (
                  <div className="wa-findings">
                    {showFindings.map((f) => (
                      <FindingCard key={f.id} finding={f} />
                    ))}
                  </div>
                ) : (
                  <p className="wa-empty">Nincs megjeleníthető találat.</p>
                )}
              </section>

              <section className="wa-section">
                <div className="wa-security">
                  <h2>Biztonsági megjegyzés</h2>
                  <p>
                    {audit.securityExposureNote ||
                      "A biztonsági rész nem-intruzív kitettségvizsgálat (HTTPS, fejlécek, cookie jelek). Nem pentest, nem behatolási próba, és nem minősíti az oldalt „feltörhetetlennek”. Mélyebb felméréshez kérj külön biztonsági áttekintést."}
                  </p>
                  <div className="wa-cta-row">
                    <Link className="btn" href={securityHref}>
                      Biztonsági felmérést kérek
                    </Link>
                    <Link className="btn secondary" href={helpHref}>
                      Segítséget kérek a javításhoz
                    </Link>
                  </div>
                </div>
              </section>
            </>
          ) : null}

          {!loading && !audit && !error ? (
            <section className="wa-section">
              <p className="wa-empty">Nincs megjeleníthető eredmény.</p>
              <div className="wa-cta-row">
                <Link className="btn" href="/weboldal-ellenorzo">
                  Vissza az ellenőrzőhöz
                </Link>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </LandingShell>
  );
}
