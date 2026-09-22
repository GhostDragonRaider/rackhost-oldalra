function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? stripTags(m[1]) || null : null;
}

export function metaContent(html: string, name: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["']`,
    "i"
  );
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${name}["']`,
    "i"
  );
  const m = html.match(re) || html.match(re2);
  return m?.[1]?.trim() || null;
}

export function extractCanonical(html: string): string | null {
  const m =
    html.match(
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i
    ) ||
    html.match(
      /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i
    );
  return m?.[1]?.trim() || null;
}

export function extractH1s(html: string): string[] {
  const out: string[] = [];
  const re = /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const text = stripTags(match[1]);
    if (text) out.push(text);
  }
  return out;
}

export function extractHtmlLang(html: string): string | null {
  const m = html.match(/<html\b[^>]*\blang=["']([^"']*)["']/i);
  if (!m) return null;
  return m[1].trim() || "";
}

export function extractViewport(html: string): string | null {
  return metaContent(html, "viewport");
}

export type HeadingNode = { level: number; text: string };

export function extractHeadings(html: string): HeadingNode[] {
  const out: HeadingNode[] = [];
  const re = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const level = Number(match[1]);
    const text = stripTags(match[2]);
    if (text) out.push({ level, text });
  }
  return out;
}

export type ImageInfo = {
  src: string | null;
  alt: string | null;
  hasAltAttr: boolean;
  emptyAlt: boolean;
};

export function extractImages(html: string): ImageInfo[] {
  const out: ImageInfo[] = [];
  const re = /<img\b([^>]*)>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const attrs = match[1];
    const src = attrs.match(/\bsrc=["']([^"']*)["']/i)?.[1] ?? null;
    const altMatch = attrs.match(/\balt=["']([^"']*)["']/i);
    const hasAltAttr = /\balt\s*=/i.test(attrs);
    const alt = hasAltAttr ? (altMatch?.[1] ?? "") : null;
    out.push({
      src,
      alt,
      hasAltAttr,
      emptyAlt: hasAltAttr && (alt === "" || alt == null),
    });
  }
  return out;
}

export type LinkInfo = {
  href: string | null;
  text: string;
  ariaLabel: string | null;
};

export function extractLinks(html: string): LinkInfo[] {
  const out: LinkInfo[] = [];
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const attrs = match[1];
    const href = attrs.match(/\bhref=["']([^"']*)["']/i)?.[1] ?? null;
    const ariaLabel =
      attrs.match(/\baria-label=["']([^"']*)["']/i)?.[1]?.trim() || null;
    const text = stripTags(match[2]);
    out.push({ href, text, ariaLabel });
  }
  return out;
}

export type InputInfo = {
  type: string;
  id: string | null;
  name: string | null;
  ariaLabel: string | null;
  hasAriaLabelledBy: boolean;
  placeholder: string | null;
};

export function extractInputs(html: string): InputInfo[] {
  const out: InputInfo[] = [];
  const re = /<(input|textarea|select)\b([^>]*)\/?>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const tag = match[1].toLowerCase();
    const attrs = match[2];
    const type =
      tag === "input"
        ? (attrs.match(/\btype=["']([^"']*)["']/i)?.[1] || "text").toLowerCase()
        : tag;
    if (type === "hidden" || type === "submit" || type === "button" || type === "image" || type === "reset") {
      continue;
    }
    out.push({
      type,
      id: attrs.match(/\bid=["']([^"']*)["']/i)?.[1] || null,
      name: attrs.match(/\bname=["']([^"']*)["']/i)?.[1] || null,
      ariaLabel: attrs.match(/\baria-label=["']([^"']*)["']/i)?.[1] || null,
      hasAriaLabelledBy: /\baria-labelledby\s*=/i.test(attrs),
      placeholder: attrs.match(/\bplaceholder=["']([^"']*)["']/i)?.[1] || null,
    });
  }
  return out;
}

export function extractLabelFors(html: string): Set<string> {
  const set = new Set<string>();
  const re = /<label\b([^>]*)>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const forId = match[1].match(/\bfor=["']([^"']*)["']/i)?.[1];
    if (forId) set.add(forId);
  }
  // Also count inputs nested inside labels as labeled (heuristic: label...input.../label)
  return set;
}

