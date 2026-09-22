import type { NextApiRequest, NextApiResponse } from "next";
import { clientIp, requireAdmin } from "../../../../lib/admin-auth";
import { checkAuditRateLimit } from "../../../../lib/website-audit/rate-limit";
import { runWebsiteAudit } from "../../../../lib/website-audit/runner";
import { listAuditSummaries } from "../../../../lib/website-audit/store";
import { validateAuditUrlInput } from "../../../../lib/website-audit/ssrf";

export const config = {
  api: {
    responseLimit: false,
    externalResolver: true,
    bodyParser: {
      sizeLimit: "32kb",
    },
  },
  // PageSpeed can take 20–40s; keep the route alive.
  maxDuration: 60,
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

    try {
      const audit = await runWebsiteAudit({
        inputUrl: url,
        reuseCache: !force,
      });
      return res.status(200).json({ ok: true, audit });
    } catch (e) {
      console.error("[admin/website-audit] run", e);
      return res.status(500).json({
        ok: false,
        error: "Az ellenőrzés sikertelen.",
      });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ ok: false, error: "Csak GET vagy POST." });
}
