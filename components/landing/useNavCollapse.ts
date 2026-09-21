import { RefObject, useLayoutEffect, useState } from "react";

/**
 * Collapse desktop nav links into the hamburger when brand + links + actions
 * no longer fit the nav container (mid-width viewports / long locales).
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
      void links.offsetWidth;

      const styles = getComputedStyle(container);
      const colGap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
      const linkStyles = getComputedStyle(links);
      const linkGap = parseFloat(linkStyles.columnGap || linkStyles.gap || "0") || 0;
      const pad =
        (parseFloat(styles.paddingLeft) || 0) +
        (parseFloat(styles.paddingRight) || 0);

      const linkChildren = Array.from(links.children) as HTMLElement[];
      const linksWidth =
        linkChildren.reduce((sum, el) => sum + el.offsetWidth, 0) +
        Math.max(0, linkChildren.length - 1) * linkGap;

      // Menu is display:none while measuring; reserve space for it so
      // collapsing does not immediately overflow the action cluster.
      const menu = actions.querySelector<HTMLElement>(".menu");
      const menuReserve = menu ? 42 + 8 : 0;

      const available =
        container.clientWidth -
        brand.offsetWidth -
        actions.offsetWidth -
        menuReserve -
        colGap * 2 -
        pad;

      const overflow = linksWidth > available - 8;
      const roomy = linksWidth <= available - 36;

      nav.classList.remove("nav-measuring");

      setCollapsed((prev) => (overflow ? true : roomy ? false : prev));
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(container);
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      nav.classList.remove("nav-measuring");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller passes locale/nav deps
  }, [navContainerRef, ...deps]);

  return collapsed;
}
