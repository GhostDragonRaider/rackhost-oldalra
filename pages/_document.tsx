import { Head, Html, Main, NextScript } from "next/document";

/** Prevents a flash of the old wallpaper before React hydrates. */
export default function Document() {
  return (
    <Html lang="hu">
      <Head>
        <meta name="theme-color" content="#081426" />
        <style
          dangerouslySetInnerHTML={{
            __html:
              "html,body{background-color:#081426!important;background-image:none!important}",
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
