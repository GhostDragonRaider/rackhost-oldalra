import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import type { AuditCategoryId, AuditSeverity } from "../../../lib/website-audit/types";
import { SEVERITY_LABELS } from "../../../lib/website-audit/types";
import {
  CATEGORY_HELP,
  OVERALL_SCORE_HELP,
  SEVERITY_HELP,
} from "../../../lib/website-audit/help-texts";
import { DelayedHelpTip } from "./DelayedHelpTip";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

type AuditRevealProps = {
  children: ReactNode;
  /** Reset reveal when this changes (e.g. audit id). */
  resetKey?: string | number | null;
  className?: string;
  as?: ElementType;
  /** Stagger delay after the element enters the viewport. */
  delayMs?: number;
  /** Accessible name when wrapping a landmark section. */
  "aria-label"?: string;
  style?: CSSProperties;
};

/**
 * Fade/slide-in when the block scrolls into view.
 * Used for post-audit result sections.
 */
export function AuditReveal({
  children,
  resetKey,
  className = "",
  as: Tag = "div",
  delayMs = 0,
  "aria-label": ariaLabel,
  style,
}: AuditRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
  }, [resetKey]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      setRevealed(true);
      return;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;
    const reveal = () => {
      if (timer) return;
      timer = setTimeout(() => setRevealed(true), delayMs);
    };

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          reveal();
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );
    obs.observe(el);

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9 && rect.bottom > 40) {
      reveal();
      obs.disconnect();
    }

    return () => {
      obs.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [resetKey, delayMs]);

  return (
    <Tag
      ref={ref}
      className={`audit-reveal${revealed ? " is-revealed" : ""}${
        className ? ` ${className}` : ""
      }`}
      aria-label={ariaLabel}
      style={
        {
          ["--audit-reveal-delay" as string]: `${delayMs}ms`,
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </Tag>
  );
}

export function severityLabel(s: AuditSeverity | string): string {
  if (s in SEVERITY_LABELS) {
    return SEVERITY_LABELS[s as AuditSeverity];
  }
  // Legacy stored audits
  if (s === "warning") return "Közepes";
  return String(s);
}

export function severityIcon(s: AuditSeverity | string): string {
  switch (s) {
    case "pass":
      return "✓";
    case "info":
      return "ⓘ";
    case "low":
      return "•";
    case "medium":
    case "warning":
      return "⚠";
    case "high":
      return "!";
    case "critical":
      return "⚠";
    default:
      return "•";
  }
}

export function scoreTone(score: number): "good" | "warn" | "bad" | "neutral" {
  if (score >= 80) return "good";
  if (score >= 55) return "warn";
  return "bad";
}

function useAnimatedCounter(
  target: number,
  durationMs: number,
  play: boolean
): number {
  const [value, setValue] = useState(() => (play ? 0 : target));

  useEffect(() => {
    if (!play) {
      setValue(0);
      return;
    }
    if (prefersReducedMotion()) {
      setValue(Math.round(target));
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const to = Math.max(0, Math.min(100, Math.round(target)));

    const tick = (timestamp: number) => {
      if (start == null) start = timestamp;
      const progress = Math.min(1, (timestamp - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(to * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    setValue(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, play]);

  return value;
}

type ScoreRingProps = {
  score: number;
  label: string;
  size?: number;
};

/** Total audit score with animated metric counter (Georgia display). */
export function ScoreRing({ score, label }: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const tone = scoreTone(clamped);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    setPlay(false);
    const id = window.setTimeout(() => setPlay(true), 40);
    return () => window.clearTimeout(id);
  }, [clamped]);

  const display = useAnimatedCounter(clamped, 1600, play);

  return (
    <DelayedHelpTip text={OVERALL_SCORE_HELP} placement="bottom" display="block">
      <div
        className={`audit-total-score audit-total-score--${tone}${
          play ? " is-playing" : ""
        }`}
        role="img"
        aria-label={`Összesített pontszám: ${clamped} per 100, ${label}. Tartsd az egeret 2 másodpercig a magyarázathoz.`}
        tabIndex={0}
      >
        <span className="audit-total-score__number">{display}</span>
        <span className="audit-total-score__max">/ 100</span>
      </div>
    </DelayedHelpTip>
  );
}

type CategoryBarsProps = {
  categories: Array<{
    id: string;
    label: string;
    score: number | null;
    status?: string;
    measurable?: boolean;
  }>;
  onSelect?: (id: string) => void;
  activeId?: string | null;
  /** When true, fills grow from 0 → score. Parent typically sets after scroll. */
  play?: boolean;
};

function CategoryMetricRow({
  cat,
  index,
  play,
  active,
  onSelect,
}: {
  cat: CategoryBarsProps["categories"][number];
  index: number;
  play: boolean;
  active: boolean;
  onSelect?: (id: string) => void;
}) {
  const measurable = cat.measurable !== false && cat.score != null;
  const score = measurable ? Math.max(0, Math.min(100, cat.score!)) : 0;
  const tone = measurable ? scoreTone(score) : "neutral";
  const display = useAnimatedCounter(score, 1600, play && measurable);
  const help =
    CATEGORY_HELP[cat.id as AuditCategoryId] ||
    `${cat.label}: ennek a területnek a pontszáma 0–100 között.`;
  const Tag = onSelect ? "button" : "div";

  return (
    <li>
      <DelayedHelpTip text={help} placement="top" display="block">
        <Tag
          type={onSelect ? "button" : undefined}
          className={`audit-metric audit-metric--${tone}${
            active ? " is-active" : ""
          }${play ? " is-playing" : ""}`}
          onClick={onSelect ? () => onSelect(cat.id) : undefined}
          aria-current={active ? "true" : undefined}
          style={
            {
              ["--score" as string]: measurable ? `${score}%` : "0%",
              ["--audit-bar-delay" as string]: `${index * 100}ms`,
            } as never
          }
        >
          <div className="audit-metric__header">
            <div className="audit-metric__label">
              <span className="audit-metric__dot" aria-hidden />
              {cat.label}
            </div>
            <div className="audit-metric__value">
              <span className="audit-metric__number">
                {measurable ? display : "—"}
              </span>
              {measurable ? (
                <span className="audit-metric__unit">%</span>
              ) : null}
            </div>
          </div>
          <div className="audit-metric__track" aria-hidden>
            <div className="audit-metric__fill" />
          </div>
        </Tag>
      </DelayedHelpTip>
    </li>
  );
}

export function CategoryBars({
  categories,
  onSelect,
  activeId,
  play = false,
}: CategoryBarsProps) {
  return (
    <ul className="audit-metrics" aria-label="Kategória pontszámok">
      {categories.map((cat, index) => (
        <CategoryMetricRow
          key={cat.id}
          cat={cat}
          index={index}
          play={play}
          active={activeId === cat.id}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}

type CategoryBarsSectionProps = CategoryBarsProps & {
  title: ReactNode;
};

/** Scroll-reveal wrapper: section fades in, bars play when bottom enters viewport. */
export function CategoryBarsSection({
  title,
  categories,
  onSelect,
  activeId,
}: CategoryBarsSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    setRevealed(false);
    setPlay(false);
  }, [categories]);

  useEffect(() => {
    const section = sectionRef.current;
    const bottom = bottomRef.current;
    if (!section || !bottom) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setRevealed(true);
      setPlay(true);
      return;
    }

    const revealObs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setRevealed(true);
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    revealObs.observe(section);

    const playObs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setPlay(true);
      },
      { threshold: 0, rootMargin: "0px 0px 0px 0px" }
    );
    playObs.observe(bottom);

    // If the section already fits in the viewport (bottom above fold), play now.
    const rect = section.getBoundingClientRect();
    if (rect.bottom <= window.innerHeight && rect.top < window.innerHeight) {
      setRevealed(true);
      if (rect.bottom <= window.innerHeight - 4) setPlay(true);
    }

    return () => {
      revealObs.disconnect();
      playObs.disconnect();
    };
  }, [categories]);

  return (
    <section
      ref={sectionRef}
      className={`audit-reveal audit-cat-section${revealed ? " is-revealed" : ""}`}
      aria-label="Kategóriák"
    >
      {title}
      <CategoryBars
        categories={categories}
        onSelect={onSelect}
        activeId={activeId}
        play={play}
      />
      <div ref={bottomRef} className="audit-cat-section__bottom" aria-hidden />
    </section>
  );
}

type SeverityDistributionProps = {
  counts: Partial<Record<string, number>>;
};

export function SeverityDistribution({ counts }: SeverityDistributionProps) {
  const items: Array<{
    key: AuditSeverity | "warning";
    label: string;
    count: number;
  }> = [
    { key: "pass", label: "sikeres", count: counts.pass || 0 },
    { key: "info", label: "információ", count: counts.info || 0 },
    { key: "low", label: "alacsony", count: counts.low || 0 },
    {
      key: "medium",
      label: "közepes",
      count: (counts.medium || 0) + (counts.warning || 0),
    },
    { key: "high", label: "magas", count: counts.high || 0 },
    { key: "critical", label: "kritikus", count: counts.critical || 0 },
  ];
  const total = items.reduce((s, i) => s + i.count, 0) || 1;

  return (
    <div className="audit-sev-dist" aria-label="Súlyosság eloszlás">
      <DelayedHelpTip
        text="A színes sáv azt mutatja, milyen arányban vannak a sikeres és a különböző súlyosságú találatok az összes ellenőrzés között."
        placement="bottom"
        display="block"
      >
        <div className="audit-sev-dist__bar" aria-hidden>
          {items
            .filter((i) => i.count > 0)
            .map((i) => (
              <span
                key={i.key}
                className={`audit-sev-dist__seg audit-sev--${i.key}`}
                style={{ flexGrow: i.count, flexBasis: 0 }}
              />
            ))}
        </div>
      </DelayedHelpTip>
      <ul className="audit-sev-dist__list">
        {items.map((i) => (
          <li key={i.key}>
            <DelayedHelpTip
              text={SEVERITY_HELP[i.key] || SEVERITY_HELP.info}
              placement="top"
            >
              <span className={`audit-sev-chip audit-sev--${i.key}`} tabIndex={0}>
                <span className="audit-sev-chip__icon" aria-hidden>
                  {severityIcon(i.key)}
                </span>
                <span>
                  <strong>{i.count}</strong> {i.label}
                </span>
                <span className="admin-sr-only">
                  ({Math.round((i.count / total) * 100)}%)
                </span>
              </span>
            </DelayedHelpTip>
          </li>
        ))}
      </ul>
    </div>
  );
}

type SectionTitleProps = {
  children: string;
  help: string;
};

export function AuditSectionTitle({ children, help }: SectionTitleProps) {
  return (
    <div className="audit-section-title-row">
      <h4 className="audit-section-title">
        <DelayedHelpTip text={help} placement="bottom" display="inline">
          <span className="audit-section-title-hit" tabIndex={0}>
            <span className="audit-section-title__label audit-section-title--help">
              {children}
            </span>
            <span className="audit-help-q" aria-hidden>
              ?
            </span>
          </span>
        </DelayedHelpTip>
      </h4>
    </div>
  );
}
