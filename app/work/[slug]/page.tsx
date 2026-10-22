import type { Metadata } from "next";
import Image from "next/image";
import { MyWidgetFlowScript } from "@/components/public/MyWidgetFlowScript";
import { notFound } from "next/navigation";
import { getProject } from "@/lib/db";
import { getPublicSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug).catch(() => null);
  if (!project) return { title: "Project not found", robots: { index: false, follow: false } };
  const description = (project.summary || `${project.title}, a project by Obadasa Kayode and Lordic.`).slice(0, 160);
  const siteUrl = getPublicSiteUrl();
  const canonical = siteUrl ? new URL(`/work/${encodeURIComponent(project.slug)}`, siteUrl).toString() : undefined;
  const image = siteUrl && project.images[0]?.url ? new URL(project.images[0].url, siteUrl).toString() : undefined;
  return {
    title: project.title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      type: "article",
      siteName: "Lordic",
      title: project.title,
      description,
      url: canonical,
      images: image ? [{ url: image, alt: project.images[0]?.caption || `${project.title} project screenshot` }] : undefined,
    },
    twitter: { card: image ? "summary_large_image" : "summary", title: project.title, description, images: image ? [image] : undefined },
  };
}

export default async function WorkPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  return <>
    <header className="wrap site-header"><a className="brand" href="/" aria-label="Lordic home"><Image className="brand-logo" src="/lordic-logo.png" alt="Lordic" width={1774} height={887} priority /></a><a className="nav-link" href="/#work">← Back to selected work</a></header>
    <main id="main" className="wrap">
      <section className="case-hero"><div className="eyebrow">{project.category} / Selected work</div><h1 className="case-title">{project.title}</h1><p style={{ maxWidth: 700, fontSize: 19, color: "#555a52" }}>{project.summary || project.context}</p><div className="case-meta">{project.technologies.length > 0 && <span>{project.technologies.join(" · ")}</span>}{project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">Visit project ↗</a>}{project.repositoryUrl && <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">Source ↗</a>}</div></section>
      {project.context && <section className="case-layout"><h2>Context</h2><p>{project.context}</p></section>}
      {project.contribution && <section className="case-layout"><h2>Contribution</h2><p>{project.contribution}</p></section>}
      {project.outcome && <section className="case-layout"><h2>Outcome</h2><p>{project.outcome}</p></section>}
      {project.images.length > 0 && <section className="case-layout"><h2>Selected screens</h2><div className="gallery">{project.images.map((image, index) => <figure key={image.id} style={{ margin: 0 }}><img src={image.url} alt={image.caption || `${project.title} screenshot ${index + 1}`} width={1200} height={900} loading="lazy" decoding="async"/>{image.caption && <figcaption className="micro" style={{ paddingTop: 8 }}>{image.caption}</figcaption>}</figure>)}</div></section>}
      <section className="wrap section contact"><div><div className="chapter">Continue the conversation</div><h2>Build the next<br/><span className="display-serif">useful thing.</span></h2></div><a className="button" href="mailto:obadasakayode78@gmail.com?subject=Project%20enquiry%20for%20Lordic">Contact Obadasa Kayode <span>↗</span></a></section>
    </main>
    <footer className="wrap site-footer"><a href="/">© Obadasa Kayode · Lordic</a><a href="/admin">Owner studio</a></footer>
    <MyWidgetFlowScript />
  </>;
}