export function countNestedLabelInputs(html: string): number {
  const re = /<label\b[^>]*>[\s\S]*?<(?:input|textarea|select)\b[\s\S]*?<\/label>/gi;
  return (html.match(re) || []).length;
}

export type ButtonInfo = {
  text: string;
  ariaLabel: string | null;
  type: string | null;
};

export function extractButtons(html: string): ButtonInfo[] {
  const out: ButtonInfo[] = [];
  const re = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const attrs = match[1];
    out.push({
      text: stripTags(match[2]),
      ariaLabel: attrs.match(/\baria-label=["']([^"']*)["']/i)?.[1] || null,
      type: attrs.match(/\btype=["']([^"']*)["']/i)?.[1] || null,
    });
  }
  // input type=button|submit|reset with value
  const re2 = /<input\b([^>]*\btype=["'](?:button|submit|reset)["'][^>]*)\/?>/gi;
  while ((match = re2.exec(html))) {
    const attrs = match[1];
    out.push({
      text: attrs.match(/\bvalue=["']([^"']*)["']/i)?.[1] || "",
      ariaLabel: attrs.match(/\baria-label=["']([^"']*)["']/i)?.[1] || null,
      type: attrs.match(/\btype=["']([^"']*)["']/i)?.[1] || null,
    });
  }
  return out;
}

export function approximateWordCount(html: string): number {
  const withoutScripts = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ");
  const text = stripTags(withoutScripts);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

export type JsonLdBlock = {
  raw: string;
  parseOk: boolean;
  types: string[];
  error: string | null;
};

function collectTypes(node: unknown, into: Set<string>) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) collectTypes(item, into);
    return;
  }
  const obj = node as Record<string, unknown>;
  const t = obj["@type"];
  if (typeof t === "string") into.add(t);
  else if (Array.isArray(t)) {
    for (const x of t) if (typeof x === "string") into.add(x);
  }
  if (obj["@graph"]) collectTypes(obj["@graph"], into);
}

export function extractJsonLd(html: string): JsonLdBlock[] {
  const out: JsonLdBlock[] = [];
  const re =
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const raw = match[1].trim();
    try {
      const parsed = JSON.parse(raw) as unknown;
      const types = new Set<string>();
      collectTypes(parsed, types);
      out.push({
        raw: raw.slice(0, 500),
        parseOk: true,
        types: Array.from(types),
        error: null,
      });
    } catch (e) {
      out.push({
        raw: raw.slice(0, 500),
        parseOk: false,
        types: [],
        error: e instanceof Error ? e.message : "JSON parse hiba",
      });
    }
  }
  return out;
}

export type SocialMeta = {
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogUrl: string | null;
  ogType: string | null;
  twitterCard: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
};

export function extractSocialMeta(html: string): SocialMeta {
  return {
    ogTitle: metaContent(html, "og:title"),
    ogDescription: metaContent(html, "og:description"),
    ogImage: metaContent(html, "og:image"),
    ogUrl: metaContent(html, "og:url"),
    ogType: metaContent(html, "og:type"),
    twitterCard: metaContent(html, "twitter:card"),
    twitterTitle: metaContent(html, "twitter:title"),
    twitterDescription: metaContent(html, "twitter:description"),
    twitterImage: metaContent(html, "twitter:image"),
  };
}

