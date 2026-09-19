import { Head, Html, Main, NextScript } from "next/document";

/** Blocks wallpaper FOUC; respects saved light/dark theme before paint. */
export default function Document() {
  return (
    <Html lang="hu">
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("anticode-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: [
              "html,body{background-image:none!important}",
              'html:not([data-theme="light"]),html:not([data-theme="light"]) body{background-color:#081426}',
              'html[data-theme="light"],html[data-theme="light"] body{background-color:#f5f8fc}',
            ].join(""),
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
