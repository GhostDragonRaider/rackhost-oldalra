import type { NextApiRequest, NextApiResponse } from "next";
import { readSession } from "../../../lib/admin-auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Csak GET." });
  }
  const session = readSession(req);
  if (!session) {
    return res.status(401).json({ ok: false, authenticated: false });
  }
  return res.status(200).json({ ok: true, authenticated: true, user: session.u });
}
