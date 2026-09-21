export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | {
      type: "table";
      headers: string[];
      rows: string[][];
      caption?: string;
    }
  | { type: "code"; code: string; caption?: string }
  | { type: "compare"; bad: string; good: string; note?: string }
  | { type: "checklist"; title?: string; items: string[] }
  | { type: "note"; text: string };

export type ArticleSection = {
  heading: string;
  blocks: ArticleBlock[];
};

export type Article = {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  readingMinutes: number;
  eyebrow: string;
  h1: string;
  lead: string;
  /** Shorter card copy on /tudastar (can differ from lead). */
  cardExcerpt: string;
  sections: ArticleSection[];
  relatedServices: { href: string; label: string }[];
  relatedArticles?: { slug: string; label: string }[];
  closingCta?: { text: string; href: string; label: string };
};

/** Parse simple [label](/path) and [label](https://...) links in article text. */
export function parseInlineLinks(text: string): Array<
  | { type: "text"; value: string }
  | { type: "link"; href: string; label: string }
> {
  const parts: Array<
    | { type: "text"; value: string }
    | { type: "link"; href: string; label: string }
  > = [];
  const re = /\[([^\]]+)\]\((\/[^)\s]+|https?:\/\/[^)\s]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    if (match.index > last) {
      parts.push({ type: "text", value: text.slice(last, match.index) });
    }
    parts.push({ type: "link", href: match[2], label: match[1] });
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    parts.push({ type: "text", value: text.slice(last) });
  }
  return parts.length ? parts : [{ type: "text", value: text }];
}
