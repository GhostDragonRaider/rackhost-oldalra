import { useEffect, useMemo, useRef, useState } from "react";
import type { PublicAuditProgressStep } from "./publicTypes";

type AuditProgressListProps = {
  steps: PublicAuditProgressStep[];
  className?: string;
  /** Fired when the staged UI has caught up to server-terminal steps. */
  onVisualCaughtUp?: (caughtUp: boolean) => void;
  /** Minimum pause between checking off successive items (ms). */
  stepDelayMs?: number;
};

const DEFAULT_STEP_DELAY_MS = 1000;

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

/**
 * Counts how many leading steps the server has finished (done/error/skipped).
 * The runner advances sequentially, so a prefix count is the reliable target.
 */
function countTerminalPrefix(steps: PublicAuditProgressStep[]): number {
  let n = 0;
  for (const step of steps) {
    if (!isTerminal(step.status)) break;
    n += 1;
  }
  return n;
}

/**
 * Premium staged checklist: server truth decides what may become done,
 * the UI reveals checkmarks one-by-one (≥ stepDelayMs apart).
 */
export default function AuditProgressList({
  steps,
  className = "",
  onVisualCaughtUp,
  stepDelayMs = DEFAULT_STEP_DELAY_MS,
}: AuditProgressListProps) {
  const serverSteps = useMemo(
    () => (Array.isArray(steps) ? steps : []),
    [steps]
  );
  const stepIdsKey = serverSteps.map((s) => s.id).join("|");
  const serverTerminalCount = useMemo(
    () => countTerminalPrefix(serverSteps),
    [serverSteps]
  );
  const serverRunningIndex = useMemo(() => {
    const idx = serverSteps.findIndex(
      (s) => normalizeStatus(s.status) === "running"
    );
    return idx;
  }, [serverSteps]);

  const [revealedCount, setRevealedCount] = useState(0);
  const [phase, setPhase] = useState<"idle" | "running" | "checking">("idle");
  const lastAdvanceAt = useRef(0);
  const caughtUpRef = useRef(false);
  const onCaughtUpRef = useRef(onVisualCaughtUp);
  onCaughtUpRef.current = onVisualCaughtUp;

  // New audit / new step list → restart staging
  useEffect(() => {
    setRevealedCount(0);
    setPhase("idle");
    lastAdvanceAt.current = 0;
    caughtUpRef.current = false;
    onCaughtUpRef.current?.(false);
  }, [stepIdsKey]);

  // Staged reveal toward serverTerminalCount
  useEffect(() => {
    if (!serverSteps.length) return;

    if (prefersReducedMotion()) {
      setRevealedCount(serverTerminalCount);
      setPhase("idle");
      return;
    }

    // Fully caught up to what the server has finished
    if (revealedCount >= serverTerminalCount) {
      if (serverRunningIndex === revealedCount) {
        setPhase("running");
      } else {
        setPhase("idle");
      }
      return;
    }

    // Reveal next terminal step: show running, then check off after ≥1s
    setPhase("running");
    // First item: short lead-in; later items: full stepDelayMs between ticks
    const delay =
      lastAdvanceAt.current === 0 ? Math.min(700, stepDelayMs) : stepDelayMs;

    const timer = setTimeout(() => {
      lastAdvanceAt.current = Date.now();
      setPhase("checking");
      setRevealedCount((c) => Math.min(c + 1, serverTerminalCount));
    }, delay);

    return () => clearTimeout(timer);
  }, [
    serverSteps.length,
    serverTerminalCount,
    revealedCount,
    serverRunningIndex,
    stepDelayMs,
  ]);

  useEffect(() => {
    const caughtUp =
      serverSteps.length > 0 && revealedCount >= serverTerminalCount;
    if (caughtUp === caughtUpRef.current) return;
    caughtUpRef.current = caughtUp;
    onCaughtUpRef.current?.(caughtUp);
  }, [revealedCount, serverTerminalCount, serverSteps.length]);

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
        revealedCount >= serverTerminalCount
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
    serverTerminalCount,
  ]);

  if (!serverSteps.length) {
    return (
      <p className="wa-empty" role="status">
        Az ellenőrzés lépései hamarosan megjelennek…
      </p>
    );
  }

  const total = serverSteps.length;
  const busy = phase === "running" || revealedCount < total;

  return (
    <div className={`wa-progress${className ? ` ${className}` : ""}`}>
      <div className="wa-progress__meta" aria-live="polite">
        <span className="wa-progress__count">
          {revealedCount} / {total} ellenőrzés
        </span>
        <span className="wa-progress__live">
          {busy ? "Weboldal vizsgálata…" : "Ellenőrzések kész"}
        </span>
      </div>

      <ol className="wa-progress-list" aria-label="Ellenőrzés előrehaladása">
        {displaySteps.map((step, index) => {
          const st = normalizeStatus(step.status);
          const justDone = st === "done" && index === revealedCount - 1;
          return (
            <li
              key={step.id}
              className={`wa-progress-item wa-progress-item--${st}${
                justDone ? " wa-progress-item--just-done" : ""
              }`}
            >
              <span className="wa-progress-item__marker" aria-hidden="true">
                {st === "done" ? (
                  <svg
                    viewBox="0 0 16 16"
                    width="12"
                    height="12"
                    focusable="false"
                  >
                    <path
                      d="M3.5 8.5 L6.5 11.5 L12.5 4.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : st === "error" ? (
                  <span className="wa-progress-item__mark-char">!</span>
                ) : st === "running" ? (
                  <span className="wa-progress-item__pulse" />
                ) : (
                  <span className="wa-progress-item__dot" />
                )}
              </span>
              <div className="wa-progress-item__body">
                <div className="wa-progress-item__row">
                  <span className="wa-progress-item__label">{step.label}</span>
                  <span className="wa-progress-item__status">
                    {statusLabel(step.status)}
                  </span>
                </div>
                {step.detail && st !== "pending" ? (
                  <p className="wa-progress-item__detail">{step.detail}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
