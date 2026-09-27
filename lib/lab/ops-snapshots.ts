import { listAuditSummaries } from "../website-audit/store";
import { getAnalyticsSummary } from "../analytics-store";
import { LAB_MODULES } from "./registry";
import { getLabFlagsState } from "./flags-store";

export function getPerformanceLabSnapshot() {
  const audits = listAuditSummaries(30);
  const samples = audits
    .map((a) => {
      const rec = a as {
        id: string;
        inputUrl: string;
        status: string;
        overallScore: number | null;
        createdAt: string;
        finishedAt?: string | null;
        durationMs?: number | null;
      };
      let durationMs =
        typeof rec.durationMs === "number" ? rec.durationMs : null;
      if (
        durationMs == null &&
        rec.finishedAt &&
        rec.createdAt
      ) {
        const d =
          new Date(rec.finishedAt).getTime() - new Date(rec.createdAt).getTime();
        durationMs = Number.isFinite(d) && d >= 0 ? d : null;
      }
      return {
        id: rec.id,
        url: rec.inputUrl,
        status: rec.status,
        score: rec.overallScore,
        createdAt: rec.createdAt,
        durationMs,
      };
    })
    .filter((a) => a.durationMs != null);

  const avg =
    samples.length > 0
      ? Math.round(
          samples.reduce((s, a) => s + (a.durationMs || 0), 0) / samples.length
        )
      : null;

  return {
    sampleCount: samples.length,
    averageDurationMs: avg,
    provenance: avg != null ? ("real" as const) : ("unavailable" as const),
    source: "website-audit-store",
    note:
      avg != null
        ? `Átlag audit idő: ${avg} ms (${samples.length} minta).`
        : "Nincs mérhető audit duration — futtass Weboldal-ellenőrzőt.",
    samples: samples.slice(0, 12),
  };
}

export function getAnalyticsLabSnapshot() {
  try {
    const data = getAnalyticsSummary();
    return {
      ok: true as const,
      provenance: "real" as const,
      source: "analytics-store",
      data,
      error: null as string | null,
    };
  } catch (e) {
    return {
      ok: false as const,
      provenance: "unavailable" as const,
      source: "analytics-store",
      error: e instanceof Error ? e.message : "Analytics nem olvasható",
      data: null,
    };
  }
}

export function getTestingQaSnapshot() {
  const modules = LAB_MODULES.map((m) => ({
    id: m.id,
    name: m.nameHu,
    implemented: m.implemented,
    status: m.status,
    testStatus: m.testStatus,
    securityStatus: m.securityStatus,
  }));
  const implemented = modules.filter((m) => m.implemented).length;
  const pendingTests = modules.filter((m) => m.testStatus === "pending").length;
  const checklist = [
    {
      id: "typecheck",
      label: "TypeScript typecheck (npm run typecheck)",
      hint: "Lokálisan / CI-ben futtatandó",
    },
    {
      id: "tests",
      label: "Unit tesztek (npm test)",
      hint: "Lab + audit tesztek",
    },
    {
      id: "build",
      label: "Production build (npm run build)",
      hint: "Deploy előtt kötelező",
    },
    {
      id: "kill-switch",
      label: "Kill switch KI éles előtt",
      hint: `Jelenlegi: ${getLabFlagsState().killSwitch ? "BE ⚠️" : "KI ✓"}`,
    },
  ];
  return {
    implementedCount: implemented,
    totalModules: modules.length,
    pendingTests,
    modules,
    checklist,
    provenance: "real" as const,
    source: "lab-registry + flags-store",
  };
}

export function getDebugLabSnapshot() {
  const flags = getLabFlagsState();
  const envPresence = [
    "ADMIN_USER",
    "ADMIN_PASSWORD",
    "ADMIN_SESSION_SECRET",
    "GSC_CLIENT_EMAIL",
    "GSC_PRIVATE_KEY",
    "SMTP_HOST",
    "SMTP_USER",
    "SMTP_PASS",
    "AI_API_KEY",
    "META_APP_ID",
  ].map((key) => ({
    key,
    present: Boolean(process.env[key]?.trim()),
  }));

  return {
    nodeEnv: process.env.NODE_ENV || "unknown",
    killSwitch: flags.killSwitch,
    flagsUpdatedAt: flags.updatedAt,
    recentModules: flags.recent.slice(0, 8),
    envPresence,
    note: "Env értékek sosem jelennek meg — csak van/nincs.",
    provenance: "real" as const,
    source: "process.env keys + lab-flags",
  };
}
