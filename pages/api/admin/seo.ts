import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../lib/admin-auth";
import {
  refreshSeoIndexingInBackground,
  runSeoCheck,
} from "../../../lib/seo-checker";
import { getSeoReport } from "../../../lib/seo-store";

export const config = {
  api: {
    // Full site crawl can take a while
    responseLimit: false,
    externalResolver: true,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!requireAdmin(req, res)) return;

  if (req.method === "GET") {
    try {
      const report = getSeoReport();
      return res.status(200).json({ ok: true, report });
    } catch (e) {
      console.error("[admin/seo] get", e);
      return res.status(500).json({ ok: false, error: "SEO jelentés nem elérhető." });
    }
  }

  if (req.method === "POST") {
    try {
      const sendAlert = req.body?.sendAlert !== false;
      // Defer GSC URL Inspection so nginx (default 60s) does not cut the response.
      // Indexing continues in the background and is patched onto the saved report.
      const report = await runSeoCheck({ sendAlert, deferIndexing: true });
      refreshSeoIndexingInBackground();
      return res.status(200).json({
        ok: true,
        report,
        indexingRefresh: "started",
      });
    } catch (e) {
      console.error("[admin/seo] run", e);
      return res
        .status(500)
        .json({ ok: false, error: "Az SEO ellenőrzés sikertelen." });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ ok: false, error: "Csak GET vagy POST." });
}
