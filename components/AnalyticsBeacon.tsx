import { useEffect } from "react";
import { useRouter } from "next/router";

/** In-memory dedupe survives React Strict Mode remounts in the same tab. */
const recentPageviews = new Map<string, number>();
const DEDUPE_MS = 2500;

function normalizePath(url: string): string {
  const noQuery = (url.split("?")[0] || "/").split("#")[0] || "/";
  return noQuery.length > 1 && noQuery.endsWith("/")
    ? noQuery.slice(0, -1)
    : noQuery;
}

function shouldSkipDuplicate(path: string): boolean {
  const now = Date.now();
  const last = recentPageviews.get(path) || 0;
  if (now - last < DEDUPE_MS) return true;
  recentPageviews.set(path, now);
  if (recentPageviews.size > 80) {
    for (const [key, at] of recentPageviews) {
      if (now - at > DEDUPE_MS) recentPageviews.delete(key);
    }
  }
  return false;
}

/** Silent pageview beacon — never linked from UI; skips /admin. */
export default function AnalyticsBeacon() {
  const router = useRouter();

  useEffect(() => {
    const send = (url: string) => {
      const path = normalizePath(url);
      if (path.startsWith("/admin") || path.startsWith("/api/")) return;
      if (shouldSkipDuplicate(path)) return;
      void fetch("/api/analytics/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
        keepalive: true,
      });
    };

    send(router.asPath);
    const onRoute = (url: string) => send(url);
    router.events.on("routeChangeComplete", onRoute);
    return () => router.events.off("routeChangeComplete", onRoute);
    // Only subscribe once. Do not depend on asPath — that remounts the effect
    // and would send again on every client navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [router.events]);

  return null;
}
