export type CvLocale = "hu" | "en";

export type CvPersonal = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  websiteLabel: string;
  websiteUrl: string;
  /** Birth year as shown on the source CV header */
  birthYear: string;
  photoSrc: string;
  photoAlt: Record<CvLocale, string>;
};

export type CvLocalizedString = Record<CvLocale, string>;

export type CvExperienceItem = {
  title: CvLocalizedString;
  organization: string;
  start: string;
  end: CvLocalizedString;
  current: boolean;
};

export type CvEducationItem = {
  title: CvLocalizedString;
  institution: string;
  location: CvLocalizedString;
  start: string;
  end: string;
};

export type CvLanguageItem = {
  name: CvLocalizedString;
  level: CvLocalizedString;
};

export type CvPortfolioItem = {
  title: CvLocalizedString;
  urlLabel: string;
  url: string;
  description: CvLocalizedString;
};

export type CvContent = {
  personal: CvPersonal;
  labels: Record<
    | "profile"
    | "experience"
    | "education"
    | "languages"
    | "drivingLicence"
    | "skills"
    | "contact"
    | "present"
    | "portfolio",
    CvLocalizedString
  >;
  profile: CvLocalizedString;
  experience: CvExperienceItem[];
  education: CvEducationItem[];
  portfolio: CvPortfolioItem[];
  languages: CvLanguageItem[];
  drivingLicence: {
    category: string;
    description: CvLocalizedString;
  };
  skills: CvLocalizedString[];
  pdfFileName: Record<CvLocale, string>;
};

/** Future job-application send payload (architecture stub). */
export type CvApplicationDraft = {
  toEmail: string;
  companyName: string;
  positionTitle: string;
  contactPerson?: string;
  locale: CvLocale;
  subject: string;
  coverLetter: string;
  notes?: string;
};

export type CvApplicationRecord = CvApplicationDraft & {
  id: string;
  createdAt: string;
  sentAt: string | null;
  status: "draft" | "queued" | "sent" | "failed";
  error?: string | null;
};
