import React from "react";
import { useLocale } from "../../lib/i18n/LocaleContext";

/** Full pricing matrix used on /arak. */
export default function PricingTable() {
  const { t } = useLocale();
  const p = t.pricingTable;

  return (
    <>
      <div className="pricing-dashboard">
        <div className="pricing-stat">
          <b>9</b>
          {p.statItems}
        </div>
        <div className="pricing-stat">
          <b>3</b>
          {p.statFrames}
        </div>
        <div className="pricing-stat">
          <b>1</b>
          {p.statOffer}
        </div>
      </div>
      <div className="pricing-legend">
        <span>
          <i style={{ background: "#22c983" }} aria-hidden="true" />
          {p.legendStart}
        </span>
        <span>
          <i style={{ background: "var(--blue)" }} aria-hidden="true" />
          {p.legendStandard}
        </span>
        <span>
          <i style={{ background: "var(--blue-2)" }} aria-hidden="true" />
          {p.legendComplex}
        </span>
      </div>
      <div className="pricing-table-wrap">
        <table className="pricing-table">
          <caption className="sr-only">{p.caption}</caption>
          <thead>
            <tr>
              <th scope="col">{p.colService}</th>
              <th scope="col" className="start">
                {p.colStart}
              </th>
              <th scope="col" className="standard">
                {p.colStandard}
              </th>
              <th scope="col" className="complex">
                {p.colComplex}
              </th>
            </tr>
          </thead>
          <tbody>
            {p.rows.map((row, index) => {
              const groupBreaks = [0, 4, 7];
              const groupIndex = groupBreaks.indexOf(index);
              return (
                <React.Fragment key={`${row.name}-${index}`}>
                  {groupIndex >= 0 ? (
                    <tr className="group">
                      <td colSpan={4}>{p.groups[groupIndex]}</td>
                    </tr>
                  ) : null}
                  <tr>
                    <td className="service">
                      {row.name}
                      <span className="detail">{row.detail}</span>
                    </td>
                    <td className="start">{row.start}</td>
                    <td className="standard">{row.standard}</td>
                    <td className="complex">{row.complex}</td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
