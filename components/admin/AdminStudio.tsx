"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type ProjectImage = { id: string; path: string; url: string; caption: string; sortOrder: number };
type Project = { id: string; slug: string; title: string; category: string; summary: string; context: string; contribution: string; outcome: string; technologies: string[]; demoUrl: string; repositoryUrl: string; published: boolean; sortOrder: number; images: ProjectImage[] };
const blank = (): Omit<Project, "id" | "images"> => ({ slug: "", title: "", category: "", summary: "", context: "", contribution: "", outcome: "", technologies: [], demoUrl: "", repositoryUrl: "", published: false, sortOrder: 10 });
const fields: Array<{ key: keyof ReturnType<typeof blank>; label: string; area?: boolean; hint?: string }> = [
  { key: "title", label: "Project name" }, { key: "slug", label: "URL slug", hint: "Use a short, real-project name in lowercase with hyphens" },
  { key: "category", label: "Type / category" }, { key: "summary", label: "Short introduction", area: true },
  { key: "context", label: "Context / problem", area: true }, { key: "contribution", label: "What you built", area: true },
  { key: "outcome", label: "Outcome", area: true, hint: "Describe what actually changed. Only include results or numbers you can substantiate." }, { key: "technologies", label: "Technologies", hint: "Separate items with commas" },
  { key: "demoUrl", label: "Live project URL (HTTPS)" }, { key: "repositoryUrl", label: "Repository URL (HTTPS)" },
];
async function errorMessage(response: Response, fallback: string) { const body = await response.json().catch(() => ({})) as { error?: string }; return body.error || fallback; }
export function AdminStudio({ ownerName, signInError }: { ownerName: string; signInError?: boolean }) {
  const [projects, setProjects] = useState<Project[]>([]); const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState(blank()); const [isNew, setIsNew] = useState(false); const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [uploading, setUploading] = useState(false);
  const selected = useMemo(() => projects.find((project) => project.id === selectedId) ?? null, [projects, selectedId]);
  const loadProjects = async (keepId?: string) => {
    setLoading(true); setError("");
    try { const response = await fetch("/api/admin/projects", { cache: "no-store" }); if (!response.ok) throw new Error(await errorMessage(response, "Could not load projects.")); const data = await response.json() as { projects: Project[] }; setProjects(data.projects); const nextId = keepId && data.projects.some((p) => p.id === keepId) ? keepId : data.projects[0]?.id ?? null; setSelectedId(nextId); const chosen = data.projects.find((p) => p.id === nextId); if (chosen) { const { id: _id, images: _images, ...rest } = chosen; setForm(rest); setIsNew(false); } else { setForm(blank()); setIsNew(false); } }
    catch (error) { setError(error instanceof Error ? error.message : "Could not load projects."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void loadProjects(); }, []);
  const choose = (project: Project) => { setSelectedId(project.id); setIsNew(false); const { id: _id, images: _images, ...rest } = project; setForm(rest); setMessage(""); setError(""); };
  const update = (key: keyof ReturnType<typeof blank>, value: string | boolean | number | string[]) => setForm((current) => ({ ...current, [key]: value }));
  const save = async () => {
    setSaving(true); setError(""); setMessage("");
    const payload = { ...form, technologies: Array.isArray(form.technologies) ? form.technologies : String(form.technologies).split(",").map((item) => item.trim()).filter(Boolean) };
    try {
      const response = isNew ? await fetch("/api/admin/projects", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }) : await fetch("/api/admin/projects", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: selectedId, project: payload }) });
      if (!response.ok) throw new Error(await errorMessage(response, "Could not save the project."));
      const result = isNew ? await response.json() as { id: string } : { id: selectedId! };
      await loadProjects(result.id); setMessage(payload.published ? "Published. This case study is now in the public work archive." : "Draft saved. It stays private in the Owner Studio until you publish it."); setIsNew(false);
    } catch (error) { setError(error instanceof Error ? error.message : "Could not save this project."); }
    finally { setSaving(false); }
  };
  const create = () => { setSelectedId(null); setForm(blank()); setIsNew(true); setMessage(""); setError(""); };
  const removeProject = async () => {
    if (!selectedId || !window.confirm("Remove this project and its stored screenshots from your portfolio?")) return;
    const response = await fetch(`/api/admin/projects?id=${encodeURIComponent(selectedId)}`, { method: "DELETE" });
    if (!response.ok) { setError(await errorMessage(response, "Could not remove the project.")); return; }
    const result = await response.json().catch(() => ({})) as { note?: string };
    setMessage(result.note || "Project removed from the portfolio."); await loadProjects();
  };
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.assign("/admin"); };
  const upload = async (file: File) => {
    if (!selectedId) { setError("Save the project before adding screenshots."); return; }
    setUploading(true); setError("");
    const data = new FormData(); data.set("file", file); data.set("caption", "");
    const response = await fetch(`/api/admin/projects/${selectedId}/images`, { method: "POST", body: data });
    if (!response.ok) setError(await errorMessage(response, "Upload failed."));
    else { setMessage("Screenshot uploaded."); await loadProjects(selectedId); }
    setUploading(false);
  };
  const replaceImage = async (image: ProjectImage, file: File) => {
    if (!selectedId) return;
    setUploading(true); setError("");
    const data = new FormData(); data.set("file", file);
    const response = await fetch(`/api/admin/projects/${selectedId}/images/${image.id}`, { method: "PUT", body: data });
    if (!response.ok) setError(await errorMessage(response, "Could not replace the screenshot."));
    else { const result = await response.json().catch(() => ({})) as { note?: string }; setMessage(result.note || "Screenshot replaced in Supabase Storage."); await loadProjects(selectedId); }
    setUploading(false);
  };
  const patchImage = async (image: ProjectImage, changes: Partial<Pick<ProjectImage, "caption" | "sortOrder">>) => {
    if (!selectedId) return;
    const next = { ...image, ...changes };
    const response = await fetch(`/api/admin/projects/${selectedId}/images/${image.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ caption: next.caption, sortOrder: next.sortOrder }) });
    if (!response.ok) setError(await errorMessage(response, "Could not update the screenshot.")); else await loadProjects(selectedId);
  };
  const moveImage = async (index: number, direction: -1 | 1) => {
    const other = index + direction;
    if (!selectedId || other < 0 || other >= images.length) return;
    const first = images[index];
    const second = images[other];
    const results = await Promise.all([
      fetch(`/api/admin/projects/${selectedId}/images/${first.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ caption: first.caption, sortOrder: second.sortOrder }) }),
      fetch(`/api/admin/projects/${selectedId}/images/${second.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ caption: second.caption, sortOrder: first.sortOrder }) }),
    ]);
    if (results.some((result) => !result.ok)) setError("Could not reorder these screenshots.");
    else await loadProjects(selectedId);
  };
  const removeImage = async (image: ProjectImage) => {
    if (!selectedId || !window.confirm("Remove this screenshot from the gallery and Supabase Storage?")) return;
    const response = await fetch(`/api/admin/projects/${selectedId}/images/${image.id}`, { method: "DELETE" });
    if (!response.ok) setError(await errorMessage(response, "Could not remove the screenshot.")); else { const result = await response.json().catch(() => ({})) as { note?: string }; setMessage(result.note || "Screenshot removed from the gallery."); await loadProjects(selectedId); }
  };
  const images = selected?.images ?? [];
  if (loading && !projects.length) return <div className="admin-shell"><main id="main" className="admin-wrap"><p>Opening the project studio…</p></main></div>;
  return <div className="admin-shell"><div className="admin-wrap">
    <header className="admin-header"><a className="brand" href="/"><Image src="/lordic-logo.png" alt="Lordic" width={1774} height={887} style={{ width: 122, height: "auto" }}/><span>OWNER STUDIO</span></a><div className="admin-actions"><span className="muted">{ownerName}</span><button type="button" className="admin-btn secondary" onClick={logout}>Sign out</button><a className="admin-btn secondary" href="/">View portfolio</a></div></header>
    <h1 className="admin-title">Project studio</h1><p className="muted">The place to keep the work current. Only published projects appear publicly.</p>
    {signInError && <p className="notice" role="status">Sign-in did not complete. Check that you used the owner account.</p>}
    {message && <p className="notice" role="status">{message}</p>}{error && <p role="alert" className="notice" style={{ background: "#f7e9e5", borderColor: "#dcaa9e" }}>{error}</p>}
    <div className="admin-grid"><aside className="admin-panel"><div className="admin-actions" style={{ justifyContent: "space-between", marginBottom: 16 }}><strong>Projects ({projects.length})</strong><button type="button" className="admin-btn" onClick={create}>+ Add project</button></div><div className="admin-list">{projects.map((project) => <button key={project.id} className={project.id === selectedId ? "active" : ""} type="button" onClick={() => choose(project)}><strong>{project.title}</strong><br/><small className="muted">{project.published ? "Published" : "Draft"} · {project.category}</small></button>)}{!projects.length && <p className="muted">No projects yet. Add one to get started.</p>}</div></aside>
      <main id="main" className="admin-card"><form className="admin-form" onSubmit={(event) => { event.preventDefault(); void save(); }}>
        {fields.map(({ key, label, area, hint }) => { const value = key === "technologies" ? Array.isArray(form.technologies) ? form.technologies.join(", ") : form.technologies : form[key]; return <div className="field" key={key}><label htmlFor={`field-${key}`}>{label}</label>{area ? <textarea id={`field-${key}`} value={String(value ?? "")} onChange={(event) => update(key, event.target.value)}/> : <input id={`field-${key}`} value={String(value ?? "")} onChange={(event) => update(key, event.target.value)}/ >}{hint && <small className="muted">{hint}</small>}</div>; })}
        <div className="field"><label htmlFor="field-order">Display order</label><input id="field-order" type="number" value={form.sortOrder} onChange={(event) => update("sortOrder", Number(event.target.value))}/></div>
        <label style={{ display: "flex", alignItems: "center", gap: 10 }}><input type="checkbox" checked={form.published} onChange={(event) => update("published", event.target.checked)}/> Publish on the public portfolio</label>
        <div className="admin-actions"><button className="admin-btn" type="submit" disabled={saving}>{saving ? "Saving…" : isNew ? "Create project" : "Save project"}</button>{!isNew && selected && <button className="admin-btn danger" type="button" onClick={() => void removeProject()}>Remove project</button>}</div>
      </form>
      {!isNew && selected && <section style={{ marginTop: 30, borderTop: "1px solid var(--line)", paddingTop: 22 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}><div><h2 style={{ margin: "0 0 5px", fontSize: 20 }}>Screenshots</h2><p className="muted" style={{ margin: 0, fontSize: 12 }}>JPEG, PNG, WebP or AVIF. Up to 8 MB each.</p></div><label className="admin-btn secondary" style={{ cursor: "pointer" }}>{uploading ? "Uploading…" : "Add screenshot"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.currentTarget.value = ""; }}/></label></div>
        {images.length > 0 ? <div className="admin-images" style={{ marginTop: 18 }}>{images.map((image, index) => <div className="admin-image" key={image.id}><img src={image.url} alt={image.caption || `Screenshot ${index + 1} of ${selected.title}`} width={900} height={675} loading="lazy" decoding="async"/><label className="admin-btn secondary" style={{ display: "inline-flex", cursor: uploading ? "wait" : "pointer", marginTop: 8 }}>Replace<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void replaceImage(image, file); event.currentTarget.value = ""; }}/></label><input aria-label={`Caption for screenshot ${index + 1}`} value={image.caption} placeholder="Add a caption" onChange={(event) => setProjects((all) => all.map((project) => project.id === selectedId ? { ...project, images: project.images.map((item) => item.id === image.id ? { ...item, caption: event.target.value } : item) } : project))} onBlur={(event) => void patchImage(image, { caption: event.target.value })}/><div className="admin-actions"><button className="admin-btn secondary" type="button" aria-label="Move screenshot earlier" disabled={index === 0} onClick={() => void moveImage(index, -1)}>↑</button><button className="admin-btn secondary" type="button" aria-label="Move screenshot later" disabled={index === images.length - 1} onClick={() => void moveImage(index, 1)}>↓</button><button className="admin-btn danger" type="button" onClick={() => void removeImage(image)}>Remove</button></div></div>)}</div> : <p className="muted" style={{ marginTop: 20 }}>No screenshots yet.</p>}
      </section>}
      </main>
    </div>
  </div></div>;
}
