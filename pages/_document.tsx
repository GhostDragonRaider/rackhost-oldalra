import { Head, Html, Main, NextScript } from "next/document";

/** Blocks wallpaper FOUC; respects saved light/dark theme before paint. */
export default function Document() {
  return (
    <Html lang="hu">
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
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
              "body.landing-active .nav .links a{color:#b6c6dd}",
              'html[data-theme="light"] body.landing-active .nav .links a{color:#52637a}',
            ].join(""),
          }}
        />
      </Head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=location.pathname.replace(/\\/$/,"")||"/";var ok=p==="/"||p==="/arak"||p==="/weboldal-keszites"||p==="/webshop-keszites"||p==="/egyedi-webfejlesztes"||p==="/weboldal-karbantartas";if(ok)document.body.classList.add("landing-active");}catch(e){}})();`,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
