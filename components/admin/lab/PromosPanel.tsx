import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  applyDiscount,
  type PromoCatalogItem,
  type PromoTier,
} from "../../../lib/promos-catalog";
import type { PromoOffer, PromosState } from "../../../lib/promos-store";

const TIER_LABEL: Record<PromoTier, string> = {
  start: "Induló",
  standard: "Jellemző",
  complex: "Komplex",
};

function PromoPriceMark({
  original,
  promo,
  badge,
}: {
  original: string;
  promo: string;
  badge: string;
}) {
  return (
    <span className="promo-price">
      <span className="promo-price__badge">{badge}</span>
      <span className="promo-price__stack">
        <s className="promo-price__old">{original}</s>
        <strong className="promo-price__new">{promo}</strong>
      </span>
    </span>
  );
}

export default function PromosPanel({ bumpIdle }: { bumpIdle: () => void }) {
  const [catalog, setCatalog] = useState<PromoCatalogItem[]>([]);
  const [state, setState] = useState<PromosState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [previewServiceId, setPreviewServiceId] = useState("business-site");

  const load = useCallback(async () => {
    setError("");
    const res = await fetch("/api/admin/promos", { credentials: "same-origin" });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data.error || "Az akciós beállítások nem tölthetők be.");
      return;
    }
    setCatalog(data.catalog || []);
    setState(data.state);
    const firstId = data.catalog?.[0]?.id as string | undefined;
    if (firstId) {
      setPreviewServiceId((current) =>
        data.catalog.some((c: PromoCatalogItem) => c.id === current)
          ? current
          : firstId
      );
    }
  }, []);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  async function save() {
    if (!state) return;
    bumpIdle();
    setBusy(true);
    setError("");
    setMsg("");
    try {
      const res = await fetch("/api/admin/promos", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", ...state }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Mentés sikertelen.");
        return;
      }
      setState(data.state);
      setMsg("Akciós ajánlatok mentve.");
    } catch {
      setError("Hálózati hiba.");
    } finally {
      setBusy(false);
    }
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    await save();
  }

  function patchOffer(serviceId: string, patch: Partial<PromoOffer>) {
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        offers: prev.offers.map((o) =>
          o.serviceId === serviceId ? { ...o, ...patch, tiers: { ...o.tiers, ...(patch.tiers || {}) } } : o
        ),
      };
    });
  }

  const preview = useMemo(() => {
    if (!state) return null;
    const item = catalog.find((c) => c.id === previewServiceId) || catalog[0];
    const offer = state.offers.find((o) => o.serviceId === item?.id);
    if (!item || !offer) return null;
    return { item, offer };
  }, [catalog, previewServiceId, state]);

  if (loading || !state) {
    return <p className="lab-muted">Betöltés…</p>;
  }

  return (
    <div className="lab-promos">
      <header className="lab-promos__head">
        <div>
          <p className="lab-kicker">Árazás</p>
          <h2>Akciós ajánlatok</h2>
          <p className="lab-muted">
            Itt kapcsolod be a kedvezményes jelölést, és itt látod előre, hogyan
            jelenik meg az akciós ár.
          </p>
        </div>
        <label className="lab-promos__master">
          <input
            type="checkbox"
            checked={state.active}
            onChange={(e) =>
              setState((prev) =>
                prev ? { ...prev, active: e.target.checked } : prev
              )
            }
          />
          <span>Akciók aktívak a weboldalon</span>
        </label>
      </header>

      {error ? (
        <p className="admin-error" role="alert">
          {error}
        </p>
      ) : null}
      {msg ? <p className="lab-muted">{msg}</p> : null}

      <div className="lab-promos__grid">
        <form className="lab-card lab-form" onSubmit={onSave}>
          <h3>Kampány beállítások</h3>
          <label>
            Jelvény szöveg
            <input
              required
              value={state.badge}
              onChange={(e) =>
                setState((prev) =>
                  prev ? { ...prev, badge: e.target.value } : prev
                )
              }
              placeholder="Akció"
            />
          </label>
          <label>
            Kedvezmény (%)
            <input
              type="number"
              min={1}
              max={90}
              required
              value={state.discountPercent}
              onChange={(e) =>
                setState((prev) =>
                  prev
                    ? {
                        ...prev,
                        discountPercent: Number(e.target.value) || 1,
                      }
                    : prev
                )
              }
            />
          </label>
          <label>
            Kampány cím
            <input
              value={state.headline}
              onChange={(e) =>
                setState((prev) =>
                  prev ? { ...prev, headline: e.target.value } : prev
                )
              }
            />
          </label>
          <label>
            Megjegyzés
            <textarea
              rows={3}
              value={state.note}
              onChange={(e) =>
                setState((prev) =>
                  prev ? { ...prev, note: e.target.value } : prev
                )
              }
            />
          </label>
          <button
            type="submit"
            className="lab-btn lab-btn--primary"
            disabled={busy}
          >
            Mentés
          </button>
        </form>

        <section className="lab-card lab-promos__preview-card">
          <h3>Akciós ár jelzése — előnézet</h3>
          <p className="lab-muted">
            Így jelenik meg a kedvezményes ár a választott szolgáltatásnál.
          </p>
          <label>
            Előnézet szolgáltatás
            <select
              value={previewServiceId}
              onChange={(e) => setPreviewServiceId(e.target.value)}
            >
              {catalog.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          {preview ? (
            <div
              className={`lab-promos__preview ${
                state.active && preview.offer.enabled
                  ? "lab-promos__preview--on"
                  : "lab-promos__preview--off"
              }`}
            >
              <div className="lab-promos__preview-top">
                <div>
                  <strong>{preview.item.name}</strong>
                  <div className="lab-muted">{preview.item.detail}</div>
                </div>
                {state.active && preview.offer.enabled ? (
                  <span className="promo-price__badge promo-price__badge--lg">
                    {state.badge} −{state.discountPercent}%
                  </span>
                ) : (
                  <span className="lab-promos__off-pill">Nincs akció</span>
                )}
              </div>

              <div className="lab-promos__preview-tiers">
                {(Object.keys(TIER_LABEL) as PromoTier[]).map((tier) => {
                  const original = preview.item.prices[tier];
                  const discounted = applyDiscount(
                    original,
                    state.discountPercent
                  );
                  const showPromo =
                    state.active &&
                    preview.offer.enabled &&
                    preview.offer.tiers[tier];
                  return (
                    <div key={tier} className="lab-promos__tier">
                      <span className="lab-promos__tier-label">
                        {TIER_LABEL[tier]}
                      </span>
                      {showPromo ? (
                        <PromoPriceMark
                          original={discounted.original}
                          promo={discounted.promo}
                          badge={state.badge}
                        />
                      ) : (
                        <strong className="lab-promos__plain">{original}</strong>
                      )}
                    </div>
                  );
                })}
              </div>

              {state.active && preview.offer.enabled && state.note ? (
                <p className="lab-promos__preview-note">{state.note}</p>
              ) : null}
            </div>
          ) : null}

          <div className="lab-promos__inline-demo" aria-label="Ártábla minta">
            <div className="lab-promos__inline-demo-head">
              Ártábla-jelölés minta
            </div>
            <table className="lab-table lab-promos__mini-table">
              <thead>
                <tr>
                  <th>Szolgáltatás</th>
                  <th>Induló</th>
                  <th>Jellemző</th>
                </tr>
              </thead>
              <tbody>
                {(preview ? [preview.item] : catalog.slice(0, 1)).map((item) => {
                  const offer =
                    state.offers.find((o) => o.serviceId === item.id) ||
                    state.offers[0];
                  const start = applyDiscount(
                    item.prices.start,
                    state.discountPercent
                  );
                  const standard = applyDiscount(
                    item.prices.standard,
                    state.discountPercent
                  );
                  const show =
                    state.active && offer?.enabled;
                  return (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.name}</strong>
                      </td>
                      <td>
                        {show && offer.tiers.start ? (
                          <PromoPriceMark
                            original={start.original}
                            promo={start.promo}
                            badge={state.badge}
                          />
                        ) : (
                          item.prices.start
                        )}
                      </td>
                      <td>
                        {show && offer.tiers.standard ? (
                          <PromoPriceMark
                            original={standard.original}
                            promo={standard.promo}
                            badge={state.badge}
                          />
                        ) : (
                          item.prices.standard
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="lab-card lab-card--wide">
          <h3>Szolgáltatások</h3>
          <p className="lab-muted">
            Kapcsold be, mely tételeken jelenjen meg az akciós ár, és mely
            keretekre (induló / jellemző / komplex).
          </p>
          <table className="lab-table">
            <thead>
              <tr>
                <th>Szolgáltatás</th>
                <th>Akció</th>
                <th>Induló</th>
                <th>Jellemző</th>
                <th>Komplex</th>
              </tr>
            </thead>
            <tbody>
              {catalog.map((item) => {
                const offer = state.offers.find((o) => o.serviceId === item.id);
                if (!offer) return null;
                return (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      <div className="lab-muted">{item.detail}</div>
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={offer.enabled}
                        onChange={(e) =>
                          patchOffer(item.id, { enabled: e.target.checked })
                        }
                        aria-label={`${item.name} akció`}
                      />
                    </td>
                    {(Object.keys(TIER_LABEL) as PromoTier[]).map((tier) => (
                      <td key={tier}>
                        <input
                          type="checkbox"
                          checked={offer.tiers[tier]}
                          disabled={!offer.enabled}
                          onChange={(e) =>
                            patchOffer(item.id, {
                              tiers: { ...offer.tiers, [tier]: e.target.checked },
                            })
                          }
                          aria-label={`${item.name} ${TIER_LABEL[tier]}`}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop: 14 }}>
            <button
              type="button"
              className="lab-btn lab-btn--primary"
              disabled={busy}
              onClick={() => void save()}
            >
              Mentés
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
