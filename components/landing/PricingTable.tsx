import React from "react";

/** Full pricing matrix used on /arak and previously on the homepage. */
export default function PricingTable() {
  return (
    <>
      <div className="pricing-dashboard">
        <div className="pricing-stat">
          <b>9</b>szolgáltatási tétel
        </div>
        <div className="pricing-stat">
          <b>3</b>projektkeret
        </div>
        <div className="pricing-stat">
          <b>1</b>egyedi ajánlat minden projektre
        </div>
      </div>
      <div className="pricing-legend">
        <span>
          <i style={{ background: "#22c983" }} aria-hidden="true" />
          Induló — egy világos, fókuszált feladathoz
        </span>
        <span>
          <i style={{ background: "var(--blue)" }} aria-hidden="true" />
          Jellemző — a legtöbb üzleti igényhez
        </span>
        <span>
          <i style={{ background: "var(--blue-2)" }} aria-hidden="true" />
          Komplex — több funkcióhoz vagy nagyobb tartalomhoz
        </span>
      </div>
      <div className="pricing-table-wrap">
        <table className="pricing-table">
          <caption className="sr-only">
            AntiCode szolgáltatásárak induló, jellemző és komplex keretekben
          </caption>
          <thead>
            <tr>
              <th scope="col">Szolgáltatás</th>
              <th scope="col" className="start">
                Induló
              </th>
              <th scope="col" className="standard">
                Jellemző
              </th>
              <th scope="col" className="complex">
                Komplex
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="group">
              <td colSpan={4}>WEBOLDALAK ÉS ÉRTÉKESÍTÉS</td>
            </tr>
            <tr>
              <td className="service">
                Start oldal
                <span className="detail">Egyoldalas, fókuszált bemutatkozás</span>
              </td>
              <td className="start">99 000 Ft</td>
              <td className="standard">129 000 Ft</td>
              <td className="complex">159 000 Ft</td>
            </tr>
            <tr>
              <td className="service">
                Üzleti weboldal
                <span className="detail">Többoldalas szolgáltatói jelenlét</span>
              </td>
              <td className="start">127 000 Ft</td>
              <td className="standard">178 000 Ft</td>
              <td className="complex">250 000 Ft</td>
            </tr>
            <tr>
              <td className="service">
                Weboldal megújítás
                <span className="detail">
                  Tartalom, struktúra és felület újragondolása
                </span>
              </td>
              <td className="start">82 000 Ft</td>
              <td className="standard">127 000 Ft</td>
              <td className="complex">191 000 Ft</td>
            </tr>
            <tr>
              <td className="service">
                Webshop
                <span className="detail">Katalógus, termékek és vásárlási út</span>
              </td>
              <td className="start">191 000 Ft</td>
              <td className="standard">255 000 Ft</td>
              <td className="complex">351 000 Ft</td>
            </tr>
            <tr className="group">
              <td colSpan={4}>EGYEDI FUNKCIÓK</td>
            </tr>
            <tr>
              <td className="service">
                Ajánlatkérő vagy jelentkezési rendszer
                <span className="detail">
                  Űrlap, fájlfeltöltés, értesítési folyamat
                </span>
              </td>
              <td className="start">49 000 Ft</td>
              <td className="standard">79 000 Ft</td>
              <td className="complex">103 000 Ft</td>
            </tr>
            <tr>
              <td className="service">
                Védett adminfelület
                <span className="detail">Belépés, szerepkörök és adatkezelés</span>
              </td>
              <td className="start">99 000 Ft</td>
              <td className="standard">127 000 Ft</td>
              <td className="complex">199 000 Ft</td>
            </tr>
            <tr>
              <td className="service">
                Egyedi funkció vagy integráció
                <span className="detail">
                  Külső szolgáltatás, automatizmus vagy egyedi logika
                </span>
              </td>
              <td className="start">29 000 Ft</td>
              <td className="standard">59 000 Ft</td>
              <td className="complex">Egyedi becslés</td>
            </tr>
            <tr className="group">
              <td colSpan={4}>FOLYAMATOS TÁMOGATÁS</td>
            </tr>
            <tr>
              <td className="service">
                Havi karbantartás
                <span className="detail">
                  Frissítések, mentések és kisebb módosítások
                </span>
              </td>
              <td className="start">15 000 Ft / hó</td>
              <td className="standard">25 000 Ft / hó</td>
              <td className="complex">45 000 Ft / hó</td>
            </tr>
            <tr>
              <td className="service">
                Tartalmi és technikai fejlesztési nap
                <span className="detail">
                  Előre egyeztetett fejlesztési feladatokra
                </span>
              </td>
              <td className="start">25 000 Ft</td>
              <td className="standard">35 000 Ft</td>
              <td className="complex">50 000 Ft</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
