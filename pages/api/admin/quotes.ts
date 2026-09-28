import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../lib/admin-auth";
import {
  listQuotes,
  updateQuoteStatus,
  type QuoteStatus,
} from "../../../lib/quotes-store";

const STATUSES = new Set<QuoteStatus>(["new", "read", "replied", "archived"]);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;

  if (req.method === "GET") {
    const quotes = listQuotes();
    return res.status(200).json({
      ok: true,
      quotes,
      newCount: quotes.filter((q) => q.status === "new").length,
    });
  }

  if (req.method === "PATCH") {
    const id = String(req.body?.id || "").trim();
    const status = String(req.body?.status || "").trim() as QuoteStatus;
    if (!id || !STATUSES.has(status)) {
      return res.status(400).json({ ok: false, error: "Érvénytelen kérés." });
    }
    const updated = updateQuoteStatus(id, status);
    if (!updated) {
      return res.status(404).json({ ok: false, error: "Nincs ilyen árajánlat." });
    }
    return res.status(200).json({ ok: true, quote: updated });
  }

  res.setHeader("Allow", "GET, PATCH");
  return res.status(405).json({ ok: false, error: "Csak GET vagy PATCH." });
}
