import type { AuditCategoryId, AuditSeverity } from "./types";

/** Layperson help texts for audit dashboard elements (shown after 2s hover). */

export const OVERALL_SCORE_HELP =
  "Ez az oldal összesített „egészségügyi” pontszáma 0–100 között. A hét vizsgálati terület eredményéből számoljuk. Minél magasabb, annál kevesebb komoly technikai gondot találtunk — nem minősítés a tartalomról vagy a designról.";

export const SECTION_HELP = {
  severity:
    "Itt azt látod, hány ellenőrzés ment át rendben, és hány jelzett kisebb vagy súlyosabb problémát. Segít egy pillantással megítélni, mennyire „tiszta” az eredmény.",
  categories:
    "A hét fő vizsgálati terület saját pontszáma. Mindegyik más szempontot néz (pl. biztonság, keresőbarátság). Kattints egy sorra, és ugorj a részletekhez.",
  priority:
    "Automatikusan rangsorolt lista: először a legsúlyosabb, legérdemesebb javítanivalók. Ha kevés időd van, ezekkel érdemes kezdeni.",
  indexability:
    "Azt mutatja, van-e olyan technikai utasítás az oldalon, ami miatt a keresők (pl. Google) szándékosan ne indexeljék. Nem állítja, hogy ténylegesen bent van-e a Google találatai között.",
  details:
    "Kategóriánként az összes konkrét ellenőrzés. Kinyithatod a területeket, és szűrhetsz a problémás vagy a sikeres tételekre.",
  technical:
    "Nyers, technikai mérési adatok (URL, válaszidő, TLS stb.). Fejlesztőknek és mélyebb vizsgálatnak hasznos; a javítási listához nem kötelező.",
} as const;

export const CATEGORY_HELP: Record<AuditCategoryId, string> = {
  availability:
    "Elérhetőség: az oldal egyáltalán megnyílik-e a böngészőben. HTTP hibák (pl. 404, 500), túl sok átirányítás vagy hálózati gond ide tartozik. Ha ez gyenge, a többi ellenőrzés is kevésbé releváns.",
  security:
    "Biztonság: HTTPS, tanúsítvány, biztonsági válaszfejlécek és cookie beállítások. Célja, hogy a látogatók kapcsolata védettebb legyen — ez nem teljes biztonsági audit vagy „feltörhetetlen” minősítés.",
  seo:
    "SEO (keresőoptimalizálás): title, leírás, canonical, indexelhetőség, közösségi megosztás jelek. Segít, hogy a keresők és a megosztások érthetően mutassák az oldalt.",
  content:
    "Tartalom: címsorok (H1–H6), képek, linkek, szövegmennyiség. Azt nézi, mennyire átlátható és géppel is értelmezhető a HTML tartalom — nem a szöveg minőségét pontozza.",
  performance:
    "Teljesítmény: milyen gyorsan válaszol és töltődik az oldal (válaszidő, méret, PageSpeed). Gyorsabb oldal jobb élményt ad, és a keresők is figyelembe vehetik.",
  accessibility:
    "Akadálymentesség: mennyire használható az oldal pl. képernyőolvasóval vagy nagyítással (nyelv, képleírások, űrlap címkék). Automatikus ellenőrzés — nem egyenlő hivatalos WCAG tanúsítvánnyal.",
  best_practices:
    "Best practices: általános, jól bevált webtechnikai szokások (HTTPS, robots.txt, favicon, viewport stb.). Nem „hibák listája”, inkább ajánlott alapok.",
};

