import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type {
  LabFormDefinition,
  LabFormField,
  LabFormFieldType,
  LabFormSubmission,
} from "../../../lib/lab/forms-store";
import { ProvenanceBadge } from "./LabShell";

function isFieldVisible(
  field: LabFormField,
  answers: Record<string, string | boolean | number | undefined>
): boolean {
  if (!field.showIf) return true;
  return answers[field.showIf.fieldId] === field.showIf.equals;
}

const FIELD_TYPE_OPTIONS: Array<{ value: LabFormFieldType; label: string }> = [
  { value: "text", label: "Szöveg" },
  { value: "email", label: "E-mail" },
  { value: "textarea", label: "Hosszú szöveg" },
  { value: "select", label: "Lista" },
  { value: "checkbox", label: "Jelölőnégyzet" },
];

const emptyField = (): LabFormField => ({
  id: "",
  label: "Új mező",
  type: "text",
  required: false,
});

type FormsFlowsPanelProps = {
  bumpIdle: () => void;
};

export default function FormsFlowsPanel({ bumpIdle }: FormsFlowsPanelProps) {
  const [forms, setForms] = useState<LabFormDefinition[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<LabFormDefinition | null>(null);
  const [answers, setAnswers] = useState<
    Record<string, string | boolean | number>
  >({});
  const [submissions, setSubmissions] = useState<LabFormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"builder" | "preview" | "submissions">(
    "preview"
  );

  const load = useCallback(async (formId?: string) => {
    setError("");
    const qs = formId ? `?formId=${encodeURIComponent(formId)}` : "";
    const res = await fetch(`/api/admin/lab/forms${qs}`, {
      credentials: "same-origin",
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data.error || "Űrlapok betöltése sikertelen.");
      return;
    }
    setForms(data.forms || []);
    setSubmissions(data.submissions || []);
    const form = (data.form as LabFormDefinition | null) || data.forms?.[0] || null;
    if (form) {
      setSelectedId(form.id);
      setDraft(structuredClone(form));
      setAnswers({});
    } else {
      setSelectedId("");
      setDraft(null);
    }
  }, []);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  const visibleFields = useMemo(() => {
    if (!draft) return [];
    return draft.fields.filter((f) => isFieldVisible(f, answers));
  }, [draft, answers]);

  function selectForm(id: string) {
    bumpIdle();
    setSelectedId(id);
    setMsg("");
    setError("");
    setLoading(true);
    void load(id).finally(() => setLoading(false));
  }

  function startNew() {
    bumpIdle();
    const now = new Date().toISOString();
    setDraft({
      id: "",
      name: "Új űrlap",
      description: "",
      updatedAt: now,
      fields: [
        { id: "name", label: "Név", type: "text", required: true },
        { id: "email", label: "E-mail", type: "email", required: true },
        { id: "message", label: "Üzenet", type: "textarea", required: true },
      ],
    });
    setSelectedId("");
    setAnswers({});
    setTab("builder");
    setMsg("Új űrlap szerkesztése — mentsd el a létrehozáshoz.");
  }

  function updateField(index: number, patch: Partial<LabFormField>) {
    if (!draft) return;
    const fields = draft.fields.map((f, i) =>
      i === index ? { ...f, ...patch } : f
    );
    setDraft({ ...draft, fields });
  }

  function moveField(index: number, dir: -1 | 1) {
    if (!draft) return;
    const target = index + dir;
    if (target < 0 || target >= draft.fields.length) return;
    const fields = [...draft.fields];
    const tmp = fields[index];
    fields[index] = fields[target];
    fields[target] = tmp;
    setDraft({ ...draft, fields });
  }

  async function saveDraft() {
    if (!draft) return;
    bumpIdle();
    setSaving(true);
    setError("");
    setMsg("");
    try {
      const res = await fetch("/api/admin/lab/forms", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          id: draft.id || undefined,
          name: draft.name,
          description: draft.description,
          fields: draft.fields,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Mentés sikertelen.");
        return;
      }
      setForms(data.forms || []);
      setDraft(data.form);
      setSelectedId(data.form.id);
      setMsg("Űrlap elmentve.");
      await load(data.form.id);
    } catch {
      setError("Hálózati hiba a mentéskor.");
    } finally {
      setSaving(false);
    }
  }

  async function removeForm() {
    if (!draft?.id) return;
    if (!window.confirm(`Törlöd a(z) „${draft.name}” űrlapot?`)) return;
    bumpIdle();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/lab/forms", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id: draft.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Törlés sikertelen.");
        return;
      }
      setMsg("Űrlap törölve.");
      await load();
    } catch {
      setError("Hálózati hiba a törléskor.");
    } finally {
      setSaving(false);
    }
  }

  async function onPreviewSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft?.id) {
      setError("Előbb mentsd el az űrlapot, majd próbáld a beküldést.");
      return;
    }
    bumpIdle();
    setSubmitting(true);
    setError("");
    setMsg("");
    try {
      const res = await fetch("/api/admin/lab/forms", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          formId: draft.id,
          answers,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Beküldés sikertelen.");
        return;
      }
      setSubmissions(data.submissions || []);
      setAnswers({});
      setMsg("Teszt beküldés elmentve a lead listába.");
      setTab("submissions");
    } catch {
      setError("Hálózati hiba a beküldéskor.");
    } finally {
      setSubmitting(false);
    }
  }

  async function setSubmissionStatus(
    id: string,
    status: LabFormSubmission["status"]
  ) {
    bumpIdle();
    try {
      const res = await fetch("/api/admin/lab/forms", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submission-status", id, status }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Státusz mentése sikertelen.");
        return;
      }
      setSubmissions(data.submissions || []);
    } catch {
      setError("Hálózati hiba a státusz mentésekor.");
    }
  }

  if (loading && !draft) {
    return <p className="lab-muted">Űrlapok betöltése…</p>;
  }

  return (
    <div className="lab-grid lab-forms">
      <aside className="lab-card lab-card--sm">
        <div className="lab-forms__aside-head">
          <h2>Űrlapok</h2>
          <button type="button" className="lab-btn lab-btn--primary" onClick={startNew}>
            Új
          </button>
        </div>
        {!forms.length ? (
          <p className="lab-muted">Még nincs űrlap. Hozz létre egyet.</p>
        ) : (
          <ul className="lab-forms__list">
            {forms.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  className={`lab-forms__item${
                    selectedId === f.id ? " is-active" : ""
                  }`}
                  onClick={() => selectForm(f.id)}
                >
                  <strong>{f.name}</strong>
                  <span>{f.fields.length} mező</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="lab-muted" style={{ marginTop: 12 }}>
          <ProvenanceBadge provenance="real" /> lab-forms.json
        </p>
      </aside>

      <section className="lab-card lab-card--wide">
        {!draft ? (
          <div className="lab-empty">Válassz vagy hozz létre egy űrlapot.</div>
        ) : (
          <>
            <header className="lab-forms__head">
              <div>
                <p className="lab-kicker">Forms & Flows</p>
                <h2>{draft.name || "Űrlap"}</h2>
                <p className="lab-muted">
                  Feltételes mezők, élő előnézet és lead mentés.
                </p>
              </div>
              <div className="lab-main__actions">
                <button
                  type="button"
                  className={`lab-ghost${tab === "builder" ? " is-active" : ""}`}
                  onClick={() => setTab("builder")}
                >
                  Szerkesztő
                </button>
                <button
                  type="button"
                  className={`lab-ghost${tab === "preview" ? " is-active" : ""}`}
                  onClick={() => setTab("preview")}
                >
                  Előnézet
                </button>
                <button
                  type="button"
                  className={`lab-ghost${
                    tab === "submissions" ? " is-active" : ""
                  }`}
                  onClick={() => setTab("submissions")}
                >
                  Beküldések ({submissions.length})
                </button>
              </div>
            </header>

            {error ? (
              <p className="admin-error" role="alert">
                {error}
              </p>
            ) : null}
            {msg ? <p className="lab-muted">{msg}</p> : null}

            {tab === "builder" ? (
              <div className="lab-form">
                <label>
                  Név
                  <input
                    value={draft.name}
                    onChange={(e) =>
                      setDraft({ ...draft, name: e.target.value })
                    }
                  />
                </label>
                <label>
                  Leírás
                  <textarea
                    rows={2}
                    value={draft.description}
                    onChange={(e) =>
                      setDraft({ ...draft, description: e.target.value })
                    }
                  />
                </label>

                <div className="lab-forms__fields">
                  <div className="lab-forms__aside-head">
                    <h3>Mezők</h3>
                    <button
                      type="button"
                      className="lab-ghost"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          fields: [...draft.fields, emptyField()],
                        })
                      }
                    >
                      Mező hozzáadása
                    </button>
                  </div>

                  {draft.fields.map((field, index) => (
                    <div key={`${field.id}-${index}`} className="lab-forms__field-row">
                      <label>
                        Címke
                        <input
                          value={field.label}
                          onChange={(e) =>
                            updateField(index, { label: e.target.value })
                          }
                        />
                      </label>
                      <label>
                        Azonosító
                        <input
                          value={field.id}
                          onChange={(e) =>
                            updateField(index, { id: e.target.value })
                          }
                          placeholder="pl. service"
                        />
                      </label>
                      <label>
                        Típus
                        <select
                          value={field.type}
                          onChange={(e) =>
                            updateField(index, {
                              type: e.target.value as LabFormFieldType,
                            })
                          }
                        >
                          {FIELD_TYPE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="lab-forms__check">
                        <input
                          type="checkbox"
                          checked={Boolean(field.required)}
                          onChange={(e) =>
                            updateField(index, { required: e.target.checked })
                          }
                        />
                        Kötelező
                      </label>
                      {field.type === "select" ? (
                        <label className="lab-forms__span">
                          Opciók (vesszővel)
                          <input
                            value={(field.options || []).join(", ")}
                            onChange={(e) =>
                              updateField(index, {
                                options: e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              })
                            }
                          />
                        </label>
                      ) : null}
                      <label>
                        Feltétel mező
                        <select
                          value={field.showIf?.fieldId || ""}
                          onChange={(e) => {
                            const fieldId = e.target.value;
                            if (!fieldId) {
                              updateField(index, { showIf: undefined });
                              return;
                            }
                            updateField(index, {
                              showIf: {
                                fieldId,
                                equals: field.showIf?.equals ?? "",
                              },
                            });
                          }}
                        >
                          <option value="">— mindig látszik —</option>
                          {draft.fields
                            .filter((_, i) => i !== index)
                            .map((f) => (
                              <option key={f.id || f.label} value={f.id}>
                                {f.label} ({f.id || "?"})
                              </option>
                            ))}
                        </select>
                      </label>
                      {field.showIf ? (
                        <label>
                          Egyenlő ezzel
                          <input
                            value={String(field.showIf.equals ?? "")}
                            onChange={(e) =>
                              updateField(index, {
                                showIf: {
                                  fieldId: field.showIf!.fieldId,
                                  equals: e.target.value,
                                },
                              })
                            }
                          />
                        </label>
                      ) : null}
                      <div className="lab-forms__field-actions">
                        <button
                          type="button"
                          className="lab-ghost"
                          onClick={() => moveField(index, -1)}
                          disabled={index === 0}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="lab-ghost"
                          onClick={() => moveField(index, 1)}
                          disabled={index === draft.fields.length - 1}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className="lab-btn lab-btn--danger"
                          onClick={() =>
                            setDraft({
                              ...draft,
                              fields: draft.fields.filter((_, i) => i !== index),
                            })
                          }
                        >
                          Törlés
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="lab-main__actions">
                  <button
                    type="button"
                    className="lab-btn lab-btn--primary"
                    disabled={saving}
                    onClick={() => void saveDraft()}
                  >
                    {saving ? "Mentés…" : "Űrlap mentése"}
                  </button>
                  {draft.id ? (
                    <button
                      type="button"
                      className="lab-btn lab-btn--danger"
                      disabled={saving}
                      onClick={() => void removeForm()}
                    >
                      Űrlap törlése
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}

            {tab === "preview" ? (
              <form className="lab-form" onSubmit={onPreviewSubmit}>
                {draft.description ? (
                  <p className="lab-muted">{draft.description}</p>
                ) : null}
                {visibleFields.map((field) => {
                  if (field.type === "checkbox") {
                    return (
                      <label key={field.id} className="lab-forms__check">
                        <input
                          type="checkbox"
                          checked={Boolean(answers[field.id])}
                          onChange={(e) =>
                            setAnswers({
                              ...answers,
                              [field.id]: e.target.checked,
                            })
                          }
                        />
                        {field.label}
                      </label>
                    );
                  }
                  if (field.type === "select") {
                    return (
                      <label key={field.id}>
                        {field.label}
                        {field.required ? " *" : ""}
                        <select
                          required={field.required}
                          value={String(answers[field.id] ?? "")}
                          onChange={(e) =>
                            setAnswers({
                              ...answers,
                              [field.id]: e.target.value,
                            })
                          }
                        >
                          <option value="">Válassz…</option>
                          {(field.options || []).map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </label>
                    );
                  }
                  if (field.type === "textarea") {
                    return (
                      <label key={field.id}>
                        {field.label}
                        {field.required ? " *" : ""}
                        <textarea
                          rows={4}
                          required={field.required}
                          value={String(answers[field.id] ?? "")}
                          onChange={(e) =>
                            setAnswers({
                              ...answers,
                              [field.id]: e.target.value,
                            })
                          }
                        />
                      </label>
                    );
                  }
                  return (
                    <label key={field.id}>
                      {field.label}
                      {field.required ? " *" : ""}
                      <input
                        type={field.type === "email" ? "email" : "text"}
                        required={field.required}
                        value={String(answers[field.id] ?? "")}
                        onChange={(e) =>
                          setAnswers({
                            ...answers,
                            [field.id]: e.target.value,
                          })
                        }
                      />
                    </label>
                  );
                })}
                <button
                  type="submit"
                  className="lab-btn lab-btn--primary"
                  disabled={submitting || !draft.id}
                >
                  {submitting ? "Küldés…" : "Teszt beküldés"}
                </button>
                {!draft.id ? (
                  <p className="lab-muted">
                    A beküldéshez előbb mentsd el az űrlapot.
                  </p>
                ) : null}
              </form>
            ) : null}

            {tab === "submissions" ? (
              !submissions.length ? (
                <div className="lab-empty">
                  Még nincs beküldés ehhez az űrlaphoz.
                </div>
              ) : (
                <table className="lab-table">
                  <thead>
                    <tr>
                      <th>Idő</th>
                      <th>Név / e-mail</th>
                      <th>Válaszok</th>
                      <th>Státusz</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s) => (
                      <tr key={s.id}>
                        <td>
                          {new Date(s.createdAt).toLocaleString("hu-HU")}
                        </td>
                        <td>
                          <strong>{s.name || "—"}</strong>
                          <div className="lab-muted">{s.email || "—"}</div>
                        </td>
                        <td>
                          <code className="lab-forms__answers">
                            {Object.entries(s.answers || {})
                              .map(([k, v]) => `${k}: ${String(v)}`)
                              .join(" · ")}
                          </code>
                        </td>
                        <td>
                          <select
                            value={s.status}
                            onChange={(e) =>
                              void setSubmissionStatus(
                                s.id,
                                e.target.value as LabFormSubmission["status"]
                              )
                            }
                          >
                            <option value="new">Új</option>
                            <option value="contacted">Kapcsolatban</option>
                            <option value="archived">Archivált</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
