import { finding } from "./helpers";
import type { AuditFinding } from "../types";

export function checkAvailability(input: {
  status: number;
  ms: number;
  chain: string[];
  truncated: boolean;
  error?: string;
  maxRedirects: number;
  maxBodyBytes: number;
}): AuditFinding[] {
  const out: AuditFinding[] = [];
  const { status, ms, chain, truncated, error, maxBodyBytes } = input;

  if (error && (status === 0 || /redirect|átirányítás/i.test(error))) {
    out.push(
      finding({
        id: "redirect-error",
        category: "availability",
        severity: "critical",
        title: "Átirányítási hiba",
        detail: error,
        recommendation:
          "Ellenőrizd a Location headereket és a redirect célt — privát/internal cél tiltott.",
        source: "http",
      })
    );
  }

  if (chain.length > 3) {
    out.push(
      finding({
        id: "redirect-chain-long",
        category: "availability",
        severity: "medium",
        title: "Hosszú redirect lánc",
        detail: `${chain.length} lépés a végső URL-ig. A hosszú lánc lassíthatja a betöltést és bonyolítja a SEO jelek követését.`,
        recommendation:
          "Csökkentsd 1–2 lépésre a redirect láncot (pl. közvetlen HTTPS cél).",
        detectedValue: chain.join(" → "),
        evidence: chain.join(" → "),
        source: "http",
      })
    );
  }

  if (truncated) {
    out.push(
      finding({
        id: "body-too-large",
        category: "availability",
        severity: "medium",
        title: "Túl nagy válasz — részleges elemzés",
        detail: `A válasz meghaladta a ${maxBodyBytes} bájtos biztonsági limitet; a HTML-elemzés részleges lehet.`,
        recommendation:
          "Csökkentsd a HTML válaszméretét, vagy válaszd szét a tartalmat.",
        source: "http",
      })
    );
  }

  if (status === 0) {
    out.push(
      finding({
        id: "fetch-failed",
        category: "availability",
        severity: "critical",
        title: "Az oldal nem érhető el",
        detail: error || "Hálózati / időtúllépési / DNS hiba.",
        recommendation:
          "Ellenőrizd a DNS-t, a szerver elérhetőségét és a tűzfal szabályokat.",
        source: "http",
      })
    );
  } else if (status >= 500) {
    out.push(
      finding({
        id: "status-5xx",
        category: "availability",
        severity: "critical",
        title: `Szerverhiba (HTTP ${status})`,
        detail: "Az oldal 5xx választ adott — a tartalom nem megbízhatóan elérhető.",
        recommendation:
          "Vizsgáld a szerver / alkalmazás naplókat, és javítsd a hibát.",
        detectedValue: String(status),
        source: "http",
      })
    );
  } else if (status === 404) {
    out.push(
      finding({
        id: "status-404",
        category: "availability",
        severity: "critical",
        title: "404 — az oldal nem található",
        detail: "A végleges URL 404-et adott.",
        recommendation:
          "Javítsd a URL-t, állíts be megfelelő redirectet, vagy állítsd helyre az oldalt.",
        detectedValue: "404",
        source: "http",
      })
    );
  } else if (status >= 400) {
    out.push(
      finding({
        id: "status-4xx",
        category: "availability",
        severity: "high",
        title: `HTTP ${status}`,
        detail: "Az oldal hibás kliensválaszt adott (4xx).",
        recommendation: "Vizsgáld a jogosultságot, a URL-t és a szerver válaszát.",
        detectedValue: String(status),
        source: "http",
      })
    );
  } else {
    out.push(
      finding({
        id: "status-ok",
        category: "availability",
        severity: "pass",
        title: `Elérhető (HTTP ${status})`,
        detail: `Válaszidő (redirectekkel együtt): ${ms} ms`,
        detectedValue: `HTTP ${status} · ${ms} ms`,
        source: "http",
      })
    );
  }

  return out;
}
