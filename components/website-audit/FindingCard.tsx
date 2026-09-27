import { useId, useState } from "react";
import { findingHelpText } from "../../lib/website-audit/help-texts";
import {
  isUnavailableStatus,
  type PublicAuditFinding,
} from "./publicTypes";

type FindingCardProps = {
  finding: PublicAuditFinding;
  defaultOpen?: boolean;
};

function severityClass(finding: PublicAuditFinding): string {
  const status = String(finding.status || "").toLowerCase();
  const sev = String(finding.severity || "").toLowerCase();
  if (isUnavailableStatus(status)) return "unavailable";
  if (status === "fail" || sev === "critical" || sev === "high") return "fail";
  if (status === "pass" || sev === "pass") return "pass";
  if (
    sev === "warning" ||
    sev === "info" ||
    sev === "low" ||
    sev === "medium" ||
    status === "warning"
  ) {
    return "warning";
  }
  return "unavailable";
}

function severityBadge(finding: PublicAuditFinding): string {
  const cls = severityClass(finding);
  switch (cls) {
    case "pass":
      return "Sikeres";
    case "warning":
      return "Figyelmeztetés";
    case "fail":
      return "Hiba";
    default:
      return "Nem ellenőrizhető";
  }
}

export default function FindingCard({
  finding,
  defaultOpen = false,
}: FindingCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const tone = severityClass(finding);
  const why =
    finding.whyItMatters ||
    (finding.id ? findingHelpText(finding.id) : null) ||
    null;
  const hasTech = Boolean(finding.technicalDetails?.trim());

  return (
    <article className={`wa-finding wa-finding--${tone}`}>
      <header className="wa-finding__head">
        <span className={`wa-finding__badge wa-finding__badge--${tone}`}>
          {severityBadge(finding)}
        </span>
        <h3 className="wa-finding__title">{finding.title}</h3>
      </header>

      {finding.detail ? (
        <p className="wa-finding__detail">{finding.detail}</p>
      ) : null}

      {why ? (
        <div className="wa-finding__why">
          <strong>Miért fontos?</strong>
          <p>{why}</p>
        </div>
      ) : null}

      {finding.recommendation ? (
        <div className="wa-finding__rec">
          <strong>Ajánlás</strong>
          <p>{finding.recommendation}</p>
        </div>
      ) : null}

      {hasTech ? (
        <div className="wa-finding__tech">
          <button
            type="button"
            className="wa-finding__tech-toggle"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Technikai részletek elrejtése" : "Technikai részletek"}
          </button>
          {open ? (
            <pre id={panelId} className="wa-finding__tech-body">
              {finding.technicalDetails}
            </pre>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
