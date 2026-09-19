import React, {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import BrandMark from "./BrandMark";
import SeoHead from "./SeoHead";
import {
  DECK_CARDS,
  FAQ_ITEMS,
  HOME_PRICE_CATEGORIES,
  INTAKE_STEPS,
  NAV_LINKS,
  REFERENCE_PROJECTS,
} from "./projectData";
import {
  absoluteUrl,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SITE_EMAIL,
  SITE_NAME,
  SITE_URL,
} from "../../lib/site";

type Theme = "dark" | "light";

const THEME_KEY = "anticode-theme";
const DECK_LAYERS = ["deck-front", "deck-middle", "deck-back", "deck-last"] as const;
const FAQ_MID = Math.ceil(FAQ_ITEMS.length / 2);
const FAQ_COLUMNS = [
  FAQ_ITEMS.slice(0, FAQ_MID),
  FAQ_ITEMS.slice(FAQ_MID),
] as const;

const PROCESS_STEPS = [
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
] as const;

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
  const [formError, setFormError] = useState("");
  const [formSending, setFormSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<Record<string, boolean>>({});
  const [year] = useState(() => new Date().getFullYear());

  const toggleFaq = useCallback((question: string) => {
    setOpenFaq((prev) => ({ ...prev, [question]: !prev[question] }));
  }, []);

  const navContainerRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLSpanElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const intakeRef = useRef<HTMLDivElement>(null);
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

  // Process + intake steps: sequential border + content reveal
  useEffect(() => {
    const strips = [processRef.current, intakeRef.current].filter(
      (el): el is HTMLDivElement => !!el
    );
    if (!strips.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: Array<() => void> = [];

    strips.forEach((process) => {
      if (reduced) {
        process.classList.add("is-sequenced", "is-complete");
        process.querySelectorAll(".step").forEach((step) => {
          step.classList.add("is-ready");
        });
        return;
      }

      const onAnimationEnd = (event: AnimationEvent) => {
        const target = event.target as HTMLElement | null;
        if (!target) return;

        if (
          target.classList.contains("step") &&
          event.animationName.includes("processSurfaceIn")
        ) {
          target.classList.add("is-ready");
        }

        if (!target.classList.contains("step-body")) return;
        if (process.querySelector(".step:last-child .step-body") !== target) return;
        process.classList.add("is-complete");
        process.querySelectorAll(".step").forEach((step) => {
          step.classList.add("is-ready");
        });
      };
      process.addEventListener("animationend", onAnimationEnd);

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              process.classList.add("is-sequenced");
              observer.unobserve(process);
            }
          });
        },
        { threshold: 0.28 }
      );
      observer.observe(process);

      cleanups.push(() => {
        observer.disconnect();
        process.removeEventListener("animationend", onAnimationEnd);
      });
    });

    return () => cleanups.forEach((fn) => fn());
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

  const onLeadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setFormError("");
    setFormStatus("");
    if (!form.reportValidity()) {
      setFormError("Kérlek, javítsd a jelölt mezőket, majd küldd újra.");
      return;
    }

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      service: String(formData.get("service") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      website: String(formData.get("website") || ""),
    };

    setFormSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; message?: string };
      if (!res.ok || !data.ok) {
        setFormError(
          data.error ||
            `Nem sikerült elküldeni. Írj közvetlenül a ${SITE_EMAIL} címre.`
        );
        return;
      }
      setFormStatus(
        data.message ||
          "Megkaptam az üzeneted – 1 munkanapon belül jelentkezem."
      );
      form.reset();
    } catch {
      setFormError(
        `Hálózati hiba. Próbáld újra, vagy írj a ${SITE_EMAIL} címre.`
      );
    } finally {
      setFormSending(false);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: SITE_NAME,
      url: SITE_URL,
      email: SITE_EMAIL,
      description: DEFAULT_DESCRIPTION,
      areaServed: "HU",
      image: absoluteUrl("/favicon.svg"),
      serviceType: [
        "Weboldal készítés",
        "Webshop fejlesztés",
        "Egyedi webes rendszerek",
        "Weboldal karbantartás",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "AntiCode szolgáltatások",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Weboldal készítés",
              url: absoluteUrl("/weboldal-keszites"),
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Webshop készítés",
              url: absoluteUrl("/webshop-keszites"),
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Egyedi webfejlesztés",
              url: absoluteUrl("/egyedi-webfejlesztes"),
            },
          },
        ],
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Anti",
      jobTitle: "Alapító és fejlesztő",
      worksFor: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      email: SITE_EMAIL,
      url: SITE_URL,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "hu-HU",
      publisher: { "@type": "Organization", name: SITE_NAME },
    },
  ];

  return (
    <div className="landing-page">
      <SeoHead
        title={DEFAULT_TITLE}
        description={DEFAULT_DESCRIPTION}
        path="/"
        jsonLd={jsonLd}
      />

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
          <BrandMark href="#tartalom" />
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
              <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
            </button>
            <a className="btn" href="#kapcsolat">
              <span className="btn-label">Ajánlatot kérek</span>{" "}
              <span aria-hidden="true">→</span>
            </a>
            <button
              className="menu"
              type="button"
              aria-label={menuOpen ? "Menü bezárása" : "Menü megnyitása"}
              aria-controls="mobile-nav"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span aria-hidden="true">☰</span>
            </button>
          </div>
        </div>
      </header>

      <nav
        className={`mobile-nav${menuOpen ? " open" : ""}`}
        id="mobile-nav"
        aria-label="Mobil navigáció"
        aria-hidden={!menuOpen}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={closeMenu}
            tabIndex={menuOpen ? undefined : -1}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <main id="tartalom" className="landing-main" tabIndex={-1}>
        <section className="hero container">
          <div>
            <p className="seo-kicker">
              Weboldal készítés szolgáltató vállalkozásoknak
            </p>
            <div className="eyebrow">Szolgáltató vállalkozásoknak</div>
            <h1>Ne csak jelen legyél online. Legyen okod, hogy téged válasszanak.</h1>
            <p>
              Üzletszerző weboldalakat és célzott webes rendszereket készítek olyan
              vállalkozásoknak, amelyek tisztábban szeretnék bemutatni az ajánlatukat
              és könnyebbé tenni az ügyfélszerzést.
            </p>
            <div className="actions">
              <a className="btn" href="#kapcsolat">
                Kérek ajánlatot <span aria-hidden="true">→</span>
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
          <div className="deck" id="heroDeck" ref={deckRef} aria-label="AntiCode projektkártyák">
            {DECK_CARDS.map((card) => (
              <article className="browser deck-card" key={card.kicker}>
                <div className="bar">
                  <i className="dot" aria-hidden="true" />
                  <i className="dot" aria-hidden="true" />
                  <i className="dot" aria-hidden="true" />
                  <div className="url" aria-hidden="true" />
                </div>
                <div className="mock">
                  <small>{card.kicker}</small>
                  <h3>{card.title}</h3>
                  <div className="mock-grid">
                    <div className="mock-card mock-card-primary">
                      <span className="mock-card-label">{card.primary.label}</span>
                      <p className="mock-card-text">{card.primary.text}</p>
                    </div>
                    <div className="mock-card mock-card-accent">
                      <span className="mock-card-label">{card.accent.label}</span>
                      <p className="mock-card-text">{card.accent.text}</p>
                    </div>
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
                <div className="eyebrow eyebrow-premium">Amiben segítek</div>
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
                <h3>
                  <Link href="/weboldal-keszites">Üzletszerző weboldalak</Link>
                </h3>
                <p>
                  Üzenet, oldalszerkezet és CTA-k, amelyek a bizonytalan érdeklődőt
                  kapcsolatfelvétel felé terelik.
                </p>
              </article>
              <article className="card">
                <span className="num">02 / ONLINE ÉRTÉKESÍTÉS</span>
                <h3>
                  <Link href="/webshop-keszites">Webshopok</Link>
                </h3>
                <p>
                  Átgondolt termékút, könnyen kezelhető admin és olyan vásárlási élmény,
                  amely nem akadályozza a döntést.
                </p>
              </article>
              <article className="card">
                <span className="num">03 / HATÉKONYABB MŰKÖDÉS</span>
                <h3>
                  <Link href="/egyedi-webfejlesztes">Egyedi webes rendszerek</Link>
                </h3>
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
                <div className="eyebrow">Árak</div>
                <h2>Fő kategóriák, érthető belépő árakkal.</h2>
              </div>
              <p>
                A részletes 3×9-es árkatalógus a{" "}
                <Link href="/arak">/arak</Link> oldalon van. Itt a fő irányok
                induló keretei — a pontos ajánlat mindig a feladathoz igazodik.
              </p>
            </div>
            <div className="price-categories">
              {HOME_PRICE_CATEGORIES.map((cat) => (
                <article className="price-category" key={cat.href}>
                  <h3>
                    <Link href={cat.href}>{cat.title}</Link>
                  </h3>
                  <p className="price-from">{cat.from}</p>
                  <p>{cat.text}</p>
                </article>
              ))}
            </div>
            <div className="price-callout">
              <p>
                <strong>Pontos díj:</strong> a tartalom, a funkciók és a határidő
                alapján írásos ajánlatot kapsz. A tárhely, domain és külső szolgáltatások
                külön tételként szerepelnek.
              </p>
              <div className="actions">
                <Link className="btn secondary" href="/arak">
                  Részletes árak <span aria-hidden="true">→</span>
                </Link>
                <a className="btn" href="#kapcsolat">
                  Kérek ajánlatot <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="references" id="referenciak">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow">Munkáim</div>
                <h2>Mini esettanulmányok élő demóval.</h2>
              </div>
              <p>
                Probléma → tervezési döntés → megoldás → élő demó. Öt saját példa:
                corporate, foglaló, katalógus, cockpit és képeskártyák.
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
                    <a
                      className="showcase-preview-link"
                      href={activeProject.demoHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${activeProject.tabLabel} demó megnyitása`}
                    >
                      <img
                        src={activeProject.preview}
                        alt={activeProject.previewAlt}
                        className="showcase-preview-img"
                        width={960}
                        height={600}
                        loading="lazy"
                        decoding="async"
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

        <section className="process-section" id="folyamat">
          <div className="container">
            <div className="section-head process-head">
              <div>
                <div className="eyebrow eyebrow-premium">Munkamódszer</div>
                <h2>Átlátható folyamat. Kevesebb találgatás.</h2>
              </div>
              <p className="process-lead">
                A jó eredmény nem a fejlesztéssel kezdődik, hanem azzal, hogy közösen
                tisztázzuk, kinek és mit kell elérnie az oldalnak.
              </p>
            </div>
            <div className="process" role="list" ref={processRef}>
              {PROCESS_STEPS.map((step) => (
                <div className="step" role="listitem" key={step.num} data-step={step.num}>
                  <svg className="step-outline" aria-hidden="true">
                    <rect className="step-outline-path" pathLength={1} />
                  </svg>
                  <span className="step-ghost" aria-hidden="true">
                    {step.num}
                  </span>
                  <div className="step-body">
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="faq" id="gyik">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow eyebrow-premium">Gyakori kérdések</div>
                <h2>A fontos részletek még az ajánlatkérés előtt.</h2>
              </div>
              <p>Egyértelmű keretekkel gyorsabb a döntés és kevesebb a félreértés.</p>
            </div>
            <div className="faq-list">
              {FAQ_COLUMNS.map((column, colIdx) => (
                <div className="faq-column" key={colIdx}>
                  {column.map((item, itemIdx) => {
                    const isOpen = !!openFaq[item.q];
                    const panelId = `faq-panel-${colIdx}-${itemIdx}`;
                    return (
                      <div
                        className={`faq-item${isOpen ? " is-open" : ""}`}
                        key={item.q}
                      >
                        <button
                          type="button"
                          className="faq-trigger"
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          id={`faq-trigger-${colIdx}-${itemIdx}`}
                          onClick={() => toggleFaq(item.q)}
                        >
                          <span>{item.q}</span>
                          <span className="faq-icon" aria-hidden="true" />
                        </button>
                        <div
                          className="faq-panel"
                          id={panelId}
                          role="region"
                          aria-labelledby={`faq-trigger-${colIdx}-${itemIdx}`}
                          aria-hidden={!isOpen}
                        >
                          <div className="faq-panel-inner">
                            <p>{item.a}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="rolam">
          <div className="container about">
            <div className="about-card about-card-person">
              <div className="eyebrow">Ki dolgozik a projekten</div>
              <div className="about-person">
                <div className="about-avatar" aria-hidden="true">
                  A
                </div>
                <div className="identity">
                  Anti — alapító és fejlesztő
                </div>
              </div>
              <h2>Egy kapcsolattartó. Tiszta felelősség.</h2>
              <p>
                Az első beszélgetéstől az éles indulásig közvetlenül velem dolgozol.
                A döntések, a tervezés és a fejlesztés egy kézben maradnak, ezért a
                visszajelzések gyorsan beépülnek. Nem ügynökségi rétegek — egy ember,
                aki a projekt végéig elérhető.
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

        <section
          className="process-section intake-section"
          aria-labelledby="intake-heading"
        >
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow eyebrow-premium">Így indul a projekt</div>
                <h2 id="intake-heading">Ajánlatkéréstől a projektindításig.</h2>
              </div>
              <p>
                Átlátható lépések — kevesebb ismeretlen, professzionálisabb folyamat.
              </p>
            </div>
            <div className="process" role="list" ref={intakeRef}>
              {INTAKE_STEPS.map((step, i) => {
                const num = String(i + 1).padStart(2, "0");
                return (
                  <div
                    className="step"
                    role="listitem"
                    key={step.title}
                    data-step={num}
                  >
                    <svg className="step-outline" aria-hidden="true">
                      <rect className="step-outline-path" pathLength={1} />
                    </svg>
                    <span className="step-ghost" aria-hidden="true">
                      {num}
                    </span>
                    <div className="step-body">
                      <h3>{step.title}</h3>
                      <p>{step.text}</p>
                    </div>
                  </div>
                );
              })}
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
                  <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>
                </p>
              </div>
              <form
                className="lead-form"
                onSubmit={onLeadSubmit}
                noValidate
                aria-describedby="form-feedback"
              >
                <label htmlFor="lead-name">
                  Név
                  <input
                    id="lead-name"
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder="Neved"
                    aria-required="true"
                    aria-invalid={!!formError}
                  />
                </label>
                <label htmlFor="lead-email">
                  E-mail
                  <input
                    id="lead-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    maxLength={254}
                    placeholder="email@ceged.hu"
                    aria-required="true"
                    aria-invalid={!!formError}
                  />
                </label>
                <label className="full" htmlFor="lead-service">
                  Mire van szükséged?
                  <select
                    id="lead-service"
                    name="service"
                    required
                    defaultValue=""
                    aria-required="true"
                  >
                    <option value="" disabled>
                      Válassz egy irányt
                    </option>
                    <option>Üzletszerző weboldal</option>
                    <option>Webshop vagy egyedi rendszer</option>
                    <option>Meglévő oldal megújítása</option>
                    <option>Még egyeztetném</option>
                  </select>
                </label>
                <label className="full" htmlFor="lead-message">
                  Röviden a projektről
                  <textarea
                    id="lead-message"
                    name="message"
                    required
                    minLength={10}
                    maxLength={2000}
                    placeholder="Mivel foglalkozol, mi nem működik most jól, és mit szeretnél elérni?"
                    aria-required="true"
                  />
                </label>
                <div className="hp-field" aria-hidden="true">
                  <label htmlFor="lead-website">
                    Weboldal
                    <input
                      id="lead-website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </label>
                </div>
                <button className="btn" type="submit" disabled={formSending}>
                  {formSending ? "Küldés..." : "Üzenet küldése"}{" "}
                  <span aria-hidden="true">→</span>
                </button>
                <p className="form-note">
                  Az adataidat csak az ajánlatkérés kezeléséhez használom. Válasz: 1
                  munkanapon belül.
                </p>
                <div id="form-feedback">
                  {formError ? (
                    <p className="form-status form-status-error" role="alert">
                      {formError}
                    </p>
                  ) : null}
                  {formStatus ? (
                    <p className="form-status" role="status" aria-live="polite">
                      {formStatus}
                    </p>
                  ) : null}
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer">
          <p>
            <BrandMark className="brand footer-brand" asLink={false} /> /{" "}
            <Link href="/weboldal-keszites">weboldal készítés</Link>
            {" · "}
            <Link href="/arak">árak</Link>
          </p>
          <p>© {year} AntiCode. Minden jog fenntartva.</p>
        </div>
      </footer>
    </div>
  );
}
