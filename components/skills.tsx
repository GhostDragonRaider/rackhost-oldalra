import React from "react";

type TechIcon = string | { src: string };

export default function Skills() {
  const technologies: { name: string; icon: TechIcon }[] = [
    { name: "HTML5", icon: "html" },
    { name: "CSS3", icon: "css" },
    { name: "JavaScript", icon: "javascript" },
    { name: "TypeScript", icon: "typescript" },
    { name: "React", icon: "react" },
    { name: "Next.js", icon: "nextjs" },
  ];

  return (
    <div className="skills-container">
      <div className="skills-header">
        <h2 className="skills-title">Techs</h2>
        <p className="skills-subtitle">
          Néhány technológia, amelyekkel dolgozom:
        </p>
      </div>

      <div className="skills-grid">
        {technologies.map((tech, index) => (
          <div
            key={tech.name}
            className="skill-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {typeof tech.icon === "string" ? (
              <div className={`skill-icon skill-icon-${tech.icon}`}></div>
            ) : (
              <div className="skill-icon skill-icon-image">
                <img
                  src={tech.icon.src}
                  alt={tech.name}
                  className="skill-icon-img"
                />
              </div>
            )}
            <h3 className="skill-name">{tech.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
