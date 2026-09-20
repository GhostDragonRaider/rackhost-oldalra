import { Head, Html, Main, NextScript } from "next/document";

/** Blocks wallpaper FOUC; default light theme, respects saved preference. */
export default function Document() {
  return (
    <Html lang="hu" data-theme="light">
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#f5f8fc" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("anticode-theme");document.documentElement.setAttribute("data-theme",t==="dark"?"dark":"light");}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: [
              "html,body{background-image:none!important}",
              'html:not([data-theme="dark"]),html:not([data-theme="dark"]) body{background-color:#f5f8fc}',
              'html[data-theme="dark"],html[data-theme="dark"] body{background-color:#081426}',
              "body.landing-active .nav .links a{color:#52637a}",
              'html[data-theme="dark"] body.landing-active .nav .links a{color:#b6c6dd}',
            ].join(""),
          }}
        />
      </Head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=location.pathname.replace(/\\/$/,"")||"/";var ok=p==="/"||p==="/arak"||p==="/kapcsolat"||p==="/rolam"||p==="/tudastar"||p.indexOf("/tudastar/")===0||p==="/weboldal-keszites"||p==="/webshop-keszites"||p==="/egyedi-webfejlesztes"||p==="/weboldal-karbantartas";if(ok)document.body.classList.add("landing-active");}catch(e){}})();`,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
