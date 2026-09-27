import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { SITE_EMAIL } from "../../lib/site";
import { saveQuoteRequest } from "../../lib/quotes-store";

type Body = {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  message?: string;
  website?: string; // honeypot
  source?: string;
  auditId?: string;
  websiteUrl?: string;
  overallScore?: number | null;
  overallLabel?: string;
};

const SERVICES = new Set([
  "Üzletszerző weboldal",
  "Webshop vagy egyedi rendszer",
  "SEO optimalizálás",
  "Auto SEO",
  "Meglévő oldal megújítása",
  "Még egyeztetném",
]);

function bad(res: NextApiResponse, status: number, error: string) {
  return res.status(status).json({ ok: false, error });
}

function persistQuote(
  body: Body,
  fields: {
    name: string;
    email: string;
    phone: string;
    service: string;
    message: string;
  }
) {
  try {
    saveQuoteRequest({
      ...fields,
      source: body.source,
      auditId: body.auditId || null,
      websiteUrl: body.websiteUrl || null,
      overallScore:
        typeof body.overallScore === "number" ? body.overallScore : null,
      overallLabel: body.overallLabel || null,
    });
  } catch (err) {
    console.error("Quote store error:", err);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return bad(res, 405, "Csak POST kérés engedélyezett.");
  }

  const body = (req.body || {}) as Body;

  // Honeypot: bots fill hidden field
  if (body.website && String(body.website).trim()) {
    return res.status(200).json({ ok: true });
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();
  const service = String(body.service || "").trim();
  const message = String(body.message || "").trim();

  if (name.length < 2 || name.length > 100) {
    return bad(res, 400, "Add meg a neved (legalább 2 karakter).");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return bad(res, 400, "Érvényes e-mail címet adj meg.");
  }
  if (phone && (phone.length < 6 || phone.length > 40)) {
    return bad(res, 400, "A telefonszám túl rövid vagy túl hosszú.");
  }
  if (message.length < 10 || message.length > 2000) {
    return bad(res, 400, "Írj röviden a projektről (legalább 10 karakter).");
  }
  if (!SERVICES.has(service)) {
    return bad(res, 400, "Válassz egy szolgáltatási irányt.");
  }

  const fields = { name, email, phone, service, message };

  const smtpUser = process.env.SMTP_USER || SITE_EMAIL;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpPass) {
    persistQuote(body, fields);
    return res.status(200).json({
      ok: true,
      message:
        "Megkaptam az üzeneted – 1 munkanapon belül jelentkezem.",
    });
  }

  const text = [
    body.source ? `Forrás: ${body.source}` : null,
    body.auditId ? `Audit ID: ${body.auditId}` : null,
    body.websiteUrl ? `Weboldal: ${body.websiteUrl}` : null,
    body.overallScore != null ? `Pontszám: ${body.overallScore}/100` : null,
    `Név: ${name}`,
    `E-mail: ${email}`,
    `Telefon: ${phone || "—"}`,
    `Szolgáltatás: ${service}`,
    "",
    "Projekt:",
    message,
  ]
    .filter((line) => line != null)
    .join("\n");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.rackhost.hu",
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `AntiCode <${SITE_EMAIL}>`,
      to: process.env.CONTACT_TO || SITE_EMAIL,
      replyTo: email,
      subject: `AntiCode — Árajánlat — ${service}`,
      text,
    });

    persistQuote(body, fields);

    return res.status(200).json({
      ok: true,
      message: "Megkaptam az üzeneted – 1 munkanapon belül jelentkezem.",
    });
  } catch (err) {
    console.error("Contact SMTP error:", err);
    persistQuote(body, fields);
    return bad(
      res,
      502,
      "Nem sikerült elküldeni az üzenetet. Próbáld újra, vagy írj a info@anticode.hu címre."
    );
  }
}
