/**
 * Pull UNSEEN mail from Rackhost IMAP and re-send to Gmail via authenticated SMTP.
 * Server-side Rackhost→Gmail forward often fails SPF; this re-sends as info@.
 */
import { ImapFlow } from "imapflow";
import nodemailer from "nodemailer";
import { simpleParser } from "mailparser";

const user = process.env.SMTP_USER || "info@anticode.hu";
const pass = process.env.SMTP_PASS;
const forwardTo = process.env.CONTACT_TO || "sancii5427@gmail.com";
const imapHost = process.env.IMAP_HOST || "imap.rackhost.hu";
const smtpHost = process.env.SMTP_HOST || "smtp.rackhost.hu";
const smtpPort = Number(process.env.SMTP_PORT || 587);

if (!pass) {
  console.error("SMTP_PASS missing");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: process.env.SMTP_SECURE === "true",
  auth: { user, pass },
});

const client = new ImapFlow({
  host: imapHost,
  port: 993,
  secure: true,
  auth: { user, pass },
  logger: false,
});

await client.connect();
let forwarded = 0;

const lock = await client.getMailboxLock("INBOX");
try {
  const uids = await client.search({ seen: false }, { uid: true });
  console.log(`Unseen: ${uids.length}`);

  for (const uid of uids) {
    const downloaded = await client.download(uid, undefined, { uid: true });
    if (!downloaded?.content) {
      console.warn(`Skip uid=${uid}: empty`);
      continue;
    }

    const chunks = [];
    for await (const chunk of downloaded.content) {
      chunks.push(chunk);
    }
    const source = Buffer.concat(chunks);
    const parsed = await simpleParser(source);

    const fromAddr =
      parsed.from?.value?.[0]?.address ||
      downloaded.meta?.envelope?.from?.[0]?.address ||
      "unknown@unknown";
    const subject = parsed.subject || "(nincs tárgy)";

    await transporter.sendMail({
      from: `AntiCode <${user}>`,
      to: forwardTo,
      replyTo: fromAddr,
      subject: `[info@] ${subject}`,
      text:
        parsed.text ||
        `(Nincs szöveges törzs)\n\nEredeti feladó: ${fromAddr}`,
      html: typeof parsed.html === "string" ? parsed.html : undefined,
      attachments: (parsed.attachments || []).map((a) => ({
        filename: a.filename || "melleklet",
        content: a.content,
        contentType: a.contentType,
      })),
    });

    await client.messageFlagsAdd(uid, ["\\Seen"], { uid: true });
    forwarded += 1;
    console.log(`Forwarded uid=${uid} from=${fromAddr}`);
  }
} finally {
  lock.release();
  await client.logout();
}

console.log(`Done. Forwarded ${forwarded} message(s) to ${forwardTo}`);
