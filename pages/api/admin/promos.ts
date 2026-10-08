import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../lib/admin-auth";
import { PROMO_CATALOG } from "../../../lib/promos-catalog";
import {
  getPromosState,
  resetPromosToGroupDefaults,
  updatePromosState,
} from "../../../lib/promos-store";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!requireAdmin(req, res)) return;

  try {
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        catalog: PROMO_CATALOG,
        state: getPromosState(),
      });
    }

    if (req.method === "POST") {
      const action = String(req.body?.action || "save").trim();

      if (action === "reset-defaults") {
        const state = resetPromosToGroupDefaults();
        return res.status(200).json({
          ok: true,
          catalog: PROMO_CATALOG,
          state,
        });
      }

      if (action !== "save") {
        return res.status(400).json({ ok: false, error: "Ismeretlen művelet." });
      }
      const state = updatePromosState({
        active: req.body?.active,
        badge: req.body?.badge,
        headline: req.body?.headline,
        note: req.body?.note,
        offers: req.body?.offers,
      });
      return res.status(200).json({
        ok: true,
        catalog: PROMO_CATALOG,
        state,
      });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Nem engedélyezett." });
  } catch (err) {
    return res.status(400).json({
      ok: false,
      error: err instanceof Error ? err.message : "Akció mentési hiba.",
    });
  }
}
