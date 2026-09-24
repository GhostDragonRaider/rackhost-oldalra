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
            width={94}
            height={94}
          />
          <div className="cv-doc__name-block">
            <h1 className="cv-doc__name">{p.fullName}</h1>
            <p className="cv-doc__role-hint">
              {locale === "hu"
                ? "IT üzemeltetés · Web- és szoftverfejlesztés"
                : "IT operations · Web & software development"}
            </p>
            <p className="cv-doc__meta">
              {p.location}
              <span aria-hidden> · </span>
              {p.birthYear}
            </p>
          </div>
        </div>
        <address className="cv-doc__contact">
          <span className="cv-doc__contact-label">{L.contact[locale]}</span>
          <a href={`mailto:${p.email}`}>{p.email}</a>
          <a href={`tel:${p.phone.replace(/\s+/g, "")}`}>{p.phone}</a>
          <span>{p.location}</span>
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
        <ol className="cv-doc__timeline">
          {cv.experience.map((item) => (
            <li key={`${item.organization}-${item.start}`}>
              <span className="cv-doc__timeline-mark" aria-hidden />
              <div className="cv-doc__item-head">
                <h3>{item.title[locale]}</h3>
                <time>
                  {formatCvPeriod(item.start, item.end[locale], locale)}
                </time>
              </div>
              <p className="cv-doc__org">{item.organization}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="cv-doc__section">
        <h2>{L.education[locale]}</h2>
        <ul className="cv-doc__list">
          {cv.education.map((item) => (
            <li key={`${item.institution}-${item.start}`}>
              <div className="cv-doc__item-head">
                <h3>{item.title[locale]}</h3>
                <time>{formatCvPeriod(item.start, item.end, locale)}</time>
              </div>
              <p className="cv-doc__org">
                {item.institution}
                <span aria-hidden> · </span>
                {item.location[locale]}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="cv-doc__section">
        <h2>{L.portfolio[locale]}</h2>
        <ul className="cv-doc__portfolio">
          {cv.portfolio.map((item) => (
            <li key={item.url}>
              <div className="cv-doc__portfolio-top">
                <h3>{item.title[locale]}</h3>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.urlLabel}
                </a>
              </div>
              <p>{item.description[locale]}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="cv-doc__meta-row">
        <section className="cv-doc__section">
          <h2>{L.languages[locale]}</h2>
          <ul className="cv-doc__list cv-doc__list--compact">
            {cv.languages.map((lang) => (
              <li key={lang.name.en}>
                <strong>{lang.name[locale]}</strong>
                <span>{lang.level[locale]}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="cv-doc__section">
          <h2>{L.drivingLicence[locale]}</h2>
          <p className="cv-doc__licence">
            <strong>{cv.drivingLicence.category}</strong>
            <span>{cv.drivingLicence.description[locale]}</span>
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
