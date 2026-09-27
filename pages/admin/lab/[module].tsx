import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import LabShell, { ProvenanceBadge } from "../../../components/admin/lab/LabShell";
import { getLabModule } from "../../../lib/lab/registry";
import type { LabActionItem } from "../../../lib/lab/types";
import type { DataProvenance } from "../../../lib/lab/integrity";
import type { VpsSnapshot } from "../../../lib/lab/vps-metrics";

function Unimplemented({ name }: { name: string }) {
  return (
    <div className="lab-empty">
      <p>
        <strong>{name}</strong> — architektúra regisztrálva, UI még nincs
        implementálva.
      </p>
      <p className="lab-muted">
        Nincs mock adat. Státusz: <ProvenanceBadge provenance="unavailable" />
      </p>
    </div>
  );
}

function formatBytes(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  const u = ["B", "KB", "MB", "GB", "TB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < u.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${u[i]}`;
}

function MetricLine({
  label,
  measured,
}: {
  label: string;
  measured: {
    value: number | string | null;
    provenance: DataProvenance;
    measurementStatus: string;
    error: string | null;
    source: string | null;
  };
}) {
  if (measured.measurementStatus !== "ok" || measured.value == null) {
    return (
      <div style={{ marginBottom: 12 }}>
        <strong>{label}</strong>: Nem mérhető
        <div className="lab-muted">{measured.error || "—"}</div>
        <ProvenanceBadge provenance={measured.provenance} />
      </div>
    );
  }
  return (
    <div style={{ marginBottom: 12 }}>
      <strong>{label}</strong>: {String(measured.value)}
      <div className="lab-muted">{measured.source}</div>
      <ProvenanceBadge provenance={measured.provenance} />
    </div>
  );
}

export default function LabModulePage() {
  const router = useRouter();
  const moduleParam = String(router.query.module || "");
  const meta = useMemo(() => getLabModule(moduleParam), [moduleParam]);

  const [actions, setActions] = useState<LabActionItem[]>([]);
  const [security, setSecurity] = useState<{
    checks: Array<{
      id: string;
      title: string;
      status: string;
      detail: string;
      provenance: DataProvenance;
      source: string;
    }>;
    score: {
      value: number | null;
      provenance: DataProvenance;
      measurementStatus: string;
      error: string | null;
    };
  } | null>(null);
  const [vps, setVps] = useState<VpsSnapshot | null>(null);
  const [vpsError, setVpsError] = useState("");
  const [logs, setLogs] = useState<
    Array<{ id: string; timestamp: string; action: string; module: string; detail: string; actor: string }>
  >([]);
  const [seo, setSeo] = useState<unknown>(null);
  const [integrations, setIntegrations] = useState<
    Array<{
      id: string;
      name: string;
      status: string;
      note: string;
      provenance: DataProvenance;
      missing: string[];
    }>
  >([]);
  const [calcId, setCalcId] = useState("website-quote");
  const [calcResult, setCalcResult] = useState<{
    total: number;
    currency: string;
    provenance: string;
    estimateNote: string;
    lineItems: Array<{ label: string; amount: number }>;
  } | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [msg, setMsg] = useState("");

  const loadSection = useCallback(async (section: string) => {
    const res = await fetch(`/api/admin/lab/data?section=${section}`, {
      credentials: "same-origin",
    });
    return res.json();
  }, []);

  useEffect(() => {
    if (!moduleParam) return;
    if (moduleParam === "action-center") {
      void loadSection("actions").then((j) => setActions(j.items || []));
    }
    if (moduleParam === "security-center") {
      void loadSection("security").then((j) => setSecurity(j));
    }
    if (moduleParam === "logs") {
      void loadSection("logs").then((j) => setLogs(j.entries || []));
    }
    if (moduleParam === "seo-lab") {
      void loadSection("seo").then((j) => setSeo(j.report));
    }
    if (moduleParam === "integrations") {
      void loadSection("integrations").then((j) =>
        setIntegrations(j.integrations || [])
      );
    }
  }, [moduleParam, loadSection]);

  useEffect(() => {
    if (moduleParam !== "vps-monitor") return;
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch("/api/admin/lab/vps", {
          credentials: "same-origin",
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setVpsError(json.error || "VPS hiba");
          setVps(null);
          return;
        }
        setVpsError("");
        setVps(json.snapshot);
      } catch (e) {
        if (!cancelled) {
          setVpsError(e instanceof Error ? e.message : "VPS hiba");
        }
      }
    };
    void tick();
    const t = window.setInterval(() => void tick(), 2000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, [moduleParam]);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-lab-theme",
      moduleParam === "design-system" ? theme : "light"
    );
    return () => {
      document.documentElement.removeAttribute("data-lab-theme");
    };
  }, [theme, moduleParam]);

  if (!router.isReady) return null;

  if (!meta) {
    return (
      <LabShell moduleId="overview" title="Ismeretlen modul">
        {() => (
          <div className="lab-empty">
            Nincs ilyen Lab modul: <code>{moduleParam}</code>
            <div style={{ marginTop: 12 }}>
              <Link href="/admin/lab" className="lab-btn">
                Vissza az áttekintéshez
              </Link>
            </div>
          </div>
        )}
      </LabShell>
    );
  }

  return (
    <LabShell moduleId={meta.id} title={meta.nameHu}>
      {({ bumpIdle, refreshFlags, state, killSwitch }) => {
        if (!meta.implemented) {
          return <Unimplemented name={meta.nameHu} />;
        }

        if (meta.id === "action-center") {
          return (
            <div className="lab-card lab-card--wide">
              <h2>Prioritásos teendők</h2>
              <p className="lab-muted">
                Csak valós forrásokból (SEO store, audit store, VPS, security
                checks). Üres lista = nincs detektált probléma.
              </p>
              {!actions.length ? (
                <div className="lab-empty">Nincs nyitott Action Center tétel.</div>
              ) : (
                <table className="lab-table">
                  <thead>
                    <tr>
                      <th>Prioritás</th>
                      <th>Cím</th>
                      <th>Részlet</th>
                      <th>Forrás</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actions.map((a) => (
                      <tr key={a.id}>
                        <td>
                          <span className={`lab-priority lab-priority--${a.priority}`}>
                            {a.priority}
                          </span>
                        </td>
                        <td>
                          {a.href ? (
                            <Link href={a.href} onClick={() => bumpIdle()}>
                              {a.title}
                            </Link>
                          ) : (
                            a.title
                          )}
                        </td>
                        <td>{a.detail}</td>
                        <td>
                          <ProvenanceBadge provenance={a.provenance} />
                          <div className="lab-muted">{a.source}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        }

        if (meta.id === "website-audit") {
          return (
            <div className="lab-card lab-card--wide">
              <h2>Website Audit Engine</h2>
              <p className="lab-muted">
                A meglévő SSRF-védett audit motor a Labból érhető el. Új publikus
                UI nincs — a futó eszköz: Admin → Weboldal-ellenőrző.
              </p>
              <Link
                href="/admin/website-audit"
                className="lab-btn lab-btn--primary"
                onClick={() => bumpIdle()}
              >
                Audit megnyitása
              </Link>
              <p className="lab-muted" style={{ marginTop: 16 }}>
                Pluginok (meglévő checks): availability, SEO, security,
                accessibility, performance, content, best-practices.
              </p>
            </div>
          );
        }

        if (meta.id === "seo-lab") {
          const report = seo as {
            summary?: { score?: number; lastCheckedAt?: string };
            gscIndexing?: {
              indexedCount?: number;
              total?: number;
              notIndexedCount?: number;
              error?: string | null;
              urls?: Array<{
                url: string;
                indexed: boolean | null;
                coverageState: string | null;
                error: string | null;
              }>;
            };
          } | null;
          return (
            <div className="lab-grid">
              <section className="lab-card lab-card--wide">
                <h2>SEO Control Center</h2>
                <p className="lab-muted">
                  Adatok a meglévő <code>seo-store</code> / GSC clientből. Nincs
                  kitalált indexszám.
                </p>
                {!report?.summary?.lastCheckedAt ? (
                  <div className="lab-empty">
                    Nincs SEO jelentés. Futtasd: Admin → Monitor → SEO ellenőrzés.
                    <ProvenanceBadge provenance="unavailable" />
                  </div>
                ) : (
                  <>
                    <p>
                      Technikai score: <strong>{report.summary.score}</strong> ·{" "}
                      {report.summary.lastCheckedAt}
                    </p>
                    {report.gscIndexing ? (
                      <p>
                        GSC index: {report.gscIndexing.indexedCount}/
                        {report.gscIndexing.total} · nincs indexelve:{" "}
                        {report.gscIndexing.notIndexedCount}
                        {report.gscIndexing.error
                          ? ` · hiba: ${report.gscIndexing.error}`
                          : ""}
                      </p>
                    ) : (
                      <p className="lab-muted">GSC indexing: UNAVAILABLE</p>
                    )}
                    <ProvenanceBadge provenance="real" />
                  </>
                )}
                <div style={{ marginTop: 12 }}>
                  <Link href="/admin" className="lab-ghost">
                    Admin Monitor
                  </Link>
                </div>
              </section>
              {report?.gscIndexing?.urls?.length ? (
                <section className="lab-card lab-card--wide">
                  <h2>URL lista</h2>
                  <table className="lab-table">
                    <thead>
                      <tr>
                        <th>URL</th>
                        <th>Index</th>
                        <th>Coverage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.gscIndexing.urls.map((u) => (
                        <tr key={u.url}>
                          <td>{u.url}</td>
                          <td>
                            {u.indexed === true
                              ? "igen"
                              : u.indexed === false
                                ? "nem"
                                : "ismeretlen"}
                          </td>
                          <td>{u.coverageState || u.error || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              ) : null}
            </div>
          );
        }

        if (meta.id === "security-center") {
          return (
            <div className="lab-card lab-card--wide">
              <h2>Security Center</h2>
              {!security ? (
                <p className="lab-muted">Betöltés…</p>
              ) : (
                <>
                  {security.score.measurementStatus === "ok" &&
                  security.score.value != null ? (
                    <p>
                      Score: <strong>{security.score.value}</strong>{" "}
                      <ProvenanceBadge provenance={security.score.provenance} />
                    </p>
                  ) : (
                    <p>
                      Score: Nem mérhető — {security.score.error}{" "}
                      <ProvenanceBadge provenance="unavailable" />
                    </p>
                  )}
                  <table className="lab-table">
                    <thead>
                      <tr>
                        <th>Check</th>
                        <th>Státusz</th>
                        <th>Részlet</th>
                        <th>Forrás</th>
                      </tr>
                    </thead>
                    <tbody>
                      {security.checks.map((c) => (
                        <tr key={c.id}>
                          <td>{c.title}</td>
                          <td>{c.status}</td>
                          <td>{c.detail}</td>
                          <td>
                            <ProvenanceBadge provenance={c.provenance} />
                            <div className="lab-muted">{c.source}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          );
        }

        if (meta.id === "vps-monitor") {
          return (
            <div className="lab-grid">
              <section className="lab-card lab-card--wide">
                <h2>VPS Live Monitor</h2>
                <p className="lab-muted">
                  Szerveroldali mérés · admin-only · rate limited · nincs shell
                  injection. Poll ~2s.
                </p>
                {vpsError ? <p className="admin-error">{vpsError}</p> : null}
                {!vps && !vpsError ? (
                  <p className="lab-muted">Első mintavétel…</p>
                ) : null}
                {vps ? (
                  <>
                    <div className="lab-grid">
                      <div className="lab-card lab-card--sm">
                        <div className="lab-metric">
                          {vps.cpu.utilizationPercent.value ?? "—"}
                          {vps.cpu.utilizationPercent.value != null ? "%" : ""}
                        </div>
                        <div className="lab-metric__label">CPU</div>
                        <ProvenanceBadge
                          provenance={vps.cpu.utilizationPercent.provenance}
                        />
                      </div>
                      <div className="lab-card lab-card--sm">
                        <div className="lab-metric">
                          {vps.memory.usedPercent.value ?? "—"}
                          {vps.memory.usedPercent.value != null ? "%" : ""}
                        </div>
                        <div className="lab-metric__label">RAM</div>
                        <ProvenanceBadge
                          provenance={vps.memory.usedPercent.provenance}
                        />
                      </div>
                      <div className="lab-card lab-card--sm">
                        <div className="lab-metric" style={{ fontSize: "1.2rem" }}>
                          {vps.hostname.value}
                        </div>
                        <div className="lab-metric__label">Host</div>
                        <ProvenanceBadge provenance={vps.hostname.provenance} />
                      </div>
                    </div>
                    <MetricLine
                      label="Load avg"
                      measured={{
                        ...vps.cpu.loadAverage,
                        value: vps.cpu.loadAverage.value
                          ? vps.cpu.loadAverage.value.map((n) => n.toFixed(2)).join(" / ")
                          : null,
                      }}
                    />
                    <MetricLine
                      label="Memória used"
                      measured={{
                        ...vps.memory.usedBytes,
                        value: formatBytes(vps.memory.usedBytes.value),
                      }}
                    />
                    <MetricLine
                      label="Uptime (sec)"
                      measured={vps.uptimeSec}
                    />
                    {vps.disk.mounts.value ? (
                      <table className="lab-table">
                        <thead>
                          <tr>
                            <th>Mount</th>
                            <th>Used %</th>
                            <th>Used</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vps.disk.mounts.value.map((m) => (
                            <tr key={m.mount}>
                              <td>{m.mount}</td>
                              <td>{m.usedPercent}%</td>
                              <td>{formatBytes(m.usedBytes)}</td>
                              <td>{formatBytes(m.totalBytes)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="lab-muted">
                        Disk: {vps.disk.mounts.error}{" "}
                        <ProvenanceBadge provenance={vps.disk.mounts.provenance} />
                      </p>
                    )}
                    {vps.processes.topCpu.value ? (
                      <>
                        <h3>Top processzek (ESTIMATED rank)</h3>
                        <ProvenanceBadge provenance="estimated" />
                        <table className="lab-table">
                          <thead>
                            <tr>
                              <th>PID</th>
                              <th>Score</th>
                              <th>Command</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vps.processes.topCpu.value.map((p) => (
                              <tr key={p.pid}>
                                <td>{p.pid}</td>
                                <td>{p.cpu}</td>
                                <td>
                                  <code>{p.command}</code>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    ) : null}
                  </>
                ) : null}
              </section>
            </div>
          );
        }

        if (meta.id === "design-system") {
          return (
            <div className="lab-grid">
              <section className="lab-card lab-card--wide">
                <h2>Design System Playground</h2>
                <div className="lab-main__actions" style={{ marginBottom: 16 }}>
                  <button
                    type="button"
                    className={`lab-btn${theme === "light" ? " lab-btn--primary" : ""}`}
                    onClick={() => setTheme("light")}
                  >
                    Light
                  </button>
                  <button
                    type="button"
                    className={`lab-btn${theme === "dark" ? " lab-btn--primary" : ""}`}
                    onClick={() => setTheme("dark")}
                  >
                    Dark
                  </button>
                </div>
                <h3>Colors</h3>
                <div className="lab-swatch-row">
                  {[
                    ["bg-primary", "var(--lab-bg-primary)"],
                    ["surface", "var(--lab-surface-primary)"],
                    ["brand", "var(--lab-action-primary)"],
                    ["danger", "var(--lab-action-danger)"],
                    ["text", "var(--lab-text-primary)"],
                  ].map(([name, color]) => (
                    <div className="lab-swatch" key={name}>
                      <div
                        className="lab-swatch__color"
                        style={{ background: color }}
                      />
                      <div className="lab-swatch__meta">{name}</div>
                    </div>
                  ))}
                </div>
                <div className="lab-token-preview" style={{ marginTop: 20 }}>
                  <h3>Glass / Standard</h3>
                  <p className="lab-muted">
                    Kontrollált glass — blur token, nem random.
                  </p>
                  <button type="button" className="lab-btn lab-btn--primary">
                    Primary button
                  </button>{" "}
                  <button type="button" className="lab-ghost">
                    Ghost
                  </button>
                </div>
                <p className="lab-muted" style={{ marginTop: 16 }}>
                  Dokumentáció: <code>DESIGN_SYSTEM.md</code>
                </p>
              </section>
            </div>
          );
        }

        if (meta.id === "calculators") {
          return (
            <div className="lab-card lab-card--wide">
              <h2>Calculator Engine</h2>
              <p className="lab-muted">
                Eredmény mindig <ProvenanceBadge provenance="estimated" /> — nem
                hivatalos árajánlat.
              </p>
              <div className="lab-form">
                <label>
                  Kalkulátor
                  <select
                    value={calcId}
                    onChange={(e) => setCalcId(e.target.value)}
                  >
                    <option value="website-quote">Weboldal</option>
                    <option value="webshop-quote">Webshop</option>
                  </select>
                </label>
                <button
                  type="button"
                  className="lab-btn lab-btn--primary"
                  onClick={async () => {
                    bumpIdle();
                    const res = await fetch(
                      "/api/admin/lab/data?section=calculators",
                      {
                        method: "POST",
                        credentials: "same-origin",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          section: "calculators",
                          calculatorId: calcId,
                          answers: {
                            pages: 5,
                            cms: true,
                            complexity: "standard",
                            products: 50,
                            payments: true,
                          },
                        }),
                      }
                    );
                    const json = await res.json();
                    if (json.result) setCalcResult(json.result);
                  }}
                >
                  Becslés futtatása
                </button>
              </div>
              {calcResult ? (
                <div style={{ marginTop: 16 }}>
                  <div className="lab-metric">
                    {calcResult.total.toLocaleString("hu-HU")} {calcResult.currency}
                  </div>
                  <ProvenanceBadge provenance="estimated" />
                  <p className="lab-muted">{calcResult.estimateNote}</p>
                  <ul>
                    {calcResult.lineItems.map((l) => (
                      <li key={l.label}>
                        {l.label}: {l.amount.toLocaleString("hu-HU")}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          );
        }

        if (meta.id === "settings") {
          return (
            <div className="lab-grid">
              <section className="lab-card">
                <h2>Emergency Kill Switch</h2>
                <p className="lab-muted">
                  Állapot: <strong>{killSwitch ? "BE" : "KI"}</strong>
                </p>
                <button
                  type="button"
                  className="lab-btn lab-btn--danger"
                  onClick={async () => {
                    bumpIdle();
                    await fetch("/api/admin/lab/flags", {
                      method: "POST",
                      credentials: "same-origin",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "kill-switch",
                        on: !killSwitch,
                      }),
                    });
                    setMsg(killSwitch ? "Kill switch kikapcsolva" : "Kill switch bekapcsolva");
                    await refreshFlags();
                  }}
                >
                  {killSwitch ? "Kill switch KI" : "Kill switch BE"}
                </button>
                {msg ? <p className="lab-muted">{msg}</p> : null}
              </section>
              <section className="lab-card">
                <h2>Feature flagek</h2>
                <p className="lab-muted">
                  Modul override-ok a <code>data/lab-flags.json</code> fájlban.
                  Default: public=false, adminOnly=true.
                </p>
                <p className="lab-muted">
                  Updated: {state?.updatedAt || "—"}
                </p>
              </section>
            </div>
          );
        }

        if (meta.id === "logs") {
          return (
            <div className="lab-card lab-card--wide">
              <h2>Security audit log</h2>
              {!logs.length ? (
                <div className="lab-empty">Még nincs naplóbejegyzés.</div>
              ) : (
                <table className="lab-table">
                  <thead>
                    <tr>
                      <th>Idő</th>
                      <th>Actor</th>
                      <th>Action</th>
                      <th>Module</th>
                      <th>Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((e) => (
                      <tr key={e.id}>
                        <td>{new Date(e.timestamp).toLocaleString("hu-HU")}</td>
                        <td>{e.actor}</td>
                        <td>{e.action}</td>
                        <td>{e.module}</td>
                        <td>{e.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <ProvenanceBadge provenance="real" />
            </div>
          );
        }

        if (meta.id === "integrations") {
          return (
            <div className="lab-card lab-card--wide">
              <h2>Integrációk</h2>
              <p className="lab-muted">
                Credential értékek sosem jelennek meg. Hiányzó env = UNAVAILABLE,
                nem „működik”.
              </p>
              <table className="lab-table">
                <thead>
                  <tr>
                    <th>Szolgáltatás</th>
                    <th>Státusz</th>
                    <th>Megjegyzés</th>
                  </tr>
                </thead>
                <tbody>
                  {integrations.map((i) => (
                    <tr key={i.id}>
                      <td>{i.name}</td>
                      <td>
                        {i.status}{" "}
                        <ProvenanceBadge provenance={i.provenance} />
                      </td>
                      <td>{i.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (meta.id === "debug" || meta.id === "testing-qa" || meta.id === "performance" || meta.id === "analytics") {
          return (
            <div className="lab-card lab-card--wide">
              <h2>{meta.nameHu}</h2>
              <p className="lab-muted">{meta.description}</p>
              <p className="lab-muted">
                Verzió {meta.version} · státusz {meta.status} ·{" "}
                {meta.implemented ? "implemented shell" : "not implemented"}
              </p>
              {meta.id === "analytics" ? (
                <p className="lab-muted">
                  Belső analytics: Admin Monitor / analytics-store. GSC traffic:
                  credential függő — lásd Integrations.
                </p>
              ) : null}
              {meta.id === "testing-qa" ? (
                <p className="lab-muted">
                  Futtatás: <code>npm test</code>, <code>npm run typecheck</code>,{" "}
                  <code>npm run build</code>
                </p>
              ) : null}
            </div>
          );
        }

        return <Unimplemented name={meta.nameHu} />;
      }}
    </LabShell>
  );
}
