import { useEffect, useState } from "react";
import {
  scoreTone,
  type PublicAuditCategory,
} from "./publicTypes";

type ScoreBarsProps = {
  categories: PublicAuditCategory[];
  animate?: boolean;
  className?: string;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useAnimatedNumber(
  target: number | null,
  durationMs: number,
  enabled: boolean
): number | null {
  const [value, setValue] = useState<number | null>(() =>
    enabled ? 0 : target
  );

  useEffect(() => {
    if (target == null || Number.isNaN(target)) {
      setValue(null);
      return;
    }
    if (!enabled || prefersReducedMotion()) {
      setValue(Math.round(target));
      return;
    }
    let frame = 0;
    const start = performance.now();
    const from = 0;
    const to = Math.max(0, Math.min(100, target));

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, enabled]);

  return value;
}

function ScoreBarRow({
  category,
  animate,
  index,
}: {
  category: PublicAuditCategory;
  animate: boolean;
  index: number;
}) {
  const measurable =
    category.measurable !== false &&
    category.score != null &&
    !Number.isNaN(category.score);
  const rawScore = measurable ? Number(category.score) : null;
  const duration = 600 + Math.min(400, index * 80);
  const display = useAnimatedNumber(rawScore, duration, animate);
  const tone = scoreTone(rawScore);
  const widthPct =
    rawScore == null
      ? 0
      : Math.max(0, Math.min(100, prefersReducedMotion() || !animate ? rawScore : display ?? 0));
  const reduced = typeof window !== "undefined" && prefersReducedMotion();

  return (
    <li className={`wa-score-bar wa-score-bar--${tone}`}>
      <div className="wa-score-bar__head">
        <span className="wa-score-bar__label">{category.label}</span>
        <span className="wa-score-bar__value" aria-live="polite">
          {rawScore == null ? "N/A" : `${display ?? Math.round(rawScore)}`}
        </span>
      </div>
      <div
        className="wa-score-bar__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={rawScore == null ? undefined : Math.round(rawScore)}
        aria-valuetext={
          rawScore == null
            ? `${category.label}: nem ellenőrizhető`
            : `${category.label}: ${Math.round(rawScore)} per 100`
        }
      >
        <span
          className={`wa-score-bar__fill${reduced || !animate ? " is-instant" : ""}`}
          style={{
            width: `${widthPct}%`,
            transitionDuration: reduced || !animate ? "0ms" : `${duration}ms`,
          }}
        />
      </div>
      {rawScore == null ? (
        <p className="wa-score-bar__na">Nem ellenőrizhető — nem PASS</p>
      ) : null}
    </li>
  );
}

export default function ScoreBars({
  categories,
  animate = true,
  className = "",
}: ScoreBarsProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Start fill after paint so CSS transition runs
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!categories?.length) {
    return (
      <p className="wa-empty" role="status">
        Nincs megjeleníthető kategória-pontszám.
      </p>
    );
  }

  return (
    <ul
      className={`wa-score-bars${className ? ` ${className}` : ""}`}
      aria-label="Fő kategória pontszámok"
    >
      {categories.map((cat, i) => (
        <ScoreBarRow
          key={cat.id}
          category={cat}
          animate={animate && ready}
          index={i}
        />
      ))}
    </ul>
  );
}
