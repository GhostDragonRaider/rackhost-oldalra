import { useEffect } from "react";
import { useRouter } from "next/router";

/** Silent pageview beacon — never linked from UI; skips /admin. */
export default function AnalyticsBeacon() {
  const router = useRouter();

  useEffect(() => {
    const send = (url: string) => {
      const path = url.split("?")[0] || "/";
      if (path.startsWith("/admin") || path.startsWith("/api/")) return;
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
  }, [router]);

  return null;
}
