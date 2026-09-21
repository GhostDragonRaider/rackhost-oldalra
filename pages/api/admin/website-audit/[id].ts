import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../../lib/admin-auth";
import { getAuditById } from "../../../../lib/website-audit/store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Csak GET." });
  }

  const id = String(req.query.id || "");
  if (!id || id.length > 64) {
    return res.status(400).json({ ok: false, error: "Hiányzó audit azonosító." });
  }

  const audit = getAuditById(id);
  if (!audit) {
    return res.status(404).json({ ok: false, error: "Az audit nem található." });
  }

  return res.status(200).json({ ok: true, audit });
}