export const SEVERITY_HELP: Record<AuditSeverity | "warning", string> = {
  pass: "Rendben: az ellenőrzés nem talált problémát ezen a ponton.",
  info: "Információ: nem hiba, hanem hasznos megjegyzés vagy kisebb tipp. Általában nem kell azonnal javítani.",
  low: "Alacsony: kisebb hiányosság vagy finomhangolás. Érdemes egyszer megnézni, de ritkán sürgős.",
  medium:
    "Közepes: érdemes javítani, mert rontja a minőséget, a biztonságot vagy a keresőbarátságot — de az oldal általában még használható.",
  warning:
    "Közepes: érdemes javítani, mert rontja a minőséget, a biztonságot vagy a keresőbarátságot — de az oldal általában még használható.",
  high: "Magas: komolyabb technikai gond. Érdemes hamar foglalkozni vele, mert erősen befolyásolhatja a biztonságot, a sebességet vagy a kereső megjelenést.",
  critical:
    "Kritikus: súlyos akadály (pl. az oldal nem elérhető, vagy a keresőknek tiltva van). Publikus oldalon ezt érdemes először rendezni.",
};

export const TECH_FIELD_HELP: Record<string, string> = {
  inputUrl:
    "Az a cím, amit te adtál meg az ellenőrzéshez. Innen indult a vizsgálat.",
  finalUrl:
    "A böngésző végül ide jutott (átirányítások után). Ha eltér az eredetitől, átirányítás történt.",
  statusCode:
    "A szerver válaszának kódja. 200 = rendben megjött az oldal. 404 = nem található. 5xx = szerverhiba.",
  responseMs:
    "Mennyi idő alatt érkezett meg a válasz ezredmásodpercben. Alacsonyabb érték = gyorsabb szerverválasz.",
  responseBytes:
    "Mekkora volt a letöltött HTML válasz bájtban. Nagyobb méret lassabb betöltést okozhat.",
  contentType:
    "A szerver szerint milyen típusú a válasz (pl. HTML oldal vagy valami más). SEO jelekhez HTML kell.",
  canonical:
    "A „hivatalos” URL, amit az oldal a keresőknek javasol. Segít elkerülni a duplikált tartalom zavarát.",
  htmlLang:
    "Az oldal nyelvének jelzése a HTML-ben (pl. hu). Segít a böngészőknek és a kisegítő technológiáknak.",
  robots:
    "Utasítások a keresőrobotoknak (meta robots / X-Robots-Tag). Pl. noindex esetén az oldal kérheti, hogy ne jelenjen meg a találatokban.",
  tls: "A HTTPS titkosítás / tanúsítvány állapota. Ez védi a látogató és a szerver közötti adatforgalmat.",
  pagespeed:
    "Honnan jött a teljesítménypont: valódi Google PageSpeed / Lighthouse mérés, vagy helyi, egyszerűbb becslés, ha az API nem volt elérhető.",
  auditedAt: "Mikor készült ez az ellenőrzés. Az eredmény pillanatkép, később változhat az oldal.",
  redirectChain:
    "Milyen címeken ment át a kérés, amíg a végső oldalhoz ért. Túl hosszú lánc lassíthat és zavarhat.",
  progress:
    "Az ellenőrzés belső lépései (URL, lekérés, SEO, PageSpeed stb.). Azt mutatja, mi futott le sikeresen.",
};

export const SOURCE_HELP = {
  pagespeed_api:
    "Ez az adat a Google PageSpeed Insights / Lighthouse valódi méréséből jön — nem becslés.",
  local_estimate:
    "Ez helyi, egyszerűbb becslés (pl. válaszidő és méret alapján), mert a Google PageSpeed most nem volt elérhető. Nem ugyanaz, mint a Lighthouse pontszám.",
} as const;

/**
 * Per-check layperson explainers. Keys are finding `id`s (prefix match OK via lookup).
 */
