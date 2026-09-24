import Head from "next/head";
import Link from "next/link";
import { useLocale } from "../lib/i18n/LocaleContext";

export default function Custom404() {
  const { t } = useLocale();
  return (
    <>
      <Head>
        <title>{t.errors.notFoundTitle} | AntiCode</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main className="site-error">
        <p className="site-error-code">404</p>
        <h1>{t.errors.notFoundTitle}</h1>
        <p>{t.errors.notFoundBody}</p>
        <Link href="/">{t.serviceUi.home}</Link>
      </main>
    </>
  );
}
