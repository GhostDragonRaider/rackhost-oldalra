export type ServicePageContent = {
  path: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  lead: string;
  points: { title: string; text: string }[];
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
    ctaHref: "/#kapcsolat",
    related: [
      { href: "/webshop-keszites", label: "Webshop készítés" },
      { href: "/egyedi-webfejlesztes", label: "Egyedi webfejlesztés" },
      { href: "/arak", label: "Árak" },
    ],
    schemaName: "Weboldal készítés",
    schemaType: "Weboldal készítés vállalkozásoknak",
  },
  {
    path: "/webshop-keszites",
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
    ctaHref: "/#kapcsolat",
    related: [
      { href: "/weboldal-keszites", label: "Weboldal készítés" },
      { href: "/egyedi-webfejlesztes", label: "Egyedi webfejlesztés" },
      { href: "/arak", label: "Árak" },
    ],
    schemaName: "Webshop készítés",
    schemaType: "Webshop fejlesztés",
  },
  {
    path: "/egyedi-webfejlesztes",
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
    ctaHref: "/#kapcsolat",
    related: [
      { href: "/weboldal-keszites", label: "Weboldal készítés" },
      { href: "/webshop-keszites", label: "Webshop készítés" },
      { href: "/weboldal-karbantartas", label: "Karbantartás" },
    ],
    schemaName: "Egyedi webfejlesztés",
    schemaType: "Egyedi webes rendszerek",
  },
  {
    path: "/weboldal-karbantartas",
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
    ctaHref: "/#kapcsolat",
    related: [
      { href: "/weboldal-keszites", label: "Weboldal készítés" },
      { href: "/arak", label: "Árak" },
      { href: "/egyedi-webfejlesztes", label: "Egyedi fejlesztés" },
    ],
    schemaName: "Weboldal karbantartás",
    schemaType: "Weboldal karbantartás",
  },
];
