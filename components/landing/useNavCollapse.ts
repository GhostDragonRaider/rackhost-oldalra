import { RefObject, useLayoutEffect, useState } from "react";

/**
 * Collapse desktop nav links into the hamburger when the link row would
 * overlap the action cluster (theme / CTA / lang).
 */
export function useNavCollapse(
  navContainerRef: RefObject<HTMLElement | null>,
  deps: unknown[] = []
) {
  const [collapsed, setCollapsed] = useState(false);

  useLayoutEffect(() => {
    const container = navContainerRef.current;
    if (!container) return;

    const nav = container.closest(".nav");
    const brand = container.querySelector<HTMLElement>(".brand");
    const links = container.querySelector<HTMLElement>(".links");
    const actions = container.querySelector<HTMLElement>(".nav-actions");
    if (!nav || !brand || !links || !actions) return;

    const measure = () => {
      // Force expanded metrics: links visible, hamburger hidden.
      nav.classList.add("nav-measuring");
      nav.classList.remove("nav-collapsed");
      void links.offsetWidth;

      const linkChildren = Array.from(links.children) as HTMLElement[];
      const lastLink = linkChildren[linkChildren.length - 1];
      // First *visible* action (menu is display:none while measuring).
      const actionItems = Array.from(actions.children) as HTMLElement[];
      const firstAction = actionItems.find(
        (el) => getComputedStyle(el).display !== "none"
      );

      let overflow = false;
      let roomy = true;

      if (lastLink && firstAction) {
        const linkRight = lastLink.getBoundingClientRect().right;
        const actionLeft = firstAction.getBoundingClientRect().left;
        const gap = actionLeft - linkRight;
        // Need a clear gap; collapse if touching/overlapping.
        overflow = gap < 12;
        roomy = gap >= 28;
      } else {
        // Fallback: compare content width vs free middle space.
        const styles = getComputedStyle(container);
        const colGap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
        const linkStyles = getComputedStyle(links);
        const linkGap =
          parseFloat(linkStyles.columnGap || linkStyles.gap || "0") || 0;
        const linksWidth =
          linkChildren.reduce((sum, el) => sum + el.offsetWidth, 0) +
          Math.max(0, linkChildren.length - 1) * linkGap;
        const available =
          container.clientWidth -
          brand.offsetWidth -
          actions.offsetWidth -
          colGap * 2;
        overflow = linksWidth > available - 8;
        roomy = linksWidth <= available - 36;
      }

      nav.classList.remove("nav-measuring");

      setCollapsed((prev) => {
        const next = overflow ? true : roomy ? false : prev;
        // Keep DOM class in sync immediately for CSS sibling mobile-nav.
        nav.classList.toggle("nav-collapsed", next);
        return next;
      });
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(container);
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      nav.classList.remove("nav-measuring", "nav-collapsed");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller passes locale/nav deps
  }, [navContainerRef, ...deps]);

  return collapsed;
}