export const FINDING_HELP: Record<string, string> = {
  "status-ok":
    "Az oldal sikeresen megnyílt (általában HTTP 200). Ez az alap: a tartalom egyáltalán elérhető.",
  "status-404":
    "A szerver azt mondja: ez a cím nem létezik. A látogató „nem található” oldalt kap.",
  "status-5xx":
    "A szerveren hiba van — az oldal most nem szolgálható ki megbízhatóan.",
  "status-4xx":
    "A szerver hibás kérést jelzett (4xx). Gyakran rossz cím, jogosultság vagy tiltás áll mögötte.",
  "fetch-failed":
    "Az oldalt nem sikerült lekérni (hálózat, DNS vagy időtúllépés). Ilyenkor a többi vizsgálat korlátozott.",
  "redirect-error":
    "Az átirányítás hibás vagy veszélyes célra mutat. A biztonságos ellenőrző ilyenkor megáll.",
  "redirect-chain-long":
    "Túl sok ugrás van a kezdő cím és a végső oldal között. Lassíthat, és nehezíti a keresőknek is.",
  "body-too-large":
    "A válasz túl nagy volt a biztonsági limithoz képest, ezért az elemzés részleges lehet.",
  "http-to-https":
    "A http:// cím átirányít https://-re. Ez jó: a látogató titkosított kapcsolatra kerül.",
  "http-only":
    "Nincs biztonságos HTTPS átirányítás — a forgalom titkosítatlan maradhat.",
  "tls-ok":
    "A HTTPS tanúsítvány érvényesnek tűnik. A kapcsolat titkosítása rendben van ezen a ponton.",
  "tls-fail":
    "A HTTPS tanúsítvány vagy a titkosított kapcsolat problémás (lejárt, hibás, stb.).",
  "tls-no-https":
    "A végső cím nem HTTPS, ezért nincs biztonságos titkosítás.",
  "hdr-csp":
    "Content-Security-Policy: szabály, hogy a böngésző honnan tölthet be scripteket/stílusokat. Csökkentheti bizonyos támadások (pl. XSS) hatását.",
  "hdr-xfo":
    "X-Frame-Options: megmondja, beágyazható-e az oldal más site iframe-jébe. Clickjacking elleni alapvédelem.",
  "hdr-cto":
    "X-Content-Type-Options: megakadályozza, hogy a böngésző „kitalálja” a fájltípust — csökkenti bizonyos támadási trükköket.",
  "hdr-ref":
    "Referrer-Policy: szabályozza, mennyi információt küld a böngésző az előző oldal címéről más oldalakra.",
  "hdr-hsts":
    "HSTS: utasítja a böngészőt, hogy ezentúl mindig HTTPS-t használjon ehhez a domainhez.",
  "hdr-permissions":
    "Permissions-Policy: korlátozhatja, hogy az oldal használhat-e kamerát, mikrofont, helymeghatározást stb.",
  "mixed-content":
    "HTTPS oldalon http:// erőforrás is van. A böngésző figyelmeztethet vagy blokkolhatja — biztonsági és megbízhatósági gond.",
  "mixed-content-ok":
    "A HTML-ben nem látszik nyilvánvaló http:// erőforrás HTTPS oldalon.",
  "cookie-secure":
    "Secure cookie flag: HTTPS nélkül ne menjen a cookie. Hiánya növeli a kiszivárgás kockázatát.",
  "cookie-httponly":
    "HttpOnly: a cookie-t ne olvashassa JavaScript. Session cookie-nál fontos XSS ellen.",
  "cookie-samesite":
    "SameSite: korlátozza, más site-ról érkező kérésekkel menjen-e a cookie — CSRF védelem része.",
  "hdr-server":
    "A Server header technológiai infót árulhat el. Önmagában ritkán kritikus.",
  "hdr-x-powered-by":
    "Az X-Powered-By elárulhatja a használt technológiát — érdemes eltávolítani.",
  "security-disclaimer":
    "Emlékeztető: a zöld security eredmények nem jelentik, hogy az oldal teljesen biztonságos.",
  "title-missing":
    "A <title> a böngészőfülén és a keresőtalálatban megjelenő főcím. Hiánya nagyon gyenge jel.",
  "title-ok":
    "Van értelmes title — ez az egyik legfontosabb SEO alapadat.",
  "title-short":
    "A title túl rövid; a keresők és a felhasználók keveset tudnak meg belőle.",
  "title-long":
    "A title túl hosszú; a keresők gyakran levágják a végét.",
  "desc-missing":
    "A meta description rövid összefoglaló a keresőtalálat alatt. Hiánya kevésbé kontrollálható kivonatot eredményezhet.",
  "desc-ok":
    "Van meta description megfelelő hossz körül — segít a találati megjelenésben.",
  "desc-short":
    "A leírás rövid; érdemes bővíteni, hogy többet mondjon az oldalról.",
  "desc-long":
    "A leírás hosszú; a keresők levághatják.",
  "canonical-missing":
    "Nincs megadva a „hivatalos” URL. Duplikált címek esetén a kereső nehezebben választ.",
  "canonical-ok":
    "Van érvényes canonical — az oldal megmondja, melyik URL a kanonikus változat.",
  "canonical-problem":
    "A canonical gyanús vagy hibás (pl. más domain, HTTP HTTPS helyett).",
  "canonical-warn":
    "A canonical megvan, de nem ideális (pl. relatív). Érdemes abszolút HTTPS-re cserélni.",
  "canonical-invalid":
    "A canonical érték nem érvényes URL.",
  "indexability-ok":
    "Nem találtunk olyan utasítást, ami nyilvánvalóan megtiltaná az indexelést. (Ez nem Google index-ellenőrzés.)",
  "indexability-noindex":
    "Az oldal noindex utasítást tartalmaz — a keresőknek azt kéri, ne listázzák. Publikus oldalon ez kritikus lehet, stagingnél szándékos is lehet.",
  "indexability-caution":
    "Van olyan jel (pl. robots tiltás vagy nofollow), ami befolyásolhatja a crawl / indexelést.",
  "social-ok":
    "Open Graph / Twitter mezők megvannak — a megosztáskor szebb előnézet jelenhet meg.",
  "social-partial":
    "Hiányzik néhány közösségi megosztás mező — a Facebook/LinkedIn/X előnézet gyengébb lehet.",
  "social-missing":
    "Szinte nincsenek social meta tagek — megosztáskor a platform találomra választ címet/képet.",
  "jsonld-ok":
    "Van géppel olvasható strukturált adat (JSON-LD). Segíthet a keresőknek, de nem garantál rich resultet.",
  "jsonld-missing":
    "Nincs JSON-LD. Nem kötelező minden oldalon, de bizonyos tartalmaknál hasznos.",
  "jsonld-invalid":
    "A strukturált adat hibás — a kereső nem tudja megbízhatóan feldolgozni.",
  "sitemap-ok":
    "Van elérhető XML sitemap — térkép a keresőknek az oldalakhoz.",
  "sitemap-missing":
    "Nincs (vagy hibás) sitemap.xml. Egy oldal auditjánál nem mindig kritikus.",
  "sitemap-invalid":
    "A sitemap válasz nem tűnik érvényes XML-nek.",
  "html-lang-ok-seo":
    "Az oldal nyelve meg van adva a HTML-ben — jó jel a keresőknek és az akadálymentességnek.",
  "html-lang-missing-seo":
    "Nincs html lang — a nyelv kevésbé egyértelmű a gépeknek.",
  "h1-ok":
    "Van egy főcím (H1) — ez az oldal fő témájának címe a tartalomban.",
  "h1-missing":
    "Nincs H1. A látogatók és a keresők nehezebben azonosítják a fő témát.",
  "h1-multiple":
    "Több H1 van. Nem mindig hiba, de általában egy főcím a legtisztább.",
  "heading-ok":
    "A címsorok (H1–H6) sorrendje logikusnak tűnik.",
  "heading-skip":
    "A címsorszintek ugrálnak (pl. H2 után H4). Nehezíti az áttekintést és a képernyőolvasást.",
  "images-missing-alt":
    "Egyes képeknek nincs alt szövege — a vak / gyengénlátó felhasználók és a keresők keveset tudnak a képről.",
  "images-empty-alt":
    "Üres alt: dekoratív képnél rendben lehet. Informatív képnél viszont leírást érdemes adni.",
  "images-count":
    "Hány <img> található a HTML-ben, és közülük hánynak van alt attribútuma.",
  "links-empty-href":
    "Olyan link, aminek nincs célcíme — zavaró és akadálymentességi gond.",
  "links-hash":
    "Csak #-re mutató link gyakran gomb helyett használt — jobb a valódi gomb vagy URL.",
  "links-javascript":
    "javascript: linkek elavultak és problémásak — kerülendők.",
  "links-no-name":
    "A linknek nincs olvasható neve — képernyőolvasóval nem érthető, hova visz.",
  "links-ok":
    "A linkek alapvető ellenőrzése rendben ment.",
  "content-thin":
    "Kevés látható szöveg. Nem feltétlenül rossz (pl. fotós landing), csak jelzés.",
  "content-words":
    "Hozzávetőleges szószám a HTML szövegéből — tájékoztató adat.",
  "ttfb-ok":
    "A szerver elfogadható időn belül válaszolt.",
  "slow-ttfb":
    "Lassú első válasz. A látogató sokáig vár az oldal megérkezésére.",
  "ttfb-medium":
    "Közepes válaszidő — van tér a gyorsításra.",
  "body-size-ok":
    "A HTML dokumentum mérete ésszerű tartományban van.",
  "body-large":
    "Nagy HTML válasz — lassabb betöltést okozhat, főleg mobilon.",
  "compression-ok":
    "A szerver tömöríti a választ (gzip/Brotli) — kevesebb adat megy át a hálózaton.",
  "compression-missing":
    "Nincs tömörítés — a letöltés nagyobb és lassabb lehet a kelleténél.",
  "cache-missing":
    "Nincs Cache-Control. A böngésző / CDN kevésbé tudja újrahasználni a fájlokat.",
  "pagespeed-score":
    "Google Lighthouse teljesítmény pontszám (PageSpeed). Magasabb = gyorsabbnak mért oldal.",
  "pagespeed-local":
    "Helyi teljesítménybecslés, ha a PageSpeed API nem elérhető. Nem azonos a Lighthouse ponttal.",
  "psi-lcp":
    "LCP: mennyi idő alatt jelenik meg a legnagyobb tartalmi elem (pl. hero kép). Fontos sebességmutató.",
  "psi-cls":
    "CLS: mennyit „ugrál” az elrendezés betöltés közben. Alacsonyabb = stabilabb oldal.",
  "psi-inp":
    "INP: milyen gyorsan reagál az oldal a kattintásokra / érintésekre.",
  "psi-tbt":
    "TBT: mennyi ideig „blokkolja” a fő szál a JavaScript a betöltés alatt.",
  "psi-fcp":
    "FCP: mikor jelenik meg az első tartalom a képernyőn.",
  "psi-si":
    "Speed Index: milyen gyorsan töltődik fel vizuálisan az oldal.",
  "psi-bytes":
    "Az oldal összes letöltött erőforrásának becsült mérete.",
  "psi-resource-breakdown":
    "Mennyi JS / CSS / kép megy át a hálózaton — hol érdemes fogyni.",
  "psi-render-blocking":
    "Olyan fájlok, amelyek késleltetik az első megjelenítést (pl. CSS/JS a headben).",
  "a11y-disclaimer":
    "Fontos: ez automatikus ellenőrzés, nem hivatalos akadálymentességi tanúsítvány.",
  "a11y-lang-ok":
    "A dokumentum nyelve megvan — a képernyőolvasó helyesen tud kiejteni.",
  "a11y-lang-missing":
    "Nincs megadva a nyelv — a képernyőolvasók rossz kiejtéssel olvashatnak.",
  "a11y-images-alt":
    "Képek alt nélkül: a nem látó felhasználók nem kapnak leírást a képről.",
  "a11y-images-ok":
    "A képeknek van alt attribútuma (üres is lehet dekoratívnál).",
  "a11y-inputs-label":
    "Űrlapmező címke nélkül: nem egyértelmű, mit kell kitölteni — különösen kisegítő eszközzel.",
  "a11y-inputs-ok":
    "Az űrlapmezőkhez találtunk címkét / aria-label kapcsolatot.",
  "a11y-button-name":
    "Gomb szöveg / név nélkül: a képernyőolvasó nem tudja, mit csinál.",
  "a11y-button-ok":
    "A gomboknak van megérthető neve.",
  "a11y-link-name":
    "Link szöveg nélkül: nem derül ki, hova vezet.",
  "a11y-heading-skip":
    "Címsor-ugrás: nehezebb a struktúra követése képernyőolvasóval.",
  "a11y-viewport-ok":
    "Van viewport beállítás — az oldal igazodik a mobil képernyőhöz.",
  "a11y-viewport-missing":
    "Nincs viewport meta — mobilon rosszul skálázódhat az oldal.",
  "a11y-viewport-zoom":
    "A nagyítás korlátozva van — ez akadályozhatja a gyengénlátókat.",
  "a11y-lighthouse":
    "A Lighthouse akadálymentességi pontszáma. Összesített automata jelzés, nem teljes audit.",
  "a11y-lighthouse-na":
    "Most nem kaptunk Lighthouse akadálymentességi pontot — csak a helyi HTML ellenőrzések futottak.",
  "robots-ok":
    "A robots.txt elérhető: ebben mondhatod meg a keresőknek, mit crawlolhatnak.",
  "robots-missing":
    "Nincs robots.txt. Nem tiltja az indexelést, de a crawl szabályozásához ajánlott.",
  "robots-block-all":
    "A robots.txt mindent tilt. Publikus site esetén ez súlyos — a keresők nem járják be az oldalt.",
  "bp-https":
    "Az oldal HTTPS-en fut — alap elvárás ma a weben.",
  "bp-no-https":
    "Nincs HTTPS — a kapcsolat nem titkosított.",
  "favicon-ok":
    "Van favicon (kis ikon a böngészőfülön) — segít felismerni az oldalt.",
  "favicon-missing":
    "A HTML-ben nem találtunk favicon hivatkozást.",
  "manifest-ok":
    "Van web app manifest hivatkozás — PWA / „telepíthető” élményhez hasznos.",
  "manifest-missing":
    "Nincs web app manifest — csak akkor kell, ha PWA funkciót szeretnél.",
  "bp-viewport-ok":
    "Viewport meta megvan — mobilbarát megjelenés alapja.",
  "bp-viewport-missing":
    "Hiányzó viewport — mobilon torzulhat a nézet.",
  "bp-html-ok":
    "Az oldal alap HTML szerkezete értelmezhetőnek tűnik.",
  "bp-html-sparse":
    "Kevesebb jel a szokásos HTML dokumentumstruktúrára.",
  "url-invalid":
    "A megadott cím nem ellenőrizhető biztonságosan (pl. localhost, privát IP, hibás URL).",
  "not-html":
    "A válasz nem HTML oldal — ezért a SEO / tartalom jelek nem értékelhetők.",
  "seo-no-html":
    "SEO jelekhez HTML kellene — most nem volt ilyen válasz.",
  "content-no-html":
    "Tartalom ellenőrzéshez HTML kellene — most nem volt ilyen válasz.",
  "a11y-no-html":
    "Akadálymentességi HTML ellenőrzéshez HTML kellene.",
  "runtime-error":
    "Az ellenőrzés váratlanul megszakadt. Próbáld újra, vagy más URL-lel.",
};

export function findingHelpText(findingId: string): string | null {
  if (FINDING_HELP[findingId]) return FINDING_HELP[findingId];
  // Prefix / family fallbacks
  const prefixes = [
    "hdr-",
    "psi-",
    "a11y-",
    "title-",
    "desc-",
    "canonical-",
    "indexability-",
    "social-",
    "jsonld-",
    "sitemap-",
    "h1-",
    "heading-",
    "images-",
    "links-",
    "cookie-",
    "pagespeed-",
    "ttfb-",
    "bp-",
    "robots-",
    "favicon-",
    "manifest-",
    "html-lang-",
    "status-",
  ];
  for (const p of prefixes) {
    if (findingId.startsWith(p)) {
      const family = Object.keys(FINDING_HELP).find((k) => k.startsWith(p));
      if (family) {
        // Prefer exact family pass/ok style generic
        const generic =
          FINDING_HELP[`${p.replace(/-$/, "")}-ok`] ||
          FINDING_HELP[family];
        if (generic) return generic;
      }
    }
  }
  return null;
}
