import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../../lib/admin-auth";
import { buildActionCenterItems } from "../../../../lib/lab/action-center";
import { runSecurityCenterChecks } from "../../../../lib/lab/security-checks";
import { listLabAuditLog, appendLabAuditLog } from "../../../../lib/lab/audit-log";
import { listAuditSummaries } from "../../../../lib/website-audit/store";
import { getSeoReport } from "../../../../lib/seo-store";
import { getAnalyticsSummary } from "../../../../lib/analytics-store";
import {
  evaluateCalculator,
  getCalculator,
  LAB_CALCULATORS,
} from "../../../../lib/lab/calculator-engine";
import { measuredUnavailable } from "../../../../lib/lab/integrity";
import {
  createLabForm,
  getLabForm,
  listLabForms,
  saveLabForm,
  visibleFormFields,
} from "../../../../lib/lab/forms-engine";
import {
  addLabProject,
  deleteLabClient,
  listLabClients,
  upsertLabClient,
} from "../../../../lib/lab/clients-store";
import {
  createLabLead,
  listLabLeads,
  updateLabLeadStatus,
  type LeadStatus,
} from "../../../../lib/lab/leads-store";
import {
  createSocialDryRun,
  listSocialDrafts,
  listSocialPlatforms,
  type SocialPlatformId,
} from "../../../../lib/lab/social-hub";
import {
  addCareTarget,
  checkAllCareTargets,
  checkCareTarget,
  listCareTargets,
  removeCareTarget,
} from "../../../../lib/lab/care-monitor";
import {
  createAutomationRule,
  dryRunAutomation,
  listAutomationRules,
  toggleAutomationRule,
} from "../../../../lib/lab/automation-engine";
import {
  approveAiRecommendation,
  listAiSessions,
  runAiDetect,
} from "../../../../lib/lab/ai-tools";
import {
  listExperiments,
  pickExperimentVariant,
  setExperimentStatus,
  upsertExperiment,
  type ExperimentStatus,
} from "../../../../lib/lab/experiments-store";
import {
  buildUtmUrl,
  deleteContentItem,
  listContentItems,
  upsertContentItem,
} from "../../../../lib/lab/content-store";
import {
  getAnalyticsLabSnapshot,
  getDebugLabSnapshot,
  getPerformanceLabSnapshot,
  getTestingQaSnapshot,
} from "../../../../lib/lab/ops-snapshots";

