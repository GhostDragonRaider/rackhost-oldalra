import React, {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import BrandMark from "./BrandMark";
import LangSwitcher from "./LangSwitcher";
import SeoHead from "./SeoHead";
import { REFERENCE_PROJECTS } from "./projectData";
import { useLocale } from "../../lib/i18n/LocaleContext";
import {
  absoluteUrl,
  faqJsonLd,
  SITE_EMAIL,
  SITE_NAME,
  SITE_URL,
} from "../../lib/site";

type Theme = "dark" | "light";

const THEME_KEY = "anticode-theme";
const DECK_LAYERS = ["deck-front", "deck-middle", "deck-back", "deck-last"] as const;
const GLASS_SELECTOR =
  ".links a, .nav-actions .btn, .theme, .menu, .lang-switcher .lang-btn";

function applyTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", next === "dark" ? "#081426" : "#f5f8fc");
}

export default function LandingPage() {
  const { t } = useLocale();

  const projects = useMemo(
    () =>
      t.references.projects.map((p) => {
        const media = REFERENCE_PROJECTS.find((r) => r.id === p.id)!;
        return { ...p, preview: media.preview, demoHref: media.demoHref };
      }),
    [t]
  );

  const faqColumns = useMemo(() => {
    const mid = Math.ceil(t.faq.items.length / 2);
    return [t.faq.items.slice(0, mid), t.faq.items.slice(mid)];
  }, [t]);

  const [theme, setTheme] = useState<Theme>("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState(projects[0].id);
  const [showcaseFade, setShowcaseFade] = useState(false);
  const [showcaseFace, setShowcaseFace] = useState<"desc" | "preview">("desc");
  const [formStatus, setFormStatus] = useState("");
  const [formError, setFormError] = useState("");
  const [formSending, setFormSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<Record<string, boolean>>({});
  const [year] = useState(() => new Date().getFullYear());

  useEffect(() => {
    setActiveProjectId((id) =>
      projects.some((p) => p.id === id) ? id : projects[0].id
    );
  }, [projects]);

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
    projects.find((p) => p.id === activeProjectId) ?? projects[0];

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  }, [theme]);

  useLayoutEffect(() => {
    document.body.classList.add("landing-active");
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    const initial: Theme = saved === "light" || saved === "dark" ? saved : "light";
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
        GLASS_SELECTOR
      ) as HTMLElement | null;
      if (target) placeGlass(target);
      else hideGlass();
    };

    navContainer.addEventListener("pointermove", onPointerMove);
    navContainer.addEventListener("pointerleave", hideGlass);

    const focusables = navContainer.querySelectorAll<HTMLElement>(GLASS_SELECTOR);
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

  // Process + intake steps: staggered fade-in (same as hamburger menu items)
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
        if (!target?.classList.contains("step")) return;
        if (!event.animationName.includes("processStepIn")) return;

        target.classList.add("is-ready");
        const steps = process.querySelectorAll(".step");
        const last = process.querySelector(".step:last-child");
        if (target === last) {
          process.classList.add("is-complete");
          steps.forEach((step) => step.classList.add("is-ready"));
        }
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
          ? projects.length - 1
          : (index + action + projects.length) % projects.length;
    const next = projects[nextIndex];
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
      setFormError(t.contact.validation);
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
        setFormError(t.contact.fail.replace("{email}", SITE_EMAIL));
        return;
      }
      setFormStatus(t.contact.success);
      form.reset();
    } catch {
      setFormError(t.contact.network.replace("{email}", SITE_EMAIL));
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
      description: t.meta.description,
      areaServed: "HU",
      image: absoluteUrl("/logo.png"),
      logo: absoluteUrl("/logo.png"),
      serviceType: t.services.cards.map((card) => card.title),
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "AntiCode",
        itemListElement: t.services.cards.map((card) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: card.title,
            url: absoluteUrl(card.href),
          },
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Anti",
      jobTitle: "Alapító és fejlesztő",
      worksFor: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      email: SITE_EMAIL,
      url: absoluteUrl("/rolam"),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: t.meta.htmlLang,
      publisher: { "@type": "Organization", name: SITE_NAME },
    },
    faqJsonLd(
      t.faq.items.map((item) => ({ q: item.q, a: item.a })),
      SITE_URL
    ),
  ];

  return (
    <div className="landing-page">
      <SeoHead
        title={t.meta.title}
        description={t.meta.description}
        path="/"
        jsonLd={jsonLd}
      />

      <a className="skip-link" href="#tartalom">
        {t.chrome.skip}
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
          <nav className="links" aria-label={t.chrome.navAria}>
            {t.nav.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className="nav-actions">
            <button
              className="theme"
              type="button"
              aria-label={t.chrome.theme}
              aria-pressed={theme === "dark"}
              title={t.chrome.themeTitle}
              onClick={toggleTheme}
            >
              <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
            </button>
            <a className="btn" href="#kapcsolat">
              <span className="btn-label">{t.chrome.cta}</span>
              <span aria-hidden="true">→</span>
            </a>
            <LangSwitcher />
            <button
              className="menu"
              type="button"
              aria-label={menuOpen ? t.chrome.menuClose : t.chrome.menuOpen}
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
        aria-label={t.chrome.mobileNavAria}
        aria-hidden={!menuOpen}
      >
        {t.nav.map((link) => (
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
            <p className="seo-kicker">{t.hero.seoKicker}</p>
            <div className="eyebrow eyebrow-premium">{t.hero.eyebrow}</div>
            <h1>{t.hero.h1}</h1>
            <p>{t.hero.lead}</p>
            <div className="actions">
              <a className="btn" href="#kapcsolat">
                {t.hero.ctaPrimary} <span aria-hidden="true">→</span>
              </a>
              <a className="btn secondary" href="#referenciak">
                {t.hero.ctaSecondary}
              </a>
            </div>
            <div className="hero-proof">
              {t.hero.proofs.map((proof) => (
                <span key={proof}>{proof}</span>
              ))}
            </div>
          </div>
          <div className="deck" id="heroDeck" ref={deckRef} aria-label={t.hero.deckAria}>
            {t.deck.map((card) => (
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
                <div className="eyebrow eyebrow-premium">{t.services.eyebrow}</div>
                <h2>{t.services.h2}</h2>
              </div>
              <p>{t.services.lead}</p>
            </div>
            <div className="cards">
              {t.services.cards.map((card) => (
                <article className="card" key={card.href}>
                  <span className="num">{card.num}</span>
                  <h3>
                    <Link href={card.href}>{card.title}</Link>
                  </h3>
                  <p>{card.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pricing" id="arak">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow eyebrow-premium">{t.homePricing.eyebrow}</div>
                <h2>{t.homePricing.h2}</h2>
              </div>
              <p>
                {t.homePricing.leadBefore}
                <Link href="/arak">/arak</Link>
                {t.homePricing.leadAfter}
              </p>
            </div>
            <div className="price-categories">
              {t.homePricing.categories.map((cat) => (
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
                <strong>{t.homePricing.calloutStrong}</strong>
                {t.homePricing.calloutRest}
              </p>
              <div className="actions">
                <Link className="btn secondary" href="/arak">
                  {t.homePricing.detailed} <span aria-hidden="true">→</span>
                </Link>
                <a className="btn" href="#kapcsolat">
                  {t.homePricing.cta} <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="references" id="referenciak">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow eyebrow-premium">{t.references.eyebrow}</div>
                <h2>{t.references.h2}</h2>
              </div>
              <p>{t.references.lead}</p>
            </div>
            <div className="slider">
              <div
                className="project-list"
                role="tablist"
                aria-label={t.references.listAria}
              >
                {projects.map((project, index) => {
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
                      aria-label={activeProject.demoOpenAria}
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
                <div className="eyebrow eyebrow-premium">{t.process.eyebrow}</div>
                <h2>{t.process.h2}</h2>
              </div>
              <p className="process-lead">{t.process.lead}</p>
            </div>
            <div className="process" role="list" ref={processRef}>
              {t.process.steps.map((step) => (
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
                <div className="eyebrow eyebrow-premium">{t.faq.eyebrow}</div>
                <h2>{t.faq.h2}</h2>
              </div>
              <p>{t.faq.lead}</p>
            </div>
            <div className="faq-list">
              {faqColumns.map((column, colIdx) => (
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
              <div className="eyebrow">{t.about.personEyebrow}</div>
              <div className="about-person">
                <div className="about-avatar" aria-hidden="true">
                  A
                </div>
                <div className="identity">{t.about.identity}</div>
              </div>
              <h2>{t.about.personH2}</h2>
              <p>{t.about.personText}</p>
            </div>
            <div className="about-card">
              <div className="eyebrow">{t.about.metricEyebrow}</div>
              <h2>{t.about.metricH2}</h2>
              <p>{t.about.metricText}</p>
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
                <div className="eyebrow eyebrow-premium">{t.intake.eyebrow}</div>
                <h2 id="intake-heading">{t.intake.h2}</h2>
              </div>
              <p>{t.intake.lead}</p>
            </div>
            <div className="process" role="list" ref={intakeRef}>
              {t.intake.steps.map((step, i) => {
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
                <div className="eyebrow">{t.contact.eyebrow}</div>
                <h2>{t.contact.h2}</h2>
                <p>{t.contact.lead}</p>
                <p className="direct-email">
                  {t.contact.directBefore}{" "}
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
                  {t.contact.name}
                  <input
                    id="lead-name"
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder={t.contact.namePh}
                    aria-required="true"
                    aria-invalid={!!formError}
                  />
                </label>
                <label htmlFor="lead-email">
                  {t.contact.email}
                  <input
                    id="lead-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    maxLength={254}
                    placeholder={t.contact.emailPh}
                    aria-required="true"
                    aria-invalid={!!formError}
                  />
                </label>
                <label className="full" htmlFor="lead-service">
                  {t.contact.service}
                  <select
                    id="lead-service"
                    name="service"
                    required
                    defaultValue=""
                    aria-required="true"
                  >
                    <option value="" disabled>
                      {t.contact.servicePh}
                    </option>
                    {t.contact.services.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="full" htmlFor="lead-message">
                  {t.contact.message}
                  <textarea
                    id="lead-message"
                    name="message"
                    required
                    minLength={10}
                    maxLength={2000}
                    placeholder={t.contact.messagePh}
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
                  {formSending ? t.contact.sending : t.contact.submit}{" "}
                  <span aria-hidden="true">→</span>
                </button>
                <p className="form-note">{t.contact.note}</p>
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
            <Link href="/weboldal-keszites">{t.homePricing.categories[0].title}</Link>
            {" · "}
            <Link href="/arak">{t.chrome.prices}</Link>
            {" · "}
            <Link href="/tudastar">Tudástár</Link>
            {" · "}
            <Link href="/kapcsolat">{t.chrome.cta}</Link>
          </p>
          <p>© {year} AntiCode</p>
        </div>
      </footer>
    </div>
  );
}
