import type { CvApplicationDraft, CvApplicationRecord, CvLocale } from "./types";

/**
 * Architecture stub for future job-application email sending.
 * Uses the project's existing SMTP env pattern (see pages/api/contact.ts).
 * Does NOT invent credentials — send is disabled until SMTP_PASS is set
 * and an authenticated admin API is implemented.
 */
export function isCvSendConfigured(): boolean {
  return Boolean(process.env.SMTP_PASS && process.env.SMTP_PASS.length > 0);
}

export function validateApplicationDraft(
  draft: Partial<CvApplicationDraft>
): { ok: true; draft: CvApplicationDraft } | { ok: false; error: string } {
  const toEmail = String(draft.toEmail || "").trim();
  const companyName = String(draft.companyName || "").trim();
  const positionTitle = String(draft.positionTitle || "").trim();
  const subject = String(draft.subject || "").trim();
  const coverLetter = String(draft.coverLetter || "").trim();
  const locale = (draft.locale === "en" ? "en" : "hu") as CvLocale;

  if (!toEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail)) {
    return { ok: false, error: "Érvényes cél e-mail-cím szükséges." };
  }
  if (!companyName) {
    return { ok: false, error: "A cég neve kötelező." };
  }
  if (!positionTitle) {
    return { ok: false, error: "A pozíció neve kötelező." };
  }
  if (!subject) {
    return { ok: false, error: "A tárgy kötelező." };
  }
  if (!coverLetter || coverLetter.length < 20) {
    return { ok: false, error: "A kísérőlevél túl rövid." };
  }

  return {
    ok: true,
    draft: {
      toEmail,
      companyName,
      positionTitle,
      contactPerson: draft.contactPerson?.trim() || undefined,
      locale,
      subject,
      coverLetter,
      notes: draft.notes?.trim() || undefined,
    },
  };
}

/** Placeholder — full send flow ships in a later iteration. */
export function createDraftRecord(
  draft: CvApplicationDraft
): CvApplicationRecord {
  return {
    ...draft,
    id: `cvapp_${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    sentAt: null,
    status: "draft",
    error: null,
  };
}
