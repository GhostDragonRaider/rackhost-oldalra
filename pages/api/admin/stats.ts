import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../lib/admin-auth";
import { getAnalyticsSummary } from "../../../lib/analytics-store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Csak GET." });
  }
  if (!requireAdmin(req, res)) return;
  try {
    const stats = getAnalyticsSummary();
    return res.status(200).json({ ok: true, stats });
  } catch (e) {
    console.error("[admin/stats]", e);
    return res.status(500).json({ ok: false, error: "Statisztika nem elérhető." });
  }
}
