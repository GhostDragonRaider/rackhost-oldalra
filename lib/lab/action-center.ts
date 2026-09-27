import { listAuditSummaries } from "../website-audit/store";
import { getSeoReport } from "../seo-store";
import { collectVpsSnapshot } from "./vps-metrics";
import { runSecurityCenterChecks } from "./security-checks";
import type { LabActionItem } from "./types";

function idFrom(parts: string[]): string {
  return parts.join(":").replace(/[^a-zA-Z0-9:_-]/g, "_").slice(0, 120);
}

/** Build Action Center items from REAL sources only — no invented alerts. */
export function buildActionCenterItems(): LabActionItem[] {
  const now = new Date().toISOString();
  const items: LabActionItem[] = [];

  // SEO issues from stored report
  try {
    const seo = getSeoReport();
    if (seo?.gscIndexing) {
      const gi = seo.gscIndexing;
      if (gi.error) {
        items.push({
          id: idFrom(["seo", "gsc-error"]),
          title: "GSC indexelés hiba",
          detail: gi.error,
          priority: "high",
          category: "seo",
          moduleId: "seo-lab",
          createdAt: gi.checkedAt || now,
          acknowledged: false,
          href: "/admin/lab/seo-lab",
          source: "seo-store.gscIndexing",
          provenance: "real",
        });
      } else if (gi.notIndexedCount > 0) {
        items.push({
          id: idFrom(["seo", "not-indexed", String(gi.notIndexedCount)]),
          title: `${gi.notIndexedCount} URL nincs indexelve`,
          detail: `${gi.indexedCount}/${gi.total} indexelve · forrás: GSC URL Inspection`,
          priority: gi.notIndexedCount >= 10 ? "high" : "medium",
          category: "seo",
          moduleId: "seo-lab",
          createdAt: gi.checkedAt || now,
          acknowledged: false,
          href: "/admin/lab/seo-lab",
          source: "gsc-url-inspection",
          provenance: "real",
        });
      }
    }
    for (const issue of seo?.issues || []) {
      if (issue.severity === "critical" || issue.severity === "warning") {
        items.push({
          id: idFrom(["seo-issue", issue.id]),
          title: issue.title,
          detail: issue.detail,
          priority: issue.severity === "critical" ? "critical" : "high",
          category: "seo",
          moduleId: "seo-lab",
          createdAt: seo.summary?.lastCheckedAt || now,
          acknowledged: false,
          href: "/admin/lab/seo-lab",
          source: "seo-checker",
          provenance: "real",
        });
      }
    }
  } catch {
    /* store may be empty */
  }

  // Failed audits
  try {
    const audits = listAuditSummaries(20);
    for (const a of audits) {
      if (a.status === "failed" || a.error) {
        items.push({
          id: idFrom(["audit", a.id]),
          title: "Sikertelen website audit",
          detail: `${a.inputUrl} — ${a.error || a.status}`,
          priority: "medium",
          category: "audit",
          moduleId: "website-audit",
          createdAt: a.createdAt,
          acknowledged: false,
          href: "/admin/website-audit",
          source: "website-audit-store",
          provenance: "real",
        });
      }
    }
  } catch {
    /* */
  }

  // VPS thresholds — only when REAL measurement exists
  try {
    const vps = collectVpsSnapshot();
    const ram = vps.memory.usedPercent;
    if (ram.measurementStatus === "ok" && ram.value != null) {
      if (ram.value >= 95) {
        items.push({
          id: idFrom(["vps", "ram-critical"]),
          title: "RAM kritikus",
          detail: `RAM használat ${ram.value}% (REAL · ${ram.source})`,
          priority: "critical",
          category: "vps",
          moduleId: "vps-monitor",
          createdAt: vps.measuredAt,
          acknowledged: false,
          href: "/admin/lab/vps-monitor",
          source: ram.source || "vps",
          provenance: "real",
        });
      } else if (ram.value >= 90) {
        items.push({
          id: idFrom(["vps", "ram-high"]),
          title: "RAM figyelmeztetés",
          detail: `RAM használat ${ram.value}% (REAL · ${ram.source})`,
          priority: "high",
          category: "vps",
          moduleId: "vps-monitor",
          createdAt: vps.measuredAt,
          acknowledged: false,
          href: "/admin/lab/vps-monitor",
          source: ram.source || "vps",
          provenance: "real",
        });
      }
    }
    const cpu = vps.cpu.utilizationPercent;
    if (cpu.measurementStatus === "ok" && cpu.value != null && cpu.value >= 85) {
      items.push({
        id: idFrom(["vps", "cpu-high"]),
        title: "CPU magas",
        detail: `CPU ${cpu.value}% (REAL · ${cpu.source}) — egy mintapont; tartós terheléshez hysteresis kell.`,
        priority: "high",
        category: "vps",
        moduleId: "vps-monitor",
        createdAt: vps.measuredAt,
        acknowledged: false,
        href: "/admin/lab/vps-monitor",
        source: cpu.source || "vps",
        provenance: "real",
      });
    }
    if (vps.disk.mounts.measurementStatus === "ok" && vps.disk.mounts.value) {
      for (const m of vps.disk.mounts.value) {
        if (m.usedPercent >= 95) {
          items.push({
            id: idFrom(["vps", "disk", m.mount, "crit"]),
            title: `Disk kritikus: ${m.mount}`,
            detail: `${m.usedPercent}% tele (REAL · fs.statfsSync)`,
            priority: "critical",
            category: "vps",
            moduleId: "vps-monitor",
            createdAt: vps.measuredAt,
            acknowledged: false,
            href: "/admin/lab/vps-monitor",
            source: "fs.statfsSync",
            provenance: "real",
          });
        } else if (m.usedPercent >= 85) {
          items.push({
            id: idFrom(["vps", "disk", m.mount, "high"]),
            title: `Disk figyelmeztetés: ${m.mount}`,
            detail: `${m.usedPercent}% tele (REAL · fs.statfsSync)`,
            priority: "high",
            category: "vps",
            moduleId: "vps-monitor",
            createdAt: vps.measuredAt,
            acknowledged: false,
            href: "/admin/lab/vps-monitor",
            source: "fs.statfsSync",
            provenance: "real",
          });
        }
      }
    }
  } catch {
    /* */
  }

  // Security fails
  try {
    const sec = runSecurityCenterChecks();
    for (const c of sec.checks) {
      if (c.status === "fail") {
        items.push({
          id: idFrom(["sec", c.id]),
          title: c.title,
          detail: c.detail,
          priority: "high",
          category: "security",
          moduleId: "security-center",
          createdAt: c.measuredAt,
          acknowledged: false,
          href: "/admin/lab/security-center",
          source: c.source,
          provenance: "real",
        });
      }
    }
  } catch {
    /* */
  }

  const order: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    info: 4,
  };
  return items.sort(
    (a, b) => (order[a.priority] ?? 9) - (order[b.priority] ?? 9)
  );
}
