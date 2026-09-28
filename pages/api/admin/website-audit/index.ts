import type { NextApiRequest, NextApiResponse } from "next";
import { clientIp, requireAdmin } from "../../../../lib/admin-auth";
import { checkAuditRateLimit } from "../../../../lib/website-audit/rate-limit";
import { enqueueAuditJob, auditQueueStats } from "../../../../lib/website-audit/queue";
import { runWebsiteAudit } from "../../../../lib/website-audit/runner";
import {
  createQueuedAuditRecord,
  listAuditSummaries,
  saveAudit,
  getAuditById,
} from "../../../../lib/website-audit/store";
import { validateAuditUrlInput } from "../../../../lib/website-audit/ssrf";

export const config = {
  api: {
    responseLimit: false,
    externalResolver: true,
    bodyParser: {
      sizeLimit: "32kb",
    },
  },
  maxDuration: 90,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = requireAdmin(req, res);
  if (!session) return;

  if (req.method === "GET") {
    try {
      const items = listAuditSummaries(40);
      return res.status(200).json({ ok: true, items });
    } catch (e) {
      console.error("[admin/website-audit] list", e);
      return res
        .status(500)
        .json({ ok: false, error: "Az audit előzmények nem elérhetők." });
    }
  }

  if (req.method === "POST") {
    const url = String(req.body?.url || "");
    const force = Boolean(req.body?.force);
    const pre = validateAuditUrlInput(url);
    if (pre.ok === false) {
      return res.status(400).json({ ok: false, error: pre.error });
    }

    const ip = clientIp(req);
    const limit = checkAuditRateLimit(`${session.u}:${ip}`);
    if (limit.ok === false) {
      res.setHeader("Retry-After", String(limit.retryAfterSec));
      return res.status(429).json({
        ok: false,
        error: `Túl sok ellenőrzés. Próbáld újra ${limit.retryAfterSec} mp múlva.`,
      });
    }

    const shell = createQueuedAuditRecord(url);
    saveAudit(shell);

    const enqueued = enqueueAuditJob(shell.id, async () => {
      const current = getAuditById(shell.id);
      if (current) {
        saveAudit({
          ...current,
          status: "running",
          summary: "Weboldal vizsgálata…",
          updatedAt: new Date().toISOString(),
        });
      }
      try {
        await runWebsiteAudit({
          inputUrl: url,
          reuseCache: !force,
          auditId: shell.id,
          createdAt: shell.createdAt,
        });
      } catch (e) {
        console.error("[admin/website-audit] run", e);
        const failed = getAuditById(shell.id);
        if (failed) {
          saveAudit({
            ...failed,
            status: "failed",
            error: "Az ellenőrzés sikertelen (belső hiba).",
            summary: "Belső hiba — nem készült hamis eredmény.",
            updatedAt: new Date().toISOString(),
          });
        }
      }
    });

    if (enqueued.ok === false) {
      saveAudit({
        ...shell,
        status: "failed",
        error: enqueued.error,
        summary: enqueued.error,
        updatedAt: new Date().toISOString(),
      });
      return res.status(503).json({ ok: false, error: enqueued.error });
    }

    return res.status(202).json({
      ok: true,
      id: shell.id,
      status: "queued",
      position: enqueued.position,
      queue: auditQueueStats(),
      audit: shell,
    });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ ok: false, error: "Csak GET vagy POST." });
}
