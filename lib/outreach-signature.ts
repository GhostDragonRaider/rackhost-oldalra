/**
 * Cégszerű e-mail aláírás az Ügyfélszerzés kiküldésekhez.
 * A kampányszöveg végére automatikusan kerül (text + HTML).
 */

import { OUTREACH_MAILBOX_DEFAULT } from "./outreach-mail";
import { SITE_NAME, SITE_URL } from "./site";

export type OutreachSignature = {
  closing: string;
  name: string;
  title: string;
  company: string;
  tagline: string;
  email: string;
  phone: string;
  website: string;
  websiteLabel: string;
};

export function getOutreachSignature(mailbox?: string): OutreachSignature {
  const email = (
    mailbox ||
    process.env.OUTREACH_EMAIL ||
    process.env.OUTREACH_SMTP_USER ||
    OUTREACH_MAILBOX_DEFAULT
  )
    .trim()
    .toLowerCase();

  return {
    closing: process.env.OUTREACH_SIGN_CLOSING?.trim() || "Üdvözlettel,",
    name: process.env.OUTREACH_SIGN_NAME?.trim() || "Milei Sándor Antal",
    title:
      process.env.OUTREACH_SIGN_TITLE?.trim() || "Alapító és fejlesztő",
    company: process.env.OUTREACH_SIGN_COMPANY?.trim() || SITE_NAME,
    tagline:
      process.env.OUTREACH_SIGN_TAGLINE?.trim() ||
      "Üzletszerző weboldalak · webshopok · egyedi rendszerek",
    email,
    phone: process.env.OUTREACH_SIGN_PHONE?.trim() || "+36 30 485 5517",
    website: process.env.OUTREACH_SIGN_URL?.trim() || SITE_URL,
    websiteLabel:
      process.env.OUTREACH_SIGN_URL_LABEL?.trim() || "anticode.hu",
  };
}

export function formatOutreachSignatureText(sig: OutreachSignature): string {
  return [
    sig.closing,
    "",
    sig.name,
    `${sig.title} · ${sig.company}`,
    sig.tagline,
    "",
    sig.email,
    sig.phone,
    sig.website,
  ].join("\n");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function formatOutreachSignatureHtml(sig: OutreachSignature): string {
  const name = escapeHtml(sig.name);
  const title = escapeHtml(`${sig.title} · ${sig.company}`);
  const tagline = escapeHtml(sig.tagline);
  const email = escapeHtml(sig.email);
  const phone = escapeHtml(sig.phone);
  const website = escapeHtml(sig.website);
  const websiteLabel = escapeHtml(sig.websiteLabel);
  const closing = escapeHtml(sig.closing);

  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;border-collapse:collapse;font-family:Georgia,'Times New Roman',serif;">
  <tr>
    <td style="padding:0 0 12px 0;font-size:15px;line-height:1.5;color:#0b1b36;">${closing}</td>
  </tr>
  <tr>
    <td style="padding:0;border-left:3px solid #3f5f86;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-left:14px;">
        <tr>
          <td style="padding:0 0 2px 0;font-size:16px;line-height:1.35;font-weight:700;color:#0b1b36;font-family:Arial,Helvetica,sans-serif;">${name}</td>
        </tr>
        <tr>
          <td style="padding:0 0 2px 0;font-size:13px;line-height:1.4;color:#3f5f86;font-family:Arial,Helvetica,sans-serif;">${title}</td>
        </tr>
        <tr>
          <td style="padding:0 0 12px 0;font-size:12px;line-height:1.4;color:#52637a;font-family:Arial,Helvetica,sans-serif;">${tagline}</td>
        </tr>
        <tr>
          <td style="padding:0;font-size:13px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;color:#0b1b36;">
            <a href="mailto:${email}" style="color:#3f5f86;text-decoration:none;">${email}</a><br/>
            <a href="tel:${phone.replaceAll(" ", "")}" style="color:#0b1b36;text-decoration:none;">${phone}</a><br/>
            <a href="${website}" style="color:#3f5f86;text-decoration:none;">${websiteLabel}</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();
}

/** Plain-text body → simple HTML paragraphs (preserves blank lines). */
export function outreachBodyToHtml(text: string): string {
  const blocks = text
    .replaceAll("\r\n", "\n")
    .trim()
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (!blocks.length) return "";

  return blocks
    .map((block) => {
      const lines = escapeHtml(block).replaceAll("\n", "<br/>");
      return `<p style="margin:0 0 14px 0;font-size:15px;line-height:1.55;color:#0b1b36;font-family:Georgia,'Times New Roman',serif;">${lines}</p>`;
    })
    .join("\n");
}

export function composeOutreachEmail(params: {
  bodyText: string;
  mailbox?: string;
}): { text: string; html: string; signature: OutreachSignature } {
  const signature = getOutreachSignature(params.mailbox);
  const sigText = formatOutreachSignatureText(signature);
  const body = params.bodyText.replace(/\s+$/u, "");
  const text = `${body}\n\n${sigText}\n`;
  const html = `<!DOCTYPE html>
<html lang="hu">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:24px;background:#f3f6fb;">
  <div style="max-width:560px;margin:0 auto;padding:28px 28px 20px;background:#ffffff;border:1px solid #dce5f0;border-radius:8px;">
    ${outreachBodyToHtml(body)}
    ${formatOutreachSignatureHtml(signature)}
  </div>
</body>
</html>`;
  return { text, html, signature };
}

/** Safe snapshot for admin UI. */
export function getOutreachSignaturePublic(mailbox?: string): {
  text: string;
  preview: OutreachSignature;
} {
  const preview = getOutreachSignature(mailbox);
  return {
    text: formatOutreachSignatureText(preview),
    preview,
  };
}
