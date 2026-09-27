import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../../lib/admin-auth";
import { appendLabAuditLog } from "../../../../lib/lab/audit-log";
import {
  getLabFlagsState,
  listResolvedModules,
  patchDashboard,
  patchModuleFlags,
  setLabKillSwitch,
  toggleFavorite,
  touchRecent,
} from "../../../../lib/lab/flags-store";
import { listLabModulesByCategory } from "../../../../lib/lab/registry";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = requireAdmin(req, res);
  if (!session) return;

  if (req.method === "GET") {
    const state = getLabFlagsState();
    return res.status(200).json({
      ok: true,
      state,
      modules: listResolvedModules(),
      categories: listLabModulesByCategory(),
    });
  }

  if (req.method === "POST") {
    const action = String(req.body?.action || "");
    try {
      if (action === "kill-switch") {
        const on = Boolean(req.body?.on);
        const state = setLabKillSwitch(on);
        appendLabAuditLog({
          actor: session.u,
          action: on ? "lab.kill_switch.on" : "lab.kill_switch.off",
          module: "settings",
          detail: `killSwitch=${on}`,
        });
        return res.status(200).json({ ok: true, state });
      }
      if (action === "patch-flags") {
        const moduleId = String(req.body?.moduleId || "");
        const patch = req.body?.patch || {};
        const state = patchModuleFlags(moduleId, patch);
        appendLabAuditLog({
          actor: session.u,
          action: "lab.feature_flag.patch",
          module: moduleId,
          detail: JSON.stringify(patch).slice(0, 400),
        });
        return res.status(200).json({ ok: true, state });
      }
      if (action === "toggle-favorite") {
        const moduleId = String(req.body?.moduleId || "");
        const state = toggleFavorite(moduleId);
        return res.status(200).json({ ok: true, state });
      }
      if (action === "touch-recent") {
        const moduleId = String(req.body?.moduleId || "");
        const state = touchRecent(moduleId);
        return res.status(200).json({ ok: true, state });
      }
      if (action === "patch-dashboard") {
        const state = patchDashboard(req.body?.dashboard || {});
        return res.status(200).json({ ok: true, state });
      }
      return res.status(400).json({ ok: false, error: "Ismeretlen action." });
    } catch (e) {
      return res.status(400).json({
        ok: false,
        error: e instanceof Error ? e.message : "Lab flags hiba",
      });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ ok: false, error: "Nem engedélyezett." });
}
