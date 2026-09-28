import type { AuditCategoryId, AuditFinding } from "../../../lib/website-audit/types";
import { CATEGORY_LABELS } from "../../../lib/website-audit/types";
import {
  CATEGORY_HELP,
  FINDING_HELP,
  SEVERITY_HELP,
  SOURCE_HELP,
  findingHelpText,
} from "../../../lib/website-audit/help-texts";
import { DelayedHelpTip } from "./DelayedHelpTip";
import { severityIcon, severityLabel } from "./AuditDashboardParts";

function normalizeSeverity(s: string): string {
  if (s === "warning") return "medium";
  return s;
}

export type ExpandableFindingGridProps = {
  items: AuditFinding[];
  openMap: Record<string, boolean>;
  onToggle: (key: string) => void;
  /** Prefixed key so multiple grids don't collide */
  keyPrefix?: string;
  showIndex?: boolean;
  showCategory?: boolean;
  emptyText?: string;
  listClassName?: string;
  asOrdered?: boolean;
};

export function ExpandableFindingGrid({
  items,
  openMap,
  onToggle,
  keyPrefix = "",
  showIndex = false,
  showCategory = true,
  emptyText = "Nincs találat.",
  listClassName = "",
  asOrdered = false,
}: ExpandableFindingGridProps) {
  const ListTag = asOrdered ? "ol" : "ul";

  if (items.length === 0) {
    return <p className="admin-muted">{emptyText}</p>;
  }

  return (
    <ListTag
      className={`audit-tile-grid${listClassName ? ` ${listClassName}` : ""}`}
    >
      {items.map((f, i) => {
        const sev = normalizeSeverity(f.severity);
        const key = `${keyPrefix}${f.id}-${i}`;
        const open = openMap[key] ?? false;
        const help =
          findingHelpText(f.id) ||
          FINDING_HELP[f.id] ||
          CATEGORY_HELP[f.category as AuditCategoryId] ||
          f.detail;
        return (
          <li
            key={key}
            className={`audit-tile${showIndex ? "" : " audit-tile--no-index"} audit-sev--${sev}${
              sev === "critical" ? " is-critical" : ""
            }${open ? " is-open" : ""}`}
          >
            <button
              type="button"
              className="audit-tile__summary"
              aria-expanded={open}
              onClick={() => onToggle(key)}
            >
              {showIndex ? (
                <span className="audit-tile__n" aria-hidden>
                  {i + 1}
                </span>
              ) : null}
              <span className="audit-tile__main">
                <span className="audit-tile__title">{f.title}</span>
                <span className="audit-tile__meta">
                  <DelayedHelpTip text={SEVERITY_HELP[sev as keyof typeof SEVERITY_HELP] || SEVERITY_HELP.info} placement="top">
                    <span
                      className={`admin-finding-tag audit-sev--${sev}`}
                      tabIndex={0}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span aria-hidden>{severityIcon(sev)} </span>
                      {severityLabel(sev)}
                    </span>
                  </DelayedHelpTip>
                  {showCategory ? (
                    <DelayedHelpTip
                      text={CATEGORY_HELP[f.category as AuditCategoryId] || ""}
                      placement="top"
                    >
                      <span
                        className="audit-cat-pill"
                        tabIndex={0}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {CATEGORY_LABELS[f.category as AuditCategoryId] ||
                          f.category}
                      </span>
                    </DelayedHelpTip>
                  ) : null}
                  {f.source === "pagespeed_api" ? (
                    <DelayedHelpTip
                      text={SOURCE_HELP.pagespeed_api}
                      placement="top"
                    >
                      <span
                        className="audit-source"
                        tabIndex={0}
                        onClick={(e) => e.stopPropagation()}
                      >
                        PageSpeed
                      </span>
                    </DelayedHelpTip>
                  ) : null}
                  {f.source === "local_estimate" ? (
                    <DelayedHelpTip
                      text={SOURCE_HELP.local_estimate}
                      placement="top"
                    >
                      <span
                        className="audit-source audit-source--local"
                        tabIndex={0}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Helyi
                      </span>
                    </DelayedHelpTip>
                  ) : null}
                </span>
              </span>
              <span
                className={`audit-tile__chev${open ? " is-open" : ""}`}
                aria-hidden
              >
                ▾
              </span>
            </button>
            <div className="audit-tile__panel" aria-hidden={!open}>
              <div className="audit-tile__panel-inner">
                <DelayedHelpTip text={help} placement="top" display="block">
                  <div className="audit-tile__body">
                    {f.detail ? <p>{f.detail}</p> : null}
                    {f.detectedValue ? (
                      <p className="admin-muted admin-break">
                        Érték: {f.detectedValue}
                      </p>
                    ) : null}
                    {f.recommendation ? (
                      <p className="audit-fix">
                        <strong>Javaslat:</strong> {f.recommendation}
                      </p>
                    ) : null}
                    {f.evidence ? (
                      <pre className="admin-evidence">{f.evidence}</pre>
                    ) : null}
                  </div>
                </DelayedHelpTip>
              </div>
            </div>
          </li>
        );
      })}
    </ListTag>
  );
}
