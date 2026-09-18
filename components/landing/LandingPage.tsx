import React, {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Head from "next/head";
import {
  DECK_CARDS,
  FAQ_ITEMS,
  NAV_LINKS,
  REFERENCE_PROJECTS,
} from "./projectData";

type Theme = "dark" | "light";

const THEME_KEY = "anticode-theme";
const DECK_LAYERS = ["deck-front", "deck-middle", "deck-back", "deck-last"] as const;

function applyTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", next === "dark" ? "#081426" : "#f5f8fc");
}

export default function LandingPage() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState(REFERENCE_PROJECTS[0].id);
  const [showcaseFade, setShowcaseFade] = useState(false);
  const [showcaseFace, setShowcaseFace] = useState<"desc" | "preview">("desc");
  const [formStatus, setFormStatus] = useState("");
  const [year] = useState(() => new Date().getFullYear());

  const navContainerRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLSpanElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const glassTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeGlassTargetRef = useRef<HTMLElement | null>(null);
  const deckOrderRef = useRef<HTMLElement[]>([]);
  const deckAnimatingRef = useRef(false);

  const activeProject =
    REFERENCE_PROJECTS.find((p) => p.id === activeProjectId) ??
    REFERENCE_PROJECTS[0];

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  }, [theme]);

  useLayoutEffect(() => {
    document.body.classList.add("landing-active");
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    const initial: Theme = saved === "light" || saved === "dark" ? saved : "dark";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  // Nav glass hover
  useEffect(() => {
    const navContainer = navContainerRef.current;
    const glass = glassRef.current;
    if (!navContainer || !glass) return;

    const placeGlass = (target: HTMLElement) => {
      if (glassTimerRef.current) clearTimeout(glassTimerRef.current);
      if (
        activeGlassTargetRef.current === target &&
        glass.classList.contains("active")
      ) {
        return;
      }
      activeGlassTargetRef.current = target;
      const outer = navContainer.getBoundingClientRect();
      const box = target.getBoundingClientRect();
      glass.style.left = `${box.left - outer.left}px`;
      glass.style.top = `${box.top - outer.top}px`;
      glass.style.width = `${box.width}px`;
      glass.style.height = `${box.height}px`;
      glass.classList.add("active");
    };

    const hideGlass = () => {
      if (glassTimerRef.current) clearTimeout(glassTimerRef.current);
      activeGlassTargetRef.current = null;
      glassTimerRef.current = setTimeout(() => {
        glass.classList.remove("active");
      }, 130);
    };

    const onPointerMove = (event: PointerEvent) => {
      const target = (event.target as Element).closest(
        ".links a, .nav-actions .btn, .theme, .menu"
      ) as HTMLElement | null;
      if (target) placeGlass(target);
      else hideGlass();
    };

    navContainer.addEventListener("pointermove", onPointerMove);
    navContainer.addEventListener("pointerleave", hideGlass);

    const focusables = navContainer.querySelectorAll<HTMLElement>(
      ".links a, .nav-actions .btn, .theme, .menu"
    );
    const onFocus = (e: FocusEvent) => placeGlass(e.currentTarget as HTMLElement);
    const onBlur = () => hideGlass();
    focusables.forEach((el) => {
      el.addEventListener("focus", onFocus);
      el.addEventListener("blur", onBlur);
    });

    return () => {
      navContainer.removeEventListener("pointermove", onPointerMove);
      navContainer.removeEventListener("pointerleave", hideGlass);
      focusables.forEach((el) => {
        el.removeEventListener("focus", onFocus);
        el.removeEventListener("blur", onBlur);
      });
      if (glassTimerRef.current) clearTimeout(glassTimerRef.current);
    };
  }, []);

  // Hero deck rotation
  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;
    const cards = [...deck.querySelectorAll<HTMLElement>(".deck-card")];
    deckOrderRef.current = cards;

    const renderDeck = () => {
      deckOrderRef.current.forEach((card, index) => {
        card.classList.remove(...DECK_LAYERS);
        card.classList.add(DECK_LAYERS[Math.min(index, DECK_LAYERS.length - 1)]);
      });
    };

    const rotateDeck = () => {
      if (deckAnimatingRef.current) return;
      deckAnimatingRef.current = true;
      const outgoing = deckOrderRef.current[0];
      if (!outgoing) {
        deckAnimatingRef.current = false;
        return;
      }
      outgoing.classList.add("deck-leaving");
      const motion = outgoing.animate(
        [
          {
            transform: "translate3d(0,0,0) rotate(2deg) scale(1)",
            opacity: 1,
            filter: "saturate(1) brightness(1)",
            offset: 0,
          },
          {
            transform: "translate3d(-28px,8px,-20px) rotate(-1deg) scale(.985)",
            opacity: 0.86,
            filter: "saturate(.88) brightness(.92)",
            offset: 0.35,
          },
          {
            transform: "translate3d(-118px,34px,-80px) rotate(-6deg) scale(.91)",
            opacity: 0,
            filter: "saturate(.5) brightness(.72) blur(1.5px)",
            offset: 1,
          },
        ],
        {
          duration: 720,
          easing: "cubic-bezier(.22,.86,.26,1)",
          fill: "forwards",
        }
      );
      deckOrderRef.current.push(deckOrderRef.current.shift()!);
      renderDeck();
      motion.finished.then(() => {
        motion.cancel();
        outgoing.classList.remove("deck-leaving");
        deckAnimatingRef.current = false;
      });
    };

    renderDeck();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const interval = setInterval(rotateDeck, 5000);
    return () => clearInterval(interval);
  }, []);

  // Reveal on scroll
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("main.landing-main > section");
    sections.forEach((item, index) => {
      if (index) item.classList.add("reveal");
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    sections.forEach((item) => {
      if (item.classList.contains("reveal")) observer.observe(item);
    });
    return () => observer.disconnect();
  }, []);

  const selectProject = (id: string) => {
    setActiveProjectId(id);
    setShowcaseFace("desc");
    setShowcaseFade(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setShowcaseFade(true));
    });
  };

  // Alternating description / preview faces every 5s
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const timer = setInterval(() => {
      setShowcaseFace((face) => (face === "desc" ? "preview" : "desc"));
    }, 5000);
    return () => clearInterval(timer);
  }, [activeProjectId]);

  const onProjectKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keys: Record<string, number | "home" | "end"> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
      Home: "home",
      End: "end",
    };
    const action = keys[event.key];
    if (action === undefined) return;
    event.preventDefault();
    const nextIndex =
      action === "home"
        ? 0
        : action === "end"
          ? REFERENCE_PROJECTS.length - 1
          : (index + action + REFERENCE_PROJECTS.length) % REFERENCE_PROJECTS.length;
    const next = REFERENCE_PROJECTS[nextIndex];
    selectProject(next.id);
    const buttons = document.querySelectorAll<HTMLButtonElement>(".project-list .project");
    buttons[nextIndex]?.focus();
  };

  const onLeadSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const formData = new FormData(form);
    const subject = encodeURIComponent(`Projektindítás — ${formData.get("service")}`);
    const body = encodeURIComponent(
      `Név: ${formData.get("name")}\nE-mail: ${formData.get("email")}\n\nMire van szükség:\n${formData.get("service")}\n\nProjekt röviden:\n${formData.get("message")}`
    );
    setFormStatus(
      "Az üzenet előkészül az e-mail alkalmazásodban. Küldés előtt még ellenőrizheted."
    );
    window.location.href = `mailto:info@anticode.hu?subject=${subject}&body=${body}`;
  };

  const closeMenu = () => setMenuOpen(false);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "AntiCode",
    email: "info@anticode.hu",
    description:
      "Üzletszerző weboldalak, webshopok és egyedi digitális rendszerek vállalkozásoknak.",
    serviceType: [
      "Weboldal készítés",
      "Webshop fejlesztés",
      "Egyedi webes rendszerek",
    ],
  };

  return (
    <div className="landing-page">
      <Head>
        <title>AntiCode — Üzletszerző weboldalak és egyedi rendszerek</title>
        <meta
          name="description"
          content="Anticode — üzletszerző weboldalak, webshopok és egyedi digitális rendszerek szolgáltató vállalkozásoknak. Átlátható folyamat és projektkeret."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="robots" content="index,follow" />
        <meta name="theme-color" content="#081426" />
        <meta property="og:locale" content="hu_HU" />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="AntiCode — Üzletszerző weboldalak és egyedi rendszerek"
        />
        <meta
          property="og:description"
          content="Weboldalak, webshopok és célzott webes rendszerek szolgáltató vállalkozásoknak."
        />
        <meta name="twitter:card" content="summary" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <a className="skip-link" href="#tartalom">
        Ugrás a tartalomra
      </a>

      <header className="nav">
        <div
          className="container"
          ref={navContainerRef}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "min(1180px, calc(100% - 40px))",
          }}
        >
          <span className="nav-glass" aria-hidden="true" ref={glassRef} />
          <a href="#tartalom" className="brand" aria-label="AntiCode kezdőlap">
            <span className="cap">A</span>nti<span className="cap accent">C</span>ode
          </a>
          <nav className="links" aria-label="Fő navigáció">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className="nav-actions">
            <button
              className="theme"
              type="button"
              aria-label="Világos vagy sötét mód váltása"
              aria-pressed={theme === "dark"}
              title="Téma váltása"
              onClick={toggleTheme}
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>
            <a className="btn" href="#kapcsolat">
              <span className="btn-label">Ajánlatot kérek</span>{" "}
              <span aria-hidden="true">→</span>
            </a>
            <button
              className="menu"
              type="button"
              aria-label="Menü megnyitása"
              aria-controls="mobile-nav"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      <nav
        className={`mobile-nav${menuOpen ? " open" : ""}`}
        id="mobile-nav"
        aria-label="Mobil navigáció"
      >
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={closeMenu}>
            {link.label}
          </a>
        ))}
      </nav>

      <main id="tartalom" className="landing-main" tabIndex={-1}>
        <section className="hero container">
          <div>
            <div className="eyebrow">Szolgáltató vállalkozásoknak</div>
            <h1>Ne csak jelen legyél online. Legyen okod, hogy téged válasszanak.</h1>
            <p>
              Üzletszerző weboldalakat és célzott webes rendszereket készítek olyan
              vállalkozásoknak, amelyek tisztábban szeretnék bemutatni az ajánlatukat
              és könnyebbé tenni az ügyfélszerzést.
            </p>
            <div className="actions">
              <a className="btn" href="#kapcsolat">
                Kérek ajánlatot <span>→</span>
              </a>
              <a className="btn secondary" href="#referenciak">
                Munkáim
              </a>
            </div>
            <div className="hero-proof">
              <span>Közvetlen együttműködés</span>
              <span>Átlátható projektkeret</span>
              <span>Reszponzív megvalósítás</span>
            </div>
          </div>
          <div className="deck" id="heroDeck" ref={deckRef} aria-label="Anticode projektkártyák">
            {DECK_CARDS.map((card) => (
              <article className="browser deck-card" key={card.kicker}>
                <div className="bar">
                  <i className="dot" />
                  <i className="dot" />
                  <i className="dot" />
                  <div className="url" />
                </div>
                <div className="mock">
                  <small>{card.kicker}</small>
                  <h3>{card.title}</h3>
                  <div className="mock-grid">
                    <div className="mock-card" />
                    <div className="mock-card" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="szolgaltatasok">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow">Amiben segítek</div>
                <h2>Nem csak elkészül az oldal. Feladata is lesz.</h2>
              </div>
              <p>
                A megjelenés, a tartalom és a technikai megoldás egy irányba dolgozik:
                hogy a látogató gyorsabban értse meg, miért releváns számára a
                vállalkozásod.
              </p>
            </div>
            <div className="cards">
              <article className="card">
                <span className="num">01 / BEMUTATKOZÁS ÉS LEAD</span>
                <h3>Üzletszerző weboldalak</h3>
                <p>
                  Üzenet, oldalszerkezet és CTA-k, amelyek a bizonytalan érdeklődőt
                  kapcsolatfelvétel felé terelik.
                </p>
              </article>
              <article className="card">
                <span className="num">02 / ONLINE ÉRTÉKESÍTÉS</span>
                <h3>Webshopok</h3>
                <p>
                  Átgondolt termékút, könnyen kezelhető admin és olyan vásárlási élmény,
                  amely nem akadályozza a döntést.
                </p>
              </article>
              <article className="card">
                <span className="num">03 / HATÉKONYABB MŰKÖDÉS</span>
                <h3>Egyedi webes rendszerek</h3>
                <p>
                  Űrlapok, védett adminfelületek és célzott eszközök, amelyek a saját
                  folyamataidhoz igazodnak.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="pricing" id="arak">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow">Árkatalógus</div>
                <h2>Válassz projektméretet, ne zsákbamacskát.</h2>
              </div>
              <p>
                Szolgáltatásonként három keretet mutatok. A pontos ajánlatot a tartalom,
                a funkciók és a határidő alapján állítom össze.
              </p>
            </div>
            <div className="pricing-dashboard">
              <div className="pricing-stat">
                <b>9</b>szolgáltatási tétel
              </div>
              <div className="pricing-stat">
                <b>3</b>projektkeret
              </div>
              <div className="pricing-stat">
                <b>1</b>egyedi ajánlat minden projektre
              </div>
            </div>
            <div className="pricing-legend">
              <span>
                <i style={{ background: "#22c983" }} />
                Induló — egy világos, fókuszált feladathoz
              </span>
              <span>
                <i style={{ background: "var(--blue)" }} />
                Jellemző — a legtöbb üzleti igényhez
              </span>
              <span>
                <i style={{ background: "var(--blue-2)" }} />
                Komplex — több funkcióhoz vagy nagyobb tartalomhoz
              </span>
            </div>
            <div className="pricing-table-wrap">
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Szolgáltatás</th>
                    <th className="start">Induló</th>
                    <th className="standard">Jellemző</th>
                    <th className="complex">Komplex</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="group">
                    <td colSpan={4}>WEBOLDALAK ÉS ÉRTÉKESÍTÉS</td>
                  </tr>
                  <tr>
                    <td className="service">
                      Start oldal
                      <span className="detail">Egyoldalas, fókuszált bemutatkozás</span>
                    </td>
                    <td className="start">99 000 Ft</td>
                    <td className="standard">103 000 Ft</td>
                    <td className="complex">143 000 Ft</td>
                  </tr>
                  <tr>
                    <td className="service">
                      Üzleti weboldal
                      <span className="detail">Többoldalas szolgáltatói jelenlét</span>
                    </td>
                    <td className="start">159 000 Ft</td>
                    <td className="standard">223 000 Ft</td>
                    <td className="complex">312 000 Ft</td>
                  </tr>
                  <tr>
                    <td className="service">
                      Weboldal megújítás
                      <span className="detail">
                        Tartalom, struktúra és felület újragondolása
                      </span>
                    </td>
                    <td className="start">103 000 Ft</td>
                    <td className="standard">159 000 Ft</td>
                    <td className="complex">239 000 Ft</td>
                  </tr>
                  <tr>
                    <td className="service">
                      Webshop
                      <span className="detail">Katalógus, termékek és vásárlási út</span>
                    </td>
                    <td className="start">239 000 Ft</td>
                    <td className="standard">319 000 Ft</td>
                    <td className="complex">439 000 Ft</td>
                  </tr>
                  <tr className="group">
                    <td colSpan={4}>EGYEDI FUNKCIÓK</td>
                  </tr>
                  <tr>
                    <td className="service">
                      Ajánlatkérő vagy jelentkezési rendszer
                      <span className="detail">
                        Űrlap, fájlfeltöltés, értesítési folyamat
                      </span>
                    </td>
                    <td className="start">49 000 Ft</td>
                    <td className="standard">79 000 Ft</td>
                    <td className="complex">103 000 Ft</td>
                  </tr>
                  <tr>
                    <td className="service">
                      Védett adminfelület
                      <span className="detail">Belépés, szerepkörök és adatkezelés</span>
                    </td>
                    <td className="start">99 000 Ft</td>
                    <td className="standard">127 000 Ft</td>
                    <td className="complex">199 000 Ft</td>
                  </tr>
                  <tr>
                    <td className="service">
                      Egyedi funkció vagy integráció
                      <span className="detail">
                        Külső szolgáltatás, automatizmus vagy egyedi logika
                      </span>
                    </td>
                    <td className="start">29 000 Ft</td>
                    <td className="standard">59 000 Ft</td>
                    <td className="complex">Egyedi becslés</td>
                  </tr>
                  <tr className="group">
                    <td colSpan={4}>FOLYAMATOS TÁMOGATÁS</td>
                  </tr>
                  <tr>
                    <td className="service">
                      Havi karbantartás
                      <span className="detail">
                        Frissítések, mentések és kisebb módosítások
                      </span>
                    </td>
                    <td className="start">15 000 Ft / hó</td>
                    <td className="standard">25 000 Ft / hó</td>
                    <td className="complex">45 000 Ft / hó</td>
                  </tr>
                  <tr>
                    <td className="service">
                      Tartalmi és technikai fejlesztési nap
                      <span className="detail">
                        Előre egyeztetett fejlesztési feladatokra
                      </span>
                    </td>
                    <td className="start">25 000 Ft</td>
                    <td className="standard">35 000 Ft</td>
                    <td className="complex">50 000 Ft</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="price-callout">
              <p>
                <strong>Így olvasd az árakat:</strong> az „Induló” egy tiszta,
                körülhatárolt feladat belépő díja. A „Jellemző” a legtöbb vállalkozás
                reális projektkerete. A „Komplex” több oldalt, több tartalmat vagy
                összetettebb működést jelent. A tárhely, domain, fizetős bővítmények,
                szövegírás és fotózás minden ajánlatban külön tételként szerepel.
              </p>
              <a className="btn" href="#kapcsolat">
                Kérek pontos ajánlatot <span>→</span>
              </a>
            </div>
          </div>
        </section>

        <section className="references" id="referenciak">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow">Munkáim</div>
                <h2>Portfólió demók, amelyek megmutatják, hogyan dolgozom.</h2>
              </div>
              <p>
                Három saját demó: corporate oldal, foglaló rendszer és
                autókatalógus — mindegyik élő előnézetben megnyitható.
              </p>
            </div>
            <div className="slider">
              <div
                className="project-list"
                role="tablist"
                aria-label="Referencia projektek"
              >
                {REFERENCE_PROJECTS.map((project, index) => {
                  const active = project.id === activeProjectId;
                  return (
                    <button
                      key={project.id}
                      className={`project${active ? " active" : ""}`}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-controls="showcase"
                      onClick={() => selectProject(project.id)}
                      onKeyDown={(e) => onProjectKeyDown(e, index)}
                    >
                      <b>{project.tabLabel}</b>
                      {project.tabSub}
                    </button>
                  );
                })}
              </div>
              <div
                className={`showcase-flip${showcaseFade ? " fade" : ""}`}
                id="showcase"
                role="tabpanel"
                aria-live="polite"
              >
                <div
                  className={`showcase-flip-inner${
                    showcaseFace === "preview" ? " is-flipped" : ""
                  }`}
                >
                  <article className="showcase showcase-face showcase-face-front">
                    <div className="tag">{activeProject.tag}</div>
                    <h3>{activeProject.title}</h3>
                    <p>{activeProject.text}</p>
                    <div className="case-brief">
                      {activeProject.brief.map(([label, value]) => (
                        <div key={label}>
                          <b>{label}</b>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                    <a
                      className="btn showcase-demo"
                      href={activeProject.demoHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {activeProject.demoLabel}{" "}
                      <span aria-hidden="true">→</span>
                    </a>
                  </article>
                  <article className="showcase showcase-face showcase-face-back">
                    <div className="tag">{activeProject.tag}</div>
                    <h3 className="showcase-preview-title">Oldal előnézet</h3>
                    <a
                      className="showcase-preview-link"
                      href={activeProject.demoHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${activeProject.tabLabel} demó megnyitása`}
                    >
                      <img
                        src={activeProject.preview}
                        alt=""
                        className="showcase-preview-img"
                      />
                    </a>
                    <a
                      className="btn showcase-demo"
                      href={activeProject.demoHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {activeProject.demoLabel}{" "}
                      <span aria-hidden="true">→</span>
                    </a>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="folyamat">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow">Munkamódszer</div>
                <h2>Átlátható folyamat. Kevesebb találgatás.</h2>
              </div>
              <p>
                A jó eredmény nem a fejlesztéssel kezdődik, hanem azzal, hogy közösen
                tisztázzuk, kinek és mit kell elérnie az oldalnak.
              </p>
            </div>
            <div className="process">
              <div className="step">
                <span>01</span>
                <h3>Felfedezés</h3>
                <p>Célok, célcsoport, ajánlat és meglévő akadályok.</p>
              </div>
              <div className="step">
                <span>02</span>
                <h3>Irány</h3>
                <p>Oldaltérkép, prioritások és a látogató következő lépése.</p>
              </div>
              <div className="step">
                <span>03</span>
                <h3>Tervezés</h3>
                <p>Tartalom és felület egy közös, tesztelhető rendszerben.</p>
              </div>
              <div className="step">
                <span>04</span>
                <h3>Építés</h3>
                <p>Reszponzív, gyors és kezelhető megvalósítás.</p>
              </div>
              <div className="step">
                <span>05</span>
                <h3>Élesítés</h3>
                <p>Ellenőrzés, átadás és stabil indulás.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="faq" id="gyik">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow">Gyakori kérdések</div>
                <h2>A fontos részletek még az ajánlatkérés előtt.</h2>
              </div>
              <p>Egyértelmű keretekkel gyorsabb a döntés és kevesebb a félreértés.</p>
            </div>
            <div className="faq-list">
              {FAQ_ITEMS.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="rolam">
          <div className="container about">
            <div className="about-card">
              <div className="eyebrow">Ki dolgozik a projekten</div>
              <div className="identity">
                <i>A</i>Anti / alapító és fejlesztő
              </div>
              <h2>Egy kapcsolattartó. Tiszta felelősség.</h2>
              <p>
                Az első beszélgetéstől az éles indulásig közvetlenül velem dolgozol. A
                döntések, a tervezés és a fejlesztés egy kézben maradnak, ezért a
                visszajelzések gyorsan beépülnek.
              </p>
            </div>
            <div className="about-card">
              <div className="eyebrow">A mérce</div>
              <h2>Ne csak szép legyen. Könnyű legyen rá igent mondani.</h2>
              <p>
                A prémium felület nem öncélú díszítés: rendet teremt az információban,
                erősíti a bizalmat, és segít a látogatónak magabiztosan továbblépni.
              </p>
            </div>
          </div>
        </section>

        <section className="contact" id="kapcsolat">
          <div className="container">
            <div className="contact-inner">
              <div className="contact-copy">
                <div className="eyebrow">Projektindítás</div>
                <h2>Mondd el röviden, min szeretnél változtatni.</h2>
                <p>
                  Néhány mondat alapján visszajelzek, hogy látok-e értelmes irányt a
                  feladatra. Ha igen, kapsz egy tiszta következő lépést és egy
                  projektkeretet — kötelezettség nélkül.
                </p>
                <p className="direct-email">
                  Inkább közvetlenül írnál?{" "}
                  <a href="mailto:info@anticode.hu">info@anticode.hu</a>
                </p>
              </div>
              <form className="lead-form" onSubmit={onLeadSubmit}>
                <label>
                  Név
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={100}
                    placeholder="Neved"
                  />
                </label>
                <label>
                  E-mail
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    maxLength={254}
                    placeholder="email@ceged.hu"
                  />
                </label>
                <label className="full">
                  Mire van szükséged?
                  <select name="service" required defaultValue="">
                    <option value="" disabled>
                      Válassz egy irányt
                    </option>
                    <option>Üzletszerző weboldal</option>
                    <option>Webshop vagy egyedi rendszer</option>
                    <option>Meglévő oldal megújítása</option>
                    <option>Még egyeztetném</option>
                  </select>
                </label>
                <label className="full">
                  Röviden a projektről
                  <textarea
                    name="message"
                    required
                    maxLength={2000}
                    placeholder="Mivel foglalkozol, mi nem működik most jól, és mit szeretnél elérni?"
                  />
                </label>
                <button className="btn" type="submit">
                  Előkészítem az üzenetet <span aria-hidden="true">→</span>
                </button>
                <p className="form-note">
                  Az oldal nem tárolja az adataidat: elküldéskor az e-mail
                  alkalmazásodban jön létre az üzenet a info@anticode.hu címre.
                </p>
                <p className="form-status" role="status" aria-live="polite">
                  {formStatus}
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer">
          <p>
            <span className="brand footer-brand" aria-label="AntiCode">
              <span className="cap">A</span>nti
              <span className="cap accent">C</span>ode
            </span>{" "}
            / weboldalak és egyedi rendszerek
          </p>
          <p>© {year} AntiCode. Minden jog fenntartva.</p>
        </div>
      </footer>
    </div>
  );
}
