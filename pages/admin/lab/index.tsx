import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import LabShell, { ProvenanceBadge } from "../../../components/admin/lab/LabShell";
import type { DataProvenance } from "../../../lib/lab/integrity";

type OverviewPayload = {
  actionsCount: number;
  criticalActions: number;
  securityScore: {
    value: number | null;
    provenance: DataProvenance;
    measurementStatus: string;
    error: string | null;
    source: string | null;
    measuredAt: string | null;
  };
  seo: {
    score: number | null;
    lastCheckedAt: string | null;
    gscIndexing: {
      total?: number;
      indexedCount?: number;
      notIndexedCount?: number;
      checkedAt?: string | null;
      error?: string | null;
      provenance?: DataProvenance;
      source?: string | null;
      measurementStatus?: string;
    };
  };
  recentAudits: Array<{
    id: string;
    inputUrl: string;
    status: string;
    overallScore: number | null;
    createdAt: string;
  }>;
};

export default function LabOverviewPage() {
  const [data, setData] = useState<OverviewPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/lab/data?section=overview", {
        credentials: "same-origin",
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Betöltés sikertelen");
      setData(json.overview);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const gsc = data?.seo.gscIndexing;
  const gscProv = (gsc?.provenance || "unavailable") as DataProvenance;

  return (
    <LabShell moduleId="overview" title="Áttekintés">
      {({ bumpIdle, modules, state }) => (
        <div className="lab-grid">
          <section className="lab-card lab-card--sm">
            <h2>Action Center</h2>
            {loading ? (
              <p className="lab-muted">Betöltés…</p>
            ) : (
              <>
                <div className="lab-metric">{data?.actionsCount ?? "—"}</div>
                <div className="lab-metric__label">nyitott tétel</div>
                <p className="lab-muted" style={{ marginTop: 12 }}>
                  Kritikus: {data?.criticalActions ?? 0}
                </p>
                <ProvenanceBadge provenance="real" />
                <div style={{ marginTop: 12 }}>
                  <Link
                    href="/admin/lab/action-center"
                    className="lab-btn"
                    onClick={() => bumpIdle()}
                  >
                    Megnyitás
                  </Link>
                </div>
              </>
            )}
          </section>

          <section className="lab-card lab-card--sm">
            <h2>Security</h2>
            {data?.securityScore.measurementStatus === "ok" &&
            data.securityScore.value != null ? (
              <>
                <div className="lab-metric">{data.securityScore.value}</div>
                <div className="lab-metric__label">pont (REAL checkek)</div>
                <ProvenanceBadge provenance={data.securityScore.provenance} />
              </>
            ) : (
              <>
                <div className="lab-metric" style={{ fontSize: "1.1rem" }}>
                  Nem mérhető
                </div>
                <p className="lab-muted">{data?.securityScore.error || "—"}</p>
                <ProvenanceBadge provenance="unavailable" />
              </>
            )}
          </section>

          <section className="lab-card lab-card--sm">
            <h2>SEO / GSC</h2>
            {gsc && gsc.total != null && !gsc.error ? (
              <>
                <div className="lab-metric">
                  {gsc.indexedCount}/{gsc.total}
                </div>
                <div className="lab-metric__label">indexelt URL</div>
                <p className="lab-muted">
                  Nincs indexelve: {gsc.notIndexedCount}
                </p>
                <ProvenanceBadge provenance={gscProv} />
              </>
            ) : (
              <>
                <div className="lab-metric" style={{ fontSize: "1.1rem" }}>
                  Nem elérhető
                </div>
                <p className="lab-muted">
                  {gsc?.error ||
                    "Nincs tárolt GSC indexelési jelentés. Futtasd a Monitor SEO ellenőrzést."}
                </p>
                <ProvenanceBadge provenance="unavailable" />
              </>
            )}
            {data?.seo.score != null ? (
              <p className="lab-muted" style={{ marginTop: 8 }}>
                Technikai SEO score (store): {data.seo.score}
              </p>
            ) : null}
          </section>

          <section className="lab-card lab-card--wide">
            <h2>Rendszerállapot</h2>
            <p className="lab-muted">
              Kill switch:{" "}
              <strong>{state?.killSwitch ? "BE" : "KI"}</strong> · Modulok:{" "}
              {modules.filter((m) => m.effectivelyAvailable).length}/
              {modules.length} elérhető · Favorites:{" "}
              {state?.favorites?.length || 0}
            </p>
            {error ? <p className="admin-error">{error}</p> : null}
            <button type="button" className="lab-btn" onClick={() => { bumpIdle(); void load(); }}>
              Frissítés
            </button>
          </section>

          <section className="lab-card">
            <h2>Legutóbbi auditok</h2>
            {!data?.recentAudits?.length ? (
              <div className="lab-empty">Nincs még audit a store-ban.</div>
            ) : (
              <table className="lab-table">
                <thead>
                  <tr>
                    <th>URL</th>
                    <th>Státusz</th>
                    <th>Score</th>
                    <th>Idő</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentAudits.map((a) => (
                    <tr key={a.id}>
                      <td>{a.inputUrl}</td>
                      <td>{a.status}</td>
                      <td>{a.overallScore ?? "—"}</td>
                      <td>{new Date(a.createdAt).toLocaleString("hu-HU")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <ProvenanceBadge provenance="real" />
            <div style={{ marginTop: 12 }}>
              <Link href="/admin/website-audit" className="lab-ghost">
                Weboldal-ellenőrző
              </Link>
            </div>
          </section>

          <section className="lab-card">
            <h2>Kedvencek / Recent</h2>
            <p className="lab-muted">
              Recent: {(state?.recent || []).join(", ") || "—"}
            </p>
            <p className="lab-muted">
              Favorites: {(state?.favorites || []).join(", ") || "—"}
            </p>
            <Link href="/admin/lab/settings" className="lab-ghost">
              Beállítások
            </Link>
          </section>
        </div>
      )}
    </LabShell>
  );
}
