/**
 * Outreach (Ügyfélszerzés) mailbox — separate from contact-form SMTP.
 * Default sender: sandor@anticode.hu (Rackhost mailbox).
 */

export const OUTREACH_MAILBOX_DEFAULT = "sandor@anticode.hu";

export type OutreachMailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  from: string;
  /** True when a password is present (value never exposed). */
  configured: boolean;
  mailbox: string;
};

export function getOutreachMailConfig(): OutreachMailConfig & {
  pass: string | null;
} {
  const mailbox = (
    process.env.OUTREACH_EMAIL ||
    process.env.OUTREACH_SMTP_USER ||
    OUTREACH_MAILBOX_DEFAULT
  )
    .trim()
    .toLowerCase();

  const user = (
    process.env.OUTREACH_SMTP_USER ||
    process.env.OUTREACH_EMAIL ||
    OUTREACH_MAILBOX_DEFAULT
  ).trim();

  const pass =
    process.env.OUTREACH_SMTP_PASS?.trim() ||
    // Fallback only if dedicated pass missing and shared SMTP user matches mailbox
    (process.env.SMTP_USER?.trim() === user
      ? process.env.SMTP_PASS?.trim() || null
      : null) ||
    null;

  const from =
    process.env.OUTREACH_SMTP_FROM?.trim() ||
    `AntiCode <${mailbox}>`;

  return {
    host: process.env.OUTREACH_SMTP_HOST?.trim() ||
      process.env.SMTP_HOST?.trim() ||
      "smtp.rackhost.hu",
    port: Number(
      process.env.OUTREACH_SMTP_PORT || process.env.SMTP_PORT || 587
    ),
    secure:
      process.env.OUTREACH_SMTP_SECURE === "true" ||
      process.env.SMTP_SECURE === "true",
    user,
    from,
    pass,
    configured: Boolean(pass),
    mailbox,
  };
}

/** Safe snapshot for admin UI (no secrets). */
export function getOutreachMailPublicStatus(): {
  mailbox: string;
  from: string;
  host: string;
  configured: boolean;
} {
  const cfg = getOutreachMailConfig();
  return {
    mailbox: cfg.mailbox,
    from: cfg.from,
    host: cfg.host,
    configured: cfg.configured,
  };
}
