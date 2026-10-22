const tools = [
  { category: "Frameworks", name: "Next.js 15 · React 19" },
  { category: "Languages", name: "TypeScript · Python" },
  { category: "Runtime", name: "Node.js" },
  { category: "3D", name: "Three.js" },
  { category: "Backend", name: "Firebase · Supabase Auth" },
  { category: "Data & storage", name: "PostgreSQL · Supabase Storage" },
  { category: "AI", name: "OpenAI · LLMs" },
  { category: "Integrations", name: "API integrations" },
];

export function TechStack() {
  return (
    <section className="wrap stack-section" id="stack" aria-labelledby="stack-heading">
      <div className="stack-intro">
        <div className="chapter">02 / Tools & framework</div>
        <h2 id="stack-heading">Tools I use<br /><em>to build products.</em></h2>
        <p>Frameworks, languages and platforms I use through Lordic to build software, AI features and API integrations.</p>
      </div>
      <div className="stack-content">
        <dl className="stack-list" aria-label="Obadasa's professional tools and technologies">
          {tools.map((item) => (
            <div className="stack-item" key={item.category}>
              <dt>{item.category}</dt>
              <dd>{item.name}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
