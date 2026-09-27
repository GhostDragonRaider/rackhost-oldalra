import fs from "fs";
import path from "path";
import { measuredReal, measuredUnavailable, type MeasuredValue } from "./integrity";

export type SecurityCheckResult = {
  id: string;
  title: string;
  status: "pass" | "fail" | "warn" | "unavailable";
  detail: string;
  provenance: MeasuredValue<unknown>["provenance"];
  source: string;
  measuredAt: string;
};

function envPresent(name: string): boolean {
  const v = process.env[name];
  return Boolean(v && String(v).trim());
}

export function runSecurityCenterChecks(): {
  checkedAt: string;
  checks: SecurityCheckResult[];
  score: MeasuredValue<number>;
} {
  const checkedAt = new Date().toISOString();
  const checks: SecurityCheckResult[] = [];

  const push = (
    id: string,
    title: string,
    ok: boolean,
    detail: string,
    source: string,
    warn = false
  ) => {
    checks.push({
      id,
      title,
      status: ok ? "pass" : warn ? "warn" : "fail",
      detail,
      provenance: "real",
      source,
      measuredAt: checkedAt,
    });
  };

  push(
    "admin-password",
    "ADMIN_PASSWORD beállítva",
    envPresent("ADMIN_PASSWORD") && (process.env.ADMIN_PASSWORD || "").length >= 12,
    envPresent("ADMIN_PASSWORD")
      ? (process.env.ADMIN_PASSWORD || "").length >= 12
        ? "Jelszó hossz ≥ 12."
        : "Jelszó túl rövid (<12)."
      : "ADMIN_PASSWORD hiányzik.",
    "process.env"
  );

  push(
    "session-secret",
    "ADMIN_SESSION_SECRET vagy jelszó session signinghez",
    envPresent("ADMIN_SESSION_SECRET") || envPresent("ADMIN_PASSWORD"),
    envPresent("ADMIN_SESSION_SECRET")
      ? "Külön session secret van."
      : "Session signing az ADMIN_PASSWORD-ra támaszkodik.",
    "process.env",
    !envPresent("ADMIN_SESSION_SECRET")
  );

  const nextConfigPath = path.join(process.cwd(), "next.config.js");
  let headersOk = false;
  let headersDetail = "next.config.js nem olvasható";
  try {
    const raw = fs.readFileSync(nextConfigPath, "utf8");
    const needed = [
      "Content-Security-Policy",
      "Strict-Transport-Security",
      "X-Frame-Options",
      "X-Content-Type-Options",
      "Referrer-Policy",
    ];
    const missing = needed.filter((h) => !raw.includes(h));
    headersOk = missing.length === 0;
    headersDetail = headersOk
      ? "Security headers jelen vannak a next.config.js-ben."
      : `Hiányzó header kulcsok a konfigban: ${missing.join(", ")}`;
  } catch (e) {
    headersDetail = e instanceof Error ? e.message : "Olvasási hiba";
  }
  push("security-headers-config", "Security headers (Next config)", headersOk, headersDetail, "next.config.js");

  const ssrfPath = path.join(process.cwd(), "lib/website-audit/ssrf.ts");
  push(
    "ssrf-module",
    "SSRF védelmi modul jelen",
    fs.existsSync(ssrfPath),
    fs.existsSync(ssrfPath)
      ? "lib/website-audit/ssrf.ts elérhető."
      : "SSRF modul hiányzik.",
    "filesystem"
  );

  const robotsPath = path.join(process.cwd(), "public/robots.txt");
  let robotsOk = false;
  let robotsDetail = "robots.txt hiányzik";
  try {
    const robots = fs.readFileSync(robotsPath, "utf8");
    robotsOk = /Disallow:\s*\/admin/i.test(robots);
    robotsDetail = robotsOk
      ? "robots.txt Disallow: /admin jelen van."
      : "robots.txt nem tiltja az /admin útvonalat.";
  } catch {
    /* keep defaults */
  }
  push("robots-admin", "Admin robots tiltás", robotsOk, robotsDetail, "public/robots.txt");

  const sitemapPath = path.join(process.cwd(), "public/sitemap.xml");
  let sitemapOk = false;
  let sitemapDetail = "sitemap.xml hiányzik";
  try {
    const sm = fs.readFileSync(sitemapPath, "utf8");
    const leaks = sm.includes("/admin") || sm.includes("/lab");
    sitemapOk = !leaks;
    sitemapDetail = leaks
      ? "A sitemap admin/lab URL-t tartalmaz — javítandó."
      : "A sitemap nem tartalmaz admin/lab URL-t.";
  } catch {
    /* */
  }
  push("sitemap-no-admin", "Sitemap nem tartalmaz Lab/Admin URL-t", sitemapOk, sitemapDetail, "public/sitemap.xml");

  const dataDir = path.join(process.cwd(), "data");
  push(
    "data-dir",
    "Adattár a webrooton kívül (./data)",
    fs.existsSync(dataDir),
    fs.existsSync(dataDir)
      ? "data/ létezik (JSON store)."
      : "data/ még nincs létrehozva.",
    "filesystem",
    !fs.existsSync(dataDir)
  );

  const privateCv = path.join(process.cwd(), "private/cv");
  push(
    "private-cv",
    "CV fotó private/ alatt",
    fs.existsSync(privateCv),
    fs.existsSync(privateCv)
      ? "private/cv jelen van."
      : "private/cv hiányzik.",
    "filesystem",
    !fs.existsSync(privateCv)
  );

  // Score only from pass/fail among measurable checks — never invent
  const measurable = checks.filter((c) => c.status === "pass" || c.status === "fail");
  const passed = measurable.filter((c) => c.status === "pass").length;
  const score: MeasuredValue<number> =
    measurable.length === 0
      ? measuredUnavailable("Nincs mérhető security check.", "security-center")
      : measuredReal(
          Math.round((passed / measurable.length) * 100),
          `security-center:${passed}/${measurable.length}`
        );

  return { checkedAt, checks, score };
}
