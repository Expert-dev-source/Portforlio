const skills = [
  "SaaS MVP and product development",
  "Full-stack web application development",
  "Applied AI and LLM integration",
  "API integrations",
  "Game development",
];

const technologies = [
  { category: "Frameworks", name: "Next.js 15 · React 19" },
  { category: "Languages", name: "TypeScript · Python · PHP" },
  { category: "Backend & runtime", name: "Node.js · Firebase · Supabase Auth" },
  { category: "Data & storage", name: "PostgreSQL · Supabase Storage" },
  { category: "AI & APIs", name: "OpenAI · LLMs · API integrations" },
  { category: "3D & interactive", name: "Three.js" },
];

export function TechStack() {
  return (
    <section className="wrap stack-section" id="stack" aria-labelledby="stack-heading">
      <div className="stack-intro">
        <div className="chapter">03 / Skills & Tech Stack</div>
        <h2 id="stack-heading">Skills &amp; tech<br /><em>stack.</em></h2>
        <p>Development areas I offer through Lordic, the technologies I work with, and the stack behind this portfolio.</p>
      </div>
      <div className="stack-content">
        <div className="stack-section-label chapter">Skills</div>
        <ul className="skills-list">
          {skills.map((skill) => <li key={skill}>{skill}</li>)}
        </ul>

        <div className="stack-section-label chapter">Technologies</div>
        <dl className="stack-list" aria-label="Obadasa's skills and professional technologies">
          {technologies.map((item) => (
            <div className="stack-item" key={item.category}>
              <dt>{item.category}</dt>
              <dd>{item.name}</dd>
            </div>
          ))}
        </dl>

        <div className="site-stack">
          <div className="chapter">This site / implementation</div>
          <div className="site-stack-copy">
            <p><strong>Application</strong> Next.js 15 · React 19 · TypeScript · Supabase Auth · PostgreSQL · Supabase Storage</p>
            <p><strong>Hosting</strong> Vercel</p>
          </div>
        </div>
      </div>
    </section>
  );
}
