import dns from "dns/promises";
import net from "net";
import { lookup as dnsLookupCallback } from "dns";
import { promisify } from "util";

const dnsLookup = promisify(dnsLookupCallback) as (
  hostname: string,
  options: { all: true; family?: number }
) => Promise<Array<{ address: string; family: number }>>;

export type SsrfValidationResult =
  | { ok: true; url: URL; normalized: string }
  | { ok: false; error: string };

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata",
  "instance-data",
]);

function isPrivateOrReservedIpv4(ip: string): boolean {
  const parts = ip.split(".").map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return true;
  }
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true; // link-local / cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // multicast / reserved
  return false;
}

function isPrivateOrReservedIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === "::1") return true;
  if (normalized === "::") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // ULA
  if (normalized.startsWith("fe80")) return true; // link-local
  if (normalized.startsWith("ff")) return true; // multicast
  // IPv4-mapped
  if (normalized.includes(".")) {
    const v4 = normalized.split(":").pop() || "";
    if (net.isIP(v4) === 4) return isPrivateOrReservedIpv4(v4);
  }
  return false;
}

export function isBlockedIp(ip: string): boolean {
  const version = net.isIP(ip);
  if (version === 4) return isPrivateOrReservedIpv4(ip);
  if (version === 6) return isPrivateOrReservedIpv6(ip);
  return true;
}

export function validateAuditUrlInput(raw: string): SsrfValidationResult {
  const trimmed = String(raw || "").trim();
  if (!trimmed) {
    return { ok: false, error: "Adj meg egy URL-t." };
  }
  if (trimmed.length > 2048) {
    return { ok: false, error: "Az URL túl hosszú (max. 2048 karakter)." };
  }

  let candidate = trimmed;
  if (
    /:\/\//.test(candidate) &&
    !/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(candidate)
  ) {
    return { ok: false, error: "Érvénytelen URL formátum." };
  }
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return { ok: false, error: "Érvénytelen URL formátum." };
  }

  // Reject hostnames with illegal characters (e.g. ht!tp://… after auto-prefix)
  if (/[^a-z0-9.-]/i.test(url.hostname.replace(/^\[|\]$/g, ""))) {
    if (net.isIP(url.hostname.replace(/^\[|\]$/g, "")) === 0) {
      return { ok: false, error: "Érvénytelen hosztnév az URL-ben." };
    }
  }

  const protocol = url.protocol.toLowerCase();
  if (protocol === "file:" || protocol === "ftp:" || protocol === "data:") {
    return { ok: false, error: "Csak http és https URL engedélyezett." };
  }
  if (protocol !== "http:" && protocol !== "https:") {
    return { ok: false, error: "Csak http és https URL engedélyezett." };
  }

  if (url.username || url.password) {
    return { ok: false, error: "Felhasználónév/jelszó az URL-ben nem engedélyezett." };
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!hostname) {
    return { ok: false, error: "Hiányzó hosztnév." };
  }
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return { ok: false, error: "Ez a cím biztonsági okból nem ellenőrizhető." };
  }
  if (hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    return { ok: false, error: "Belső / helyi hosztnév nem ellenőrizhető." };
  }

  if (net.isIP(hostname)) {
    if (isBlockedIp(hostname)) {
      return { ok: false, error: "Privát vagy foglalt IP-cím nem ellenőrizhető." };
    }
  }

  // Normalize: strip hash, keep query
  url.hash = "";
  return { ok: true, url, normalized: url.toString() };
}

/** Resolve hostname and reject if any address is private/reserved. */
export async function assertPublicHostname(hostname: string): Promise<void> {
  const host = hostname.replace(/^\[|\]$/g, "");
  if (net.isIP(host)) {
    if (isBlockedIp(host)) {
      throw new Error("Privát vagy foglalt IP-cím nem ellenőrizhető.");
    }
    return;
  }

  let records: Array<{ address: string; family: number }>;
  try {
    records = await dnsLookup(host, { all: true });
  } catch {
    // Fallback to dns.resolve*
    try {
      const [v4, v6] = await Promise.all([
        dns.resolve4(host).catch(() => [] as string[]),
        dns.resolve6(host).catch(() => [] as string[]),
      ]);
      records = [
        ...v4.map((address) => ({ address, family: 4 })),
        ...v6.map((address) => ({ address, family: 6 })),
      ];
    } catch {
      throw new Error("A domain nem oldható fel (DNS hiba).");
    }
  }

  if (!records.length) {
    throw new Error("A domain nem oldható fel (nincs DNS rekord).");
  }

  for (const row of records) {
    if (isBlockedIp(row.address)) {
      throw new Error(
        "A hosztnév privát vagy foglalt IP-re mutat — az ellenőrzés biztonsági okból leállt."
      );
    }
  }
}

export async function validateAndResolveAuditUrl(
  raw: string
): Promise<SsrfValidationResult> {
  const base = validateAuditUrlInput(raw);
  if (!base.ok) return base;
  try {
    await assertPublicHostname(base.url.hostname);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "DNS ellenőrzés sikertelen.",
    };
  }
  return base;
}
