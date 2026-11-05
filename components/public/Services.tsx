import { ScrollRevealGroup } from "@/components/public/ScrollRevealGroup";

const services = [
  {
    title: "Business websites and digital experiences",
    description: "A clear, fast website that explains your work, builds trust and gives visitors a simple way to enquire.",
    value: "Help potential customers understand your services and take the next step.",
    deliverables: "Service pages · Project galleries · Enquiry flows",
  },
  {
    title: "SaaS MVPs and product builds",
    description: "Take a product idea from defined user journeys to a usable first release, with the essential interfaces and data behind it.",
    value: "Get a working product into users' hands and learn what to improve next.",
    deliverables: "Product scope · Core workflows · First release",
  },
  {
    title: "Full-stack web applications",
    description: "Build tailored dashboards, portals and workflow tools with the frontend, backend and integrations working as one.",
    value: "Reduce manual steps and make important information easier to manage.",
    deliverables: "Dashboards · Databases · Integrations",
  },
  {
    title: "Applied AI and API integrations",
    description: "Connect useful AI or external APIs to real tasks inside an existing or new product.",
    value: "Make workflows more useful without adding needless complexity.",
    deliverables: "API connections · AI features · Product workflows",
  },
  {
    title: "Game development",
    description: "Build interactive game experiences with a focus on responsive controls and a consistent visual identity.",
    value: "Create an experience people can actually explore and interact with.",
    deliverables: "Gameplay · Interaction · Web experiences",
  },
] as const;

export function Services({ gameUrl }: { gameUrl: string }) {
  return (
    <section className="wrap section services-section" id="services" aria-labelledby="services-heading">
      <div className="section-head">
        <div className="chapter">02 / Services</div>
        <h2 className="section-title" id="services-heading">
          What Lordic builds.<br /><span className="display-serif">Why it matters.</span>
        </h2>
        <p className="section-sub">The work, the deliverables and the value they create.</p>
      </div>
      <ScrollRevealGroup className="services-grid services-grid--value" itemSelector=".service-card">
        {services.map((service, index) => (
          <article className="service-card service-card--value" key={service.title}>
            <span className="service-index">0{index + 1}</span>
            <div className="service-card-content">
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <div className="service-deliverables">{service.deliverables}</div>
              <div className="service-result">
                <span className="micro">The value</span>
                <strong>{service.value}</strong>
              </div>
              {service.title === "Game development" && (
                <a className="service-link" href={gameUrl} target="_blank" rel="noopener noreferrer">
                  View standalone game <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          </article>
        ))}
      </ScrollRevealGroup>
      <div className="services-cta">
        <p>Have a project in mind?</p>
        <a className="button" href="mailto:obadasakayode78@gmail.com?subject=Project%20enquiry%20for%20Lordic">
          Discuss your project <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}
