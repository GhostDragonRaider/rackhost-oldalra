import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "../../../../lib/admin-auth";
import {
  deleteLabForm,
  getLabForm,
  listLabForms,
  listLabFormSubmissions,
  saveLabForm,
  submitLabForm,
  updateLabSubmissionStatus,
  type LabFormSubmission,
} from "../../../../lib/lab/forms-store";

const SUBMISSION_STATUSES = new Set<LabFormSubmission["status"]>([
  "new",
  "contacted",
  "archived",
]);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAdmin(req, res)) return;

  try {
    if (req.method === "GET") {
      const formId = String(req.query.formId || "").trim();
      const forms = listLabForms();
      const submissions = listLabFormSubmissions(formId || undefined);
      const selected = formId ? getLabForm(formId) : forms[0] || null;
      return res.status(200).json({
        ok: true,
        forms,
        form: selected,
        submissions,
      });
    }

    if (req.method === "POST") {
      const action = String(req.body?.action || "save").trim();

      if (action === "save") {
        const form = saveLabForm({
          id: req.body?.id,
          name: req.body?.name,
          description: req.body?.description,
          fields: req.body?.fields,
        });
        return res.status(200).json({ ok: true, form, forms: listLabForms() });
      }

      if (action === "submit") {
        const formId = String(req.body?.formId || "").trim();
        const answers =
          (req.body?.answers as Record<
            string,
            string | boolean | number | undefined
          >) || {};
        const submission = submitLabForm(formId, answers, "lab-preview");
        return res.status(200).json({
          ok: true,
          submission,
          submissions: listLabFormSubmissions(formId),
        });
      }

      if (action === "delete") {
        const id = String(req.body?.id || "").trim();
        if (!id) {
          return res.status(400).json({ ok: false, error: "Hiányzó azonosító." });
        }
        const deleted = deleteLabForm(id);
        if (!deleted) {
          return res.status(404).json({ ok: false, error: "Nincs ilyen űrlap." });
        }
        return res.status(200).json({ ok: true, forms: listLabForms() });
      }

      if (action === "submission-status") {
        const id = String(req.body?.id || "").trim();
        const status = String(
          req.body?.status || ""
        ).trim() as LabFormSubmission["status"];
        if (!id || !SUBMISSION_STATUSES.has(status)) {
          return res.status(400).json({ ok: false, error: "Érvénytelen kérés." });
        }
        const updated = updateLabSubmissionStatus(id, status);
        if (!updated) {
          return res
            .status(404)
            .json({ ok: false, error: "Nincs ilyen beküldés." });
        }
        return res.status(200).json({
          ok: true,
          submission: updated,
          submissions: listLabFormSubmissions(updated.formId),
        });
      }

      return res.status(400).json({ ok: false, error: "Ismeretlen művelet." });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Nem engedélyezett." });
  } catch (err) {
    return res.status(400).json({
      ok: false,
      error: err instanceof Error ? err.message : "Űrlap hiba.",
    });
  }
}
