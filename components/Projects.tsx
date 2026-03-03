import React, { useState } from "react";

export default function Projects() {
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const projects = [
    { name: "Project 1", image: "/projects/project-1/preview.png", link: "/projects/project-1/project-1.html" },
    { name: "Project 2", image: "/projects/project-2/preview.png", link: "/projects/project-2/" },
    { name: "Project 3", image: "/projects/project-3/preview.png", link: "/projects/project-3/" },
    { name: "Project 4", image: "placeholder", link: "#" },
    { name: "Project 5", image: "placeholder", link: "#" },
    { name: "Project 6", image: "placeholder", link: "#" },
  ];

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h2 className="projects-title">Munkáim</h2>
        <p className="projects-subtitle">Tekintsd meg néhány munkámat</p>
      </div>

      <div className="projects-grid">
        {projects
          .filter((p) => p.name === "Project 1" || p.name === "Project 2" || p.name === "Project 3")
          .map((project, index) => (
          <a
            key={index}
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="project-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="project-image">
              {project.image === "placeholder" || imageErrors[index] ? (
                <span className="project-placeholder">Project Preview</span>
              ) : (
                <img
                  src={project.image}
                  alt={`${project.name} előnézet`}
                  className="project-preview-img"
                  onError={() => setImageErrors((prev) => ({ ...prev, [index]: true }))}
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
