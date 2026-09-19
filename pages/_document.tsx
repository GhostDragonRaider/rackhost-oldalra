import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="hu">
      <Head>
        <meta name="theme-color" content="#081426" />
        <style
          dangerouslySetInnerHTML={{
            __html:
              "html,body{background:#081426!important;background-image:none!important;margin:0;min-height:100%}",
          }}
        />
      </Head>
      <body className="landing-active">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
