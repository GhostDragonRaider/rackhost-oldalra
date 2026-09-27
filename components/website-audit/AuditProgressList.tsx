import type { PublicAuditProgressStep } from "./publicTypes";

type AuditProgressListProps = {
  steps: PublicAuditProgressStep[];
  className?: string;
};

function normalizeStatus(status: string): string {
  const s = String(status || "").toLowerCase();
  if (s === "done" || s === "completed" || s === "success") return "done";
  if (s === "running" || s === "active" || s === "in_progress") return "running";
  if (s === "error" || s === "failed") return "error";
  if (s === "skipped") return "skipped";
  return "pending";
}

function statusLabel(status: string): string {
  switch (normalizeStatus(status)) {
    case "done":
      return "kész";
    case "running":
      return "folyamatban";
    case "error":
      return "hiba";
    case "skipped":
      return "kihagyva";
    default:
      return "várakozik";
  }
}

export default function AuditProgressList({
  steps,
  className = "",
}: AuditProgressListProps) {
  if (!steps?.length) {
    return (
      <p className="wa-empty" role="status">
        Az ellenőrzés lépései hamarosan megjelennek…
      </p>
    );
  }

  return (
    <ol
      className={`wa-progress-list${className ? ` ${className}` : ""}`}
      aria-label="Ellenőrzés előrehaladása"
    >
      {steps.map((step) => {
        const st = normalizeStatus(step.status);
        return (
          <li
            key={step.id}
            className={`wa-progress-item wa-progress-item--${st}`}
          >
            <span className="wa-progress-item__marker" aria-hidden="true" />
            <div className="wa-progress-item__body">
              <div className="wa-progress-item__row">
                <span className="wa-progress-item__label">{step.label}</span>
                <span className="wa-progress-item__status">
                  {statusLabel(step.status)}
                </span>
              </div>
              {step.detail ? (
                <p className="wa-progress-item__detail">{step.detail}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
