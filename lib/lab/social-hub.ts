import { newLabId, readJsonFile, writeJsonFile } from "./json-file-store";

export type SocialPlatformId = "meta" | "linkedin" | "x";

export type SocialDraft = {
  id: string;
  platform: SocialPlatformId;
  text: string;
  dryRun: true;
  status: "draft" | "dry_run_ok" | "blocked_no_creds";
  createdAt: string;
  resultNote: string;
};

type Store = { drafts: SocialDraft[] };
const FILE = "lab-social.json";

const PLATFORM_ENV: Record<SocialPlatformId, string[]> = {
  meta: ["META_APP_ID", "META_APP_SECRET"],
  linkedin: ["LINKEDIN_CLIENT_ID"],
  x: ["X_API_KEY"],
};

export function socialPlatformStatus(platform: SocialPlatformId): {
  platform: SocialPlatformId;
  configured: boolean;
  missing: string[];
  provenance: "real" | "unavailable";
} {
  const env = PLATFORM_ENV[platform];
  const missing = env.filter((k) => !process.env[k]?.trim());
  return {
    platform,
    configured: missing.length === 0,
    missing,
    provenance: missing.length ? "unavailable" : "real",
  };
}

export function listSocialPlatforms() {
  return (["meta", "linkedin", "x"] as SocialPlatformId[]).map(
    socialPlatformStatus
  );
}

function load(): Store {
  const s = readJsonFile<Store>(FILE, { drafts: [] });
  return { drafts: Array.isArray(s.drafts) ? s.drafts : [] };
}

export function listSocialDrafts(): SocialDraft[] {
  return load().drafts.slice(0, 50);
}

/**
 * Always dry-run. Never publishes externally from Lab.
 * Even with credentials we only simulate — no network call.
 */
export function createSocialDryRun(input: {
  platform: SocialPlatformId;
  text: string;
}): SocialDraft {
  const text = String(input.text || "").trim().slice(0, 2000);
  const statusInfo = socialPlatformStatus(input.platform);
  const now = new Date().toISOString();
  const draft: SocialDraft = {
    id: newLabId("social"),
    platform: input.platform,
    text,
    dryRun: true,
    status: statusInfo.configured ? "dry_run_ok" : "blocked_no_creds",
    createdAt: now,
    resultNote: statusInfo.configured
      ? "DRY-RUN OK — a poszt NEM ment ki. Lab alapból soha nem publikál."
      : `Nincs credential (${statusInfo.missing.join(", ")}) — dry-run leállítva, nincs külső hívás.`,
  };
  const store = load();
  store.drafts.unshift(draft);
  writeJsonFile(FILE, { drafts: store.drafts.slice(0, 100) });
  return draft;
}
