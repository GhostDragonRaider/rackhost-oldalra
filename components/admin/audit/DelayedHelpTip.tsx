import {
  CSSProperties,
  FocusEvent,
  MouseEvent,
  PointerEvent,
  ReactElement,
  ReactNode,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

const DEFAULT_DELAY_MS = 2000;

type DelayedHelpTipProps = {
  text: string;
  children: ReactNode;
  className?: string;
  delayMs?: number;
  placement?: "top" | "bottom";
  display?: "inline" | "block";
  /** Merge handlers onto the child (for headings). */
  asChild?: boolean;
};

type ChildProps = {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  onPointerEnter?: (e: PointerEvent) => void;
  onPointerLeave?: (e: PointerEvent) => void;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  "aria-describedby"?: string;
};

/**
 * Shows a layperson explanation after the pointer rests on the element
 * for `delayMs` (default 2s). Hides on leave / Escape / scroll.
 */
export function DelayedHelpTip({
  text,
  children,
  className,
  delayMs = DEFAULT_DELAY_MS,
  placement = "top",
  display = "inline",
  asChild = false,
}: DelayedHelpTipProps) {
  const tipId = useId();
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const hide = useCallback(() => {
    clear();
    setOpen(false);
  }, [clear]);

  const start = useCallback(() => {
    // Do not reset an already-scheduled tip (pointer+mouse duplicate events).
    if (timerRef.current || open) return;
    timerRef.current = setTimeout(() => setOpen(true), delayMs);
  }, [delayMs, open]);

  useEffect(() => () => clear(), [clear]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide();
    };
    const onScroll = () => hide();
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, hide]);

  if (!text) {
    return <>{children}</>;
  }

  const bubble = open ? (
    <div
      id={tipId}
      role="tooltip"
      className={`audit-help-tip__bubble audit-help-tip__bubble--${placement}`}
    >
      {text}
    </div>
  ) : null;

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<ChildProps>;
    return cloneElement(child, {
      className: [
        child.props.className,
        "audit-help-tip",
        `audit-help-tip--${display}`,
        "audit-help-tip--as-child",
        className,
        open ? "is-open" : "",
      ]
        .filter(Boolean)
        .join(" "),
      style: { ...(child.props.style || {}), position: "relative" },
      onPointerEnter: (e: PointerEvent) => {
        child.props.onPointerEnter?.(e);
        start();
      },
      onPointerLeave: (e: PointerEvent) => {
        child.props.onPointerLeave?.(e);
        hide();
      },
      onMouseEnter: (e: MouseEvent) => {
        child.props.onMouseEnter?.(e);
        start();
      },
      onMouseLeave: (e: MouseEvent) => {
        child.props.onMouseLeave?.(e);
        hide();
      },
      onFocus: (e: FocusEvent) => {
        child.props.onFocus?.(e);
        start();
      },
      onBlur: (e: FocusEvent) => {
        child.props.onBlur?.(e);
        hide();
      },
      "aria-describedby": open ? tipId : child.props["aria-describedby"],
      children: (
        <>
          {child.props.children}
          {bubble}
        </>
      ),
    });
  }

  return (
    <div
      className={`audit-help-tip audit-help-tip--${display}${
        className ? ` ${className}` : ""
      }${open ? " is-open" : ""}`}
      onPointerEnter={start}
      onPointerLeave={hide}
      onMouseEnter={start}
      onMouseLeave={hide}
      onFocus={start}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          hide();
        }
      }}
    >
      {children}
      {bubble}
    </div>
  );
}
