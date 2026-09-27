import { useEffect, useMemo, useRef, useState } from "react";
import type { PublicAuditProgressStep } from "./publicTypes";

type AuditProgressListProps = {
  steps: PublicAuditProgressStep[];
  className?: string;
  /**
   * Fired only when every checklist item has been visually checked off.
   * Intermediate server progress never reports caughtUp=true.
   */
  onVisualCaughtUp?: (caughtUp: boolean) => void;
  /** Minimum pause between checking off successive items (ms). Default 500. */
  stepDelayMs?: number;
  /**
   * When true (audit finished), remaining steps may be revealed even if the
   * server left a trailing pending — UI still ticks them off one-by-one.
   */
  unlockAll?: boolean;
};

const DEFAULT_STEP_DELAY_MS = 500;

function normalizeStatus(status: string): string {
  const s = String(status || "").toLowerCase();
  if (s === "done" || s === "completed" || s === "success") return "done";
  if (s === "running" || s === "active" || s === "in_progress") return "running";
  if (s === "error" || s === "failed") return "error";
  if (s === "skipped") return "skipped";
  return "pending";
}

function isTerminal(status: string): boolean {
  const s = normalizeStatus(status);
  return s === "done" || s === "error" || s === "skipped";
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

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function countTerminalPrefix(steps: PublicAuditProgressStep[]): number {
  let n = 0;
  for (const step of steps) {
    if (!isTerminal(step.status)) break;
    n += 1;
  }
  return n;
}

/**
 * Process-style progress: one focal step at a time on a flow rail,
 * not a vertical checklist of every aspect.
 */
export default function AuditProgressList({
  steps,
  className = "",
  onVisualCaughtUp,
  stepDelayMs = DEFAULT_STEP_DELAY_MS,
  unlockAll = false,
}: AuditProgressListProps) {
  const serverSteps = useMemo(
    () => (Array.isArray(steps) ? steps : []),
    [steps]
  );
  const stepIdsKey = serverSteps.map((s) => s.id).join("|");
  const total = serverSteps.length;

  const serverTerminalCount = useMemo(
    () => countTerminalPrefix(serverSteps),
    [serverSteps]
  );

  const revealTarget = unlockAll
    ? total
    : Math.min(total, serverTerminalCount);

  const serverRunningIndex = useMemo(() => {
    return serverSteps.findIndex(
      (s) => normalizeStatus(s.status) === "running"
    );
  }, [serverSteps]);

  const [revealedCount, setRevealedCount] = useState(0);
  const [phase, setPhase] = useState<"idle" | "running" | "checking">("idle");
  const lastAdvanceAt = useRef(0);
  const caughtUpRef = useRef(false);
  const onCaughtUpRef = useRef(onVisualCaughtUp);
  onCaughtUpRef.current = onVisualCaughtUp;

  useEffect(() => {
    setRevealedCount(0);
    setPhase("idle");
    lastAdvanceAt.current = 0;
    caughtUpRef.current = false;
    onCaughtUpRef.current?.(false);
  }, [stepIdsKey]);

  useEffect(() => {
    if (!total) return;

    if (prefersReducedMotion()) {
      setRevealedCount(revealTarget);
      setPhase("idle");
      return;
    }

    if (revealedCount >= revealTarget) {
      if (
        !unlockAll &&
        serverRunningIndex === revealedCount &&
        revealedCount < total
      ) {
        setPhase("running");
      } else {
        setPhase("idle");
      }
      return;
    }

    setPhase("running");
    const timer = setTimeout(() => {
      lastAdvanceAt.current = Date.now();
      setPhase("checking");
      setRevealedCount((c) => Math.min(c + 1, revealTarget));
    }, stepDelayMs);

    return () => clearTimeout(timer);
  }, [
    total,
    revealTarget,
    revealedCount,
    serverRunningIndex,
    stepDelayMs,
    unlockAll,
  ]);

  useEffect(() => {
    const caughtUp = total > 0 && revealedCount >= total;
    if (caughtUp === caughtUpRef.current) return;
    caughtUpRef.current = caughtUp;
    onCaughtUpRef.current?.(caughtUp);
  }, [revealedCount, total]);

  const displaySteps = useMemo(() => {
    return serverSteps.map((step, index) => {
      if (index < revealedCount) {
        const terminal = isTerminal(step.status)
          ? normalizeStatus(step.status)
          : "done";
        return { ...step, status: terminal };
      }
      if (index === revealedCount && phase === "running") {
        return {
          ...step,
          status: "running",
          detail: step.detail || undefined,
        };
      }
      if (
        index === revealedCount &&
        serverRunningIndex === index &&
        revealedCount >= revealTarget &&
        revealedCount < total
      ) {
        return { ...step, status: "running" };
      }
      return { ...step, status: "pending", detail: undefined };
    });
  }, [
    serverSteps,
    revealedCount,
    phase,
    serverRunningIndex,
    revealTarget,
    total,
  ]);

  if (!total) {
    return (
      <p className="wa-empty" role="status">
        Az ellenőrzés lépései hamarosan megjelennek…
      </p>
    );
  }

  const allDone = revealedCount >= total;
  const activeIndex = allDone
    ? total - 1
    : Math.min(revealedCount, total - 1);
  const activeStep = displaySteps[activeIndex];
  const activeStatus = normalizeStatus(activeStep?.status || "pending");
  const progressPct = Math.round((revealedCount / total) * 100);

  return (
    <div
      className={`wa-progress wa-progress--flow${className ? ` ${className}` : ""}`}
    >
      <div className="wa-flow__meta" aria-live="polite">
        <span className="wa-flow__live">
          {allDone ? "Ellenőrzési folyamat kész" : "Ellenőrzési folyamat"}
        </span>
        <span className="wa-flow__count">
          {revealedCount} / {total}
        </span>
      </div>

      <div
        className="wa-flow__track"
        role="list"
        aria-label="Ellenőrzési folyamat"
      >
        <div className="wa-flow__rail" aria-hidden="true">
          <div
            className="wa-flow__rail-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {displaySteps.map((step, index) => {
          const st = normalizeStatus(step.status);
          return (
            <div
              key={step.id}
              role="listitem"
              className={`wa-flow__node wa-flow__node--${st}${
                index === activeIndex && !allDone ? " is-current" : ""
              }`}
              title={step.label}
            >
              <span className="wa-flow__node-mark" aria-hidden="true">
                {st === "done" ? (
                  <svg viewBox="0 0 16 16" width="10" height="10">
                    <path
                      d="M3.5 8.5 L6.5 11.5 L12.5 4.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : st === "error" ? (
                  "!"
                ) : st === "running" ? (
                  <span className="wa-flow__node-pulse" />
                ) : null}
              </span>
              <span className="wa-sr-only">
                {step.label}: {statusLabel(step.status)}
              </span>
            </div>
          );
        })}
      </div>

      <div
        className={`wa-flow__stage wa-flow__stage--${activeStatus}${
          phase === "checking" ? " is-checking" : ""
        }`}
        key={activeStep?.id || "stage"}
      >
        <p className="wa-flow__stage-kicker">
          {allDone
            ? "Utolsó lépés"
            : `Lépés ${Math.min(revealedCount + 1, total)} / ${total}`}
        </p>
        <h3 className="wa-flow__stage-title">{activeStep?.label}</h3>
        <p className="wa-flow__stage-status">{statusLabel(activeStatus)}</p>
        {activeStep?.detail && activeStatus !== "pending" ? (
          <p className="wa-flow__stage-detail">{activeStep.detail}</p>
        ) : (
          <p className="wa-flow__stage-detail">
            {allDone
              ? "Minden szempont lefutott."
              : "A vizsgálat ezen a ponton zajlik…"}
          </p>
        )}
      </div>
    </div>
  );
}
