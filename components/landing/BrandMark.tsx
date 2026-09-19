import React from "react";

type BrandMarkProps = {
  className?: string;
  href?: string;
  asLink?: boolean;
};

/** Visually styled AntiCode mark; screen readers hear one unbroken name. */
export default function BrandMark({
  className = "brand",
  href = "/",
  asLink = true,
}: BrandMarkProps) {
  const visual = (
    <span aria-hidden="true">
      <span className="cap">A</span>nti<span className="cap accent">C</span>ode
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
