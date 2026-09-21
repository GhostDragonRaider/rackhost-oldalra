export function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/\s+/g, " ").trim() || null : null;
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
    const text = match[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (text) out.push(text);
  }
  return out;
}

export function analyzeHtmlSeo(html: string): {
  title: string | null;
  metaDescription: string | null;
  canonical: string | null;
  h1Texts: string[];
  findings: Array<{
    id: string;
    severity: "critical" | "warning" | "info" | "pass";
    title: string;
  }>;
} {
  const title = extractTitle(html);
  const metaDescription = metaContent(html, "description");
  const canonical = extractCanonical(html);
  const h1Texts = extractH1s(html);
  const findings: Array<{
    id: string;
    severity: "critical" | "warning" | "info" | "pass";
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
