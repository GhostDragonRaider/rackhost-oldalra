import { useMemo, useState } from "react";
import {
  isUnavailableStatus,
  type PublicMatrixCell,
  type PublicResponsiveMatrix,
} from "./publicTypes";

type ResponsiveMatrixProps = {
  matrix: PublicResponsiveMatrix;
};

function cellTone(status?: string): string {
  const s = String(status || "").toLowerCase();
  if (isUnavailableStatus(s)) return "unavailable";
  if (s === "pass" || s === "ok" || s === "good") return "pass";
  if (s === "fail" || s === "error" || s === "bad") return "fail";
  if (s === "warning" || s === "warn" || s === "info") return "warning";
  return "unavailable";
}

function cellLabel(status?: string): string {
  const tone = cellTone(status);
  switch (tone) {
    case "pass":
      return "OK";
    case "fail":
      return "HIBA";
    case "warning":
      return "FIGY";
    default:
      return "N/A";
  }
}

type SelectedCell = {
  path: string;
  viewport: number;
  cell: PublicMatrixCell;
};

export default function ResponsiveMatrix({ matrix }: ResponsiveMatrixProps) {
  const viewports = matrix?.viewports || [];
  const pages = matrix?.pages || [];
  const [selected, setSelected] = useState<SelectedCell | null>(null);

  const empty = !viewports.length || !pages.length;

  const selectedKey = useMemo(() => {
    if (!selected) return "";
    return `${selected.path}::${selected.viewport}`;
  }, [selected]);

  if (empty) {
    return (
      <p className="wa-empty" role="status">
        Nincs reszponzív mátrix adat.
      </p>
    );
  }

  return (
    <div className="wa-matrix">
      <div className="wa-matrix__scroll" role="region" aria-label="Reszponzív mátrix">
        <table className="wa-matrix__table">
          <thead>
            <tr>
              <th scope="col">Oldal</th>
              {viewports.map((vp) => (
                <th key={vp} scope="col">
                  {vp}px
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.path}>
                <th scope="row">{page.path}</th>
                {viewports.map((vp) => {
                  const key = String(vp);
                  const cell = page.cells?.[key] || page.cells?.[`${vp}`];
                  const status = cell?.status;
                  const tone = cellTone(status);
                  const isSelected =
                    selectedKey === `${page.path}::${vp}`;
                  return (
                    <td key={`${page.path}-${vp}`}>
                      <button
                        type="button"
                        className={`wa-matrix__cell wa-matrix__cell--${tone}${
                          isSelected ? " is-selected" : ""
                        }`}
                        onClick={() =>
                          setSelected({
                            path: page.path,
                            viewport: vp,
                            cell: cell || { status: "unavailable" },
                          })
                        }
                        aria-pressed={isSelected}
                      >
                        {cellLabel(status)}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected ? (
        <aside
          className="wa-matrix__detail"
          aria-live="polite"
          aria-label="Mátrix cella részletei"
        >
          <div className="wa-matrix__detail-head">
            <strong>
              {selected.path} · {selected.viewport}px
            </strong>
            <button
              type="button"
              className="wa-matrix__detail-close"
              onClick={() => setSelected(null)}
            >
              Bezárás
            </button>
          </div>
          <p
            className={`wa-matrix__detail-status wa-matrix__detail-status--${cellTone(
              selected.cell.status
            )}`}
          >
            Állapot:{" "}
            {isUnavailableStatus(selected.cell.status)
              ? "UNAVAILABLE — nem ellenőrizhető (nem PASS)"
              : cellLabel(selected.cell.status)}
          </p>
          {selected.cell.screenshot === null ||
          selected.cell.screenshot === "unavailable" ||
          String(selected.cell.screenshot || "").toLowerCase() ===
            "unavailable" ? (
            <p className="wa-matrix__shot-na" role="status">
              Képernyőkép: UNAVAILABLE
            </p>
          ) : null}
          {selected.cell.issues?.length ? (
            <ul className="wa-matrix__issues">
              {selected.cell.issues.map((issue, i) => (
                <li key={`${issue.title}-${i}`}>
                  <strong>{issue.title}</strong>
                  {issue.detail ? <p>{issue.detail}</p> : null}
                  {issue.selector ? (
                    <code>{issue.selector}</code>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="wa-muted">
              {isUnavailableStatus(selected.cell.status)
                ? "Ehhez a nézethez nincs megbízható mérés."
                : "Nincs rögzített probléma ebben a cellában."}
            </p>
          )}
        </aside>
      ) : (
        <p className="wa-muted wa-matrix__hint">
          Kattints egy cellára a részletekhez.
        </p>
      )}
    </div>
  );
}
