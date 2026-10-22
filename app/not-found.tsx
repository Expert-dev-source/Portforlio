import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

export default function NotFound() {
  return <main id="main" className="wrap" style={{ minHeight: "70vh", display: "grid", alignContent: "center" }}>
    <div className="chapter">404 / Not found</div>
    <h1 className="case-title">This page<br/><span className="display-serif">isn’t here.</span></h1>
    <p className="muted">The page may have moved, or the project is not public.</p>
    <p><a className="button" href="/">Return to the portfolio <span>↗</span></a></p>
  </main>;
}
