import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AuditCategoryId, AuditSeverity } from "../../../lib/website-audit/types";
import { SEVERITY_LABELS } from "../../../lib/website-audit/types";
import {
  CATEGORY_HELP,
  OVERALL_SCORE_HELP,
  SEVERITY_HELP,
} from "../../../lib/website-audit/help-texts";
import { DelayedHelpTip } from "./DelayedHelpTip";

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

type ScoreRingProps = {
  score: number;
  label: string;
  size?: number;
};

export function ScoreRing({ score, label, size = 148 }: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  const tone = scoreTone(clamped);

  return (
    <DelayedHelpTip text={OVERALL_SCORE_HELP} placement="bottom" display="block">
      <div
        className={`audit-score-ring audit-score-ring--${tone}`}
        style={{ width: size, height: size }}
        role="img"
        aria-label={`Összesített pontszám: ${clamped} per 100, ${label}. Tartsd az egeret 2 másodpercig a magyarázathoz.`}
        tabIndex={0}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden
        >
          <circle
            className="audit-score-ring__track"
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
          />
          <circle
            className="audit-score-ring__value"
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="audit-score-ring__center">
          <strong>{clamped}</strong>
          <span>{clamped} / 100</span>
          <em>{label}</em>
        </div>
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

export function CategoryBars({
  categories,
  onSelect,
  activeId,
  play = false,
}: CategoryBarsProps) {
  return (
    <ul className="audit-cat-bars" aria-label="Kategória pontszámok">
      {categories.map((cat, index) => {
        const measurable = cat.measurable !== false && cat.score != null;
        const score = measurable ? Math.max(0, Math.min(100, cat.score!)) : 0;
        const tone = measurable ? scoreTone(score) : "neutral";
        const active = activeId === cat.id;
        const help =
          CATEGORY_HELP[cat.id as AuditCategoryId] ||
          `${cat.label}: ennek a területnek a pontszáma 0–100 között.`;
        const Tag = onSelect ? "button" : "div";
        return (
          <li key={cat.id}>
            <DelayedHelpTip text={help} placement="top" display="block">
              <Tag
                type={onSelect ? "button" : undefined}
                className={`audit-cat-bar audit-cat-bar--${tone}${
                  active ? " is-active" : ""
                }${play ? " is-playing" : ""}`}
                onClick={onSelect ? () => onSelect(cat.id) : undefined}
                aria-current={active ? "true" : undefined}
                style={
                  {
                    ["--audit-score" as string]: String(score),
                    ["--audit-bar-delay" as string]: `${index * 55}ms`,
                  } as never
                }
              >
                <span className="audit-cat-bar__label">{cat.label}</span>
                <span className="audit-cat-bar__track" aria-hidden>
                  <span
                    className="audit-cat-bar__fill"
                    style={{
                      width: play && measurable ? `${score}%` : "0%",
                    }}
                  />
                </span>
                <span className="audit-cat-bar__score">
                  {measurable ? score : "—"}
                </span>
              </Tag>
            </DelayedHelpTip>
          </li>
        );
      })}
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
      className={`audit-cat-section${revealed ? " is-revealed" : ""}`}
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
