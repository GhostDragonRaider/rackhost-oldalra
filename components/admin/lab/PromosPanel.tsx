import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  applyDiscount,
  PROMO_GROUP_LABELS,
  type PromoCatalogItem,
  type PromoGroupId,
  type PromoTier,
} from "../../../lib/promos-catalog";
import type { PromoOffer, PromosState } from "../../../lib/promos-store";

const TIER_LABEL: Record<PromoTier, string> = {
  start: "Induló",
  standard: "Jellemző",
  complex: "Komplex",
};

const GROUP_ORDER: PromoGroupId[] = ["websites", "custom", "support"];

function PromoPriceMark({
  original,
  promo,
  badge,
  percent,
}: {
  original: string;
  promo: string;
  badge: string;
  percent: number;
}) {
  return (
    <span className="promo-price">
      <span className="promo-price__badge">
        {badge} −{percent}%
      </span>
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

  async function postAction(action: string, payload: Record<string, unknown> = {}) {
    bumpIdle();
    setBusy(true);
    setError("");
    setMsg("");
    try {
      const res = await fetch("/api/admin/promos", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Művelet sikertelen.");
        return null;
      }
      setCatalog(data.catalog || catalog);
      setState(data.state);
      return data;
    } catch {
      setError("Hálózati hiba.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!state) return;
    const data = await postAction("save", { ...state });
    if (data) setMsg("Akciós ajánlatok mentve.");
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    await save();
  }

  async function onResetDefaults() {
    const data = await postAction("reset-defaults");
    if (data) {
      setMsg(
        "Alap akciók beállítva: weboldalak 25%, egyedi funkciók 10%, támogatás nélkül."
      );
    }
  }

  function patchOffer(serviceId: string, patch: Partial<PromoOffer>) {
    setState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        offers: prev.offers.map((o) => {
          if (o.serviceId !== serviceId) return o;
          const next = {
            ...o,
            ...patch,
            tiers: { ...o.tiers, ...(patch.tiers || {}) },
          };
          if (typeof patch.discountPercent === "number") {
            next.discountPercent = patch.discountPercent;
            if (patch.discountPercent <= 0) next.enabled = false;
          }
          return next;
        }),
      };
    });
  }

  function setGroupPercent(groupId: PromoGroupId, percent: number) {
    const pct = Math.max(0, Math.min(90, Math.round(percent)));
    setState((prev) => {
      if (!prev) return prev;
      const ids = new Set(
        catalog.filter((c) => c.groupId === groupId).map((c) => c.id)
      );
      return {
        ...prev,
        offers: prev.offers.map((o) => {
          if (!ids.has(o.serviceId)) return o;
          const enabled = pct > 0;
          return {
            ...o,
            enabled,
            discountPercent: pct,
            tiers: enabled
              ? { start: true, standard: true, complex: true }
              : o.tiers,
          };
        }),
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

  const grouped = useMemo(() => {
    return GROUP_ORDER.map((groupId) => ({
      groupId,
      label: PROMO_GROUP_LABELS[groupId],
      items: catalog.filter((c) => c.groupId === groupId),
    })).filter((g) => g.items.length > 0);
  }, [catalog]);

  if (loading || !state) {
    return <p className="lab-muted">Betöltés…</p>;
  }

  return (
    <div className="lab-promos">
      <header className="lab-promos__head">
        <div>
          <p className="lab-kicker">Tartalom</p>
          <h2>Akciós ajánlatok</h2>
          <p className="lab-muted">
            Weboldalak 25%, egyedi funkciók 10%, folyamatos támogatás nélkül.
            Az előnézetben látod az akciós ár jelzését.
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
          <span>Akciók aktívak</span>
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
          <h3>Kampány</h3>
          <label>
            Jelvény
            <input
              required
              value={state.badge}
              onChange={(e) =>
                setState((prev) =>
                  prev ? { ...prev, badge: e.target.value } : prev
                )
              }
            />
          </label>
          <label>
            Cím
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

          <div className="lab-promos__group-rates">
            <h4>Csoportos kedvezmény</h4>
            {GROUP_ORDER.map((groupId) => {
              const sample = state.offers.find((o) =>
                catalog.some(
                  (c) => c.id === o.serviceId && c.groupId === groupId
                )
              );
              return (
                <label key={groupId}>
                  {PROMO_GROUP_LABELS[groupId]} (%)
                  <input
                    type="number"
                    min={0}
                    max={90}
                    value={sample?.discountPercent ?? 0}
                    onChange={(e) =>
                      setGroupPercent(groupId, Number(e.target.value) || 0)
                    }
                  />
                </label>
              );
            })}
          </div>

          <div className="admin-quotes__actions">
            <button
              type="submit"
              className="lab-btn lab-btn--primary"
              disabled={busy}
            >
              Mentés
            </button>
            <button
              type="button"
              className="lab-btn"
              disabled={busy}
              onClick={() => void onResetDefaults()}
            >
              Alap akciók (25% / 10% / 0%)
            </button>
          </div>
        </form>

        <section className="lab-card lab-promos__preview-card">
          <h3>Akciós ár jelzése — előnézet</h3>
          <label>
            Szolgáltatás
            <select
              value={previewServiceId}
              onChange={(e) => setPreviewServiceId(e.target.value)}
            >
              {grouped.map((g) => (
                <optgroup key={g.groupId} label={g.label}>
                  {g.items.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          {preview ? (
            <div
              className={`lab-promos__preview ${
                state.active &&
                preview.offer.enabled &&
                preview.offer.discountPercent > 0
                  ? "lab-promos__preview--on"
                  : "lab-promos__preview--off"
              }`}
            >
              <div className="lab-promos__preview-top">
                <div>
                  <strong>{preview.item.name}</strong>
                  <div className="lab-muted">
                    {PROMO_GROUP_LABELS[preview.item.groupId]} ·{" "}
                    {preview.item.detail}
                  </div>
                </div>
                {state.active &&
                preview.offer.enabled &&
                preview.offer.discountPercent > 0 ? (
                  <span className="promo-price__badge promo-price__badge--lg">
                    {state.badge} −{preview.offer.discountPercent}%
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
                    preview.offer.discountPercent
                  );
                  const showPromo =
                    state.active &&
                    preview.offer.enabled &&
                    preview.offer.discountPercent > 0 &&
                    preview.offer.tiers[tier] &&
                    discounted.amount != null;
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
                          percent={preview.offer.discountPercent}
                        />
                      ) : (
                        <strong className="lab-promos__plain">{original}</strong>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </section>

        <section className="lab-card lab-card--wide">
          <h3>Szolgáltatások csoportonként</h3>
          {grouped.map((group) => (
            <div key={group.groupId} className="lab-promos__group-block">
              <h4>
                {group.label}
                <span className="lab-muted">
                  {" "}
                  ·{" "}
                  {group.groupId === "websites"
                    ? "25%"
                    : group.groupId === "custom"
                      ? "10%"
                      : "nincs akció"}
                </span>
              </h4>
              <table className="lab-table">
                <thead>
                  <tr>
                    <th>Szolgáltatás</th>
                    <th>Akció</th>
                    <th>%</th>
                    <th>Induló</th>
                    <th>Jellemző</th>
                    <th>Komplex</th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((item) => {
                    const offer = state.offers.find(
                      (o) => o.serviceId === item.id
                    );
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
                            checked={offer.enabled && offer.discountPercent > 0}
                            disabled={offer.discountPercent <= 0}
                            onChange={(e) =>
                              patchOffer(item.id, { enabled: e.target.checked })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            max={90}
                            style={{ width: 72 }}
                            value={offer.discountPercent}
                            onChange={(e) =>
                              patchOffer(item.id, {
                                discountPercent: Number(e.target.value) || 0,
                              })
                            }
                          />
                        </td>
                        {(Object.keys(TIER_LABEL) as PromoTier[]).map(
                          (tier) => (
                            <td key={tier}>
                              <input
                                type="checkbox"
                                checked={offer.tiers[tier]}
                                disabled={!offer.enabled || offer.discountPercent <= 0}
                                onChange={(e) =>
                                  patchOffer(item.id, {
                                    tiers: {
                                      ...offer.tiers,
                                      [tier]: e.target.checked,
                                    },
                                  })
                                }
                              />
                            </td>
                          )
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
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
