import type { Metadata } from "next";
import { AdminStudio } from "@/components/admin/AdminStudio";
import { SignInButton } from "@/components/admin/SignInButton";
import { getPageSession } from "@/lib/auth";
import Image from "next/image";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Owner studio", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const session = await getPageSession();
  if (session) return <AdminStudio ownerName={session.name}/>;
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  return <main id="main" className="admin-shell"><section className="admin-wrap" style={{ maxWidth: 760 }}>
    <a className="brand" href="/" aria-label="Lordic home"><Image src="/lordic-logo.png" alt="Lordic" width={1774} height={887} style={{ width: 122, height: "auto" }}/><span>OWNER STUDIO</span></a>
    <div className="admin-card" style={{ marginTop: 90, padding: "clamp(28px, 6vw, 60px)" }}>
      <div className="chapter">Owner access / Private</div><h1 className="admin-title">Project Studio</h1>
      <p className="muted">Add a project, write the case study, upload screenshots, then publish it to the Lordic work archive.</p>
      {!configured ? <div role="status" className="notice studio-setup-notice"><strong>Studio setup required</strong><p>Connect your Supabase project first. Add its project URL and publishable key to Vercel, run the SQL migration, create your owner account, and add its UUID to the private owner registry. Then this dashboard can save and publish your past projects.</p><a href="/">Return to the portfolio</a></div> : <SignInButton/>}
      <p className="muted" style={{ marginTop: 28, fontSize: 12 }}>Access is restricted to the account listed in the Supabase owner registry. Public sign-up is not available here.</p>
    </div>
  </section></main>;
}