export function hasFavicon(html: string): boolean {
  return /<link\b[^>]*rel=["'][^"']*icon[^"']*["']/i.test(html);
}

export function hasWebManifest(html: string): boolean {
  return /<link\b[^>]*rel=["']manifest["']/i.test(html);
}

export function detectMixedContent(html: string, pageIsHttps: boolean): string[] {
  if (!pageIsHttps) return [];
  const hits: string[] = [];
  const re = /\b(?:src|href)=["'](http:\/\/[^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const url = match[1];
    if (!hits.includes(url)) hits.push(url);
    if (hits.length >= 8) break;
  }
  return hits;
}

export function detectAriaIssues(html: string): string[] {
  const issues: string[] = [];
  if (/aria-hidden=["']true["'][^>]*>\s*<a\b/i.test(html)) {
    issues.push("aria-hidden elemben található link (gyanús)");
  }
  const emptyAria = (html.match(/\baria-label=["']\s*["']/gi) || []).length;
  if (emptyAria > 0) {
    issues.push(`${emptyAria} üres aria-label`);
  }
  return issues;
}

/** Legacy helper kept for existing unit tests — maps to richer analyzer. */
export function analyzeHtmlSeo(html: string): {
  title: string | null;
  metaDescription: string | null;
  canonical: string | null;
  h1Texts: string[];
  findings: Array<{
    id: string;
    severity: "critical" | "warning" | "info" | "pass" | "medium" | "high" | "low";
    title: string;
  }>;
} {
  const title = extractTitle(html);
  const metaDescription = metaContent(html, "description");
  const canonical = extractCanonical(html);
  const h1Texts = extractH1s(html);
  const findings: Array<{
    id: string;
    severity: "critical" | "warning" | "info" | "pass" | "medium" | "high" | "low";
    title: string;
  }> = [];

  if (!title) {
    findings.push({
      id: "title-missing",
      severity: "critical",
      title: "Hiányzó title",
    });
  } else {
    findings.push({ id: "title-ok", severity: "pass", title: "Title rendben" });
  }

  if (!metaDescription) {
    findings.push({
      id: "desc-missing",
      severity: "warning",
      title: "Hiányzó meta description",
    });
  } else {
    findings.push({
      id: "desc-ok",
      severity: "pass",
      title: "Meta description rendben",
    });
  }

  if (h1Texts.length === 0) {
    findings.push({
      id: "h1-missing",
      severity: "warning",
      title: "Hiányzó H1",
    });
  } else if (h1Texts.length > 1) {
    findings.push({
      id: "h1-multiple",
      severity: "warning",
      title: "Több H1",
    });
  } else {
    findings.push({ id: "h1-ok", severity: "pass", title: "H1 rendben" });
  }

  if (!canonical) {
    findings.push({
      id: "canonical-missing",
      severity: "info",
      title: "Hiányzó canonical",
    });
  } else {
    findings.push({
      id: "canonical-ok",
      severity: "pass",
      title: "Canonical rendben",
    });
  }

  return { title, metaDescription, canonical, h1Texts, findings };
}

export type ParsedHtmlDocument = {
  title: string | null;
  metaDescription: string | null;
  canonical: string | null;
  htmlLang: string | null;
  viewport: string | null;
  metaRobots: string | null;
  h1Texts: string[];
  headings: HeadingNode[];
  images: ImageInfo[];
  links: LinkInfo[];
  inputs: InputInfo[];
  labelFors: Set<string>;
  nestedLabelInputs: number;
  buttons: ButtonInfo[];
  wordCount: number;
  jsonLd: JsonLdBlock[];
  social: SocialMeta;
  favicon: boolean;
  manifest: boolean;
  mixedContentUrls: string[];
  ariaIssues: string[];
};

export function parseHtmlDocument(
  html: string,
  opts?: { pageIsHttps?: boolean }
): ParsedHtmlDocument {
  return {
    title: extractTitle(html),
    metaDescription: metaContent(html, "description"),
    canonical: extractCanonical(html),
    htmlLang: extractHtmlLang(html),
    viewport: extractViewport(html),
    metaRobots: metaContent(html, "robots"),
    h1Texts: extractH1s(html),
    headings: extractHeadings(html),
    images: extractImages(html),
    links: extractLinks(html),
    inputs: extractInputs(html),
    labelFors: extractLabelFors(html),
    nestedLabelInputs: countNestedLabelInputs(html),
    buttons: extractButtons(html),
    wordCount: approximateWordCount(html),
    jsonLd: extractJsonLd(html),
    social: extractSocialMeta(html),
    favicon: hasFavicon(html),
    manifest: hasWebManifest(html),
    mixedContentUrls: detectMixedContent(html, Boolean(opts?.pageIsHttps)),
    ariaIssues: detectAriaIssues(html),
  };
}
