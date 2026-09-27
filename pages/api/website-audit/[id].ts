import type { NextApiRequest, NextApiResponse } from "next";
import { getAuditById } from "../../../lib/website-audit/store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Csak GET." });
  }

  const id = String(req.query.id || "");
  if (!id || id.length > 64) {
    return res.status(400).json({ ok: false, error: "Érvénytelen azonosító." });
  }

  const audit = getAuditById(id);
  if (!audit) {
    return res.status(404).json({ ok: false, error: "Nincs ilyen ellenőrzés." });
  }

  // Public GET: strip nothing sensitive (we never store secrets in audit records)
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ ok: true, audit });
}
