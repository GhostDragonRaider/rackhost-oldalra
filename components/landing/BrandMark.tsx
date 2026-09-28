import React from "react";

type BrandMarkProps = {
  className?: string;
  href?: string;
  asLink?: boolean;
  /** full = letters + track + status; mark = letters only (footer) */
  variant?: "full" | "mark";
};

const LETTERS: Array<{ ch: string; green?: boolean }> = [
  { ch: "A" },
  { ch: "n" },
  { ch: "t" },
  { ch: "i" },
  { ch: "C", green: true },
  { ch: "o" },
  { ch: "d" },
  { ch: "e" },
];

/** Animated AntiCode signature mark (letter reveal + loader track). */
export default function BrandMark({
  className = "brand",
  href = "/",
  asLink = true,
  variant = "full",
}: BrandMarkProps) {
  const visual = (
    <span
      className={`ac-logo${variant === "mark" ? " ac-logo--mark" : ""}`}
      aria-hidden="true"
    >
      <span className="ac-logo__word">
        {LETTERS.map((item, i) => (
          <span
            key={`${item.ch}-${i}`}
            className={`ac-logo__letter${
              item.green ? " ac-logo__letter--green" : ""
            }`}
          >
            {item.ch}
          </span>
        ))}
      </span>
      {variant === "full" ? (
        <>
          <span className="ac-logo__track">
            <span className="ac-logo__runner" />
          </span>
          <span className="ac-logo__status">Loading experience</span>
        </>
      ) : null}
    </span>
  );

  if (!asLink) {
    return (
      <span className={className}>
        {visual}
        <span className="sr-only">AntiCode</span>
      </span>
    );
  }

  return (
    <a className={className} href={href} aria-label="AntiCode kezdőlap">
      {visual}
    </a>
  );
}
