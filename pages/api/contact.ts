import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { SITE_EMAIL } from "../../lib/site";

type Body = {
  name?: string;
  email?: string;
  service?: string;
  message?: string;
  website?: string; // honeypot
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
  const service = String(body.service || "").trim();
  const message = String(body.message || "").trim();

  if (name.length < 2 || name.length > 100) {
    return bad(res, 400, "Add meg a neved (legalább 2 karakter).");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return bad(res, 400, "Érvényes e-mail címet adj meg.");
  }
  if (!SERVICES.has(service)) {
    return bad(res, 400, "Válassz egy szolgáltatási irányt.");
  }
  if (message.length < 10 || message.length > 2000) {
    return bad(res, 400, "Írj röviden a projektről (legalább 10 karakter).");
  }

  const smtpUser = process.env.SMTP_USER || SITE_EMAIL;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpPass) {
    return bad(
      res,
      503,
      "Az űrlap küldése átmenetileg nem elérhető. Írj közvetlenül a info@anticode.hu címre."
    );
  }

  const text = [
    `Név: ${name}`,
    `E-mail: ${email}`,
    `Szolgáltatás: ${service}`,
    "",
    "Projekt:",
    message,
  ].join("\n");

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
      subject: `AntiCode — Projektindítás — ${service}`,
      text,
    });

    return res.status(200).json({
      ok: true,
      message: "Megkaptam az üzeneted – 1 munkanapon belül jelentkezem.",
    });
  } catch (err) {
    console.error("Contact SMTP error:", err);
    return bad(
      res,
      502,
      "Nem sikerült elküldeni az üzenetet. Próbáld újra, vagy írj a info@anticode.hu címre."
    );
  }
}
