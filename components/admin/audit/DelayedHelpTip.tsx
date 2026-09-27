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
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const DEFAULT_DELAY_MS = 2000;

type DelayedHelpTipProps = {
  text: string;
  children: ReactNode;
  className?: string;
  delayMs?: number;
  placement?: "top" | "bottom" | "right";
  display?: "inline" | "block";
  /** Merge handlers onto the child (for headings / nav links). */
  asChild?: boolean;
  /**
   * `fixed` + portal — use for menus inside overflow:auto containers
   * so the tip is never clipped.
   */
  strategy?: "absolute" | "fixed";
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
  ref?: (node: HTMLElement | null) => void;
};

type TipCoords = { top: number; left: number };

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
  strategy = "absolute",
}: DelayedHelpTipProps) {
  const tipId = useId();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<TipCoords | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const hide = useCallback(() => {
    clear();
    setOpen(false);
    setCoords(null);
  }, [clear]);

  const start = useCallback(() => {
    // Do not reset an already-scheduled tip (pointer+mouse duplicate events).
    if (timerRef.current || open) return;
    timerRef.current = setTimeout(() => setOpen(true), delayMs);
  }, [delayMs, open]);

  const measure = useCallback(() => {
    const el = triggerRef.current;
    if (!el || strategy !== "fixed") return;
    const r = el.getBoundingClientRect();
    const gap = 10;
    if (placement === "bottom") {
      setCoords({ top: r.bottom + gap, left: r.left + r.width / 2 });
    } else if (placement === "right") {
      setCoords({ top: r.top + r.height / 2, left: r.right + gap });
    } else {
      setCoords({ top: r.top - gap, left: r.left + r.width / 2 });
    }
  }, [placement, strategy]);

  useEffect(() => () => clear(), [clear]);

  useLayoutEffect(() => {
    if (!open || strategy !== "fixed") return;
    measure();
    const onMove = () => measure();
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open, strategy, measure]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide();
    };
    const onScroll = () => {
      if (strategy === "fixed") measure();
      else hide();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, hide, strategy, measure]);

  if (!text) {
    return <>{children}</>;
  }

  const fixedStyle: CSSProperties | undefined =
    strategy === "fixed" && coords
      ? placement === "right"
        ? {
            position: "fixed",
            top: coords.top,
            left: coords.left,
            transform: "translateY(-50%)",
          }
        : placement === "bottom"
          ? {
              position: "fixed",
              top: coords.top,
              left: coords.left,
              transform: "translateX(-50%)",
            }
          : {
              position: "fixed",
              top: coords.top,
              left: coords.left,
              transform: "translate(-50%, -100%)",
            }
      : undefined;

  const bubble =
    open && (strategy !== "fixed" || coords) ? (
      <div
        id={tipId}
        role="tooltip"
        className={`audit-help-tip__bubble audit-help-tip__bubble--${placement}${
          strategy === "fixed" ? " audit-help-tip__bubble--fixed" : ""
        }`}
        style={fixedStyle}
      >
        {text}
      </div>
    ) : null;

  const portalBubble =
    strategy === "fixed" && typeof document !== "undefined" && bubble
      ? createPortal(bubble, document.body)
      : null;

  const setTriggerNode = useCallback((node: HTMLElement | null) => {
    triggerRef.current = node;
  }, []);

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<ChildProps>;
    return (
      <>
        {cloneElement(child, {
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
          style: {
            ...(child.props.style || {}),
            position: child.props.style?.position || "relative",
          },
          ref: (node: HTMLElement | null) => {
            setTriggerNode(node);
            const prev = child.props.ref;
            if (typeof prev === "function") prev(node);
          },
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
              {strategy === "absolute" ? bubble : null}
            </>
          ),
        })}
        {portalBubble}
      </>
    );
  }

  return (
    <div
      ref={setTriggerNode}
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
      {strategy === "absolute" ? bubble : portalBubble}
    </div>
  );
}
