import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Public website-audit result API disabled — admin-only.
 */
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  return res.status(404).json({
    ok: false,
    error: "A publikus weboldal-ellenőrző jelenleg nem elérhető.",
  });
}
