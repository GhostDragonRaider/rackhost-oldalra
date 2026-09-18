export type ProjectBrief = [string, string];

export type ReferenceProject = {
  id: string;
  tabLabel: string;
  tabSub: string;
  tag: string;
  title: string;
  text: string;
  brief: ProjectBrief[];
  preview: string;
  demoHref: string;
  demoLabel: string;
};

export const REFERENCE_PROJECTS: ReferenceProject[] = [
  {
    id: "corporate",
    tabLabel: "01 / CORPORATE WEBSITE",
    tabSub: "B2B bemutatkozó oldal",
    tag: "CORPORATE WEBSITE / PORTFÓLIÓ DEMO",
    title: "Vállalati jelenlét, amely a bizalmat és a kapcsolatfelvételt szolgálja.",
    text: "B2B gyártó–export demó: világos ajánlat, szolgáltatások és többnyelvű felület, amely a látogatót gyorsan a következő lépéshez vezeti.",
    brief: [
      ["KIINDULÓ HELYZET", "B2B bemutatkozás"],
      ["MEGOLDÁS", "Többnyelvű corporate oldal"],
      ["SZEREPEM", "Design + fejlesztés"],
    ],
    preview: "/projects/project-1/preview.png?v=20260918",
    demoHref: "/projects/project-1/project-1.html",
    demoLabel: "Demó megnyitása",
  },
  {
    id: "booking",
    tabLabel: "02 / IDŐPONTFOGLALÓ",
    tabSub: "Foglalás és adminisztráció",
    tag: "IDŐPONTFOGLALÓ / PORTFÓLIÓ DEMO",
    title: "Foglalós rendszer: ügyfélút és háttérkezelés egy helyen.",
    text: "Időpontfoglalás, ütemezhető napok és adminfelület — a szolgáltatói folyamatot végigviszi a jelentkezéstől a kezelésig.",
    brief: [
      ["KIINDULÓ HELYZET", "Online foglalás"],
      ["MEGOLDÁS", "Ügyfélút + admin"],
      ["SZEREPEM", "Teljes stack demó"],
    ],
    preview: "/projects/project-2/preview.png?v=20260918",
    demoHref: "/projects/project-2/",
    demoLabel: "Demó megnyitása",
  },
  {
    id: "novadrive",
    tabLabel: "03 / NOVADRIVE MOTORS",
    tabSub: "Autókatalógus platform",
    tag: "NOVADRIVE MOTORS / PORTFÓLIÓ DEMO",
    title: "Autós katalógus, ahol a járműadatok és a böngészés egy rendszerben van.",
    text: "NovaDrive Motors demó: részletes járműlista, átlátható struktúra és katalógusélmény autókereskedelmi jelenléthez.",
    brief: [
      ["KIINDULÓ HELYZET", "Járműkatalógus"],
      ["MEGOLDÁS", "Böngészhető platform"],
      ["SZEREPEM", "UI + fejlesztés"],
    ],
    preview: "/projects/project-3/preview.png?v=20260918",
    demoHref: "/projects/project-3/",
    demoLabel: "Demó megnyitása",
  },
];

export const NAV_LINKS = [
  { href: "#szolgaltatasok", label: "Szolgáltatások" },
  { href: "#arak", label: "Árak" },
  { href: "#referenciak", label: "Referenciák" },
  { href: "#folyamat", label: "Hogyan dolgozom?" },
  { href: "#rolam", label: "Rólam" },
  { href: "#kapcsolat", label: "Kapcsolat" },
] as const;

export const DECK_CARDS = [
  {
    kicker: "ANTICODE / PROJEKTINDÍTÓ",
    title: "Érthető ajánlat. Magabiztos első benyomás.",
  },
  {
    kicker: "STRATÉGIA / POZICIONÁLÁS",
    title: "Előbb a jó kérdések, utána a jó képernyők.",
  },
  {
    kicker: "REFERENCIÁK / BIZALOM",
    title: "Minden projekt mögött egy megoldandó üzleti helyzet áll.",
  },
  {
    kicker: "FOLYAMAT / ÉLESÍTÉS",
    title: "Tervezett út a briefingtől az indulásig.",
  },
] as const;

export const FAQ_ITEMS = [
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
    a: "Először röviden átnézem a célt és a feladatot. Ha jó az illeszkedés, a következő lépés egy pontosított projektkeret: mi készül, milyen feltételekkel és milyen költségekkel.",
  },
] as const;
