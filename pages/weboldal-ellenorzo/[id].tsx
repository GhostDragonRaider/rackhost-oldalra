import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import LandingShell from "../../components/landing/LandingShell";
import AuditProgressList from "../../components/website-audit/AuditProgressList";
import ScoreBars from "../../components/website-audit/ScoreBars";
import {
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

export default function WebsiteAuditResultPage() {
  const router = useRouter();
  const idParam = router.query.id;
  const id = typeof idParam === "string" ? idParam : "";

  const [audit, setAudit] = useState<PublicWebsiteAudit | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
    if (!res.ok || !data.ok || !data.audit) {
      setError(data.error || data.message || "Nem sikerült betölteni az eredményt.");
      setLoading(false);
      return null;
    }
    setAudit(data.audit);
    setError("");
    setLoading(false);
    return data.audit;
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      if (cancelled) return;
      const next = await load(id);
      if (cancelled || !next) return;
      if (isActiveStatus(next.status)) {
        timer = setTimeout(tick, POLL_MS);
      }
    };

    setLoading(true);
    void tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [id, load]);

  const primaryCategories = useMemo(
    () => pickPrimaryCategories(audit?.categories || []),
    [audit?.categories]
  );

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

  const quoteHref = `/kapcsolat?${new URLSearchParams({
    service: "Meglévő oldal megújítása",
    ...(audit?.id ? { audit_id: audit.id } : {}),
    ...(websiteUrl ? { website_url: websiteUrl } : {}),
    message: [
      "Árajánlatot kérek a weboldal-ellenőrző alapján.",
      websiteUrl ? `URL: ${websiteUrl}` : "",
      audit?.id ? `Audit ID: ${audit.id}` : "",
      overall != null ? `Pontszám: ${overall}/100` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  }).toString()}`;

  const title = websiteUrl
    ? `Ellenőrzés · ${websiteUrl}`
    : "Weboldal-ellenőrző eredmény";

  return (
    <LandingShell
      title={`${title} | AntiCode`}
      description="AntiCode weboldal-ellenőrző — kategória szintű eredmény, részletes találatok nélkül."
      path={id ? `/weboldal-ellenorzo/${id}` : "/weboldal-ellenorzo"}
      noindex
    >
      <div className="wa-page wa-result">
        <section className="subpage-hero">
          <div className="container">
            <p className="eyebrow">Weboldal-ellenőrző</p>
            <h1>Ellenőrzés eredménye</h1>
            <p className="wa-result-meta">
              {websiteUrl ? <strong>{websiteUrl}</strong> : null}
              {checkedAt ? (
                <span className="wa-muted"> · {checkedAt}</span>
              ) : null}
            </p>
            {audit?.fromCache ? (
              <div className="wa-cache-notice" role="status">
                <p>Gyorsított eredmény (cache) — friss ellenőrzéshez indíts újat.</p>
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

          {audit &&
          (active || (!completed && !failed && audit.progress?.length)) ? (
            <section className="wa-section" aria-busy={active}>
              <div className="wa-section-head">
                <h2>Folyamat</h2>
                <p>Valós szerveroldali lépések — nem időzített „fake” progress.</p>
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
                <Link className="btn" href={quoteHref}>
                  Árajánlatot kérek
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
                  <h2>Kategóriák</h2>
                  <p>
                    Publikus nézetben csak a kategória-pontszámok jelennek meg —
                    a részletes találatok az admin ellenőrzőben érhetők el.
                  </p>
                </div>
                <ScoreBars categories={primaryCategories} animate />
              </section>

              <section className="wa-section">
                <div className="wa-security">
                  <h2>Következő lépés</h2>
                  <p>
                    Ha szeretnéd, átnézem a teljes auditot, és árajánlatot adok a
                    javításokra — kötelezettség nélkül.
                  </p>
                  <div className="wa-cta-row">
                    <Link className="btn" href={quoteHref}>
                      Árajánlatot kérek
                    </Link>
                    <Link className="btn secondary" href="/weboldal-ellenorzo">
                      Új ellenőrzés
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
