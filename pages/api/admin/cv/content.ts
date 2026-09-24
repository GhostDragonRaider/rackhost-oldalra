import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../../lib/admin-auth";
import { CV_CONTENT } from "../../../../lib/cv/content";

/**
 * Authenticated CV payload. Do not expose résumé PII via public static bundles.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Nem engedélyezett metódus." });
  }

  if (!requireAdmin(req, res)) return;

  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  return res.status(200).json({ ok: true, cv: CV_CONTENT });
}
