import Head from "next/head";
import { useLocale } from "../../lib/i18n/LocaleContext";
import {
  absoluteUrl,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  defaultOgImage,
  SITE_NAME,
} from "../../lib/site";

type SeoHeadProps = {
  title?: string;
  description?: string;
  path?: string;
  noindex?: boolean;
  ogImage?: string;
  ogType?: "website" | "article";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

export default function SeoHead({
  title,
  description,
  path = "/",
  noindex = false,
  ogImage,
  ogType = "website",
  jsonLd,
}: SeoHeadProps) {
  const { t } = useLocale();
  const resolvedTitle = title ?? t.meta.title ?? DEFAULT_TITLE;
  const resolvedDescription =
    description ?? t.meta.description ?? DEFAULT_DESCRIPTION;
  const canonical = absoluteUrl(path);
  const robots = noindex ? "noindex,nofollow" : "index,follow";
  const image = ogImage || defaultOgImage();
  const gsc =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_GSC_VERIFICATION
      : undefined;

  return (
    <Head>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/logo.png" />
      <meta
        name="theme-color"
        content="#f5f8fc"
      />
      {gsc ? (
        <meta name="google-site-verification" content={gsc} />
      ) : null}
      <meta property="og:locale" content={t.meta.ogLocale} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta
        property="og:image:alt"
        content={`${SITE_NAME} — weboldal készítés`}
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={image} />
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      ) : null}
    </Head>
  );
}
