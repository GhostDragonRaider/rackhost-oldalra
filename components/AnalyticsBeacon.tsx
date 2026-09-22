import { useEffect } from "react";
import { useRouter } from "next/router";

function hasSkipAnalyticsCookie(): boolean {
  if (typeof document === "undefined") return false;
  return /(?:^|;\s*)ac_skip_analytics=1(?:;|$)/.test(document.cookie);
}

/** Silent pageview beacon — never linked from UI; skips /admin and owner browsers. */
export default function AnalyticsBeacon() {
  const router = useRouter();

  useEffect(() => {
    const send = (url: string) => {
      const path = url.split("?")[0] || "/";
      if (path.startsWith("/admin") || path.startsWith("/api/")) return;
      if (hasSkipAnalyticsCookie()) return;
      void fetch("/api/analytics/collect", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
        keepalive: true,
      });
    };

    send(router.asPath);
    const onRoute = (url: string) => send(url);
    router.events.on("routeChangeComplete", onRoute);
    return () => router.events.off("routeChangeComplete", onRoute);
  }, [router]);

  return null;
}
