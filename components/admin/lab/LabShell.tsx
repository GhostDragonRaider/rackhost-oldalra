import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
  KeyboardEvent,
} from "react";
import AdminShell from "../AdminShell";
import { LAB_CATEGORY_LABELS, listLabModulesByCategory } from "../../../lib/lab/registry";
import type { LabFlagsState, LabModuleMeta } from "../../../lib/lab/types";
import { PROVENANCE_LABELS, type DataProvenance } from "../../../lib/lab/integrity";

type ResolvedModule = LabModuleMeta & {
  resolvedFlags: LabModuleMeta["flags"];
  effectivelyAvailable: boolean;
};

type LabShellProps = {
  moduleId: string;
  title: string;
  children: (ctx: {
    bumpIdle: () => void;
    modules: ResolvedModule[];
    state: LabFlagsState | null;
    killSwitch: boolean;
    refreshFlags: () => Promise<void>;
  }) => ReactNode;
};

export function ProvenanceBadge({
  provenance,
}: {
  provenance: DataProvenance;
}) {
  return (
    <span className={`lab-prov lab-prov--${provenance}`} title={provenance}>
      {PROVENANCE_LABELS[provenance]}
    </span>
  );
}

export default function LabShell({ moduleId, title, children }: LabShellProps) {
  const router = useRouter();
  const [modules, setModules] = useState<ResolvedModule[]>([]);
  const [state, setState] = useState<LabFlagsState | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [focusMode, setFocusMode] = useState(false);

  const refreshFlags = useCallback(async () => {
    const res = await fetch("/api/admin/lab/flags", { credentials: "same-origin" });
    if (!res.ok) return;
    const data = await res.json();
    setModules(data.modules || []);
    setState(data.state || null);
  }, []);

  useEffect(() => {
    void refreshFlags();
  }, [refreshFlags]);

  useEffect(() => {
    if (!moduleId) return;
    void fetch("/api/admin/lab/flags", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "touch-recent", moduleId }),
    }).then(() => refreshFlags());
  }, [moduleId, refreshFlags]);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const categories = useMemo(() => listLabModulesByCategory(), []);

  const commands = useMemo(() => {
    const q = paletteQuery.trim().toLowerCase();
    const items = modules.map((m) => ({
      id: m.id,
      label: `${m.nameHu} · ${m.name}`,
      href: m.href,
      group: LAB_CATEGORY_LABELS[m.category],
    }));
    items.push(
      {
        id: "kill-on",
        label: "Emergency kill switch BE",
        href: "",
        group: "Settings",
      },
      {
        id: "kill-off",
        label: "Emergency kill switch KI",
        href: "",
        group: "Settings",
      }
    );
    if (!q) return items.slice(0, 24);
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        i.group.toLowerCase().includes(q)
    );
  }, [modules, paletteQuery]);

  async function runCommand(id: string, href?: string) {
    if (id === "kill-on" || id === "kill-off") {
      await fetch("/api/admin/lab/flags", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "kill-switch",
          on: id === "kill-on",
        }),
      });
      await refreshFlags();
      setPaletteOpen(false);
      return;
    }
    if (href) {
      setPaletteOpen(false);
      void router.push(href);
    }
  }

  function onPaletteKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && commands[0]) {
      void runCommand(commands[0].id, commands[0].href);
    }
  }

  const killSwitch = Boolean(state?.killSwitch);

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
        <title>{title} · Irányítópult</title>
      </Head>
      <AdminShell active="lab" title="Irányítópult">
        {({ authed, bumpIdle }) =>
          authed ? (
            <div
              className={`lab-root${focusMode ? " is-focus" : ""}${
                killSwitch ? " is-killed" : ""
              }`}
            >
              {killSwitch ? (
                <div className="lab-killbanner" role="alert">
                  EMERGENCY LAB KILL SWITCH aktív — kísérleti modulok
                  le vannak tiltva.
                </div>
              ) : null}

              <div className="lab-layout">
                <aside
                  className="lab-sidebar"
                  aria-label="Irányítópult navigáció"
                  hidden={focusMode}
                >
                  <div className="lab-sidebar__brand">
                    <span className="lab-sidebar__mark" aria-hidden>
                      ⌬
                    </span>
                    <div>
                      <strong>Irányítópult</strong>
                      <p>Belső eszközök · admin only</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="lab-cmd-trigger"
                    onClick={() => setPaletteOpen(true)}
                  >
                    Keresés <kbd>Ctrl</kbd>
                    <kbd>K</kbd>
                  </button>

                  <nav className="lab-nav">
                    {categories.map((g) => (
                      <div key={g.category} className="lab-nav__group">
                        <div className="lab-nav__label">{g.label}</div>
                        <ul>
                          {g.modules.map((m) => {
                            const resolved = modules.find((x) => x.id === m.id);
                            const active = moduleId === m.id;
                            const disabled =
                              resolved && !resolved.effectivelyAvailable;
                            return (
                              <li key={m.id}>
                                <Link
                                  href={m.href}
                                  className={`lab-nav__link${
                                    active ? " is-active" : ""
                                  }${disabled ? " is-disabled" : ""}`}
                                  aria-current={active ? "page" : undefined}
                                  onClick={() => bumpIdle()}
                                >
                                  <span>{m.nameHu}</span>
                                  {m.flags.beta ? (
                                    <span className="lab-pill">beta</span>
                                  ) : null}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </nav>
                </aside>

                <div className="lab-main">
                  <header className="lab-main__head">
                    <div>
                      <p className="lab-kicker">Irányítópult</p>
                      <h1>{title}</h1>
                    </div>
                    <div className="lab-main__actions">
                      <button
                        type="button"
                        className="lab-ghost"
                        onClick={() => {
                          bumpIdle();
                          setFocusMode((v) => !v);
                        }}
                      >
                        {focusMode ? "Focus ki" : "Focus mód"}
                      </button>
                      <Link
                        href="/admin/cv"
                        className="lab-ghost"
                        onClick={() => bumpIdle()}
                      >
                        Önéletrajz →
                      </Link>
                    </div>
                  </header>

                  <div className="lab-main__body">
                    {children({
                      bumpIdle,
                      modules,
                      state,
                      killSwitch,
                      refreshFlags,
                    })}
                  </div>
                </div>
              </div>

              {paletteOpen ? (
                <div
                  className="lab-palette"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Command palette"
                >
                  <button
                    type="button"
                    className="lab-palette__backdrop"
                    aria-label="Bezárás"
                    onClick={() => setPaletteOpen(false)}
                  />
                  <div className="lab-palette__panel">
                    <input
                      autoFocus
                      value={paletteQuery}
                      onChange={(e) => setPaletteQuery(e.target.value)}
                      onKeyDown={onPaletteKey}
                      placeholder="Modul, beállítás, gyors művelet…"
                      aria-label="Parancs keresése"
                    />
                    <ul>
                      {commands.map((c) => (
                        <li key={c.id}>
                          <button
                            type="button"
                            onClick={() => void runCommand(c.id, c.href)}
                          >
                            <span>{c.label}</span>
                            <small>{c.group}</small>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null
        }
      </AdminShell>
    </>
  );
}
