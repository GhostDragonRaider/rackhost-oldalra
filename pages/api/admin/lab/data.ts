import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../../lib/admin-auth";
import { buildActionCenterItems } from "../../../../lib/lab/action-center";
import { runSecurityCenterChecks } from "../../../../lib/lab/security-checks";
import { listLabAuditLog } from "../../../../lib/lab/audit-log";
import { listAuditSummaries } from "../../../../lib/website-audit/store";
import { getSeoReport } from "../../../../lib/seo-store";
import { getAnalyticsSummary } from "../../../../lib/analytics-store";
import {
  evaluateCalculator,
  getCalculator,
  LAB_CALCULATORS,
} from "../../../../lib/lab/calculator-engine";
import { measuredUnavailable } from "../../../../lib/lab/integrity";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = requireAdmin(req, res);
  if (!session) return;

  const section = String(req.query.section || req.body?.section || "overview");

  if (req.method === "GET") {
    if (section === "overview") {
      const seo = getSeoReport();
      const actions = buildActionCenterItems();
      const security = runSecurityCenterChecks();
      const audits = listAuditSummaries(8);
      let analytics = null;
      try {
        analytics = getAnalyticsSummary();
      } catch {
        analytics = null;
      }
      return res.status(200).json({
        ok: true,
        overview: {
          actionsCount: actions.length,
          criticalActions: actions.filter((a) => a.priority === "critical").length,
          securityScore: security.score,
          securityCheckedAt: security.checkedAt,
          seo: {
            score: seo?.summary?.score ?? null,
            lastCheckedAt: seo?.summary?.lastCheckedAt ?? null,
            gscIndexing: seo?.gscIndexing
              ? {
                  total: seo.gscIndexing.total,
                  indexedCount: seo.gscIndexing.indexedCount,
                  notIndexedCount: seo.gscIndexing.notIndexedCount,
                  checkedAt: seo.gscIndexing.checkedAt,
                  error: seo.gscIndexing.error,
                  provenance: seo.gscIndexing.error ? "unknown" : "real",
                  source: "gsc-url-inspection / seo-store",
                }
              : {
                  ...measuredUnavailable(
                    "Még nincs SEO/GSC indexelési jelentés a store-ban.",
                    "seo-store"
                  ),
                },
          },
          recentAudits: audits,
          analytics: analytics
            ? { provenance: "real", source: "analytics-store", data: analytics }
            : {
                provenance: "unavailable",
                source: "analytics-store",
                error: "Analytics snapshot nem elérhető.",
              },
        },
      });
    }

    if (section === "actions") {
      return res.status(200).json({
        ok: true,
        items: buildActionCenterItems(),
        provenance: "real",
        source: "action-center aggregate",
      });
    }

    if (section === "security") {
      return res.status(200).json({ ok: true, ...runSecurityCenterChecks() });
    }

    if (section === "logs") {
      return res.status(200).json({
        ok: true,
        entries: listLabAuditLog(100),
        provenance: "real",
        source: "lab-audit-log",
      });
    }

    if (section === "seo") {
      const seo = getSeoReport();
      return res.status(200).json({
        ok: true,
        report: seo,
        provenance: seo?.summary?.lastCheckedAt ? "real" : "unavailable",
        source: "seo-store",
      });
    }

    if (section === "calculators") {
      return res.status(200).json({
        ok: true,
        calculators: LAB_CALCULATORS.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          currency: c.currency,
          resultProvenance: c.resultProvenance,
          estimateNote: c.estimateNote,
          fields: c.fields,
        })),
      });
    }

    if (section === "integrations") {
      const rows = [
        {
          id: "gsc",
          name: "Google Search Console",
          env: ["GSC_CLIENT_EMAIL", "GSC_PRIVATE_KEY"],
        },
        { id: "smtp", name: "SMTP / email", env: ["SMTP_HOST", "SMTP_USER"] },
        { id: "ai", name: "AI provider", env: ["AI_API_KEY"] },
        {
          id: "meta",
          name: "Meta (FB/IG)",
          env: ["META_APP_ID", "META_APP_SECRET"],
        },
      ].map((row) => {
        const missing = row.env.filter((k) => !process.env[k]?.trim());
        return {
          ...row,
          status: missing.length ? "unavailable" : "configured",
          missing,
          provenance: missing.length ? "unavailable" : "real",
          note: missing.length
            ? `Hiányzó env: ${missing.join(", ")} — a kapcsolat nincs aktiválva.`
            : "Env változók jelen vannak (érték nem kerül a válaszba).",
        };
      });
      return res.status(200).json({ ok: true, integrations: rows });
    }

    return res.status(400).json({ ok: false, error: "Ismeretlen section." });
  }

  if (req.method === "POST" && section === "calculators") {
    const id = String(req.body?.calculatorId || "");
    const def = getCalculator(id);
    if (!def) {
      return res.status(404).json({ ok: false, error: "Ismeretlen kalkulátor." });
    }
    const answers = (req.body?.answers || {}) as Record<
      string,
      string | number | boolean | string[]
    >;
    const result = evaluateCalculator(def, answers);
    return res.status(200).json({ ok: true, result });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ ok: false, error: "Nem engedélyezett." });
}
