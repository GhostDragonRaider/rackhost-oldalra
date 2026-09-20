export type ServiceFaq = { q: string; a: string };

export type ServiceSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type ServicePageContent = {
  path: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  lead: string;
  points: { title: string; text: string }[];
  sections: ServiceSection[];
  faqs: ServiceFaq[];
  ctaHref: string;
  related: { href: string; label: string }[];
  schemaName: string;
  schemaType: string;
};

export const SERVICE_PAGES: ServicePageContent[] = [
  {
    path: "/weboldal-keszites",
    title: "Weboldal készítés vállalkozásoknak | AntiCode",
    description:
      "Üzletszerző weboldal készítés szolgáltató vállalkozásoknak: világos üzenet, átlátható szerkezet és kapcsolatfelvételre optimalizált felület — AntiCode.",
    eyebrow: "Weboldal készítés",
    h1: "Weboldal készítés, amely segít, hogy téged válasszanak.",
    lead:
      "Nem sablonos bemutatkozót készítek, hanem olyan szolgáltatói oldalt, ahol a látogató gyorsan megérti az ajánlatot, és magabiztosan tudja a következő lépést. A cél nem csak a „szép megjelenés”, hanem a döntés támogatása: miért te, mit kapsz, és hogyan indul a közös munka.",
    points: [
      {
        title: "Üzenet és szerkezet",
        text: "Előbb tisztázzuk, kinek és mit kell eladnod — utána épül fel az oldalszerkezet, a CTA-k és a tartalmi hierarchia.",
      },
      {
        title: "Bizalom és döntés",
        text: "A tartalom, a bizonyítékok és a felület együtt dolgoznak a kapcsolatfelvételért — nem csak dekorációért.",
      },
      {
        title: "Átadás és kezelhetőség",
        text: "Reszponzív, gyors megvalósítás, amit később is biztonsággal kezelhetsz vagy karbantartással továbbvihetsz.",
      },
    ],
    sections: [
      {
        heading: "Kinek készítek szolgáltatói weboldalt?",
        paragraphs: [
          "Elsősorban olyan vállalkozásoknak, ahol a weboldal feladata nem a „online jelenlét pipa”, hanem az, hogy a megfelelő érdeklődőt a megfelelő következő lépéshez vezesse. Tipikusan: szakértői és szolgáltatói cégek, helyi vagy országos szolgáltatók, B2B ajánlattevők, irodák és stúdiók, ahol a bizalom és az érthető ajánlat számít.",
          "Ha a látogatóid telefonálnak, űrlapot töltenek, időpontot kérnek vagy ajánlatot várnak, a weboldalnak ezt a döntést kell támogatnia — gyorsan, mobilról is, felesleges zaj nélkül.",
        ],
      },
      {
        heading: "Mit tartalmaz egy üzletszerző weboldal?",
        paragraphs: [
          "A konkrét terjedelem projektfüggő, de a legtöbb sikeres szolgáltatói oldal ugyanazokra az elemekre épül: egyértelmű főüzenet, szolgáltatások érthető bontása, bizonyítékok (referenciák, folyamat, válaszok a tipikus ellenvetésekre), és egy könnyen megtalálható kapcsolatfelvételi út.",
        ],
        bullets: [
          "Hero és pozicionálás: kinek szól az oldal, és mi a fő ígéret",
          "Szolgáltatás-blokkok: mit kapsz, miben különbözöl, hol a határ",
          "Bizalom: folyamat, referenciák, GYIK, átlátható következő lépés",
          "Kapcsolat: űrlap, e-mail, vagy célzott CTA a döntési pontokon",
          "Technikai alap: mobilbarát felület, gyors betöltés, SEO-kész szerkezet",
        ],
      },
      {
        heading: "Hogyan néz ki a weboldal készítés folyamata?",
        paragraphs: [
          "Először röviden tisztázzuk a célt, a célközönséget és azt, hogy mi számít sikernek (több érdeklődő, tisztább ajánlat, kevesebb felesleges kérdés). Ezután jön az irány: oldalszerkezet, üzenetek, tartalmi prioritások. A tervezés és építés iteratív: a fontos képernyőkön együtt haladunk, hogy ne a végén derüljön ki, ha valami nem stimmel.",
          "Az átadáskor rögzítjük, hogyan kezeled majd az oldalt, mi marad nálad, és milyen karbantartási vagy bővítési lehetőségek vannak. A tárhely, domain, szövegírás és fotózás az ajánlatban külön, átláthatóan szerepel.",
        ],
      },
      {
        heading: "Árak és projektkeret",
        paragraphs: [
          "A weboldal készítés díja a terjedelemtől, a tartalom mennyiségétől és a funkcióktól függ. Az induló kereteket az /arak oldalon találod: van belépő, jellemző és komplex sáv. A pontos ajánlat mindig írásban jön: mit készítek el, milyen határidővel, és mi nincs benne az árban.",
          "Ha már van meglévő oldalad, de nem hoz érdeklődőt, a megújítás is lehet célzottabb, mint egy teljesen új építés — ezt az egyeztetés elején tisztázzuk.",
        ],
      },
      {
        heading: "SEO és technikai alapok a weboldalnál",
        paragraphs: [
          "A keresőbarát alap része a munkának: értelmes címek és leírások, tiszta URL-ek, egy H1, strukturált tartalom, gyors mobilélmény és indexelhető HTML. A rangsorhoz hosszú távon tartalom és releváns keresési szándék is kell — ezért a szolgáltatásoldalakat és a tudástár cikkeket is úgy építem, hogy támogassák a fő kulcsszavakat.",
          "A demó projektek a portfólióban példák; a te éles oldalad a saját ajánlatodra és piacodra szabott.",
        ],
      },
    ],
    faqs: [
      {
        q: "Mennyi idő alatt készül el egy weboldal?",
        a: "A tipikus szolgáltatói oldal a tartalom és a visszajelzések függvényében általában néhány héttől 1–2 hónapig terjed. A vállalási időt az írásos projektkeretben rögzítem.",
      },
      {
        q: "Kell-e nekem megírni az összes szöveget?",
        a: "Nem kötelező. Segítek az oldalszerkezetben és az üzenetekben; a szakmai tartalmat közösen állítjuk össze, hogy hiteles és döntést támogató legyen.",
      },
      {
        q: "Lesz-e mobilbarát és gyors az oldal?",
        a: "Igen. A megvalósítás reszponzív, és a technikai alapokat (betöltés, struktúra, SEO meta) az induláskor rendezem.",
      },
      {
        q: "Mi a különbség egy sablon és az AntiCode weboldal között?",
        a: "A sablon gyakran „szép keret”. Én előbb az üzleti üzenetre és a döntési útra optimalizálok, majd ehhez igazítom a felületet — nem fordítva.",
      },
    ],
    ctaHref: "/kapcsolat",
    related: [
      { href: "/webshop-keszites", label: "Webshop készítés" },
      { href: "/egyedi-webfejlesztes", label: "Egyedi webfejlesztés" },
      { href: "/arak", label: "Árak" },
      { href: "/tudastar", label: "Tudástár" },
    ],
    schemaName: "Weboldal készítés",
    schemaType: "Weboldal készítés vállalkozásoknak",
  },
  {
    path: "/webshop-keszites",
    title: "Webshop készítés | AntiCode",
    description:
      "Webshop készítés átgondolt termékúttal, kezelhető adminnal és vásárlási élménnyel, amely nem akadályozza a döntést — AntiCode.",
    eyebrow: "Webshop készítés",
    h1: "Webshop készítés, ahol a termékút és az admin is rendben van.",
    lead:
      "Katalógus, termékek, kosár és háttérfolyamat — úgy, hogy a vásárló és te is átlásd a rendszert. A webshop nem csak „terméklista online”: a böngészés, a termékoldal, a kosár és az admin együtt határozza meg, hogy eladás lesz-e belőle, vagy lemorzsolódás.",
    points: [
      {
        title: "Termékút",
        text: "Érthető böngészés, világos termékoldalak és akadálymentes következő lépés a kosárig.",
      },
      {
        title: "Működés",
        text: "Admin, készlet- vagy tartalomkezelés a valós folyamatodhoz igazítva — nem elméleti demó.",
      },
      {
        title: "Növekedés",
        text: "Olyan alap, amit később bővíteni lehet: fizetés, szállítmányozás, integrációk.",
      },
    ],
    sections: [
      {
        heading: "Mikor van szükséged webshopra — és mikor nem?",
        paragraphs: [
          "Ha rendszeresen értékesítesz termékeket vagy csomagolt szolgáltatásokat online, és a rendelés, a készlet vagy a termékadat fontos, a webshop indokolt. Ha viszont főleg érdeklődőt gyűjtesz, és a zárás személyes vagy ajánlatos, gyakran jobb egy erős szolgáltatói weboldal foglalóval vagy űrlappal — és csak később jön a shop.",
          "Az egyeztetés elején ezt tisztázzuk, hogy ne fizess felesleges komplexitásért.",
        ],
      },
      {
        heading: "Mit tartalmaz a webshop készítés?",
        paragraphs: [
          "A projekt mérete a katalógus nagyságától, a fizetési és szállítási igényektől, valamint az admin elvárásoktól függ. A cél mindig ugyanaz: a vásárló értse, mit vesz, te pedig biztonsággal kezeld a rendeléseket.",
        ],
        bullets: [
          "Katalógus és kategóriák átlátható szerkezettel",
          "Termékoldalak: lényeges infó, bizalom, CTA",
          "Kosár és checkout logika a folyamatodhoz igazítva",
          "Admin: termékek, rendelések, alap kezelés",
          "Technikai SEO alapok a kategória- és termékstruktúrához",
        ],
      },
      {
        heading: "Folyamat: brief-től az éles indulásig",
        paragraphs: [
          "Először a termékpalettát, a vásárlói döntési pontokat és a háttérfolyamatot beszéljük át. Ezután jön a szerkezet (kategóriák, termékadat-mezők), majd a felület és a működés. Az élesítés előtt ellenőrzöm a kritikus utakat: böngészés, kosár, visszaigazolás, admin.",
          "Az áraknál az induló, jellemző és komplex sávokat az /arak oldalon találod. A tárhely, domain, fizetős bővítmények és tartalomfeltöltés külön tétel.",
        ],
      },
      {
        heading: "Webshop SEO — mire érdemes figyelni?",
        paragraphs: [
          "A shop SEO-ja a tiszta kategória-struktúrán, egyedi termék- és kategórialírásokon, gyors oldalakon és crawlolható linkeken múlik. Kerüljük a vékony, ismétlődő oldalakat és a zavaros URL-eket. A tartalmi támogatáshoz a tudástár és a szolgáltatói oldalak is segíthetnek, ha a shop mellett brand-keresés is cél.",
        ],
      },
    ],
    faqs: [
      {
        q: "Tudtok-e meglévő terméklistát betölteni?",
        a: "Igen, a formátumtól függően. Az egyeztetéskor megnézzük a forrást (táblázat, export, meglévő rendszer), és betervezzük a feltöltést vagy migrációt.",
      },
      {
        q: "Milyen fizetési megoldások lehetségesek?",
        a: "A választott stack és a magyar piaci igények alapján. A konkrét integrációkat az ajánlatban rögzítjük — nem ígérek olyan csomagot, ami nincs a keretben.",
      },
      {
        q: "Kell-e nekem webshop, vagy elég egy weboldal?",
        a: "Ha nincs valódi online rendelési igény, gyakran jobb egy szolgáltatói oldal. Ha van katalógus és ismétlődő vásárlás, a shop indokolt. Ezt együtt döntjük el.",
      },
      {
        q: "Mennyibe kerül egy webshop?",
        a: "Az induló kereteket az árak oldalon találod. A végleges díj a termékek számától, az adminigénytől és az integrációktól függ — írásos ajánlatban.",
      },
    ],
    ctaHref: "/kapcsolat",
    related: [
      { href: "/weboldal-keszites", label: "Weboldal készítés" },
      { href: "/egyedi-webfejlesztes", label: "Egyedi webfejlesztés" },
      { href: "/arak", label: "Árak" },
      { href: "/tudastar", label: "Tudástár" },
    ],
    schemaName: "Webshop készítés",
    schemaType: "Webshop fejlesztés",
  },
  {
    path: "/egyedi-webfejlesztes",
    title: "Egyedi webfejlesztés | AntiCode",
    description:
      "Egyedi webes rendszerek: űrlapok, adminfelületek és célzott eszközök a saját üzleti folyamatodhoz — AntiCode.",
    eyebrow: "Egyedi webfejlesztés",
    h1: "Egyedi webfejlesztés a saját folyamatodra szabva.",
    lead:
      "Ha a kész sablon nem elég: foglaló, ajánlatkérő, védett felület vagy integráció — célzottan, felesleges komplexitás nélkül. Az egyedi fejlesztés akkor éri meg, ha a folyamatod egyedi, és a kézi munka vagy a szétszórt eszközök lassítanak.",
    points: [
      {
        title: "Pontos igény",
        text: "Először a folyamatot értjük meg, utána választunk technikai megoldást — nem fordítva.",
      },
      {
        title: "Biztonságos kezelés",
        text: "Belépés, szerepkörök és adatkezelés ott, ahol tényleg kell.",
      },
      {
        title: "Integráció",
        text: "Külső szolgáltatások és automatizmusok a mindennapi működéshez.",
      },
    ],
    sections: [
      {
        heading: "Milyen egyedi rendszereket készítek?",
        paragraphs: [
          "Tipikus feladatok: időpontfoglaló és admin, ajánlatkérő workflow, belső katalógus, ügyfélportál, adatbekérő űrlapok validációval, egyszerű CRM-szerű nyilvántartás, vagy két rendszer összekötése. A portfólió demók (foglaló, autókatalógus) azt mutatják, hogyan néz ki egy célzott termékút élőben.",
          "Nem építek „mindenre jó” megaszoftvert egyből. Előbb a legfájóbb folyamatot oldjuk meg úgy, hogy később bővíthető legyen.",
        ],
      },
      {
        heading: "Mikor jobb az egyedi fejlesztés, mint a sablon?",
        paragraphs: [
          "Ha a kész eszközök túl sok kompromisszumot kérnek, vagy a manuális munka drágább, mint a fejlesztés. Ha viszont egy klasszikus bemutatkozó oldal kell, a szolgáltatói weboldal a helyes út. Az egyedi fejlesztés árazása is ehhez igazodik: kisebb moduloktól a komplexebb rendszerekig.",
        ],
        bullets: [
          "Foglalás és kapacitáskezelés",
          "Adminfelület szerepkörökkel",
          "Űrlapok, validáció, értesítések",
          "Katalógus / adatkezelő felületek",
          "API és külső szolgáltatás-integráció",
        ],
      },
      {
        heading: "Folyamat és kockázatkezelés",
        paragraphs: [
          "Egyedi projektnél különösen fontos a scope. Ezért először a folyamatábrát és a siker kritériumait rögzítjük, majd ütemezett szállításokban haladunk. Így korán látszik, ha valami változik — és nem a végén derül ki a félreértés.",
          "Az ajánlatban külön szerepel, mi van benne, mi opcionális, és hogyan néz ki a későbbi karbantartás vagy fejlesztési nap.",
        ],
      },
      {
        heading: "SEO és egyedi rendszerek",
        paragraphs: [
          "Ha az egyedi rendszer publikus oldalakat is szolgál (pl. katalógus), a crawlolható struktúra, a metaadatok és a teljesítmény ugyanúgy számít. Ha belső eszköz, a SEO nem cél — de a biztonság, a jogosultságok és a stabilitás igen.",
        ],
      },
    ],
    faqs: [
      {
        q: "Mennyibe kerül egy egyedi fejlesztés?",
        a: "A belépő moduloktól a komplex rendszerekig terjed. Az /arak oldalon látod a sávokat; a pontos díj a scope alapján, írásban jön.",
      },
      {
        q: "Kapok-e forráskódot / hozzáférést?",
        a: "Az átadás módját a szerződésben rögzítjük. Cél, hogy ne legyél zsarolható helyzetben: érthető átadás és dokumentált működés.",
      },
      {
        q: "Lehet-e később bővíteni?",
        a: "Igen, ezért tervezek bővíthető alapot. A nagyobb funkciókat fejlesztési nap vagy külön projektkeret mellett vállalom.",
      },
      {
        q: "Milyen stacket használsz?",
        a: "A feladathoz illeszkedőt. A döntés a megbízhatóság, a karbantarthatóság és a projektcél alapján születik — nem trend alapján.",
      },
    ],
    ctaHref: "/kapcsolat",
    related: [
      { href: "/weboldal-keszites", label: "Weboldal készítés" },
      { href: "/webshop-keszites", label: "Webshop készítés" },
      { href: "/weboldal-karbantartas", label: "Karbantartás" },
      { href: "/arak", label: "Árak" },
    ],
    schemaName: "Egyedi webfejlesztés",
    schemaType: "Egyedi webes rendszerek",
  },
  {
    path: "/weboldal-karbantartas",
    title: "Weboldal karbantartás | AntiCode",
    description:
      "Weboldal karbantartás: frissítések, mentések, kisebb módosítások és folyamatos technikai támogatás — AntiCode.",
    eyebrow: "Weboldal karbantartás",
    h1: "Weboldal karbantartás: stabil működés az indulás után is.",
    lead:
      "A kész oldal nem zárja le a projektet. Frissítések, biztonság és kisebb fejlesztések — előre átlátható kerettel. A karbantartás arról szól, hogy ne kelljen minden apró változáshoz új projektet indítanod, és ne maradjon gazdátlan az éles rendszer.",
    points: [
      {
        title: "Havi csomagok",
        text: "Frissítések, mentések és kisebb tartalmi vagy technikai módosítások előre egyeztetett keretben.",
      },
      {
        title: "Fejlesztési nap",
        text: "Nagyobb feladatokra külön, egyeztetett keret — nem meglepetés-számla.",
      },
      {
        title: "Nyugalom",
        text: "Tudod, kihez fordulhatsz, ha változtatni kell — nem kell mindent újra felépíteni.",
      },
    ],
    sections: [
      {
        heading: "Mit takar a weboldal karbantartás?",
        paragraphs: [
          "A tipikus csomag: biztonsági és függőségi frissítések, mentések ellenőrzése, kisebb szöveges vagy layout módosítások, hibajelzések kezelése, és rövid státusz arról, mi történt. Nem helyettesít teljes újraépítést vagy nagy feature-fejlesztést — arra a fejlesztési nap / külön ajánlat való.",
        ],
        bullets: [
          "Frissítések és alap biztonsági figyelem",
          "Mentések és visszaállíthatóság ellenőrzése",
          "Kisebb tartalmi / UI módosítások",
          "Hibák gyorsabb kezelése",
          "Átlátható havi keret",
        ],
      },
      {
        heading: "Kinek ajánlom?",
        paragraphs: [
          "Annak, akinek már van éles oldala (nálam készült vagy máshol), és szeretne felelőst a technikai folytonosságra. Különösen hasznos szolgáltatói oldalaknál és kisebb shopoknál, ahol a tartalom változik, de nincs belső fejlesztőcsapat.",
        ],
      },
      {
        heading: "Hogyan indul a karbantartás?",
        paragraphs: [
          "Átnézzük az oldalt, a tárhelyet és a hozzáféréseket, majd megállapodunk a havi keretben. Az /arak oldalon látod az induló sávokat. Ha nagyobb fejlesztés kell, azt külön ütemezzük, hogy a karbantartás ne „nyelje el” a nagyobb feladatokat.",
        ],
      },
      {
        heading: "SEO és karbantartás",
        paragraphs: [
          "A karbantartás során figyelek arra is, hogy a technikai SEO alapok ne romoljanak: ne törjenek a fontos URL-ek, ne vesszenek el a metaadatok, és a teljesítmény ne romoljon feleslegesen. A tartalmi SEO (új cikkek, landingek) külön feladat — a tudástár és a szolgáltatásoldalak erre valók.",
        ],
      },
    ],
    faqs: [
      {
        q: "Csak AntiCode-dal készült oldalra van karbantartás?",
        a: "Nem feltétlenül. Meglévő oldalnál először felmérem a stacket és a kockázatokat, majd mondok reális keretet.",
      },
      {
        q: "Mi számít „kisebb módosításnak”?",
        a: "Rövid szövegcsere, új szekció kisebb igazítása, képcsere, egyszerű űrlap-módosítás. A nagyobb feature külön egyeztetés.",
      },
      {
        q: "Van-e havi minimum?",
        a: "A csomagok havi keretesek. A pontos feltételeket az ajánlatban rögzítjük.",
      },
      {
        q: "Mi történik, ha azonnali hiba van?",
        a: "A kritikus hibákat prioritásként kezelem a csomag keretein belül. Ha a hiba nagyobb beavatkozást igényel, egyeztetünk.",
      },
    ],
    ctaHref: "/kapcsolat",
    related: [
      { href: "/weboldal-keszites", label: "Weboldal készítés" },
      { href: "/arak", label: "Árak" },
      { href: "/egyedi-webfejlesztes", label: "Egyedi fejlesztés" },
      { href: "/tudastar", label: "Tudástár" },
    ],
    schemaName: "Weboldal karbantartás",
    schemaType: "Weboldal karbantartás",
  },
];

export function getServicePage(path: string) {
  return SERVICE_PAGES.find((page) => page.path === path);
}
