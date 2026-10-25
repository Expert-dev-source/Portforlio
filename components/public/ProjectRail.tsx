"use client";

import { useCallback, useRef, useState } from "react";
import type { Project } from "@/lib/db";

export function ProjectRail({ projects }: { projects: Project[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(1);

  const update = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const max = Math.max(el.scrollWidth - el.clientWidth, 0);
    setProgress(max ? (el.scrollLeft / max) * 100 : 0);
    const card = el.querySelector<HTMLElement>(".project-card");
    if (card) setCurrent(Math.min(projects.length, Math.max(1, Math.round(el.scrollLeft / (card.offsetWidth + 16)) + 1)));
  }, [projects.length]);

  const move = (direction: number) => {
    const el = rail.current;
    const card = el?.querySelector<HTMLElement>(".project-card");
    if (!el || !card) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * (card.offsetWidth + 16), behavior: reduceMotion ? "auto" : "smooth" });
  };

  if (!projects.length) {
    return (
      <div className="focus-grid" aria-label="Areas of work">
        <article className="focus-card">
          <span className="chapter">01 / SaaS MVPs</span>
          <h3>From product scope to a working first release.</h3>
          <p>Focused software built to create a clear next step.</p>
        </article>
        <article className="focus-card">
          <span className="chapter">02 / Full-stack apps</span>
          <h3>Interfaces. Logic. Data.</h3>
          <p>Web application work across the front end, back end and integrations.</p>
        </article>
        <article className="focus-card">
          <span className="chapter">03 / Applied AI</span>
          <h3>Useful AI, inside real workflows.</h3>
          <p>Model-backed product features connected to real workflows.</p>
        </article>
      </div>
    );
  }

  return (
    <>
      <div
        className="project-rail"
        role="region"
        ref={rail}
        onScroll={update}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
          if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
        }}
        tabIndex={0}
        aria-label="Projects. Use the left and right arrow keys to browse."
      >
        {projects.map((project, index) => (
          <article className="project-card" key={project.id}>
            <div className="project-card-top">
              <span className="micro">{String(index + 1).padStart(2, "0")} / {project.category}</span>
              <span className="micro">{project.published ? "Published" : ""}</span>
            </div>
            <a className="project-visual" href={`/work/${encodeURIComponent(project.slug)}`} aria-label={`Read the ${project.title} case study`}>
              {project.images[0] ? (
                <img src={project.images[0].url} alt={project.images[0].caption || `${project.title} interface`} width={1200} height={800} loading="lazy" decoding="async" style={{ position: "absolute", inset: "16px", width: "calc(100% - 32px)", height: "calc(100% - 32px)", objectFit: "contain" }} />
              ) : (
                <div className="project-plate" aria-hidden="true">
                  <span className="plate-index">LORDIC / {String(index + 1).padStart(2, "0")}</span>
                  <div className="plate-copy">
                    <span>{project.category} / PROJECT RECORD</span>
                    <strong>{project.title}</strong>
                    <span>{project.demoUrl ? new URL(project.demoUrl).host : "Case study"}</span>
                  </div>
                  <span className="plate-mark">L/</span>
                </div>
              )}
            </a>
            <div className="project-card-bottom">
              <div>
                <span className="micro">{project.technologies.slice(0, 4).join(" · ") || "Lordic / Product work"}</span>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
              </div>
              <a className="card-arrow" href={`/work/${encodeURIComponent(project.slug)}`} aria-label={`Open ${project.title} case study`}>↗</a>
            </div>
          </article>
        ))}
      </div>
      <div className="rail-foot">
        <span className="micro">Scroll or use arrow keys</span>
        <div className="progress-wrap">
          <span className="progress-count">{String(current).padStart(2, "0")}</span>
          <div className="progress-line" role="progressbar" aria-label="Project browsing progress" aria-valuemin={1} aria-valuemax={projects.length} aria-valuenow={current}>
            <span aria-hidden="true" style={{ width: `${projects.length > 1 ? Math.max(progress, 3) : 100}%` }} />
          </div>
          <span className="progress-count">{String(projects.length).padStart(2, "0")}</span>
        </div>
        <div className="rail-controls">
          <button className="round-control" type="button" aria-label="Previous project" onClick={() => move(-1)}>←</button>
          <button className="round-control" type="button" aria-label="Next project" onClick={() => move(1)}>→</button>
        </div>
      </div>
    </>
  );
}
