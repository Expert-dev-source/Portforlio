import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deleteProject, listProjects, saveProject } from "@/lib/db";
import { isSameOriginMutation, requireOwner } from "@/lib/auth";

export const runtime = "nodejs";
const projectSchema = z.object({
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(1).max(180),
  category: z.string().trim().max(100).default("Project"),
  summary: z.string().trim().max(3000).default(""),
  context: z.string().trim().max(6000).default(""),
  contribution: z.string().trim().max(6000).default(""),
  outcome: z.string().trim().max(6000).default(""),
  technologies: z.array(z.string().trim().min(1).max(48)).max(30).default([]),
  demoUrl: z.string().trim().max(2048).default(""),
  repositoryUrl: z.string().trim().max(2048).default(""),
  published: z.boolean().default(false),
  sortOrder: z.number().int().min(-10000).max(10000).default(0),
}).strict().superRefine((value, ctx) => {
  for (const key of ["demoUrl", "repositoryUrl"] as const) {
    if (!value[key]) continue;
    try {
      if (new URL(value[key]).protocol !== "https:") throw new Error("invalid protocol");
    } catch {
      ctx.addIssue({ code: "custom", path: [key], message: "Use a complete HTTPS URL or leave this field empty." });
    }
  }
  if (value.published) {
    if (value.category.trim().length < 2) ctx.addIssue({ code: "custom", path: ["category"], message: "Add a project type before publishing." });
    if (value.summary.trim().length < 30) ctx.addIssue({ code: "custom", path: ["summary"], message: "Add a meaningful project introduction before publishing." });
    if (value.context.trim().length < 40) ctx.addIssue({ code: "custom", path: ["context"], message: "Describe the real project context or problem before publishing." });
    if (value.contribution.trim().length < 40) ctx.addIssue({ code: "custom", path: ["contribution"], message: "Describe your actual contribution before publishing." });
    if (value.outcome.trim().length < 30) ctx.addIssue({ code: "custom", path: ["outcome"], message: "Explain the actual outcome. Use numbers only when you can substantiate them." });
    if (value.technologies.length === 0) ctx.addIssue({ code: "custom", path: ["technologies"], message: "Add at least one technology before publishing." });
  }
});
const idSchema = z.string().uuid();

export async function GET() {
  const auth = await requireOwner();
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json({ projects: await listProjects(true, auth.client) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Project data is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "private, no-store" } });
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Cross-site update rejected." }, { status: 403 });
  const auth = await requireOwner();
  if (!auth.ok) return auth.response;
  const raw = await request.json().catch(() => null);
  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) {
    const publishing = Boolean(raw && typeof raw === "object" && "published" in raw && raw.published === true);
    return NextResponse.json({ error: publishing ? "Before publishing, add the real project introduction, context, your contribution, actual outcome and at least one technology. Only use claims you can support." : "Check the project fields and use a valid lowercase URL slug.", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  try {
    const id = await saveProject(auth.client, null, parsed.data);
    return NextResponse.json({ id }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not create the project. Check that its URL slug is unique." }, { status: 409 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Cross-site update rejected." }, { status: 403 });
  const auth = await requireOwner();
  if (!auth.ok) return auth.response;
  const body = await request.json().catch(() => null) as { id?: unknown; project?: unknown } | null;
  const id = idSchema.safeParse(body?.id);
  const parsed = projectSchema.safeParse(body?.project);
  if (!id.success || !parsed.success) {
    const publishing = Boolean(body?.project && typeof body.project === "object" && "published" in body.project && body.project.published === true);
    return NextResponse.json({ error: publishing ? "Before publishing, add the real project introduction, context, your contribution, actual outcome and at least one technology. Only use claims you can support." : "Project data is invalid. Check the project fields and URL slug.", details: parsed.success ? undefined : parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  try {
    await saveProject(auth.client, id.data, parsed.data);
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not save the project. Check that its URL slug is unique." }, { status: 409 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Cross-site removal rejected." }, { status: 403 });
  const auth = await requireOwner();
  if (!auth.ok) return auth.response;
  const id = idSchema.safeParse(request.nextUrl.searchParams.get("id"));
  if (!id.success) return NextResponse.json({ error: "A valid project ID is required." }, { status: 400 });
  try {
    const result = await deleteProject(auth.client, id.data);
    return NextResponse.json({ ok: true, note: result.cleanupWarning ? "Project removed; one or more private image files may need manual cleanup in Supabase Storage." : "Project and its images were removed." }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not remove the project and its stored screenshots." }, { status: 500 });
  }
}
