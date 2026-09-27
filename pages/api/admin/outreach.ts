import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { requireAdmin } from "../../../lib/admin-auth";
import { SITE_EMAIL } from "../../../lib/site";
import { listQuotes } from "../../../lib/quotes-store";
import {
  addOutreachContact,
  deleteOutreachContact,
  getActiveOutreachContacts,
  getOutreachCampaign,
  importEmails,
  listOutreachContacts,
  listOutreachLogs,
  markOutreachSent,
  renderOutreachBody,
  updateOutreachCampaign,
  updateOutreachContact,
  type OutreachContactStatus,
} from "../../../lib/outreach-store";

const STATUSES = new Set<OutreachContactStatus>([
  "active",
  "paused",
  "unsubscribed",
]);

async function sendViaSmtp(params: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const smtpUser = process.env.SMTP_USER || SITE_EMAIL;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpPass) {
    return {
      ok: false,
      error:
        "SMTP_PASS nincs beállítva — a levél nem lett elküldve (csak naplózva skip).",
    };
  }
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.rackhost.hu",
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: smtpUser, pass: smtpPass },
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `AntiCode <${SITE_EMAIL}>`,
      to: params.to,
      subject: params.subject,
      text: params.text,
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "SMTP hiba",
    };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!requireAdmin(req, res)) return;

  try {
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        contacts: listOutreachContacts(),
        campaign: getOutreachCampaign(),
        logs: listOutreachLogs(80),
        smtpConfigured: Boolean(process.env.SMTP_PASS),
      });
    }

    if (req.method === "POST") {
      const action = String(req.body?.action || "").trim();

      if (action === "add") {
        const contact = addOutreachContact({
          email: req.body?.email,
          name: req.body?.name,
          company: req.body?.company,
          notes: req.body?.notes,
          source: req.body?.source || "manual",
        });
        return res.status(200).json({
          ok: true,
          contact,
          contacts: listOutreachContacts(),
        });
      }

      if (action === "update") {
        const id = String(req.body?.id || "").trim();
        const status = req.body?.status as OutreachContactStatus | undefined;
        if (status && !STATUSES.has(status)) {
          return res.status(400).json({ ok: false, error: "Érvénytelen státusz." });
        }
        const contact = updateOutreachContact(id, {
          name: req.body?.name,
          company: req.body?.company,
          notes: req.body?.notes,
          status,
        });
        if (!contact) {
          return res.status(404).json({ ok: false, error: "Nincs ilyen kontakt." });
        }
        return res.status(200).json({
          ok: true,
          contact,
          contacts: listOutreachContacts(),
        });
      }

      if (action === "delete") {
        const id = String(req.body?.id || "").trim();
        if (!deleteOutreachContact(id)) {
          return res.status(404).json({ ok: false, error: "Nincs ilyen kontakt." });
        }
        return res.status(200).json({
          ok: true,
          contacts: listOutreachContacts(),
        });
      }

      if (action === "campaign") {
        const campaign = updateOutreachCampaign({
          subject: req.body?.subject,
          body: req.body?.body,
          intervalDays: req.body?.intervalDays,
          enabled: req.body?.enabled,
        });
        return res.status(200).json({ ok: true, campaign });
      }

      if (action === "import-quotes") {
        const quotes = listQuotes();
        const result = importEmails(
          quotes.map((q) => ({
            email: q.email,
            name: q.name,
            source: `quote:${q.source}`,
          }))
        );
        return res.status(200).json({
          ok: true,
          ...result,
          contacts: listOutreachContacts(),
        });
      }

      if (action === "send") {
        const campaign = getOutreachCampaign();
        const contactId = String(req.body?.contactId || "").trim();
        const targets = contactId
          ? getActiveOutreachContacts().filter((c) => c.id === contactId)
          : getActiveOutreachContacts();

        if (!targets.length) {
          return res.status(400).json({
            ok: false,
            error: "Nincs aktív címzett a kiküldéshez.",
          });
        }

        let sent = 0;
        let failed = 0;
        let skipped = 0;

        for (const contact of targets) {
          const text = renderOutreachBody(campaign.body, contact);
          const result = await sendViaSmtp({
            to: contact.email,
            subject: campaign.subject,
            text,
          });
          if (result.ok) {
            markOutreachSent({
              contactId: contact.id,
              email: contact.email,
              subject: campaign.subject,
              status: "sent",
              detail: "Elküldve SMTP-n keresztül.",
            });
            sent += 1;
          } else {
            const detail =
              "error" in result ? result.error : "SMTP hiba";
            const skippedSmtp = !process.env.SMTP_PASS;
            markOutreachSent({
              contactId: contact.id,
              email: contact.email,
              subject: campaign.subject,
              status: skippedSmtp ? "skipped" : "failed",
              detail,
            });
            if (skippedSmtp) skipped += 1;
            else failed += 1;
          }
        }

        return res.status(200).json({
          ok: true,
          sent,
          failed,
          skipped,
          contacts: listOutreachContacts(),
          campaign: getOutreachCampaign(),
          logs: listOutreachLogs(80),
          smtpConfigured: Boolean(process.env.SMTP_PASS),
        });
      }

      return res.status(400).json({ ok: false, error: "Ismeretlen művelet." });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Nem engedélyezett." });
  } catch (err) {
    return res.status(400).json({
      ok: false,
      error: err instanceof Error ? err.message : "Outreach hiba.",
    });
  }
}
