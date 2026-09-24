import crypto from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

const COOKIE = "ac_admin_sess";
const SKIP_ANALYTICS_COOKIE = "ac_skip_analytics";
const MAX_AGE_SEC = 60 * 60 * 12; // 12 hours
const SKIP_ANALYTICS_MAX_AGE_SEC = 60 * 60 * 24 * 400; // ~13 months

type SessionPayload = {
  u: string;
  exp: number;
};

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!s || s.length < 8) {
    throw new Error("ADMIN_SESSION_SECRET (vagy ADMIN_PASSWORD) nincs beállítva.");
  }
  return s;
}

function b64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromB64url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function sign(payload: string): string {
  return b64url(crypto.createHmac("sha256", secret()).update(payload).digest());
}

function timingEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) {
    crypto.timingSafeEqual(ba, ba);
    return false;
  }
  return crypto.timingSafeEqual(ba, bb);
}

/** Length-independent string compare via SHA-256 digests. */
function safeEqualStr(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a, "utf8").digest();
  const hb = crypto.createHash("sha256").update(b, "utf8").digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function getAdminCredentials(): { user: string; password: string } {
  return {
    user: process.env.ADMIN_USER || "admin",
    password: process.env.ADMIN_PASSWORD || "",
  };
}

export function verifyCredentials(user: string, password: string): boolean {
  const creds = getAdminCredentials();
  if (!creds.password) return false;
  const userOk = safeEqualStr(user, creds.user);
  const passOk = safeEqualStr(password, creds.password);
  return userOk && passOk;
}

export function createSessionToken(username: string): string {
  const payload: SessionPayload = {
    u: username,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SEC,
  };
  const body = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  return `${body}.${sign(body)}`;
}

export function readSession(req: NextApiRequest): SessionPayload | null {
  const raw = req.cookies?.[COOKIE];
  if (!raw) return null;
  const [body, sig] = raw.split(".");
  if (!body || !sig) return null;
  if (!timingEqual(sig, sign(body))) return null;
  try {
    const payload = JSON.parse(fromB64url(body).toString("utf8")) as SessionPayload;
    if (!payload?.u || typeof payload.exp !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse
): SessionPayload | null {
  const session = readSession(req);
  if (!session) {
    res.status(401).json({ ok: false, error: "Nincs bejelentkezve." });
    return null;
  }
  return session;
}

export function setSessionCookie(
  res: NextApiResponse,
  token: string,
  req?: NextApiRequest
) {
  const secure = cookieSecureSuffix(req);
  res.setHeader("Set-Cookie", [
    `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${MAX_AGE_SEC}${secure}`,
    // Owner browser: do not count pageviews (kept after logout).
    `${SKIP_ANALYTICS_COOKIE}=1; Path=/; SameSite=Strict; Max-Age=${SKIP_ANALYTICS_MAX_AGE_SEC}${secure}`,
  ]);
}

export function clearSessionCookie(res: NextApiResponse, req?: NextApiRequest) {
  const secure = cookieSecureSuffix(req);
  // Keep ac_skip_analytics so the owner's own browsing still stays uncounted.
  res.setHeader(
    "Set-Cookie",
    `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`
  );
}

/** True when this request should not be counted as a public pageview. */
export function shouldSkipAnalytics(req: NextApiRequest): boolean {
  const cookies = req.cookies || {};
  if (cookies[SKIP_ANALYTICS_COOKIE] === "1") return true;
  if (cookies[COOKIE]) return true;
  return false;
}

/** Set Secure only on real HTTPS (or explicit override) so local `next start` over HTTP works. */
function cookieSecureSuffix(req?: NextApiRequest): string {
  if (process.env.ADMIN_COOKIE_SECURE === "true") return "; Secure";
  if (process.env.ADMIN_COOKIE_SECURE === "false") return "";
  const xf = req?.headers?.["x-forwarded-proto"];
  const proto =
    typeof xf === "string" ? xf.split(",")[0].trim().toLowerCase() : "";
  if (proto === "https") return "; Secure";
  return "";
}

/** Simple in-memory login rate limit per IP. */
const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const row = attempts.get(ip);
  if (!row || row.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (row.count >= 8) return false;
  row.count += 1;
  return true;
}

export function clientIp(req: NextApiRequest): string {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.length) return xf.split(",")[0].trim();
  return req.socket.remoteAddress || "unknown";
}
