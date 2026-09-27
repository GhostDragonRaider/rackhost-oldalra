import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../../lib/admin-auth";
import { collectVpsSnapshot } from "../../../../lib/lab/vps-metrics";
import { isLabKillSwitchOn, resolveModuleFlags } from "../../../../lib/lab/flags-store";
import { getLabModule } from "../../../../lib/lab/registry";

/** Simple in-memory rate limit per process (admin-only endpoint). */
const hits = new Map<string, { n: number; reset: number }>();

function rateLimit(key: string, limit = 60, windowMs = 60_000): boolean {
  const now = Date.now();
  const row = hits.get(key);
  if (!row || now > row.reset) {
    hits.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  if (row.n >= limit) return false;
  row.n += 1;
  return true;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = requireAdmin(req, res);
  if (!session) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Csak GET." });
  }

  const mod = getLabModule("vps-monitor");
  if (!mod) {
    return res.status(500).json({ ok: false, error: "VPS modul hiányzik." });
  }
  const flags = resolveModuleFlags(mod);
  if (isLabKillSwitchOn() || !flags.enabled || flags.maintenanceMode) {
    return res.status(503).json({
      ok: false,
      error: "VPS Monitor jelenleg le van tiltva (flag / kill switch).",
      measurementStatus: "unavailable",
    });
  }

  const ip = String(
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown"
  )
    .split(",")[0]
    .trim();
  if (!rateLimit(`vps:${session.u}:${ip}`)) {
    return res.status(429).json({ ok: false, error: "Túl sok VPS lekérés." });
  }

  try {
    const snapshot = collectVpsSnapshot();
    return res.status(200).json({ ok: true, snapshot });
  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: e instanceof Error ? e.message : "VPS mérés sikertelen",
      measurementStatus: "error",
    });
  }
}
