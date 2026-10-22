import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { getProjectImageUrl } from "@/lib/image-url";
import { IMAGE_BUCKET } from "@/lib/storage";

export type GalleryImage = { id: string; path: string; url: string; caption: string; sortOrder: number };
export type Project = {
  id: string; slug: string; title: string; category: string; summary: string;
  context: string; contribution: string; outcome: string; technologies: string[];
  demoUrl: string; repositoryUrl: string; published: boolean; sortOrder: number; images: GalleryImage[];
};
type ProjectRow = {
  id: string; slug: string; title: string; category: string; summary: string;
  context: string; contribution: string; outcome: string; technologies: string[];
  demo_url: string; repository_url: string; published: boolean; sort_order: number;
};
type ImageRow = { id: string; project_id: string; path: string; caption: string; sort_order: number };

function mapProject(row: ProjectRow, images: GalleryImage[] = []): Project {
  return {
    id: row.id, slug: row.slug, title: row.title, category: row.category,
    summary: row.summary, context: row.context, contribution: row.contribution,
    outcome: row.outcome, technologies: Array.isArray(row.technologies) ? row.technologies : [],
    demoUrl: row.demo_url, repositoryUrl: row.repository_url,
    published: row.published, sortOrder: row.sort_order, images,
  };
}

async function galleryFor(client: SupabaseClient, projectIds: string[]): Promise<Map<string, GalleryImage[]>> {
  const result = new Map<string, GalleryImage[]>();
  if (!projectIds.length) return result;
  const { data, error } = await client.from("project_images")
    .select("id, project_id, path, caption, sort_order")
    .in("project_id", projectIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  for (const row of (data ?? []) as ImageRow[]) {
    const group = result.get(row.project_id) ?? [];
    group.push({ id: row.id, path: row.path, url: getProjectImageUrl(row.id, row.path), caption: row.caption, sortOrder: row.sort_order });
    result.set(row.project_id, group);
  }
  return result;
}

export async function listProjects(includeUnpublished = false, clientOverride?: SupabaseClient): Promise<Project[]> {
  const client = clientOverride ?? (includeUnpublished ? await createSupabaseServerClient() : createSupabasePublicClient());
  if (!client) return [];
  const baseQuery = client.from("projects")
    .select("id, slug, title, category, summary, context, contribution, outcome, technologies, demo_url, repository_url, published, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  const { data, error } = includeUnpublished ? await baseQuery : await baseQuery.eq("published", true);
  if (error) throw error;
  const rows = (data ?? []) as ProjectRow[];
  const gallery = await galleryFor(client, rows.map((row) => row.id));
  return rows.map((row) => mapProject(row, gallery.get(row.id) ?? []));
}

export async function getProject(slug: string, includeUnpublished = false, clientOverride?: SupabaseClient): Promise<Project | null> {
  const client = clientOverride ?? (includeUnpublished ? await createSupabaseServerClient() : createSupabasePublicClient());
  if (!client) return null;
  const baseQuery = client.from("projects")
    .select("id, slug, title, category, summary, context, contribution, outcome, technologies, demo_url, repository_url, published, sort_order")
    .eq("slug", slug);
  const { data, error } = includeUnpublished ? await baseQuery.maybeSingle() : await baseQuery.eq("published", true).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as ProjectRow;
  const gallery = await galleryFor(client, [row.id]);
  return mapProject(row, gallery.get(row.id) ?? []);
}

export async function saveProject(client: SupabaseClient, id: string | null, values: Omit<Project, "id" | "images">): Promise<string> {
  const record = {
    slug: values.slug, title: values.title, category: values.category,
    summary: values.summary, context: values.context, contribution: values.contribution,
    outcome: values.outcome, technologies: values.technologies,
    demo_url: values.demoUrl, repository_url: values.repositoryUrl,
    published: values.published, sort_order: values.sortOrder, updated_at: new Date().toISOString(),
  };
  if (id) {
    const { error } = await client.from("projects").update(record).eq("id", id);
    if (error) throw error;
    return id;
  }
  const { data, error } = await client.from("projects").insert(record).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function deleteProject(client: SupabaseClient, id: string): Promise<{ cleanupWarning: boolean }> {
  const { data: images, error: imageError } = await client.from("project_images").select("path").eq("project_id", id);
  if (imageError) throw imageError;
  const paths = (images ?? []).map((image: { path: string }) => image.path);
  const { error: projectError } = await client.from("projects").delete().eq("id", id);
  if (projectError) throw projectError;
  if (!paths.length) return { cleanupWarning: false };
  const { error: storageError } = await client.storage.from(IMAGE_BUCKET).remove(paths);
  return { cleanupWarning: Boolean(storageError) };
}
