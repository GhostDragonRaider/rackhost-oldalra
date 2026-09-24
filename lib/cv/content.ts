import type { CvContent } from "./types";
import { formatCvPeriod } from "./format";

export { formatCvPeriod };

/**
 * Structured CV source of truth.
 * Do not invent workplaces, dates, skills, or personal data.
 * Content matches the provided résumé (Milei Sándor Antal).
 */
export const CV_CONTENT: CvContent = {
  personal: {
    fullName: "Milei Sándor Antal",
    email: "sancii5427@gmail.com",
    phone: "+36 30 485 5517",
    location: "Kenézlő",
    websiteLabel: "anticode.hu",
    websiteUrl: "https://anticode.hu",
    birthYear: "1992",
    /** Authenticated admin API — not a public static asset */
    photoSrc: "/api/admin/cv/photo",
    photoAlt: {
      hu: "Milei Sándor Antal fényképe",
      en: "Photo of Milei Sándor Antal",
    },
  },
  labels: {
    profile: { hu: "Bemutatkozás", en: "Professional Profile" },
    experience: { hu: "Szakmai tapasztalat", en: "Professional Experience" },
    education: { hu: "Tanulmányok", en: "Education" },
    languages: { hu: "Nyelvismeret", en: "Languages" },
    drivingLicence: { hu: "Jogosítvány", en: "Driving Licence" },
    skills: { hu: "Készségek", en: "Skills" },
    contact: { hu: "Kapcsolat", en: "Contact" },
    present: { hu: "jelenleg is", en: "Present" },
    portfolio: { hu: "Portfólió", en: "Portfolio" },
  },
  profile: {
    hu: "IT üzemeltetés, web- és szoftverfejlesztés iránt elkötelezett, megbízható pályázó vagyok. Műszaki informatikus végzettséggel és Cisco IT Essentials alapismeretekkel rendelkezem. Célom junior vagy betanulható IT pozíció, ahol rendszerszemlélettel, gyors tanulással és felelősségteljes munkával fejlődhetek.",
    en: "Reliable candidate focused on IT operations, web and software development. Technical IT qualification and Cisco IT Essentials foundations. Seeking a junior or trainable IT role to grow through systems thinking, fast learning, and responsible work.",
  },
  experience: [
    {
      title: {
        hu: "Körletfelügyelő",
        en: "Housing Unit Supervisor",
      },
      organization: "Sátoraljaújhelyi Fegyház és Börtön",
      start: "2022-11",
      end: { hu: "jelenleg is", en: "Present" },
      current: true,
    },
    {
      title: {
        hu: "Forgalmi szolgálattevő",
        en: "Traffic Duty Officer",
      },
      organization: "MÁV Zrt.",
      start: "2017-07",
      end: { hu: "2022-11", en: "2022-11" },
      current: false,
    },
  ],
  education: [
    {
      title: {
        hu: "IT Essentials",
        en: "IT Essentials",
      },
      institution: "Cisco Networking Academy",
      location: { hu: "Magyarország", en: "Hungary" },
      start: "2014-04",
      end: "2014-05",
    },
    {
      title: {
        hu: "Érettségi, Műszaki Informatikus OKJ",
        en: "Secondary School Leaving Certificate, Technical IT (OKJ)",
      },
      institution: "Beregszászi Pál Szakközépiskola és Szakiskola, Debrecen",
      location: { hu: "Magyarország", en: "Hungary" },
      start: "2008-09",
      end: "2014-06",
    },
  ],
  portfolio: [
    {
      title: {
        hu: "AntiCode — saját weboldal és portfólió",
        en: "AntiCode — personal website & portfolio",
      },
      urlLabel: "anticode.hu",
      url: "https://anticode.hu",
      description: {
        hu: "Saját fejlesztésű weboldal: szolgáltatások, tudástár és szakmai bemutatkozás.",
        en: "Self-built website featuring services, knowledge base, and professional introduction.",
      },
    },
  ],
  languages: [
    {
      name: { hu: "Angol", en: "English" },
      level: {
        hu: "Középfok / kommunikációképes szint",
        en: "Intermediate / conversational level",
      },
    },
  ],
  drivingLicence: {
    category: "B",
    description: {
      hu: "Személygépkocsi",
      en: "Passenger car",
    },
  },
  skills: [
    {
      hu: "Hálózat alapismeretek",
      en: "Networking fundamentals",
    },
    {
      hu: "Office 365",
      en: "Office 365",
    },
    {
      hu: "Microsoft Office (korábbi)",
      en: "Microsoft Office (legacy)",
    },
    {
      hu: "Microsoft Active Directory",
      en: "Microsoft Active Directory",
    },
    {
      hu: "Webfejlesztés (HTML, CSS, JavaScript, Python)",
      en: "Web development (HTML, CSS, JavaScript, Python)",
    },
    {
      hu: "PowerShell",
      en: "PowerShell",
    },
    {
      hu: "Linux Bash",
      en: "Linux Bash",
    },
  ],
  pdfFileName: {
    hu: "Milei_Sandor_Antal_CV_HU.pdf",
    en: "Milei_Sandor_Antal_CV_EN.pdf",
  },
};
