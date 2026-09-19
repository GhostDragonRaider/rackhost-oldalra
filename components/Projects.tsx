import React, { useState } from "react";

export default function Projects() {
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const projects = [
    {
      name: "Corporate Website",
      image: "/projects/project-1/preview.png",
      link: "/projects/project-1/project-1.html",
    },
    {
      name: "Időpontfoglaló",
      image: "/projects/project-2/preview.png",
      link: "/projects/project-2/",
    },
    {
      name: "NovaDrive Motors",
      image: "/projects/project-3/preview.png",
      link: "/projects/project-3/",
    },
    {
      name: "Virtual Cockpit",
      image: "/projects/project-4/preview.png",
      link: "/projects/project-4/",
    },
    {
      name: "Egyedi képeskártyák",
      image: "/projects/project-5/preview.png",
      link: "/projects/project-5/",
    },
  ];

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h2 className="projects-title">Munkáim</h2>
        <p className="projects-subtitle">Tekintsd meg néhány munkámat</p>
      </div>

      <div className="projects-grid">
        {projects.map((project, index) => (
          <a
            key={project.link}
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="project-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="project-image">
              {imageErrors[index] ? (
                <span className="project-placeholder">Project Preview</span>
              ) : (
                <img
                  src={project.image}
                  alt={`${project.name} előnézet`}
                  className="project-preview-img"
                  onError={() =>
                    setImageErrors((prev) => ({ ...prev, [index]: true }))
                  }
                />
              )}
            </div>
            <h3 className="project-name">{project.name}</h3>
          </a>
        ))}
      </div>
    </div>
  );
}
