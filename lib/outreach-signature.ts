/**
 * Cégszerű e-mail aláírás az Ügyfélszerzés kiküldésekhez.
 * Forrás: branded signature graphic (public/email/anticode-signature.png).
 */

import fs from "fs";
import path from "path";
import { OUTREACH_MAILBOX_DEFAULT } from "./outreach-mail";
import { SITE_NAME, SITE_URL, absoluteUrl } from "./site";

export const OUTREACH_SIGNATURE_CID = "anticode-signature@anticode.hu";
export const OUTREACH_SIGNATURE_PUBLIC_PATH = "/email/anticode-signature.png";
export const OUTREACH_SIGNATURE_WIDTH = 640;
export const OUTREACH_SIGNATURE_HEIGHT = 231;

export type OutreachSignature = {
  closing: string;
  name: string;
  title: string;
  company: string;
  tagline: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  websiteLabel: string;
  imagePath: string;
  imageUrl: string;
  imageCid: string;
  imageWidth: number;
  imageHeight: number;
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
    name: process.env.OUTREACH_SIGN_NAME?.trim() || "Milei Sándor",
    title: process.env.OUTREACH_SIGN_TITLE?.trim() || "Webfejlesztő | AntiCode",
    company: process.env.OUTREACH_SIGN_COMPANY?.trim() || SITE_NAME,
    tagline:
      process.env.OUTREACH_SIGN_TAGLINE?.trim() ||
      "Egyedi weboldalak. Egyedi rendszerek.",
    email,
    phone: process.env.OUTREACH_SIGN_PHONE?.trim() || "+36 30 485 5517",
    location: process.env.OUTREACH_SIGN_LOCATION?.trim() || "Magyarország",
    website: process.env.OUTREACH_SIGN_URL?.trim() || SITE_URL,
    websiteLabel:
      process.env.OUTREACH_SIGN_URL_LABEL?.trim() || "anticode.hu",
    imagePath: OUTREACH_SIGNATURE_PUBLIC_PATH,
    imageUrl: absoluteUrl(OUTREACH_SIGNATURE_PUBLIC_PATH),
    imageCid: OUTREACH_SIGNATURE_CID,
    imageWidth: OUTREACH_SIGNATURE_WIDTH,
    imageHeight: OUTREACH_SIGNATURE_HEIGHT,
  };
}

export function formatOutreachSignatureText(sig: OutreachSignature): string {
  return [
    sig.closing,
    "",
    "—",
    "",
    sig.name,
    sig.title,
    sig.email,
    sig.phone,
    sig.websiteLabel,
    sig.location,
    "",
    sig.tagline,
    "Weboldal fejlesztés · Egyedi rendszerek · Webáruház megoldások · Üzleti automatizálás",
  ].join("\n");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Branded graphic signature — preferred for HTML clients. */
export function formatOutreachSignatureHtml(sig: OutreachSignature): string {
  const alt = escapeHtml(
    `${sig.name} — ${sig.title} · ${sig.email} · ${sig.phone} · ${sig.websiteLabel}`
  );
  // Prefer CID (embedded) in outbound mail; absolute URL is the fallback/src for preview.
  const src = `cid:${sig.imageCid}`;
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="padding:0 0 14px 0;font-size:15px;line-height:1.5;color:#111111;">${escapeHtml(sig.closing)}</td>
  </tr>
  <tr>
    <td style="padding:0;">
      <a href="${escapeHtml(sig.website)}" style="text-decoration:none;border:0;">
        <img
          src="${src}"
          alt="${alt}"
          width="${sig.imageWidth}"
          height="${sig.imageHeight}"
          style="display:block;width:100%;max-width:${sig.imageWidth}px;height:auto;border:0;outline:none;text-decoration:none;"
        />
      </a>
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
      return `<p style="margin:0 0 14px 0;font-size:15px;line-height:1.55;color:#111111;font-family:Arial,Helvetica,sans-serif;">${lines}</p>`;
    })
    .join("\n");
}

export function getOutreachSignatureAttachment(): {
  filename: string;
  path: string;
  cid: string;
  contentType: string;
} | null {
  const filePath = path.join(
    process.cwd(),
    "public",
    "email",
    "anticode-signature.png"
  );
  if (!fs.existsSync(filePath)) return null;
  return {
    filename: "anticode-signature.png",
    path: filePath,
    cid: OUTREACH_SIGNATURE_CID,
    contentType: "image/png",
  };
}

export function composeOutreachEmail(params: {
  bodyText: string;
  mailbox?: string;
}): {
  text: string;
  html: string;
  signature: OutreachSignature;
  attachments: NonNullable<ReturnType<typeof getOutreachSignatureAttachment>>[];
} {
  const signature = getOutreachSignature(params.mailbox);
  const sigText = formatOutreachSignatureText(signature);
  const body = params.bodyText.replace(/\s+$/u, "");
  const text = `${body}\n\n${sigText}\n`;
  const html = `<!DOCTYPE html>
<html lang="hu">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:20px;background:#ffffff;">
  <div style="max-width:${OUTREACH_SIGNATURE_WIDTH}px;margin:0 auto;">
    ${outreachBodyToHtml(body)}
    ${formatOutreachSignatureHtml(signature)}
  </div>
</body>
</html>`;
  const attachment = getOutreachSignatureAttachment();
  return {
    text,
    html,
    signature,
    attachments: attachment ? [attachment] : [],
  };
}

/** Safe snapshot for admin UI. */
export function getOutreachSignaturePublic(mailbox?: string): {
  text: string;
  imagePath: string;
  imageUrl: string;
  preview: OutreachSignature;
} {
  const preview = getOutreachSignature(mailbox);
  return {
    text: formatOutreachSignatureText(preview),
    imagePath: preview.imagePath,
    imageUrl: preview.imageUrl,
    preview,
  };
}
