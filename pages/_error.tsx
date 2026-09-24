import Head from "next/head";
import Link from "next/link";
import type { NextPageContext } from "next";
import { useLocale } from "../lib/i18n/LocaleContext";

type Props = { statusCode?: number };

function ErrorPage({ statusCode }: Props) {
  const { t } = useLocale();
  const code = statusCode || 500;
  return (
    <>
      <Head>
        <title>
          {code} | AntiCode
        </title>
        <meta name="robots" content="noindex" />
      </Head>
      <main className="site-error">
        <p className="site-error-code">{code}</p>
        <h1>{t.errors.errorTitle}</h1>
        <p>{t.errors.errorBody}</p>
        <Link href="/">{t.serviceUi.home}</Link>
      </main>
    </>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode || err?.statusCode || 500;
  return { statusCode };
};

export default ErrorPage;
