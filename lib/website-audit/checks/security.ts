import { finding } from "./helpers";
import type { AuditFinding } from "../types";

function parseSetCookie(headers: Record<string, string>): string[] {
  const raw =
    headers["set-cookie"] ||
    headers["Set-Cookie"] ||
    Object.entries(headers).find(([k]) => k.toLowerCase() === "set-cookie")?.[1];
  if (!raw) return [];
  // fetch may join multiple Set-Cookie with comma — imperfect but useful
  return raw.split(/,(?=[^;]+?=)/).map((s) => s.trim()).filter(Boolean);
}

export function checkSecurity(input: {
  startProtocol: string;
  finalProtocol: string;
  chain: string[];
  headers: Record<string, string>;
  tls: {
    ok: boolean | null;
    protocol: string | null;
    authorized: boolean | null;
    error: string | null;
  };
  mixedContentUrls: string[];
}): AuditFinding[] {
  const out: AuditFinding[] = [];
  const h = input.headers;

  if (input.startProtocol === "http:") {
    const httpsUpgrade = input.chain.some((u) => u.startsWith("https://"));
    out.push(
      finding({
        id: httpsUpgrade ? "http-to-https" : "http-only",
        category: "security",
        severity: httpsUpgrade ? "pass" : "critical",
        title: httpsUpgrade
          ? "HTTP → HTTPS átirányítás rendben"
          : "Nincs HTTPS átirányítás",
        detail: httpsUpgrade
          ? "A HTTP kérés HTTPS-re irányít."
          : "A kiinduló URL HTTP, és nem került át HTTPS-re. A forgalom titkosítatlan maradhat.",
        recommendation: httpsUpgrade
          ? null
          : "Állíts be állandó (301/308) HTTP→HTTPS átirányítást a szerveren vagy a CDN-en.",
        source: "http",
      })
    );
  }

  if (input.finalProtocol === "https:") {
    if (input.tls.ok) {
      out.push(
        finding({
          id: "tls-ok",
          category: "security",
          severity: "pass",
          title: "TLS tanúsítvány rendben",
          detail: input.tls.protocol
            ? `Protokoll: ${input.tls.protocol}`
            : "A tanúsítvány érvényesnek tűnik.",
          detectedValue: input.tls.protocol,
          source: "tls",
        })
      );
    } else {
      out.push(
        finding({
          id: "tls-fail",
          category: "security",
          severity: "critical",
          title: "TLS / SSL probléma",
          detail:
            input.tls.error ||
            "A TLS kapcsolat nem megbízható (lejárt, hibás lánc, vagy kapcsolat hiba).",
          recommendation:
            "Ellenőrizd a tanúsítvány érvényességét, a teljes láncot és a szerver TLS beállításait.",
          source: "tls",
        })
      );
    }
  } else {
    out.push(
      finding({
        id: "tls-no-https",
        category: "security",
        severity: "critical",
        title: "Nincs HTTPS",
        detail:
          "A végső URL nem HTTPS — a forgalom nincs titkosítva, a TLS tanúsítvány nem ellenőrizhető biztonságosan.",
        recommendation: "Kapcsold be a HTTPS-t érvényes tanúsítvánnyal, és irányíts át minden HTTP forgalmat.",
        source: "tls",
      })
    );
  }

  const headerChecks: Array<{
    id: string;
    header: string;
    title: string;
    missingSeverity: "info" | "low" | "medium";
    missingDetail: string;
    recommendation: string;
  }> = [
    {
      id: "hdr-csp",
      header: "content-security-policy",
      title: "Content-Security-Policy",
      missingSeverity: "medium",
      missingDetail:
        "A Content-Security-Policy header nem található. A CSP megfelelő konfiguráció esetén csökkentheti bizonyos tartalominjektálási támadások, például XSS következményeit. Hiánya önmagában nem jelenti, hogy az oldal „feltörhető”.",
      recommendation:
        "Vezess be fokozatosan egy Content-Security-Policy-t (először Report-Only módban), majd szűkítsd a script/style forrásokat.",
    },
    {
      id: "hdr-xfo",
      header: "x-frame-options",
      title: "X-Frame-Options",
      missingSeverity: "low",
      missingDetail:
        "Az X-Frame-Options header hiányzik. Clickjacking elleni védelmet a frame-ancestors CSP direktíva vagy az X-Frame-Options biztosítaná.",
      recommendation:
        "Állíts be X-Frame-Options: DENY / SAMEORIGIN értéket, vagy CSP frame-ancestors direktívát.",
    },
    {
      id: "hdr-cto",
      header: "x-content-type-options",
      title: "X-Content-Type-Options",
      missingSeverity: "low",
      missingDetail:
        "Az X-Content-Type-Options header hiányzik. A nosniff érték segít megelőzni a MIME sniffinget.",
      recommendation: "Állítsd be: X-Content-Type-Options: nosniff",
    },
    {
      id: "hdr-ref",
      header: "referrer-policy",
      title: "Referrer-Policy",
      missingSeverity: "info",
      missingDetail:
        "A Referrer-Policy header hiányzik. Ajánlott a referrer információ szabályozása (pl. strict-origin-when-cross-origin).",
      recommendation:
        "Állíts be Referrer-Policy-t, pl. strict-origin-when-cross-origin.",
    },
    {
      id: "hdr-hsts",
      header: "strict-transport-security",
      title: "Strict-Transport-Security",
      missingSeverity: "medium",
      missingDetail:
        "A Strict-Transport-Security (HSTS) header hiányzik. HTTPS oldalon a HSTS csökkenti a protokoll-downgrade kockázatát.",
      recommendation:
        "HTTPS esetén állíts be HSTS-t (pl. max-age=31536000; includeSubDomains), ha a teljes domain HTTPS-kész.",
    },
    {
      id: "hdr-permissions",
      header: "permissions-policy",
      title: "Permissions-Policy",
      missingSeverity: "info",
      missingDetail:
        "A Permissions-Policy header nem található. Ezzel korlátozhatók a böngésző funkciók (kamera, mikrofon, geolocation stb.).",
      recommendation:
        "Állíts be Permissions-Policy-t a nem szükséges funkciók tiltására.",
    },
  ];

  for (const check of headerChecks) {
    const value = h[check.header];
    if (value) {
      out.push(
        finding({
          id: check.id,
          category: "security",
          severity: "pass",
          title: `${check.title} jelen van`,
          detail: value.slice(0, 220),
          detectedValue: value.slice(0, 220),
          evidence: value,
          source: "http",
        })
      );
    } else {
      // HSTS only meaningful on HTTPS
      if (check.header === "strict-transport-security" && input.finalProtocol !== "https:") {
        out.push(
          finding({
            id: check.id,
            category: "security",
            severity: "info",
            status: "not_applicable",
            title: "HSTS nem értékelhető",
            detail: "A HSTS csak HTTPS válaszokon értelmezhető.",
            source: "http",
          })
        );
        continue;
      }
      out.push(
        finding({
          id: check.id,
          category: "security",
          severity: check.missingSeverity,
          title: `Hiányzó header: ${check.title}`,
          detail: check.missingDetail,
          recommendation: check.recommendation,
          source: "http",
        })
      );
    }
  }

  if (input.mixedContentUrls.length > 0) {
    out.push(
      finding({
        id: "mixed-content",
        category: "security",
        severity: "high",
        title: "Vegyes tartalom (mixed content)",
        detail: `HTTPS oldalon ${input.mixedContentUrls.length} http:// erőforrás hivatkozás található. A böngészők blokkolhatják vagy figyelmeztethetnek.`,
        recommendation:
          "Cseréld az összes http:// erőforrás-URL-t https://-re vagy protocol-relative URL-re.",
        detectedValue: input.mixedContentUrls.slice(0, 5).join(", "),
        evidence: input.mixedContentUrls.join("\n"),
        source: "static_html",
      })
    );
  } else if (input.finalProtocol === "https:") {
    out.push(
      finding({
        id: "mixed-content-ok",
        category: "security",
        severity: "pass",
        title: "Nincs nyilvánvaló mixed content",
        detail:
          "A HTML-ben nem találtunk http:// src/href hivatkozást. Dinamikus betöltés továbbra is lehetséges — ez statikus ellenőrzés.",
        source: "static_html",
      })
    );
  }

  const cookies = parseSetCookie(h);
  if (cookies.length === 0) {
    out.push(
      finding({
        id: "cookies-none",
        category: "security",
        severity: "info",
        status: "not_applicable",
        title: "Nincs Set-Cookie a válaszban",
        detail: "Az első HTML válaszban nem érkezett cookie — cookie flag ellenőrzés nem alkalmazható.",
        source: "http",
      })
    );
  } else {
    let insecure = 0;
    let noHttpOnly = 0;
    let noSameSite = 0;
    for (const c of cookies) {
      const lower = c.toLowerCase();
      if (input.finalProtocol === "https:" && !lower.includes("secure")) insecure += 1;
      if (!lower.includes("httponly")) noHttpOnly += 1;
      if (!lower.includes("samesite")) noSameSite += 1;
    }
    if (insecure > 0) {
      out.push(
        finding({
          id: "cookie-secure",
          category: "security",
          severity: "medium",
          title: "Cookie Secure flag hiányzik",
          detail: `${insecure} cookie HTTPS oldalon Secure flag nélkül érkezett. Ezek HTTP-n is továbbítódhatnak.`,
          recommendation: "Állítsd be a Secure flaget minden session/auth cookie-ra HTTPS-en.",
          detectedValue: `${insecure} / ${cookies.length}`,
          source: "http",
        })
      );
    } else if (input.finalProtocol === "https:") {
      out.push(
        finding({
          id: "cookie-secure-ok",
          category: "security",
          severity: "pass",
          title: "Cookie Secure flag rendben",
          detail: "A vizsgált cookie-k tartalmazzák a Secure flaget.",
          source: "http",
        })
      );
    }
    if (noHttpOnly > 0) {
      out.push(
        finding({
          id: "cookie-httponly",
          category: "security",
          severity: "medium",
          title: "Cookie HttpOnly flag hiányzik",
          detail: `${noHttpOnly} cookie nélkülözi az HttpOnly flaget — JavaScript hozzáférhet, ami XSS esetén kockázatos lehet session cookie-kra.`,
          recommendation: "Session/auth cookie-kra állítsd be az HttpOnly flaget.",
          detectedValue: `${noHttpOnly} / ${cookies.length}`,
          source: "http",
        })
      );
    } else {
      out.push(
        finding({
          id: "cookie-httponly-ok",
          category: "security",
          severity: "pass",
          title: "Cookie HttpOnly rendben",
          detail: "A vizsgált cookie-k tartalmazzák az HttpOnly flaget.",
          source: "http",
        })
      );
    }
    if (noSameSite > 0) {
      out.push(
        finding({
          id: "cookie-samesite",
          category: "security",
          severity: "low",
          title: "Cookie SameSite hiányzik",
          detail: `${noSameSite} cookie nem ad meg SameSite attribútumot. A SameSite segít a CSRF védelemben.`,
          recommendation: "Állíts be SameSite=Lax vagy Strict értéket a cookie-kra.",
          detectedValue: `${noSameSite} / ${cookies.length}`,
          source: "http",
        })
      );
    } else {
      out.push(
        finding({
          id: "cookie-samesite-ok",
          category: "security",
          severity: "pass",
          title: "Cookie SameSite rendben",
          detail: "A vizsgált cookie-k megadják a SameSite attribútumot.",
          source: "http",
        })
      );
    }
  }

  const server = h.server;
  const powered = h["x-powered-by"];
  if (server) {
    out.push(
      finding({
        id: "hdr-server",
        category: "security",
        severity: "info",
        title: "Server header jelen van",
        detail:
          "A Server header technológiai információt adhat ki. Önmagában ritkán kritikus, de érdemes minimalizálni a verziószámokat.",
        recommendation: "Ha lehetséges, távolítsd el vagy általánosítsd a Server headert.",
        detectedValue: server.slice(0, 120),
        source: "http",
      })
    );
  }
  if (powered) {
    out.push(
      finding({
        id: "hdr-x-powered-by",
        category: "security",
        severity: "low",
        title: "X-Powered-By kiszivárogtatás",
        detail:
          "Az X-Powered-By header technológiai stack információt ad ki (pl. framework), ami támadási felületet segíthet azonosítani.",
        recommendation: "Kapcsold ki / távolítsd el az X-Powered-By headert.",
        detectedValue: powered.slice(0, 120),
        source: "http",
      })
    );
  } else {
    out.push(
      finding({
        id: "hdr-x-powered-by-ok",
        category: "security",
        severity: "pass",
        title: "Nincs X-Powered-By",
        detail: "A válasz nem tartalmaz X-Powered-By headert.",
        source: "http",
      })
    );
  }

  out.push(
    finding({
      id: "security-disclaimer",
      category: "security",
      severity: "info",
      status: "pass",
      title: "Biztonsági audit korlát",
      detail:
        "A sikeres security ellenőrzések nem jelentik, hogy az oldal teljesen biztonságos. Ez automatikus, felületi ellenőrzés — nem penetrációs teszt.",
      source: "http",
    })
  );

  return out;
}
