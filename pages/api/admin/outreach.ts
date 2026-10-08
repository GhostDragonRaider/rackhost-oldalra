import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { requireAdmin } from "../../../lib/admin-auth";
import {
  getOutreachMailConfig,
  getOutreachMailPublicStatus,
} from "../../../lib/outreach-mail";
import {
  composeOutreachEmail,
  getOutreachSignaturePublic,
} from "../../../lib/outreach-signature";
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
  bodyText: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const cfg = getOutreachMailConfig();
  if (!cfg.pass) {
    return {
      ok: false,
      error:
        `OUTREACH_SMTP_PASS nincs beállítva a(z) ${cfg.mailbox} postafiókhoz — a levél nem lett elküldve (csak naplózva skip).`,
    };
  }
  try {
    const composed = composeOutreachEmail({
      bodyText: params.bodyText,
      mailbox: cfg.mailbox,
    });
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: { user: cfg.user, pass: cfg.pass },
    });
    await transporter.sendMail({
      from: cfg.from,
      to: params.to,
      subject: params.subject,
      text: composed.text,
      html: composed.html,
      replyTo: cfg.mailbox,
      attachments: composed.attachments.map((a) => ({
        filename: a.filename,
        path: a.path,
        cid: a.cid,
        contentType: a.contentType,
        contentDisposition: "inline" as const,
      })),
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
      const mail = getOutreachMailPublicStatus();
      return res.status(200).json({
        ok: true,
        contacts: listOutreachContacts(),
        campaign: getOutreachCampaign(),
        logs: listOutreachLogs(80),
        smtpConfigured: mail.configured,
        mailbox: mail,
        signature: getOutreachSignaturePublic(mail.mailbox),
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
          const bodyText = renderOutreachBody(campaign.body, contact);
          const result = await sendViaSmtp({
            to: contact.email,
            subject: campaign.subject,
            bodyText,
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
            const skippedSmtp = !getOutreachMailConfig().pass;
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

        const mail = getOutreachMailPublicStatus();
        return res.status(200).json({
          ok: true,
          sent,
          failed,
          skipped,
          contacts: listOutreachContacts(),
          campaign: getOutreachCampaign(),
          logs: listOutreachLogs(80),
          smtpConfigured: mail.configured,
          mailbox: mail,
          signature: getOutreachSignaturePublic(mail.mailbox),
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
