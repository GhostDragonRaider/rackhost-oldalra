import type { NextApiRequest, NextApiResponse } from "next";
import {
  bookSlot,
  cancelBooking,
  getBookedSlots,
  getSettings,
  getSlots,
  isValidEmail,
  isValidPhone,
  moveBooking,
  updateBooking,
  updateSettings,
} from "../../../lib/booking-store";

function pathParts(req: NextApiRequest): string[] {
  const raw = req.query.path;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") return [raw];
  return [];
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  const parts = pathParts(req);
  const joined = parts.join("/");
  const method = (req.method || "GET").toUpperCase();

  if (joined === "health" || joined === "which") {
    return res.status(200).json({
      status: "ok",
      app: "anticode-booking-demo",
      message: "Vercel booking API",
    });
  }

  if (joined === "settings" && method === "GET") {
    return res.status(200).json(getSettings());
  }

  if (joined === "slots" && method === "GET") {
    return res.status(200).json(getSlots());
  }

  if (joined === "book" && method === "POST") {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const phone = String(body.phone || "");
    const email = String(body.email || "");
    if (!isValidPhone(phone)) {
      return res.status(200).json({
        ok: false,
        error: "Érvényes telefonszámot adj meg (pl. +36 30 123 4567 vagy 06 30 123 4567).",
      });
    }
    if (!isValidEmail(email)) {
      return res.status(200).json({
        ok: false,
        error: "Érvényes e-mail címet adj meg (pl. pelda@email.hu).",
      });
    }
    const slotId = Number(body.slot_id);
    const ok = bookSlot(slotId, String(body.booking_name || ""), phone, email);
    return res.status(200).json({ ok, slot_id: slotId });
  }

  if (joined === "admin/bookings" && method === "GET") {
    return res.status(200).json(getBookedSlots());
  }

  if (joined === "admin/settings" && method === "GET") {
    return res.status(200).json(getSettings());
  }

  if (joined === "admin/settings" && method === "PATCH") {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const price_eur = Number(body.price_eur);
    const price_huf = Number(body.price_huf);
    if (Number.isFinite(price_eur) && price_eur < 0) {
      return res.status(200).json({ ok: false, error: "Az árak nem lehetnek negatívak." });
    }
    if (Number.isFinite(price_huf) && price_huf < 0) {
      return res.status(200).json({ ok: false, error: "Az árak nem lehetnek negatívak." });
    }
    const settings = updateSettings({
      price_eur: Number.isFinite(price_eur) ? price_eur : undefined,
      price_huf: Number.isFinite(price_huf) ? price_huf : undefined,
      schedule: body.schedule,
    });
    return res.status(200).json({ ok: true, settings });
  }

  if (parts[0] === "admin" && parts[1] === "bookings" && parts[2] && method === "PATCH") {
    const slotId = Number(parts[2]);
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const phone = String(body.phone || "");
    const email = String(body.email || "");
    if (!isValidPhone(phone)) {
      return res.status(200).json({ ok: false, error: "Érvényes telefonszámot adj meg." });
    }
    if (!isValidEmail(email)) {
      return res.status(200).json({ ok: false, error: "Érvényes e-mail címet adj meg." });
    }
    const name = String(body.booking_name || "");
    let ok: boolean;
    if (body.new_slot_id != null && Number(body.new_slot_id) !== slotId) {
      ok = moveBooking(slotId, Number(body.new_slot_id), name, phone, email);
    } else {
      ok = updateBooking(slotId, name, phone, email);
    }
    return res.status(200).json({ ok });
  }

  if (parts[0] === "admin" && parts[1] === "bookings" && parts[2] && method === "DELETE") {
    const ok = cancelBooking(Number(parts[2]));
    return res.status(200).json({ ok });
  }

  return res.status(404).json({ error: "Not found", path: joined });
}
