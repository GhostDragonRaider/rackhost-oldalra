import { ARTICLES } from "./articles";
import { SERVICE_PATHS, SITE_URL } from "./site";

/** Public paths crawled by the SEO monitor (no admin / API / demos). */
export function getMonitoredPaths(): string[] {
  const paths = new Set<string>([
    "/",
    ...SERVICE_PATHS,
    "/kapcsolat",
    "/rolam",
    "/tudastar",
  ]);

  for (const article of ARTICLES) {
    paths.add(`/tudastar/${article.slug}`);
  }

  return [...paths].sort((a, b) => a.localeCompare(b, "hu"));
}

export function getMonitoredUrls(baseUrl = SITE_URL): string[] {
  const origin = baseUrl.replace(/\/$/, "");
  return getMonitoredPaths().map((p) =>
    p === "/" ? `${origin}/` : `${origin}${p}`
  );
}
