import type { NextApiRequest, NextApiResponse } from "next";
import { runSeoCheck } from "../../../lib/seo-checker";

/**
 * Daily SEO check endpoint for cron.
 * Auth: Authorization: Bearer $SEO_CRON_SECRET  OR  ?secret=
 */
export const config = {
  api: {
    responseLimit: false,
    externalResolver: true,
  },
};

function authorized(req: NextApiRequest): boolean {
  const secret = process.env.SEO_CRON_SECRET || process.env.CRON_SECRET;
  if (!secret || secret.length < 8) return false;
  const header = req.headers.authorization || "";
  if (header === `Bearer ${secret}`) return true;
  const q = typeof req.query.secret === "string" ? req.query.secret : "";
  return q === secret;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Csak GET/POST." });
  }

  if (!authorized(req)) {
    return res.status(401).json({ ok: false, error: "Unauthorized." });
  }

  try {
    const report = await runSeoCheck({ sendAlert: true });
    return res.status(200).json({
      ok: true,
      score: report.summary.score,
      critical: report.summary.criticalCount,
      warnings: report.summary.warningCount,
      checkedAt: report.summary.lastCheckedAt,
    });
  } catch (e) {
    console.error("[cron/seo-check]", e);
    return res.status(500).json({ ok: false, error: "SEO check failed." });
  }
}
