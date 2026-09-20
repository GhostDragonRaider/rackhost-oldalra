import type { NextApiRequest, NextApiResponse } from "next";
import {
  checkLoginRateLimit,
  clearSessionCookie,
  clientIp,
  createSessionToken,
  setSessionCookie,
  verifyCredentials,
} from "../../../lib/admin-auth";

function bad(res: NextApiResponse, status: number, error: string) {
  return res.status(status).json({ ok: false, error });
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const ip = clientIp(req);
    if (!checkLoginRateLimit(ip)) {
      return bad(res, 429, "Túl sok próbálkozás. Próbáld újra 15 perc múlva.");
    }

    const user = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "");

    if (!process.env.ADMIN_PASSWORD) {
      return bad(res, 503, "Az admin belépés nincs konfigurálva a szerveren.");
    }

    if (!verifyCredentials(user, password)) {
      return bad(res, 401, "Hibás felhasználónév vagy jelszó.");
    }

    const token = createSessionToken(user);
    setSessionCookie(res, token);
    return res.status(200).json({ ok: true, user });
  }

  if (req.method === "DELETE") {
    clearSessionCookie(res);
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "POST, DELETE");
  return bad(res, 405, "Nem engedélyezett metódus.");
}
