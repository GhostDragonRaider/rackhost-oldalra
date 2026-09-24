import type { CvContent, CvLocale } from "../../../lib/cv/types";
import { formatCvPeriod } from "../../../lib/cv/format";

type CvDocumentProps = {
  locale: CvLocale;
  content: CvContent;
  className?: string;
};

export default function CvDocument({
  locale,
  content,
  className,
}: CvDocumentProps) {
  const cv = content;
  const p = cv.personal;
  const L = cv.labels;

  return (
    <article
      className={`cv-doc${className ? ` ${className}` : ""}`}
      lang={locale}
      aria-label={
        locale === "hu"
          ? "Önéletrajz előnézet — magyar"
          : "Curriculum vitae preview — English"
      }
    >
      <header className="cv-doc__header">
        <div className="cv-doc__identity">
          <img
            className="cv-doc__photo"
            src={p.photoSrc}
            alt={p.photoAlt[locale]}
            width={72}
            height={72}
          />
          <div className="cv-doc__name-block">
            <h1 className="cv-doc__name">{p.fullName}</h1>
            <p className="cv-doc__meta">
              {p.location}
              <span aria-hidden> · </span>
              {p.birthYear}
              <span aria-hidden> · </span>
              {locale === "hu"
                ? "IT üzemeltetés · Webfejlesztés"
                : "IT operations · Web development"}
            </p>
          </div>
        </div>
        <address className="cv-doc__contact">
          <a href={`mailto:${p.email}`}>{p.email}</a>
          <a href={`tel:${p.phone.replace(/\s+/g, "")}`}>{p.phone}</a>
          <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer">
            {p.websiteLabel}
          </a>
        </address>
      </header>

      <section className="cv-doc__section">
        <h2>{L.profile[locale]}</h2>
        <p className="cv-doc__profile">{cv.profile[locale]}</p>
      </section>

      <section className="cv-doc__section">
        <h2>{L.experience[locale]}</h2>
        <ul className="cv-doc__dense">
          {cv.experience.map((item) => (
            <li key={`${item.organization}-${item.start}`}>
              <strong>{item.title[locale]}</strong>
              <span className="cv-doc__sep">—</span>
              <span>{item.organization}</span>
              <time>{formatCvPeriod(item.start, item.end[locale], locale)}</time>
            </li>
          ))}
        </ul>
      </section>

      <section className="cv-doc__section">
        <h2>{L.education[locale]}</h2>
        <ul className="cv-doc__dense">
          {cv.education.map((item) => (
            <li key={`${item.institution}-${item.start}`}>
              <strong>{item.title[locale]}</strong>
              <span className="cv-doc__sep">—</span>
              <span>
                {item.institution}
                <span aria-hidden> · </span>
                {item.location[locale]}
              </span>
              <time>{formatCvPeriod(item.start, item.end, locale)}</time>
            </li>
          ))}
        </ul>
      </section>

      <section className="cv-doc__section">
        <h2>{L.portfolio[locale]}</h2>
        <ul className="cv-doc__dense">
          {cv.portfolio.map((item) => (
            <li key={item.url}>
              <strong>{item.title[locale]}</strong>
              <span className="cv-doc__sep">—</span>
              <span>{item.description[locale]}</span>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.urlLabel}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <div className="cv-doc__meta-row">
        <section className="cv-doc__section">
          <h2>{L.languages[locale]}</h2>
          <p className="cv-doc__inline">
            {cv.languages.map((lang) => (
              <span key={lang.name.en}>
                <strong>{lang.name[locale]}</strong>
                {` — ${lang.level[locale]}`}
              </span>
            ))}
          </p>
        </section>
        <section className="cv-doc__section">
          <h2>{L.drivingLicence[locale]}</h2>
          <p className="cv-doc__inline">
            <strong>{cv.drivingLicence.category}</strong>
            {` — ${cv.drivingLicence.description[locale]}`}
          </p>
        </section>
      </div>

      <section className="cv-doc__section cv-doc__section--skills">
        <h2>{L.skills[locale]}</h2>
        <ul className="cv-doc__skills">
          {cv.skills.map((skill) => (
            <li key={skill.en}>{skill[locale]}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}
