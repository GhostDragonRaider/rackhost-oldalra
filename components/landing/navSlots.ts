/** Stable nav slots so HU/EN/DE labels share one reserved width. */
export type NavSlot =
  | "services"
  | "pricing"
  | "knowledge"
  | "work"
  | "process"
  | "about"
  | "contact";

export function navSlotFromHref(href: string): NavSlot | undefined {
  const h = href.toLowerCase();
  if (h.includes("szolgaltatasok")) return "services";
  if (h.includes("/arak") || h.endsWith("#arak") || h.includes("#arak")) {
    return "pricing";
  }
  if (h.includes("tudastar")) return "knowledge";
  if (h.includes("referenciak")) return "work";
  if (h.includes("folyamat")) return "process";
  if (h.includes("rolam")) return "about";
  if (h.includes("kapcsolat")) return "contact";
  return undefined;
}
