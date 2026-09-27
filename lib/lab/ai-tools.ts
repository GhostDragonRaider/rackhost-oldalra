import { newLabId, readJsonFile, writeJsonFile } from "./json-file-store";
import type { DataProvenance } from "./integrity";

export type AiFinding = {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  detail: string;
};

export type AiRecommendation = {
  id: string;
  findingId: string;
  summary: string;
  before: string;
  after: string;
  approved: boolean;
};

export type AiSession = {
  id: string;
  createdAt: string;
  inputKind: "html" | "text";
  inputPreview: string;
  findings: AiFinding[];
  recommendations: AiRecommendation[];
  provenance: DataProvenance;
  source: string;
  note: string;
};

type Store = { sessions: AiSession[] };
const FILE = "lab-ai-sessions.json";

function load(): Store {
  const s = readJsonFile<Store>(FILE, { sessions: [] });
  return { sessions: Array.isArray(s.sessions) ? s.sessions : [] };
}

/**
 * Local heuristic detect — no external AI call.
 * If AI_API_KEY missing we still run heuristics and mark provenance accordingly.
 */
export function runAiDetect(input: string): AiSession {
  const raw = String(input || "").slice(0, 50_000);
  const hasKey = Boolean(process.env.AI_API_KEY?.trim());
  const findings: AiFinding[] = [];
  const recommendations: AiRecommendation[] = [];

  const lower = raw.toLowerCase();
  const hasTitle = /<title[^>]*>[^<]{3,}<\/title>/i.test(raw);
  const hasH1 = /<h1[\s>]/i.test(raw);
  const hasMetaDesc = /<meta[^>]+name=["']description["']/i.test(raw);
  const hasAltMissing = /<img(?![^>]*\balt=)[^>]*>/i.test(raw);

  if (raw.trim().length < 20) {
    findings.push({
      id: "empty",
      severity: "warning",
      title: "Üres vagy túl rövid bemenet",
      detail: "Adj meg HTML-t vagy szöveget az ellenőrzéshez.",
    });
  }

  if (lower.includes("<html") || lower.includes("<body") || lower.includes("<div")) {
    if (!hasTitle) {
      findings.push({
        id: "title",
        severity: "critical",
        title: "Hiányzó vagy túl rövid &lt;title&gt;",
        detail: "A böngésző fülén és a Google találatoknál a title jelenik meg.",
      });
      recommendations.push({
        id: newLabId("rec"),
        findingId: "title",
        summary: "Adj hozzá egy érthető title elemet.",
        before: "(nincs title)",
        after: "<title>Érthető oldalnév — AntiCode</title>",
        approved: false,
      });
    }
    if (!hasH1) {
      findings.push({
        id: "h1",
        severity: "warning",
        title: "Nincs H1 címsor",
        detail: "Minden oldalnak legyen egy fő címe (H1).",
      });
      recommendations.push({
        id: newLabId("rec"),
        findingId: "h1",
        summary: "Adj egy H1-et a fő üzenethez.",
        before: "(nincs H1)",
        after: "<h1>Fő üzenet ide</h1>",
        approved: false,
      });
    }
    if (!hasMetaDesc) {
      findings.push({
        id: "meta",
        severity: "warning",
        title: "Hiányzó meta description",
        detail: "A keresőtalálat alatti rövid szöveg hiányzik.",
      });
    }
    if (hasAltMissing) {
      findings.push({
        id: "alt",
        severity: "info",
        title: "Kép alt szöveg hiányozhat",
        detail: "Van olyan img, amin nincs alt — rossz a vakok / SEO számára.",
      });
    }
  } else {
    const words = raw.trim().split(/\s+/).filter(Boolean);
    if (words.length > 0 && words.length < 30) {
      findings.push({
        id: "short-copy",
        severity: "info",
        title: "Rövid szöveg",
        detail: `Csak ${words.length} szó — egy landingnél általában több kell.`,
      });
    }
    if (!/[.!?…]/.test(raw) && words.length > 5) {
      findings.push({
        id: "punctuation",
        severity: "info",
        title: "Nincs mondatzáró írásjel",
        detail: "Érdemes teljes mondatokban fogalmazni.",
      });
    }
  }

  if (!findings.length) {
    findings.push({
      id: "ok",
      severity: "info",
      title: "Helyi ellenőrzés nem talált tipikus hibát",
      detail: "Ez nem azt jelenti, hogy tökéletes — csak hogy a Lab heurisztika nem jelzett.",
    });
  }

  const session: AiSession = {
    id: newLabId("ai"),
    createdAt: new Date().toISOString(),
    inputKind: /<\w+/.test(raw) ? "html" : "text",
    inputPreview: raw.slice(0, 240),
    findings,
    recommendations,
    provenance: hasKey ? "estimated" : "estimated",
    source: hasKey
      ? "lab-ai-heuristics (AI_API_KEY jelen van, de külső hívás nincs — Approve kellene hozzá)"
      : "lab-ai-heuristics (AI_API_KEY hiányzik — külső modell UNAVAILABLE, helyi szabályok futottak)",
    note: hasKey
      ? "Külső AI hívás szándékosan nincs automatizálva. Először nézd meg a diffet, majd Approve."
      : "Nincs AI_API_KEY — külső modell nem hívható. A találatok helyi szabályokból jönnek (ESTIMATED).",
  };

  const store = load();
  store.sessions.unshift(session);
  writeJsonFile(FILE, { sessions: store.sessions.slice(0, 40) });
  return session;
}

export function listAiSessions(): AiSession[] {
  return load().sessions.slice(0, 20);
}

export function approveAiRecommendation(
  sessionId: string,
  recommendationId: string
): AiSession | null {
  const store = load();
  const session = store.sessions.find((s) => s.id === sessionId);
  if (!session) return null;
  const rec = session.recommendations.find((r) => r.id === recommendationId);
  if (!rec) return null;
  rec.approved = true;
  writeJsonFile(FILE, store);
  return session;
}
