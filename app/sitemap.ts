import type { MetadataRoute } from "next";
import { listProjects } from "@/lib/db";
import { getPublicSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getPublicSiteUrl();
  if (!siteUrl) return [];
  let projects: Awaited<ReturnType<typeof listProjects>> = [];
  try {
    projects = await listProjects();
  } catch {
    projects = [];
  }
  return [
    { url: new URL("/", siteUrl).toString(), changeFrequency: "monthly", priority: 1 },
    ...projects.map((project) => ({ url: new URL(`/work/${encodeURIComponent(project.slug)}`, siteUrl).toString(), changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
