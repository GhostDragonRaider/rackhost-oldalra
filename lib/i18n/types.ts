export type Locale = "hu" | "en" | "de";

export type Dictionary = {
  meta: { title: string; description: string; ogLocale: string; htmlLang: string };
  chrome: {
    skip: string;
    navAria: string;
    mobileNavAria: string;
    theme: string;
    themeTitle: string;
    menuOpen: string;
    menuClose: string;
    cta: string;
    footerTag: string;
    prices: string;
    langLabel: string;
    langHu: string;
    langEn: string;
    langDe: string;
  };
  nav: { href: string; label: string }[];
  pageNav: { href: string; label: string }[];
  hero: {
    seoKicker: string;
    eyebrow: string;
    h1: string;
    lead: string;
    ctaPrimary: string;
    ctaSecondary: string;
    proofs: string[];
    deckAria: string;
  };
  deck: {
    kicker: string;
    title: string;
    primary: { label: string; text: string };
    accent: { label: string; text: string };
  }[];
  services: {
    eyebrow: string;
    h2: string;
    lead: string;
    cards: { num: string; title: string; href: string; text: string }[];
  };
  homePricing: {
    eyebrow: string;
    h2: string;
    leadBefore: string;
    leadAfter: string;
    categories: { href: string; title: string; from: string; text: string }[];
    calloutStrong: string;
    calloutRest: string;
    detailed: string;
    cta: string;
  };
  references: {
    eyebrow: string;
    h2: string;
    lead: string;
    listAria: string;
    projects: {
      id: string;
      tabLabel: string;
      tabSub: string;
      tag: string;
      title: string;
      text: string;
      brief: [string, string][];
      previewAlt: string;
      demoLabel: string;
      demoOpenAria: string;
    }[];
  };
  process: {
    eyebrow: string;
    h2: string;
    lead: string;
    steps: { num: string; title: string; text: string }[];
  };
  faq: {
    eyebrow: string;
    h2: string;
    lead: string;
    items: { q: string; a: string }[];
  };
  about: {
    personEyebrow: string;
    identity: string;
    personH2: string;
    personText: string;
    metricEyebrow: string;
    metricH2: string;
    metricText: string;
  };
  intake: {
    eyebrow: string;
    h2: string;
    lead: string;
    steps: { title: string; text: string }[];
  };
  contact: {
    eyebrow: string;
    h2: string;
    lead: string;
    directBefore: string;
    name: string;
    namePh: string;
    email: string;
    emailPh: string;
    service: string;
    servicePh: string;
    services: { value: string; label: string }[];
    message: string;
    messagePh: string;
    submit: string;
    sending: string;
    note: string;
    validation: string;
    fail: string;
    network: string;
    success: string;
  };
  pricingPage: {
    title: string;
    description: string;
    catalogName: string;
    eyebrow: string;
    h1: string;
    lead: string;
    calloutStrong: string;
    calloutRest: string;
    cta: string;
    relatedAria: string;
    related: { href: string; label: string }[];
  };
  pricingTable: {
    statItems: string;
    statFrames: string;
    statOffer: string;
    legendStart: string;
    legendStandard: string;
    legendComplex: string;
    caption: string;
    colService: string;
    colStart: string;
    colStandard: string;
    colComplex: string;
    groups: string[];
    rows: { name: string; detail: string; start: string; standard: string; complex: string }[];
  };
  serviceUi: {
    cta: string;
    viewPrices: string;
    whatYouGetEyebrow: string;
    whatYouGetH2: string;
    relatedEyebrow: string;
    relatedH2: string;
    requestQuote: string;
    home: string;
  };
  servicePages: Record<
    string,
    {
      title: string;
      description: string;
      eyebrow: string;
      h1: string;
      lead: string;
      points: { title: string; text: string }[];
      related: { href: string; label: string }[];
      schemaName: string;
      schemaType: string;
    }
  >;
  footer: { tagline: string };
  errors: { notFoundTitle: string; notFoundBody: string; errorTitle: string; errorBody: string };
};
