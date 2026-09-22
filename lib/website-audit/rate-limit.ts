const hits = new Map<string, { count: number; resetAt: number }>();

/** Max audits per admin identity (or IP) per window. */
export function checkAuditRateLimit(
  key: string,
  limit = 8,
  windowMs = 15 * 60 * 1000
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const row = hits.get(key);
  if (!row || row.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (row.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((row.resetAt - now) / 1000)),
    };
  }
  row.count += 1;
  return { ok: true };
}

type CacheEntry = { at: number; auditId: string };
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000;

export function getCachedAuditId(normalizedUrl: string): string | null {
  const row = cache.get(normalizedUrl);
  if (!row) return null;
  if (Date.now() - row.at > CACHE_TTL_MS) {
    cache.delete(normalizedUrl);
    return null;
  }
  return row.auditId;
}

export function setCachedAuditId(normalizedUrl: string, auditId: string) {
  cache.set(normalizedUrl, { at: Date.now(), auditId });
}
