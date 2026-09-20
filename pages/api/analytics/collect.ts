import type { NextApiRequest, NextApiResponse } from "next";
import { clientIp } from "../../../lib/admin-auth";
import { recordPageview } from "../../../lib/analytics-store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false });
  }

  try {
    const path = String(req.body?.path || "/").slice(0, 200);
    const ua = String(req.headers["user-agent"] || "unknown").slice(0, 400);
    recordPageview({
      ip: clientIp(req),
      userAgent: ua,
      path,
    });
  } catch (e) {
    console.error("[analytics/collect]", e);
  }

  // Always 204 — never leak store errors to clients
  return res.status(204).end();
}
