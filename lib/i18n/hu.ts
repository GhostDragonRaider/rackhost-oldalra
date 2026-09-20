import type { Dictionary } from "./types";

export const hu: Dictionary = {
  meta: {
    title: "AntiCode — Üzletszerző weboldalak és egyedi rendszerek",
    description:
      "Üzletszerző weboldal készítés, webshop és egyedi webfejlesztés szolgáltató vállalkozásoknak. Átlátható folyamat, érthető projektkeret — AntiCode.",
    ogLocale: "hu_HU",
    htmlLang: "hu",
  },
  chrome: {
    skip: "Ugrás a tartalomra",
    navAria: "Fő navigáció",
    mobileNavAria: "Mobil navigáció",
    theme: "Világos vagy sötét mód váltása",
    themeTitle: "Téma váltása",
    menuOpen: "Menü megnyitása",
    menuClose: "Menü bezárása",
    cta: "Ajánlatot kérek",
    footerTag: "weboldalak és egyedi rendszerek",
    prices: "Árak",
    langLabel: "Nyelv",
    langHu: "Magyar",
    langEn: "English",
    langDe: "Deutsch",
  },
  nav: [
    { href: "#szolgaltatasok", label: "Szolgáltatások" },
    { href: "#arak", label: "Árak" },
    { href: "/tudastar", label: "Tudástár" },
    { href: "#referenciak", label: "Referenciák" },
    { href: "#folyamat", label: "Hogyan dolgozom?" },
    { href: "/rolam", label: "Rólam" },
    { href: "/kapcsolat", label: "Kapcsolat" },
  ],
  pageNav: [
    { href: "/#szolgaltatasok", label: "Szolgáltatások" },
    { href: "/arak", label: "Árak" },
    { href: "/tudastar", label: "Tudástár" },
    { href: "/#referenciak", label: "Referenciák" },
    { href: "/kapcsolat", label: "Kapcsolat" },
  ],
  hero: {
    seoKicker: "Weboldal készítés szolgáltató vállalkozásoknak",
    eyebrow: "Szolgáltató vállalkozásoknak",
    h1: "Ne csak jelen legyél online. Legyen okod, hogy téged válasszanak.",
    lead:
      "Üzletszerző weboldalakat és célzott webes rendszereket készítek olyan vállalkozásoknak, amelyek tisztábban szeretnék bemutatni az ajánlatukat és könnyebbé tenni az ügyfélszerzést.",
    ctaPrimary: "Kérek ajánlatot",
    ctaSecondary: "Munkáim",
    proofs: [
      "Közvetlen együttműködés",
      "Átlátható projektkeret",
      "Reszponzív megvalósítás",
    ],
    deckAria: "AntiCode projektkártyák",
  },
  deck: [
    {
      kicker: "ANTICODE / PROJEKTINDÍTÓ",
      title: "Érthető ajánlat. Magabiztos első benyomás.",
      primary: {
        label: "Első benyomás",
        text: "5 másodperc alatt világos: mit kínálsz, és mi a következő lépés.",
      },
      accent: {
        label: "Cél",
        text: "Több minőségi érdeklődő",
      },
    },
    {
      kicker: "STRATÉGIA / POZICIONÁLÁS",
      title: "Előbb a jó kérdések, utána a jó képernyők.",
      primary: {
        label: "Üzenet",
        text: "Miért téged válasszanak — nem csak hogyan nézel ki online.",
      },
      accent: {
        label: "Hatás",
        text: "Gyorsabb döntés",
      },
    },
    {
      kicker: "REFERENCIÁK / BIZALOM",
      title: "Minden projekt mögött egy megoldandó üzleti helyzet áll.",
      primary: {
        label: "Bizonyíték",
        text: "Élő demók: corporate, foglaló, katalógus, cockpit és képeskártyák — nem ígéret, példa.",
      },
      accent: {
        label: "Eredmény",
        text: "Erősebb bizalom",
      },
    },
    {
      kicker: "FOLYAMAT / ÉLESÍTÉS",
      title: "Tervezett út a briefingtől az indulásig.",
      primary: {
        label: "Folyamat",
        text: "Brief → irány → tervezés → építés → stabil élesítés.",
      },
      accent: {
        label: "Átadás",
        text: "Kezelhető rendszer",
      },
    },
  ],
  services: {
    eyebrow: "Amiben segítek",
    h2: "Nem csak elkészül az oldal. Feladata is lesz.",
    lead:
      "A megjelenés, a tartalom és a technikai megoldás egy irányba dolgozik: hogy a látogató gyorsabban értse meg, miért releváns számára a vállalkozásod.",
    cards: [
      {
        num: "01 / BEMUTATKOZÁS ÉS LEAD",
        title: "Üzletszerző weboldalak",
        href: "/weboldal-keszites",
        text: "Üzenet, oldalszerkezet és CTA-k, amelyek a bizonytalan érdeklődőt kapcsolatfelvétel felé terelik.",
      },
      {
        num: "02 / ONLINE ÉRTÉKESÍTÉS",
        title: "Webshopok",
        href: "/webshop-keszites",
        text: "Átgondolt termékút, könnyen kezelhető admin és olyan vásárlási élmény, amely nem akadályozza a döntést.",
      },
      {
        num: "03 / HATÉKONYABB MŰKÖDÉS",
        title: "Egyedi webes rendszerek",
        href: "/egyedi-webfejlesztes",
        text: "Űrlapok, védett adminfelületek és célzott eszközök, amelyek a saját folyamataidhoz igazodnak.",
      },
    ],
  },
  homePricing: {
    eyebrow: "Árak",
    h2: "Fő kategóriák, érthető belépő árakkal.",
    leadBefore: "A részletes 3×9-es árkatalógus a ",
    leadAfter:
      " oldalon van. Itt a fő irányok induló keretei — a pontos ajánlat mindig a feladathoz igazodik.",
    categories: [
      {
        href: "/weboldal-keszites",
        title: "Weboldal készítés",
        from: "99 000 Ft-tól",
        text: "Start oldal vagy többoldalas szolgáltatói jelenlét — világos üzenettel.",
      },
      {
        href: "/webshop-keszites",
        title: "Webshop",
        from: "191 000 Ft-tól",
        text: "Katalógus, termékút és kezelhető admin a mindennapi értékesítéshez.",
      },
      {
        href: "/egyedi-webfejlesztes",
        title: "Egyedi fejlesztés",
        from: "29 000 Ft-tól",
        text: "Űrlapok, adminfelületek és integrációk a saját folyamatodra.",
      },
      {
        href: "/weboldal-karbantartas",
        title: "Karbantartás",
        from: "15 000 Ft / hó-tól",
        text: "Frissítések, mentések és kisebb módosítások folyamatos keretben.",
      },
    ],
    calloutStrong: "Pontos díj:",
    calloutRest:
      " a tartalom, a funkciók és a határidő alapján írásos ajánlatot kapsz. A tárhely, domain és külső szolgáltatások külön tételként szerepelnek.",
    detailed: "Részletes árak",
    cta: "Kérek ajánlatot",
  },
  references: {
    eyebrow: "Munkáim",
    h2: "Mini esettanulmányok élő demóval.",
    lead:
      "Probléma → tervezési döntés → megoldás → élő demó. Öt saját példa: corporate, foglaló, katalógus, cockpit és képeskártyák.",
    listAria: "Referencia projektek",
    projects: [
      {
        id: "corporate",
        tabLabel: "01 / CORPORATE WEBSITE",
        tabSub: "B2B bemutatkozó oldal",
        tag: "CORPORATE WEBSITE / PORTFÓLIÓ DEMO",
        title: "Vállalati jelenlét, amely a bizalmat és a kapcsolatfelvételt szolgálja.",
        text: "B2B gyártó–export demó: világos ajánlat, szolgáltatások és többnyelvű felület, amely a látogatót gyorsan a következő lépéshez vezeti.",
        brief: [
          ["PROBLÉMA", "B2B jelenlét nélkülözte a tiszta ajánlatot"],
          ["DÖNTÉS", "Többnyelvű, CTA-központú corporate szerkezet"],
          ["MEGOLDÁS", "Gyors út a kapcsolatfelvételhez"],
        ],
        previewAlt: "Corporate bemutatkozó oldal demó előnézete",
        demoLabel: "Élő demó megnyitása",
        demoOpenAria: "Corporate Website demó megnyitása",
      },
      {
        id: "booking",
        tabLabel: "02 / IDŐPONTFOGLALÓ",
        tabSub: "Foglalás és adminisztráció",
        tag: "IDŐPONTFOGLALÓ / PORTFÓLIÓ DEMO",
        title: "Foglalós rendszer: ügyfélút és háttérkezelés egy helyen.",
        text: "Időpontfoglalás, ütemezhető napok és adminfelület — a szolgáltatói folyamatot végigviszi a jelentkezéstől a kezelésig.",
        brief: [
          ["PROBLÉMA", "Foglalás e-mailben és telefonon szóródott"],
          ["DÖNTÉS", "Egy rendszer az ügyfélútra és az adminra"],
          ["MEGOLDÁS", "Online foglalás + háttérkezelés"],
        ],
        previewAlt: "Időpontfoglaló rendszer demó előnézete",
        demoLabel: "Élő demó megnyitása",
        demoOpenAria: "Időpontfoglaló demó megnyitása",
      },
      {
        id: "novadrive",
        tabLabel: "03 / NOVADRIVE MOTORS",
        tabSub: "Autókatalógus platform",
        tag: "NOVADRIVE MOTORS / PORTFÓLIÓ DEMO",
        title: "Autós katalógus, ahol a járműadatok és a böngészés egy rendszerben van.",
        text: "NovaDrive Motors demó: részletes járműlista, átlátható struktúra és katalógusélmény autókereskedelmi jelenléthez.",
        brief: [
          ["PROBLÉMA", "Járműlista nehezen böngészhető volt"],
          ["DÖNTÉS", "Katalógusélmény részletes adatlapokkal"],
          ["MEGOLDÁS", "Átlátható autókereskedelmi platform"],
        ],
        previewAlt: "NovaDrive Motors autókatalógus demó előnézete",
        demoLabel: "Élő demó megnyitása",
        demoOpenAria: "NovaDrive Motors demó megnyitása",
      },
      {
        id: "virtualcockpit",
        tabLabel: "04 / VIRTUAL COCKPIT",
        tabSub: "Digitális műszerfal demó",
        tag: "VIRTUAL COCKPIT / PORTFÓLIÓ DEMO",
        title: "Digitális műszerfal analóg autókhoz — prémium cluster a böngészőben.",
        text: "Virtual Cockpit koncepció: modern kijelzőélmény olyan autókhoz, amelyek gyárilag még analóg műszerekkel készültek. Fordulatszám, sebesség, navigáció és járműadatok egy átlátható felületen.",
        brief: [
          ["PROBLÉMA", "Analóg műszerek, modern elvárások"],
          ["DÖNTÉS", "Prémium digitális cluster UI a böngészőben"],
          ["MEGOLDÁS", "Fordulatszám, navigáció, járműadatok egyben"],
        ],
        previewAlt: "Virtual Cockpit digitális műszerfal demó előnézete",
        demoLabel: "Élő demó megnyitása",
        demoOpenAria: "Virtual Cockpit demó megnyitása",
      },
      {
        id: "kepeskartyak",
        tabLabel: "05 / KÉPESKÁRTYÁK",
        tabSub: "Egyedi vizuális támogatás",
        tag: "KÉPESKÁRTYÁK / KORÁBBI ÉLES PROJEKT",
        title: "Egyedi képeskártyák — vizuális támogatás, amely a mindennapokat könnyíti.",
        text: "Korábban éles webshop-bemutatkozó: személyre szabott képeskártyák autizmussal élő gyermekeknek, csomagokkal, mintákkal és egyszerű rendelési folyamattal.",
        brief: [
          ["PROBLÉMA", "Személyre szabott képeskártyák rendelése"],
          ["DÖNTÉS", "Egyszerű mini webshop mintákkal és csomagokkal"],
          ["MEGOLDÁS", "Érthető rendelési út a szülőknek"],
        ],
        previewAlt: "Képeskártyák webshop bemutató oldal előnézete",
        demoLabel: "Élő demó megnyitása",
        demoOpenAria: "Képeskártyák demó megnyitása",
      },
    ],
  },
  process: {
    eyebrow: "Munkamódszer",
    h2: "Átlátható folyamat. Kevesebb találgatás.",
    lead:
      "A jó eredmény nem a fejlesztéssel kezdődik, hanem azzal, hogy közösen tisztázzuk, kinek és mit kell elérnie az oldalnak.",
    steps: [
      {
        num: "01",
        title: "Tisztázás",
        text: "Megértjük, mit kell eladnod, kinek, és mi akadályozza most a döntést.",
      },
      {
        num: "02",
        title: "Irány",
        text: "Rögzítjük az oldalszerkezetet és azt az egy következő lépést, amit a látogatónak meg kell tennie.",
      },
      {
        num: "03",
        title: "Tervezés",
        text: "Üzenet és felület ugyanarra a célra dolgozik — érthető, meggyőző, döntésre kész.",
      },
      {
        num: "04",
        title: "Építés",
        text: "Gyors, reszponzív megvalósítás, amit később is biztonsággal kezelhetsz.",
      },
      {
        num: "05",
        title: "Élesítés",
        text: "Ellenőrzött indulás, tiszta átadás és stabil működés az első naptól.",
      },
    ],
  },
  faq: {
    eyebrow: "Gyakori kérdések",
    h2: "A fontos részletek még az ajánlatkérés előtt.",
    lead: "Egyértelmű keretekkel gyorsabb a döntés és kevesebb a félreértés.",
    items: [
      {
        q: "Mennyi idő alatt készül el egy weboldal?",
        a: "A projekt ütemezése a tartalom, a funkciók és a visszajelzések gyorsaságától függ. A konkrét vállalási időt minden esetben az írásos projektkeretben rögzítem.",
      },
      {
        q: "Segítesz, ha még nincs kész szövegem?",
        a: "Igen. Közösen kialakítjuk az oldalszerkezetet és a szükséges üzeneteket, hogy a tartalom a látogató döntését segítse, ne csak helyet töltsön ki.",
      },
      {
        q: "Mit tartalmaz az ár?",
        a: "Az árlista minden tételnél kiinduló keretet mutat. A végleges ajánlatban külön, érthetően szerepel a terjedelem, a funkciók, az átadás és minden külső költség.",
      },
      {
        q: "Ki kezeli majd az elkészült oldalt?",
        a: "Az átadás módját már a projekt elején egyeztetjük. Egyszerűbb oldalaknál a szerkeszthetőség, összetettebb rendszereknél a biztonságos adminisztráció kap prioritást.",
      },
      {
        q: "Van későbbi támogatás is?",
        a: "Igen, az árlistában külön szerepel a karbantartás és a fejlesztési nap. Így a későbbi változtatásoknak is előre átlátható kerete lehet.",
      },
      {
        q: "Mi történik az ajánlatkérés után?",
        a: "Először röviden átnézem a célt és a feladatot. Ha átbeszéltük a projektet, kapsz egy átlátható ajánlatot: mit készítek el, milyen feltételekkel, és mennyibe kerül.",
      },
    ],
  },
  about: {
    personEyebrow: "Ki dolgozik a projekten",
    identity: "Anti — alapító és fejlesztő",
    personH2: "Egy kapcsolattartó. Tiszta felelősség.",
    personText:
      "Az első beszélgetéstől az éles indulásig közvetlenül velem dolgozol. A döntések, a tervezés és a fejlesztés egy kézben maradnak, ezért a visszajelzések gyorsan beépülnek. Nem ügynökségi rétegek — egy ember, aki a projekt végéig elérhető.",
    metricEyebrow: "A mérce",
    metricH2: "Ne csak szép legyen. Könnyű legyen rá igent mondani.",
    metricText:
      "A prémium felület nem öncélú díszítés: rendet teremt az információban, erősíti a bizalmat, és segít a látogatónak magabiztosan továbblépni.",
  },
  intake: {
    eyebrow: "Így indul a projekt",
    h2: "Ajánlatkéréstől a projektindításig.",
    lead: "Átlátható lépések — kevesebb ismeretlen, professzionálisabb folyamat.",
    steps: [
      { title: "Ajánlatkérés", text: "Röviden leírod, min szeretnél változtatni." },
      { title: "Egyeztetés", text: "Átbeszéljük a célt, a tartalmat és a kereteket." },
      { title: "Írásos ajánlat", text: "Kapod a terjedelmet, határidőt és a díjat." },
      { title: "Szerződés + előleg", text: "Rögzítjük a feltételeket, elindul a munka." },
      { title: "Projektindítás", text: "Tervezés és építés a közös irány alapján." },
    ],
  },
  contact: {
    eyebrow: "Projektindítás",
    h2: "Mondd el röviden, min szeretnél változtatni.",
    lead:
      "Néhány mondat alapján visszajelzek, hogy látok-e értelmes irányt a feladatra. Ha igen, kapsz egy tiszta következő lépést és egy projektkeretet — kötelezettség nélkül.",
    directBefore: "Inkább közvetlenül írnál?",
    name: "Név",
    namePh: "Neved",
    email: "E-mail",
    emailPh: "email@ceged.hu",
    service: "Mire van szükséged?",
    servicePh: "Válassz egy irányt",
    services: [
      { value: "Üzletszerző weboldal", label: "Üzletszerző weboldal" },
      { value: "Webshop vagy egyedi rendszer", label: "Webshop vagy egyedi rendszer" },
      { value: "Meglévő oldal megújítása", label: "Meglévő oldal megújítása" },
      { value: "Még egyeztetném", label: "Még egyeztetném" },
    ],
    message: "Röviden a projektről",
    messagePh:
      "Mivel foglalkozol, mi nem működik most jól, és mit szeretnél elérni?",
    submit: "Üzenet küldése",
    sending: "Küldés...",
    note: "Az adataidat csak az ajánlatkérés kezeléséhez használom. Válasz: 1 munkanapon belül.",
    validation: "Kérlek, javítsd a jelölt mezőket, majd küldd újra.",
    fail: "Nem sikerült elküldeni. Írj közvetlenül a {email} címre.",
    network: "Hálózati hiba. Próbáld újra, vagy írj a {email} címre.",
    success: "Megkaptam az üzeneted – 1 munkanapon belül jelentkezem.",
  },
  pricingPage: {
    title: "Weboldal és webshop árak | AntiCode",
    description:
      "Átlátható árkeretek weboldal készítéshez, webshophoz, egyedi fejlesztéshez és karbantartáshoz. Induló, jellemző és komplex projektméretek — AntiCode.",
    catalogName: "AntiCode árkatalógus",
    eyebrow: "Árkatalógus",
    h1: "Válassz projektméretet, ne zsákbamacskát.",
    lead:
      "Szolgáltatásonként három keretet mutatok. A pontos ajánlatot a tartalom, a funkciók és a határidő alapján állítom össze.",
    calloutStrong: "Így olvasd az árakat:",
    calloutRest:
      " az „Induló” egy tiszta, körülhatárolt feladat belépő díja. A „Jellemző” a legtöbb vállalkozás reális projektkerete. A „Komplex” több oldalt, több tartalmat vagy összetettebb működést jelent. A tárhely, domain, fizetős bővítmények, szövegírás és fotózás minden ajánlatban külön tételként szerepel.",
    cta: "Kérek pontos ajánlatot",
    relatedAria: "Kapcsolódó szolgáltatások",
    related: [
      { href: "/weboldal-keszites", label: "Weboldal készítés" },
      { href: "/webshop-keszites", label: "Webshop készítés" },
      { href: "/egyedi-webfejlesztes", label: "Egyedi webfejlesztés" },
      { href: "/weboldal-karbantartas", label: "Karbantartás" },
    ],
  },
  pricingTable: {
    statItems: "szolgáltatási tétel",
    statFrames: "projektkeret",
    statOffer: "egyedi ajánlat minden projektre",
    legendStart: "Induló — egy világos, fókuszált feladathoz",
    legendStandard: "Jellemző — a legtöbb üzleti igényhez",
    legendComplex: "Komplex — több funkcióhoz vagy nagyobb tartalomhoz",
    caption: "AntiCode szolgáltatásárak induló, jellemző és komplex keretekben",
    colService: "Szolgáltatás",
    colStart: "Induló",
    colStandard: "Jellemző",
    colComplex: "Komplex",
    groups: ["WEBOLDALAK ÉS ÉRTÉKESÍTÉS", "EGYEDI FUNKCIÓK", "FOLYAMATOS TÁMOGATÁS"],
    rows: [
      {
        name: "Start oldal",
        detail: "Egyoldalas, fókuszált bemutatkozás",
        start: "99 000 Ft",
        standard: "129 000 Ft",
        complex: "159 000 Ft",
      },
      {
        name: "Üzleti weboldal",
        detail: "Többoldalas szolgáltatói jelenlét",
        start: "127 000 Ft",
        standard: "178 000 Ft",
        complex: "250 000 Ft",
      },
      {
        name: "Weboldal megújítás",
        detail: "Tartalom, struktúra és felület újragondolása",
        start: "82 000 Ft",
        standard: "127 000 Ft",
        complex: "191 000 Ft",
      },
      {
        name: "Webshop",
        detail: "Katalógus, termékek és vásárlási út",
        start: "191 000 Ft",
        standard: "255 000 Ft",
        complex: "351 000 Ft",
      },
      {
        name: "Ajánlatkérő vagy jelentkezési rendszer",
        detail: "Űrlap, fájlfeltöltés, értesítési folyamat",
        start: "49 000 Ft",
        standard: "79 000 Ft",
        complex: "103 000 Ft",
      },
      {
        name: "Védett adminfelület",
        detail: "Belépés, szerepkörök és adatkezelés",
        start: "99 000 Ft",
        standard: "127 000 Ft",
        complex: "199 000 Ft",
      },
      {
        name: "Egyedi funkció vagy integráció",
        detail: "Külső szolgáltatás, automatizmus vagy egyedi logika",
        start: "29 000 Ft",
        standard: "59 000 Ft",
        complex: "Egyedi becslés",
      },
      {
        name: "Havi karbantartás",
        detail: "Frissítések, mentések és kisebb módosítások",
        start: "15 000 Ft / hó",
        standard: "25 000 Ft / hó",
        complex: "45 000 Ft / hó",
      },
      {
        name: "Tartalmi és technikai fejlesztési nap",
        detail: "Előre egyeztetett fejlesztési feladatokra",
        start: "25 000 Ft",
        standard: "35 000 Ft",
        complex: "50 000 Ft",
      },
    ],
  },
  serviceUi: {
    cta: "Kérek ajánlatot",
    viewPrices: "Árak megtekintése",
    whatYouGetEyebrow: "Mit kapsz",
    whatYouGetH2: "Egy irány. Érthető következő lépés.",
    relatedEyebrow: "Kapcsolódó",
    relatedH2: "További szolgáltatások",
    requestQuote: "Ajánlatkérés",
    home: "Kezdőlap",
  },
  servicePages: {
    "/weboldal-keszites": {
      title: "Weboldal készítés vállalkozásoknak | AntiCode",
      description:
        "Üzletszerző weboldal készítés szolgáltató vállalkozásoknak: világos üzenet, átlátható szerkezet és kapcsolatfelvételre optimalizált felület.",
      eyebrow: "Weboldal készítés",
      h1: "Weboldal, amely segít, hogy téged válasszanak.",
      lead:
        "Nem sablonos bemutatkozót készítek, hanem olyan szolgáltatói oldalt, ahol a látogató gyorsan megérti az ajánlatot, és magabiztosan tudja a következő lépést.",
      points: [
        {
          title: "Üzenet és szerkezet",
          text: "Előbb tisztázzuk, kinek és mit kell eladnod — utána épül fel az oldalszerkezet és a CTA-k.",
        },
        {
          title: "Bizalom és döntés",
          text: "A tartalom, a bizonyítékok és a felület együtt dolgoznak a kapcsolatfelvételért.",
        },
        {
          title: "Átadás",
          text: "Reszponzív, gyors megvalósítás, amit később is biztonsággal kezelhetsz.",
        },
      ],
      related: [
        { href: "/webshop-keszites", label: "Webshop készítés" },
        { href: "/egyedi-webfejlesztes", label: "Egyedi webfejlesztés" },
        { href: "/arak", label: "Árak" },
      ],
      schemaName: "Weboldal készítés",
      schemaType: "Weboldal készítés vállalkozásoknak",
    },
    "/webshop-keszites": {
      title: "Webshop készítés | AntiCode",
      description:
        "Webshop készítés átgondolt termékúttal, kezelhető adminnal és olyan vásárlási élménnyel, amely nem akadályozza a döntést.",
      eyebrow: "Webshop készítés",
      h1: "Webshop, ahol a termékút és az admin is rendben van.",
      lead:
        "Katalógus, termékek, kosár és háttérfolyamat — úgy, hogy a vásárló és te is átlásd a rendszert.",
      points: [
        {
          title: "Termékút",
          text: "Érthető böngészés, világos termékoldalak és akadálymentes következő lépés.",
        },
        {
          title: "Működés",
          text: "Admin, készlet- vagy tartalomkezelés a valós folyamatodhoz igazítva.",
        },
        {
          title: "Növekedés",
          text: "Olyan alap, amit később bővíteni lehet — nem egyszer használatos megoldás.",
        },
      ],
      related: [
        { href: "/weboldal-keszites", label: "Weboldal készítés" },
        { href: "/egyedi-webfejlesztes", label: "Egyedi webfejlesztés" },
        { href: "/arak", label: "Árak" },
      ],
      schemaName: "Webshop készítés",
      schemaType: "Webshop fejlesztés",
    },
    "/egyedi-webfejlesztes": {
      title: "Egyedi webfejlesztés | AntiCode",
      description:
        "Egyedi webes rendszerek: űrlapok, adminfelületek és célzott eszközök, amelyek a saját üzleti folyamatodhoz igazodnak.",
      eyebrow: "Egyedi webfejlesztés",
      h1: "Egyedi rendszer a saját folyamatodra szabva.",
      lead:
        "Ha a kész sablon nem elég: foglaló, ajánlatkérő, védett felület vagy integráció — célzottan, felesleges komplexitás nélkül.",
      points: [
        {
          title: "Pontos igény",
          text: "Először a folyamatot értjük meg, utána választunk technikai megoldást.",
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
      related: [
        { href: "/weboldal-keszites", label: "Weboldal készítés" },
        { href: "/webshop-keszites", label: "Webshop készítés" },
        { href: "/weboldal-karbantartas", label: "Karbantartás" },
      ],
      schemaName: "Egyedi webfejlesztés",
      schemaType: "Egyedi webes rendszerek",
    },
    "/weboldal-karbantartas": {
      title: "Weboldal karbantartás | AntiCode",
      description:
        "Weboldal karbantartás: frissítések, mentések, kisebb módosítások és folyamatos technikai támogatás.",
      eyebrow: "Weboldal karbantartás",
      h1: "Stabil működés az indulás után is.",
      lead:
        "A kész oldal nem zárja le a projektet. Frissítések, biztonság és kisebb fejlesztések — előre átlátható kerettel.",
      points: [
        {
          title: "Havi csomagok",
          text: "Frissítések, mentések és kisebb tartalmi vagy technikai módosítások.",
        },
        {
          title: "Fejlesztési nap",
          text: "Nagyobb feladatokra külön, egyeztetett keret.",
        },
        {
          title: "Nyugalom",
          text: "Tudod, kihez fordulhatsz, ha változtatni kell — nem kell mindent újra felépíteni.",
        },
      ],
      related: [
        { href: "/weboldal-keszites", label: "Weboldal készítés" },
        { href: "/arak", label: "Árak" },
        { href: "/egyedi-webfejlesztes", label: "Egyedi fejlesztés" },
      ],
      schemaName: "Weboldal karbantartás",
      schemaType: "Weboldal karbantartás",
    },
  },
  footer: {
    tagline: "weboldalak és egyedi rendszerek",
  },
  errors: {
    notFoundTitle: "Az oldal nem található",
    notFoundBody: "A keresett oldal nem létezik vagy áthelyezték.",
    errorTitle: "Valami hiba történt",
    errorBody: "Az oldal átmenetileg nem elérhető. Próbáld újra egy pillanat múlva.",
  },
};
