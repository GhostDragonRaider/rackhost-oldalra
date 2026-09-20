import type { Dictionary } from "./types";

export const en: Dictionary = {
  meta: {
    title: "AntiCode — Lead-generating websites and custom systems",
    description:
      "Lead-generating websites, online shops, and custom web development for service businesses. Clear process, transparent project scope — AntiCode.",
    ogLocale: "en_US",
    htmlLang: "en",
  },
  chrome: {
    skip: "Skip to content",
    navAria: "Main navigation",
    mobileNavAria: "Mobile navigation",
    theme: "Toggle light or dark mode",
    themeTitle: "Toggle theme",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    cta: "Request a quote",
    footerTag: "websites and custom systems",
    prices: "Pricing",
    langLabel: "Language",
    langHu: "Magyar",
    langEn: "English",
    langDe: "Deutsch",
  },
  nav: [
    { href: "#szolgaltatasok", label: "Services" },
    { href: "#arak", label: "Pricing" },
    { href: "/tudastar", label: "Knowledge base" },
    { href: "#referenciak", label: "Work" },
    { href: "#folyamat", label: "How I work" },
    { href: "/rolam", label: "About" },
    { href: "/kapcsolat", label: "Contact" },
  ],
  pageNav: [
    { href: "/#szolgaltatasok", label: "Services" },
    { href: "/arak", label: "Pricing" },
    { href: "/tudastar", label: "Knowledge base" },
    { href: "/#referenciak", label: "Work" },
    { href: "/kapcsolat", label: "Contact" },
  ],
  hero: {
    seoKicker: "Website design for service businesses",
    eyebrow: "For service businesses",
    h1: "Don’t just be online. Give people a reason to choose you.",
    lead:
      "I build lead-generating websites and focused web systems for businesses that want to present their offer more clearly and make winning clients easier.",
    ctaPrimary: "Request a quote",
    ctaSecondary: "My work",
    proofs: [
      "Direct collaboration",
      "Transparent project scope",
      "Responsive delivery",
    ],
    deckAria: "AntiCode project cards",
  },
  deck: [
    {
      kicker: "ANTICODE / PROJECT KICKOFF",
      title: "A clear offer. A confident first impression.",
      primary: {
        label: "First impression",
        text: "In 5 seconds it’s clear: what you offer, and what the next step is.",
      },
      accent: {
        label: "Goal",
        text: "More qualified enquiries",
      },
    },
    {
      kicker: "STRATEGY / POSITIONING",
      title: "The right questions first — then the right screens.",
      primary: {
        label: "Message",
        text: "Why they should choose you — not just how you look online.",
      },
      accent: {
        label: "Impact",
        text: "Faster decisions",
      },
    },
    {
      kicker: "REFERENCES / TRUST",
      title: "Behind every project is a business problem to solve.",
      primary: {
        label: "Proof",
        text: "Live demos: corporate, booking, catalogue, cockpit, and picture cards — not promises, examples.",
      },
      accent: {
        label: "Result",
        text: "Stronger trust",
      },
    },
    {
      kicker: "PROCESS / LAUNCH",
      title: "A planned path from briefing to go-live.",
      primary: {
        label: "Process",
        text: "Brief → direction → design → build → stable launch.",
      },
      accent: {
        label: "Handover",
        text: "A manageable system",
      },
    },
  ],
  services: {
    eyebrow: "How I help",
    h2: "The site doesn’t just get built. It gets a job to do.",
    lead:
      "Design, content, and technical decisions work in one direction: so visitors quickly understand why your business is relevant to them.",
    cards: [
      {
        num: "01 / INTRODUCTION & LEADS",
        title: "Lead-generating websites",
        href: "/weboldal-keszites",
        text: "Messaging, page structure, and CTAs that move uncertain visitors toward getting in touch.",
      },
      {
        num: "02 / ONLINE SALES",
        title: "Online shops",
        href: "/webshop-keszites",
        text: "A considered product journey, an easy-to-run admin, and a buying experience that doesn’t block decisions.",
      },
      {
        num: "03 / MORE EFFICIENT OPERATIONS",
        title: "Custom web systems",
        href: "/egyedi-webfejlesztes",
        text: "Forms, protected admin areas, and targeted tools shaped around your own processes.",
      },
    ],
  },
  homePricing: {
    eyebrow: "Pricing",
    h2: "Main categories, with clear entry prices.",
    leadBefore: "The detailed 3×9 pricing catalogue is on the ",
    leadAfter:
      " page. Here are the starting frames for the main directions — the exact quote always matches the brief.",
    categories: [
      {
        href: "/weboldal-keszites",
        title: "Website design",
        from: "From 99 000 Ft",
        text: "A start page or multi-page service presence — with a clear message.",
      },
      {
        href: "/webshop-keszites",
        title: "Online shop",
        from: "From 191 000 Ft",
        text: "Catalogue, product journey, and a manageable admin for day-to-day sales.",
      },
      {
        href: "/egyedi-webfejlesztes",
        title: "Custom development",
        from: "From 29 000 Ft",
        text: "Forms, admin interfaces, and integrations for your own workflow.",
      },
      {
        href: "/weboldal-karbantartas",
        title: "Maintenance",
        from: "From 15 000 Ft / month",
        text: "Updates, backups, and smaller changes within an ongoing retainer.",
      },
    ],
    calloutStrong: "Exact fee:",
    calloutRest:
      " you receive a written quote based on content, features, and timeline. Hosting, domain, and third-party services appear as separate line items.",
    detailed: "Full pricing",
    cta: "Request a quote",
  },
  references: {
    eyebrow: "My work",
    h2: "Mini case studies with live demos.",
    lead:
      "Problem → design decision → solution → live demo. Five own examples: corporate, booking, catalogue, cockpit, and picture cards.",
    listAria: "Reference projects",
    projects: [
      {
        id: "corporate",
        tabLabel: "01 / CORPORATE WEBSITE",
        tabSub: "B2B introduction site",
        tag: "CORPORATE WEBSITE / PORTFOLIO DEMO",
        title: "A corporate presence that builds trust and drives contact.",
        text: "B2B manufacturing–export demo: a clear offer, services, and a multilingual interface that quickly guides visitors to the next step.",
        brief: [
          ["PROBLEM", "B2B presence lacked a clear offer"],
          ["DECISION", "Multilingual, CTA-centred corporate structure"],
          ["SOLUTION", "A fast path to getting in touch"],
        ],
        previewAlt: "Corporate introduction site demo preview",
        demoLabel: "Open live demo",
        demoOpenAria: "Open Corporate Website demo",
      },
      {
        id: "booking",
        tabLabel: "02 / APPOINTMENT BOOKING",
        tabSub: "Booking and administration",
        tag: "APPOINTMENT BOOKING / PORTFOLIO DEMO",
        title: "A booking system: customer journey and back-office in one place.",
        text: "Appointment booking, schedulable days, and an admin interface — carrying the service workflow from enquiry through to management.",
        brief: [
          ["PROBLEM", "Booking was scattered across email and phone"],
          ["DECISION", "One system for the customer journey and admin"],
          ["SOLUTION", "Online booking + back-office handling"],
        ],
        previewAlt: "Appointment booking system demo preview",
        demoLabel: "Open live demo",
        demoOpenAria: "Open appointment booking demo",
      },
      {
        id: "novadrive",
        tabLabel: "03 / NOVADRIVE MOTORS",
        tabSub: "Vehicle catalogue platform",
        tag: "NOVADRIVE MOTORS / PORTFOLIO DEMO",
        title: "A car catalogue where vehicle data and browsing live in one system.",
        text: "NovaDrive Motors demo: a detailed vehicle list, clear structure, and catalogue experience for automotive retail presence.",
        brief: [
          ["PROBLEM", "The vehicle list was hard to browse"],
          ["DECISION", "Catalogue experience with detailed vehicle pages"],
          ["SOLUTION", "A clear automotive retail platform"],
        ],
        previewAlt: "NovaDrive Motors vehicle catalogue demo preview",
        demoLabel: "Open live demo",
        demoOpenAria: "Open NovaDrive Motors demo",
      },
      {
        id: "virtualcockpit",
        tabLabel: "04 / VIRTUAL COCKPIT",
        tabSub: "Digital instrument cluster demo",
        tag: "VIRTUAL COCKPIT / PORTFOLIO DEMO",
        title: "A digital instrument cluster for analogue cars — a premium cluster in the browser.",
        text: "Virtual Cockpit concept: a modern display experience for cars that left the factory with analogue gauges. RPM, speed, navigation, and vehicle data on one clear interface.",
        brief: [
          ["PROBLEM", "Analogue gauges, modern expectations"],
          ["DECISION", "Premium digital cluster UI in the browser"],
          ["SOLUTION", "RPM, navigation, and vehicle data together"],
        ],
        previewAlt: "Virtual Cockpit digital instrument cluster demo preview",
        demoLabel: "Open live demo",
        demoOpenAria: "Open Virtual Cockpit demo",
      },
      {
        id: "kepeskartyak",
        tabLabel: "05 / PICTURE CARDS",
        tabSub: "Custom visual support",
        tag: "PICTURE CARDS / PREVIOUS LIVE PROJECT",
        title: "Custom picture cards — visual support that makes everyday life easier.",
        text: "A former live shop introduction: personalised picture cards for children with autism, with packages, samples, and a simple ordering flow.",
        brief: [
          ["PROBLEM", "Ordering personalised picture cards"],
          ["DECISION", "A simple mini shop with samples and packages"],
          ["SOLUTION", "A clear ordering path for parents"],
        ],
        previewAlt: "Picture cards shop introduction page preview",
        demoLabel: "Open live demo",
        demoOpenAria: "Open picture cards demo",
      },
    ],
  },
  process: {
    eyebrow: "Working method",
    h2: "A transparent process. Less guesswork.",
    lead:
      "A strong result doesn’t start with development — it starts with clarifying together who the site must reach and what it must achieve.",
    steps: [
      {
        num: "01",
        title: "Clarify",
        text: "We understand what you need to sell, to whom, and what is blocking the decision today.",
      },
      {
        num: "02",
        title: "Direction",
        text: "We lock the page structure and the one next step the visitor should take.",
      },
      {
        num: "03",
        title: "Design",
        text: "Message and interface work toward the same goal — clear, persuasive, ready for a decision.",
      },
      {
        num: "04",
        title: "Build",
        text: "Fast, responsive delivery you can manage safely later on.",
      },
      {
        num: "05",
        title: "Launch",
        text: "A controlled go-live, clean handover, and stable operation from day one.",
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    h2: "The important details before you request a quote.",
    lead: "Clear frames make decisions faster and misunderstandings rarer.",
    items: [
      {
        q: "How long does a website take?",
        a: "The schedule depends on content, features, and how quickly feedback comes back. The concrete delivery time is always set in the written project frame.",
      },
      {
        q: "Can you help if I don’t have copy yet?",
        a: "Yes. We shape the page structure and the messages together so the content supports the visitor’s decision — not just fills space.",
      },
      {
        q: "What does the price include?",
        a: "The price list shows a starting frame for each item. The final quote states scope, features, handover, and every external cost separately and clearly.",
      },
      {
        q: "Who will manage the finished site?",
        a: "We agree the handover approach at the start of the project. Simpler sites prioritise editability; more complex systems prioritise secure administration.",
      },
      {
        q: "Is there ongoing support later?",
        a: "Yes — maintenance and development days appear separately on the price list, so later changes can have a transparent frame from the start.",
      },
      {
        q: "What happens after I request a quote?",
        a: "First I briefly review the goal and the brief. Once we’ve discussed the project, you get a clear quote: what I’ll deliver, on what terms, and at what cost.",
      },
    ],
  },
  about: {
    personEyebrow: "Who works on the project",
    identity: "Anti — founder and developer",
    personH2: "One contact. Clear ownership.",
    personText:
      "From the first conversation to go-live, you work directly with me. Decisions, design, and development stay in one pair of hands, so feedback lands quickly. No agency layers — one person available through the end of the project.",
    metricEyebrow: "The standard",
    metricH2: "Don’t just make it beautiful. Make it easy to say yes.",
    metricText:
      "A premium interface isn’t decoration for its own sake: it organises information, builds trust, and helps visitors move forward with confidence.",
  },
  intake: {
    eyebrow: "How a project starts",
    h2: "From quote request to project kickoff.",
    lead: "Transparent steps — fewer unknowns, a more professional process.",
    steps: [
      { title: "Quote request", text: "You briefly describe what you want to change." },
      { title: "Discussion", text: "We align on the goal, content, and constraints." },
      { title: "Written quote", text: "You receive scope, timeline, and fee." },
      { title: "Contract + deposit", text: "We lock the terms and work begins." },
      { title: "Project kickoff", text: "Design and build based on the shared direction." },
    ],
  },
  contact: {
    eyebrow: "Project kickoff",
    h2: "Tell me briefly what you’d like to change.",
    lead:
      "From a few sentences I’ll reply whether I see a sensible direction for the brief. If so, you get a clear next step and a project frame — with no obligation.",
    directBefore: "Prefer to write directly?",
    name: "Name",
    namePh: "Your name",
    email: "Email",
    emailPh: "email@yourcompany.com",
    service: "What do you need?",
    servicePh: "Choose a direction",
    services: [
      { value: "Üzletszerző weboldal", label: "Lead-generating website" },
      { value: "Webshop vagy egyedi rendszer", label: "Online shop or custom system" },
      { value: "Meglévő oldal megújítása", label: "Redesign of an existing site" },
      { value: "Még egyeztetném", label: "Still deciding" },
    ],
    message: "Briefly about the project",
    messagePh:
      "What do you do, what isn’t working well now, and what would you like to achieve?",
    submit: "Send message",
    sending: "Sending...",
    note: "I only use your details to handle the quote request. Reply within 1 business day.",
    validation: "Please fix the highlighted fields, then submit again.",
    fail: "Could not send. Write directly to {email}.",
    network: "Network error. Try again, or write to {email}.",
    success: "I’ve received your message — I’ll get back within 1 business day.",
  },
  pricingPage: {
    title: "Website and shop pricing | AntiCode",
    description:
      "Transparent price frames for website design, online shops, custom development, and maintenance. Starter, standard, and complex project sizes — AntiCode.",
    catalogName: "AntiCode pricing catalogue",
    eyebrow: "Pricing catalogue",
    h1: "Choose a project size — not a leap of faith.",
    lead:
      "I show three frames per service. The exact quote is built from content, features, and timeline.",
    calloutStrong: "How to read the prices:",
    calloutRest:
      " “Starter” is the entry fee for a clean, well-scoped task. “Standard” is the realistic project frame for most businesses. “Complex” means more pages, more content, or more involved functionality. Hosting, domain, paid plugins, copywriting, and photography appear as separate line items in every quote.",
    cta: "Request an exact quote",
    relatedAria: "Related services",
    related: [
      { href: "/weboldal-keszites", label: "Website design" },
      { href: "/webshop-keszites", label: "Online shop design" },
      { href: "/egyedi-webfejlesztes", label: "Custom web development" },
      { href: "/weboldal-karbantartas", label: "Maintenance" },
    ],
  },
  pricingTable: {
    statItems: "service items",
    statFrames: "project frames",
    statOffer: "custom quote for every project",
    legendStart: "Starter — for a clear, focused brief",
    legendStandard: "Standard — for most business needs",
    legendComplex: "Complex — for more features or larger content",
    caption: "AntiCode service prices in starter, standard, and complex frames",
    colService: "Service",
    colStart: "Starter",
    colStandard: "Standard",
    colComplex: "Complex",
    groups: ["WEBSITES & SALES", "CUSTOM FEATURES", "ONGOING SUPPORT"],
    rows: [
      {
        name: "Start page",
        detail: "Single-page, focused introduction",
        start: "99 000 Ft",
        standard: "129 000 Ft",
        complex: "159 000 Ft",
      },
      {
        name: "Business website",
        detail: "Multi-page service presence",
        start: "127 000 Ft",
        standard: "178 000 Ft",
        complex: "250 000 Ft",
      },
      {
        name: "Website redesign",
        detail: "Rethinking content, structure, and interface",
        start: "82 000 Ft",
        standard: "127 000 Ft",
        complex: "191 000 Ft",
      },
      {
        name: "Online shop",
        detail: "Catalogue, products, and buying journey",
        start: "191 000 Ft",
        standard: "255 000 Ft",
        complex: "351 000 Ft",
      },
      {
        name: "Quote or application system",
        detail: "Form, file upload, notification flow",
        start: "49 000 Ft",
        standard: "79 000 Ft",
        complex: "103 000 Ft",
      },
      {
        name: "Protected admin interface",
        detail: "Login, roles, and data handling",
        start: "99 000 Ft",
        standard: "127 000 Ft",
        complex: "199 000 Ft",
      },
      {
        name: "Custom feature or integration",
        detail: "Third-party service, automation, or custom logic",
        start: "29 000 Ft",
        standard: "59 000 Ft",
        complex: "Custom estimate",
      },
      {
        name: "Monthly maintenance",
        detail: "Updates, backups, and smaller changes",
        start: "15 000 Ft / month",
        standard: "25 000 Ft / month",
        complex: "45 000 Ft / month",
      },
      {
        name: "Content & technical development day",
        detail: "For pre-agreed development tasks",
        start: "25 000 Ft",
        standard: "35 000 Ft",
        complex: "50 000 Ft",
      },
    ],
  },
  serviceUi: {
    cta: "Request a quote",
    viewPrices: "View pricing",
    whatYouGetEyebrow: "What you get",
    whatYouGetH2: "One direction. A clear next step.",
    relatedEyebrow: "Related",
    relatedH2: "More services",
    requestQuote: "Request a quote",
    home: "Home",
  },
  servicePages: {
    "/weboldal-keszites": {
      title: "Website design for businesses | AntiCode",
      description:
        "Lead-generating website design for service businesses: clear messaging, transparent structure, and an interface optimised for getting in touch.",
      eyebrow: "Website design",
      h1: "A website that helps people choose you.",
      lead:
        "I don’t build template introductions — I build service sites where visitors quickly understand the offer and know the next step with confidence.",
      points: [
        {
          title: "Message and structure",
          text: "First we clarify who you sell to and what you sell — then the page structure and CTAs follow.",
        },
        {
          title: "Trust and decisions",
          text: "Content, proof, and interface work together toward contact.",
        },
        {
          title: "Handover",
          text: "Responsive, fast delivery you can manage safely later on.",
        },
      ],
      related: [
        { href: "/webshop-keszites", label: "Online shop design" },
        { href: "/egyedi-webfejlesztes", label: "Custom web development" },
        { href: "/arak", label: "Pricing" },
      ],
      schemaName: "Website design",
      schemaType: "Website design for businesses",
    },
    "/webshop-keszites": {
      title: "Online shop design | AntiCode",
      description:
        "Online shop design with a considered product journey, manageable admin, and a buying experience that doesn’t block decisions.",
      eyebrow: "Online shop design",
      h1: "An online shop where the product journey and admin both work.",
      lead:
        "Catalogue, products, cart, and back-office flow — so both the buyer and you can see the system clearly.",
      points: [
        {
          title: "Product journey",
          text: "Clear browsing, clear product pages, and an unobstructed next step.",
        },
        {
          title: "Operations",
          text: "Admin, inventory, or content management shaped to your real workflow.",
        },
        {
          title: "Growth",
          text: "A foundation you can extend later — not a one-off solution.",
        },
      ],
      related: [
        { href: "/weboldal-keszites", label: "Website design" },
        { href: "/egyedi-webfejlesztes", label: "Custom web development" },
        { href: "/arak", label: "Pricing" },
      ],
      schemaName: "Online shop design",
      schemaType: "Online shop development",
    },
    "/egyedi-webfejlesztes": {
      title: "Custom web development | AntiCode",
      description:
        "Custom web systems: forms, admin interfaces, and targeted tools shaped around your business processes.",
      eyebrow: "Custom web development",
      h1: "A custom system shaped to your process.",
      lead:
        "When a ready-made template isn’t enough: booking, quote requests, protected areas, or integrations — targeted, without unnecessary complexity.",
      points: [
        {
          title: "Precise need",
          text: "We understand the process first, then choose the technical approach.",
        },
        {
          title: "Secure handling",
          text: "Login, roles, and data handling where they are truly needed.",
        },
        {
          title: "Integration",
          text: "Third-party services and automation for day-to-day operations.",
        },
      ],
      related: [
        { href: "/weboldal-keszites", label: "Website design" },
        { href: "/webshop-keszites", label: "Online shop design" },
        { href: "/weboldal-karbantartas", label: "Maintenance" },
      ],
      schemaName: "Custom web development",
      schemaType: "Custom web systems",
    },
    "/weboldal-karbantartas": {
      title: "Website maintenance | AntiCode",
      description:
        "Website maintenance: updates, backups, smaller changes, and ongoing technical support.",
      eyebrow: "Website maintenance",
      h1: "Stable operation after launch, too.",
      lead:
        "A finished site doesn’t close the project. Updates, security, and smaller improvements — within a transparent frame agreed in advance.",
      points: [
        {
          title: "Monthly packages",
          text: "Updates, backups, and smaller content or technical changes.",
        },
        {
          title: "Development day",
          text: "A separate, agreed frame for larger tasks.",
        },
        {
          title: "Peace of mind",
          text: "You know who to turn to when something needs changing — you don’t have to rebuild everything.",
        },
      ],
      related: [
        { href: "/weboldal-keszites", label: "Website design" },
        { href: "/arak", label: "Pricing" },
        { href: "/egyedi-webfejlesztes", label: "Custom development" },
      ],
      schemaName: "Website maintenance",
      schemaType: "Website maintenance",
    },
  },
  footer: {
    tagline: "websites and custom systems",
  },
  errors: {
    notFoundTitle: "Page not found",
    notFoundBody: "The page you’re looking for doesn’t exist or has been moved.",
    errorTitle: "Something went wrong",
    errorBody: "The page is temporarily unavailable. Please try again in a moment.",
  },
};