function audit(
  actor: string,
  action: string,
  module: string,
  detail: string
) {
  try {
    appendLabAuditLog({ actor, action, module, detail });
  } catch {
    /* ignore */
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = requireAdmin(req, res);
  if (!session) return;

  const section = String(req.query.section || req.body?.section || "overview");
  const actor = session.u || "admin";

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
          criticalActions: actions.filter((a) => a.priority === "critical")
            .length,
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
          leadsOpen: listLabLeads().filter((l) => l.status === "new").length,
          clients: listLabClients().length,
          careDown: listCareTargets().filter(
            (t) => t.lastCheck && !t.lastCheck.ok
          ).length,
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

    if (section === "forms") {
      return res.status(200).json({ ok: true, forms: listLabForms() });
    }

    if (section === "clients") {
      return res.status(200).json({
        ok: true,
        clients: listLabClients(),
        provenance: "real",
        source: "lab-clients.json",
      });
    }

    if (section === "leads") {
      return res.status(200).json({
        ok: true,
        leads: listLabLeads(),
        provenance: "real",
        source: "lab-leads.json (+ contact-form)",
      });
    }

    if (section === "social") {
      return res.status(200).json({
        ok: true,
        platforms: listSocialPlatforms(),
        drafts: listSocialDrafts(),
      });
    }

    if (section === "care") {
      return res.status(200).json({
        ok: true,
        targets: listCareTargets(),
        provenance: "real",
        source: "lab-care.json",
      });
    }

    if (section === "automation") {
      return res.status(200).json({
        ok: true,
        rules: listAutomationRules(),
      });
    }

    if (section === "ai") {
      return res.status(200).json({
        ok: true,
        sessions: listAiSessions(),
        hasAiKey: Boolean(process.env.AI_API_KEY?.trim()),
      });
    }

    if (section === "experiments") {
      return res.status(200).json({
        ok: true,
        experiments: listExperiments(),
      });
    }

    if (section === "content") {
      return res.status(200).json({
        ok: true,
        items: listContentItems(),
      });
    }

    if (section === "performance") {
      return res.status(200).json({ ok: true, ...getPerformanceLabSnapshot() });
    }

    if (section === "analytics") {
      return res.status(200).json({ ok: true, ...getAnalyticsLabSnapshot() });
    }

    if (section === "testing-qa") {
      return res.status(200).json({ ok: true, ...getTestingQaSnapshot() });
    }

    if (section === "debug") {
      return res.status(200).json({ ok: true, ...getDebugLabSnapshot() });
    }

    return res.status(400).json({ ok: false, error: "Ismeretlen section." });
  }

  if (req.method === "POST") {
    const body = (req.body || {}) as Record<string, unknown>;

    if (section === "calculators") {
      const id = String(body.calculatorId || "");
      const def = getCalculator(id);
      if (!def) {
        return res
          .status(404)
          .json({ ok: false, error: "Ismeretlen kalkulátor." });
      }
      const answers = (body.answers || {}) as Record<
        string,
        string | number | boolean | string[]
      >;
      const result = evaluateCalculator(def, answers);
      return res.status(200).json({ ok: true, result });
    }

    if (section === "forms") {
      const action = String(body.action || "");
      if (action === "create") {
        const form = createLabForm(String(body.name || "Új űrlap"));
        audit(actor, "forms.create", "forms-flows", form.id);
        return res.status(200).json({ ok: true, form, forms: listLabForms() });
      }
      if (action === "save") {
        const form = body.form as Parameters<typeof saveLabForm>[0];
        if (!form?.id) {
          return res.status(400).json({ ok: false, error: "Hiányzó form." });
        }
        const saved = saveLabForm(form);
        audit(actor, "forms.save", "forms-flows", saved.id);
        return res.status(200).json({ ok: true, form: saved, forms: listLabForms() });
      }
      if (action === "preview") {
        const formId = String(body.formId || "");
        const form = getLabForm(formId);
        if (!form) {
          return res.status(404).json({ ok: false, error: "Nincs ilyen űrlap." });
        }
        const answers = (body.answers || {}) as Record<string, string | boolean>;
        return res.status(200).json({
          ok: true,
          visible: visibleFormFields(form, answers).map((f) => f.id),
        });
      }
      return res.status(400).json({ ok: false, error: "Ismeretlen forms action." });
    }

    if (section === "clients") {
      const action = String(body.action || "");
      if (action === "upsert") {
        const client = upsertLabClient({
          id: body.id ? String(body.id) : undefined,
          name: String(body.name || ""),
          email: String(body.email || ""),
          company: body.company ? String(body.company) : undefined,
        });
        audit(actor, "clients.upsert", "client-hub", client.id);
        return res.status(200).json({ ok: true, client, clients: listLabClients() });
      }
      if (action === "add-project") {
        const client = addLabProject(String(body.clientId || ""), {
          name: String(body.name || ""),
          status: body.status as "lead" | "active" | "paused" | "done" | undefined,
          url: body.url ? String(body.url) : undefined,
          notes: body.notes ? String(body.notes) : undefined,
        });
        if (!client) {
          return res.status(404).json({ ok: false, error: "Nincs ilyen ügyfél." });
        }
        audit(actor, "clients.add-project", "client-hub", client.id);
        return res.status(200).json({ ok: true, client, clients: listLabClients() });
      }
      if (action === "delete") {
        const ok = deleteLabClient(String(body.id || ""));
        audit(actor, "clients.delete", "client-hub", String(body.id || ""));
        return res.status(200).json({ ok, clients: listLabClients() });
      }
      return res.status(400).json({ ok: false, error: "Ismeretlen clients action." });
    }

    if (section === "leads") {
      const action = String(body.action || "");
      if (action === "create") {
        const lead = createLabLead({
          name: String(body.name || ""),
          email: String(body.email || ""),
          service: String(body.service || ""),
          message: String(body.message || ""),
          source: "lab-manual",
        });
        audit(actor, "leads.create", "leads-crm", lead.id);
        return res.status(200).json({ ok: true, lead, leads: listLabLeads() });
      }
      if (action === "status") {
        const lead = updateLabLeadStatus(
          String(body.id || ""),
          String(body.status || "new") as LeadStatus
        );
        if (!lead) {
          return res.status(404).json({ ok: false, error: "Nincs ilyen lead." });
        }
        audit(actor, "leads.status", "leads-crm", `${lead.id}:${lead.status}`);
        return res.status(200).json({ ok: true, lead, leads: listLabLeads() });
      }
      return res.status(400).json({ ok: false, error: "Ismeretlen leads action." });
    }

    if (section === "social") {
      const draft = createSocialDryRun({
        platform: String(body.platform || "meta") as SocialPlatformId,
        text: String(body.text || ""),
      });
      audit(actor, "social.dry-run", "social-hub", draft.id);
      return res.status(200).json({
        ok: true,
        draft,
        drafts: listSocialDrafts(),
        platforms: listSocialPlatforms(),
      });
    }

    if (section === "care") {
      const action = String(body.action || "");
      if (action === "add") {
        const result = addCareTarget(
          String(body.label || ""),
          String(body.url || "")
        );
        if ("error" in result) {
          return res.status(400).json({ ok: false, error: result.error });
        }
        audit(actor, "care.add", "care-monitor", result.id);
        return res.status(200).json({ ok: true, target: result, targets: listCareTargets() });
      }
      if (action === "remove") {
        const ok = removeCareTarget(String(body.id || ""));
        return res.status(200).json({ ok, targets: listCareTargets() });
      }
      if (action === "check") {
        const target = await checkCareTarget(String(body.id || ""));
        if (!target) {
          return res.status(404).json({ ok: false, error: "Nincs ilyen célpont." });
        }
        audit(actor, "care.check", "care-monitor", target.id);
        return res.status(200).json({ ok: true, target, targets: listCareTargets() });
      }
      if (action === "check-all") {
        const targets = await checkAllCareTargets();
        audit(actor, "care.check-all", "care-monitor", String(targets.length));
        return res.status(200).json({ ok: true, targets });
      }
      return res.status(400).json({ ok: false, error: "Ismeretlen care action." });
    }

    if (section === "automation") {
      const action = String(body.action || "");
      if (action === "create") {
        const rule = createAutomationRule(String(body.name || "Új szabály"));
        audit(actor, "automation.create", "automation", rule.id);
        return res.status(200).json({ ok: true, rule, rules: listAutomationRules() });
      }
      if (action === "toggle") {
        const rule = toggleAutomationRule(
          String(body.id || ""),
          Boolean(body.enabled)
        );
        if (!rule) {
          return res.status(404).json({ ok: false, error: "Nincs ilyen szabály." });
        }
        return res.status(200).json({ ok: true, rule, rules: listAutomationRules() });
      }
      if (action === "dry-run") {
        const result = dryRunAutomation(String(body.id || ""));
        if (!result) {
          return res.status(404).json({ ok: false, error: "Nincs ilyen szabály." });
        }
        audit(actor, "automation.dry-run", "automation", result.rule.id);
        return res.status(200).json({ ok: true, ...result, rules: listAutomationRules() });
      }
      return res.status(400).json({ ok: false, error: "Ismeretlen automation action." });
    }

    if (section === "ai") {
      const action = String(body.action || "detect");
      if (action === "detect") {
        const session = runAiDetect(String(body.input || ""));
        audit(actor, "ai.detect", "ai-tools", session.id);
        return res.status(200).json({
          ok: true,
          session,
          sessions: listAiSessions(),
          hasAiKey: Boolean(process.env.AI_API_KEY?.trim()),
        });
      }
      if (action === "approve") {
        const session = approveAiRecommendation(
          String(body.sessionId || ""),
          String(body.recommendationId || "")
        );
        if (!session) {
          return res.status(404).json({ ok: false, error: "Nincs ilyen javaslat." });
        }
        audit(actor, "ai.approve", "ai-tools", String(body.recommendationId || ""));
        return res.status(200).json({ ok: true, session, sessions: listAiSessions() });
      }
      return res.status(400).json({ ok: false, error: "Ismeretlen ai action." });
    }

    if (section === "experiments") {
      const action = String(body.action || "");
      if (action === "upsert") {
        const exp = upsertExperiment({
          id: body.id ? String(body.id) : undefined,
          name: String(body.name || ""),
          hypothesis: body.hypothesis ? String(body.hypothesis) : "",
          status: body.status as ExperimentStatus | undefined,
        });
        audit(actor, "experiments.upsert", "experiments", exp.id);
        return res.status(200).json({
          ok: true,
          experiment: exp,
          experiments: listExperiments(),
        });
      }
      if (action === "status") {
        const exp = setExperimentStatus(
          String(body.id || ""),
          String(body.status || "draft") as ExperimentStatus
        );
        if (!exp) {
          return res.status(404).json({ ok: false, error: "Nincs ilyen kísérlet." });
        }
        return res.status(200).json({
          ok: true,
          experiment: exp,
          experiments: listExperiments(),
        });
      }
      if (action === "pick") {
        const pick = pickExperimentVariant(
          String(body.id || ""),
          String(body.visitorKey || "demo-visitor")
        );
        return res.status(200).json({ ok: true, pick });
      }
      return res.status(400).json({ ok: false, error: "Ismeretlen experiments action." });
    }

    if (section === "content") {
      const action = String(body.action || "");
      if (action === "upsert") {
        const item = upsertContentItem({
          id: body.id ? String(body.id) : undefined,
          title: String(body.title || ""),
          slug: String(body.slug || ""),
          body: String(body.body || ""),
          utmSource: body.utmSource ? String(body.utmSource) : undefined,
          utmMedium: body.utmMedium ? String(body.utmMedium) : undefined,
          utmCampaign: body.utmCampaign ? String(body.utmCampaign) : undefined,
        });
        audit(actor, "content.upsert", "content", item.id);
        return res.status(200).json({ ok: true, item, items: listContentItems() });
      }
      if (action === "delete") {
        const ok = deleteContentItem(String(body.id || ""));
        return res.status(200).json({ ok, items: listContentItems() });
      }
      if (action === "utm") {
        const items = listContentItems();
        const item = items.find((i) => i.id === String(body.id || ""));
        if (!item) {
          return res.status(404).json({ ok: false, error: "Nincs ilyen tartalom." });
        }
        const url = buildUtmUrl(String(body.baseUrl || "https://anticode.hu/"), item);
        return res.status(200).json({ ok: true, url, item });
      }
      return res.status(400).json({ ok: false, error: "Ismeretlen content action." });
    }

    return res.status(400).json({ ok: false, error: "Ismeretlen section POST." });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ ok: false, error: "Nem engedélyezett." });
}
