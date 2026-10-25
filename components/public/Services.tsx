import { ScrollRevealGroup } from "@/components/public/ScrollRevealGroup";

const services = [
  {
    title: "SaaS MVPs and product builds",
    description:
      "Shape a product idea into a focused first release: core user flows, a responsive interface, and the application logic and data behind them.",
  },
  {
    title: "Full-stack web applications",
    description:
      "Build the web product end to end, connecting its responsive interface to application logic, databases, authentication, and third-party integrations.",
  },
  {
    title: "Applied AI and API integrations",
    description:
      "Put language models and external APIs into useful product workflows, with the application logic and interface to make them part of the product.",
  },
  {
    title: "Game development",
    description:
      "Develop game experiences as a distinct product type. Explore the separate standalone game linked here.",
  },
] as const;

export function Services({ gameUrl }: { gameUrl: string }) {
  return (
    <section className="wrap section services-section" id="services" aria-labelledby="services-heading">
      <div className="section-head">
        <div className="chapter">02 / Services</div>
        <h2 className="section-title" id="services-heading">
          Four ways to build<br /><span className="display-serif">with Lordic.</span>
        </h2>
        <p className="section-sub">What I take on, and what each build can include.</p>
      </div>
      <ScrollRevealGroup className="services-grid" itemSelector=".service-card">
        {services.map((service, index) => (
          <article className="service-card" key={service.title}>
            <span className="service-index">0{index + 1}</span>
            <div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
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
