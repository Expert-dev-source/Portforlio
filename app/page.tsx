import { listProjects } from "@/lib/db";
import { ProjectRail } from "@/components/public/ProjectRail";
import { TechStack } from "@/components/public/TechStack";
import { Testimonials } from "@/components/public/Testimonials";
import { MyWidgetFlowScript } from "@/components/public/MyWidgetFlowScript";
import Image from "next/image";

export const dynamic = "force-dynamic";

const UPWORK_URL = "https://www.upwork.com/freelancers/~01f955317f70a18da6?companyReference=1904459385905651640&mp_source=share";
const TIKTOK_URL = "https://www.tiktok.com/@lordic_1?_r=1&_t=ZS-9AklD8YDRbi";

export default async function HomePage() {
  const projects = await listProjects(false);
  const hasProjects = projects.length > 0;

  return (
    <>
      <header className="wrap site-header">
        <a className="brand" href="/" aria-label="Lordic home">
          <Image className="brand-logo" src="/lordic-logo.png" alt="Lordic" width={1774} height={887} priority />
        </a>
        <nav className="header-right" aria-label="Main navigation">
          <a className="nav-link" href="#work">{hasProjects ? "Work" : "Focus"}</a>
          <a className="nav-link" href="#testimonials">Reviews</a>
          <a className="nav-link" href="#stack">Stack</a>
          <a className="nav-link" href="#about">About Lordic</a>
          <a className="nav-link" href="#contact">Contact ↗</a>
          <a className="studio-link" href="/admin">Owner Studio ↗</a>
        </nav>
      </header>

      <main id="main">
        <section className="wrap hero">
          <div className="hero-copy">
            <div className="eyebrow">LORDIC · OBADASA KAYODE</div>
            <h1>Full-stack<br />developer.<br /><em>Product builder.</em></h1>
            <p>I’m Obadasa Kayode, a full-stack developer and CEO of Lordic. Through Lordic, I build SaaS MVPs, web apps and applied-AI products.</p>
            <div className="hero-links">
              <a className="button" href="#work">{hasProjects ? "See selected work" : "What Lordic builds"} <span>↘</span></a>
              <a className="text-link" href="#about">Behind Lordic</a>
            </div>
          </div>
          <aside className="hero-stage" aria-label="Lordic and Obadasa Kayode">
            <div className="hero-note">LORDIC / PRODUCT WORK</div>
            <div className="hero-brand-card">
              <Image className="hero-brand-logo" src="/lordic-logo.png" alt="Lordic" width={1774} height={887} priority />
              <div className="hero-brand-copy">
                <span className="chapter">Obadasa Kayode · CEO</span>
                <p>Full-stack product development through Lordic.</p>
              </div>
              <div className="hero-specialties" aria-label="Lordic services">
                <span>SaaS MVPs</span>
                <span>Full-stack apps</span>
                <span>Applied AI</span>
              </div>
            </div>
            <div className="hero-index">Product thinking · engineering · integrations</div>
          </aside>
        </section>

        <div className="ticker" aria-label="Lordic areas of work">
          <div className="ticker-track">
            <strong>LORDIC / OBADASA KAYODE</strong>
            <span>SaaS MVPs</span>
            <span>Web applications</span>
            <span>Applied AI</span>
            <span>Full-stack engineering</span>
            <span>Product work</span>
          </div>
        </div>

        <section className="wrap section" id="work">
          <div className="section-head">
            <div className="chapter">01 / {hasProjects ? "Selected work" : "What Lordic builds"}</div>
            <h2 className="section-title">SaaS, software<br /><span className="display-serif">and applied AI.</span></h2>
            <p className="section-sub">{hasProjects ? "Case studies with the real context, contribution and details." : "SaaS MVPs, full-stack web apps and applied-AI products."}</p>
          </div>
          <ProjectRail projects={projects} />
        </section>

        <TechStack />
        <Testimonials />

        <section className="about-section" id="about">
          <div className="wrap">
            <div className="about-grid">
              <div className="chapter">04 / Behind Lordic</div>
              <div className="about-copy">
                <h2>Lordic is my work.<br /><em>I’m the builder.</em></h2>
                <p>I’m Obadasa Kayode, a full-stack developer and CEO of Lordic. Lordic is where I bring product thinking and engineering together. I build SaaS MVPs, web applications and applied-AI features across the interface, application logic and data.</p>
                <p className="about-note">One brand for the work. One person behind the build.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="wrap section contact" id="contact">
          <div>
            <div className="chapter">05 / Contact Lordic</div>
            <h2>What are you<br /><span className="display-serif">building?</span></h2>
          </div>
          <div>
            <p>For SaaS MVPs, full-stack builds or applied-AI products, start a conversation with Lordic.</p>
            <a className="button" href="mailto:obadasakayode78@gmail.com">Email Lordic <span>↗</span></a>
            <a className="contact-email" href="mailto:obadasakayode78@gmail.com">obadasakayode78@gmail.com</a>
            <nav className="profile-links" aria-label="Lordic profiles">
              <a href={UPWORK_URL} target="_blank" rel="noopener noreferrer">Upwork profile <span aria-hidden="true">↗</span></a>
              <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer">TikTok · @lordic_1 <span aria-hidden="true">↗</span></a>
            </nav>
          </div>
        </section>
      </main>

      <footer className="wrap site-footer">
        <span>© {new Date().getFullYear()} Lordic · Obadasa Kayode</span>
        <span>Full-stack products, built through Lordic.</span>
        <a href="/admin">Owner Studio</a>
      </footer>
      <MyWidgetFlowScript />
    </>
  );
}
