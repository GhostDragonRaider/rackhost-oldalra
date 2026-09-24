import fs from "fs";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../../lib/admin-auth";

const PHOTO_PATH = path.join(
  process.cwd(),
  "private",
  "cv",
  "Milei_Sandor_Antal_CV_foto.png"
);

/**
 * Serves the CV portrait only to authenticated admins.
 * File lives outside /public so it is not statically crawlable.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Nem engedélyezett metódus." });
  }

  if (!requireAdmin(req, res)) return;

  if (!fs.existsSync(PHOTO_PATH)) {
    return res.status(404).json({ ok: false, error: "Fénykép nem található." });
  }

  const buf = fs.readFileSync(PHOTO_PATH);
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return res.status(200).send(buf);
}
