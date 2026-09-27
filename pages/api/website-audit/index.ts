import type { NextApiRequest, NextApiResponse } from "next";
import { clientIp } from "../../../lib/admin-auth";
import { checkAuditRateLimit } from "../../../lib/website-audit/rate-limit";
import { enqueueAuditJob, auditQueueStats } from "../../../lib/website-audit/queue";
import { runWebsiteAudit } from "../../../lib/website-audit/runner";
import {
  newAuditId,
  saveAudit,
  emptyTechnical,
  getAuditById,
} from "../../../lib/website-audit/store";
import { validateAuditUrlInput } from "../../../lib/website-audit/ssrf";
import type { WebsiteAuditRecord } from "../../../lib/website-audit/types";
import { scoreBandLabel } from "../../../lib/website-audit/score";

export const config = {
  api: {
    responseLimit: false,
    externalResolver: true,
    bodyParser: {
      sizeLimit: "32kb",
    },
  },
  maxDuration: 90,
};

const PUBLIC_LIMIT = Math.max(
  1,
  Number(process.env.AUDIT_PUBLIC_RATE_LIMIT || 4) || 4
);
const PUBLIC_WINDOW_MS = Math.max(
  60_000,
  Number(process.env.AUDIT_PUBLIC_RATE_WINDOW_MS || 15 * 60 * 1000) ||
    15 * 60 * 1000
);

function createQueuedShell(inputUrl: string): WebsiteAuditRecord {
  const now = new Date().toISOString();
  return {
    id: newAuditId(),
    createdAt: now,
    updatedAt: now,
    inputUrl,
    normalizedUrl: inputUrl,
    status: "queued",
    overallScore: null,
    overallLabel: scoreBandLabel(null),
    summary: "Sorban vár…",
    error: null,
    categories: [],
    findings: [],
    priorityFixes: [],
    severityCounts: {
      pass: 0,
      info: 0,
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    },
    technical: emptyTechnical(),
    progress: [
      { id: "validate", label: "URL ellenőrzése", status: "pending" },
      { id: "fetch", label: "Elérhetőség / HTTP", status: "pending" },
      { id: "tls", label: "HTTPS / TLS", status: "pending" },
      { id: "headers", label: "Biztonsági kitettség", status: "pending" },
      { id: "html", label: "SEO", status: "pending" },
      { id: "content", label: "Tartalom", status: "pending" },
      { id: "responsive", label: "Responsive", status: "pending" },
      { id: "score", label: "Pontszámítás", status: "pending" },
    ],
    beta: true,
    fromCache: false,
    cachedFromId: null,
    checkedAt: null,
    scoringExplanation: null,
    responsiveMatrix: null,
    securityExposureNote: null,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // lightweight queue status for monitoring (no secrets)
    return res.status(200).json({ ok: true, queue: auditQueueStats() });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Csak GET vagy POST." });
  }

  const url = String(req.body?.url || "");
  const force = Boolean(req.body?.force);
  const pre = validateAuditUrlInput(url);
  if (pre.ok === false) {
    return res.status(400).json({ ok: false, error: pre.error });
  }

  const ip = clientIp(req) || "unknown";
  const limit = checkAuditRateLimit(
    `public:${ip}`,
    PUBLIC_LIMIT,
    PUBLIC_WINDOW_MS
  );
  if (limit.ok === false) {
    res.setHeader("Retry-After", String(limit.retryAfterSec));
    return res.status(429).json({
      ok: false,
      error: `Túl sok ellenőrzés erről a címről. Próbáld újra ${limit.retryAfterSec} mp múlva.`,
    });
  }

  const shell = createQueuedShell(url);
  saveAudit(shell);

  const enqueued = enqueueAuditJob(shell.id, async () => {
    // Mark running before work so polls see progress
    const current = getAuditById(shell.id);
    if (current) {
      saveAudit({
        ...current,
        status: "running",
        summary: "Weboldal vizsgálata…",
        updatedAt: new Date().toISOString(),
      });
    }
    try {
      const audit = await runWebsiteAudit({
        inputUrl: url,
        reuseCache: !force,
      });
      // Preserve the public job id so the client poll URL stays valid
      saveAudit({
        ...audit,
        id: shell.id,
        createdAt: shell.createdAt,
        inputUrl: url,
      });
    } catch (e) {
      console.error("[public/website-audit]", e);
      const failed = getAuditById(shell.id);
      if (failed) {
        saveAudit({
          ...failed,
          status: "failed",
          error: "Az ellenőrzés sikertelen (belső hiba).",
          summary: "Belső hiba — nem készült hamis eredmény.",
          updatedAt: new Date().toISOString(),
        });
      }
    }
  });

  if (enqueued.ok === false) {
    saveAudit({
      ...shell,
      status: "failed",
      error: enqueued.error,
      summary: enqueued.error,
      updatedAt: new Date().toISOString(),
    });
    return res.status(503).json({ ok: false, error: enqueued.error });
  }

  return res.status(202).json({
    ok: true,
    id: shell.id,
    status: "queued",
    position: enqueued.position,
    queue: auditQueueStats(),
  });
}
