import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getProjectImageUrl } from "@/lib/image-url";
import { isSameOriginMutation, requireOwner } from "@/lib/auth";
import { ImageUploadError, storeProjectImage } from "@/lib/storage";

export const runtime = "nodejs";
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Cross-site upload rejected." }, { status: 403 });
  const auth = await requireOwner();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const { data: project, error: projectError } = await auth.client.from("projects").select("id").eq("id", id).maybeSingle();
  if (projectError) return NextResponse.json({ error: "Project data is temporarily unavailable." }, { status: 503 });
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const caption = String(form?.get("caption") ?? "").trim().slice(0, 240);
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
  let path: string | null = null;
  try {
    path = await storeProjectImage(auth.client, id, file);
    const { data: last } = await auth.client.from("project_images").select("sort_order").eq("project_id", id).order("sort_order", { ascending: false }).limit(1).maybeSingle();
    const sortOrder = (last?.sort_order ?? -1) + 1;
    const imageId = randomUUID();
    const { error } = await auth.client.from("project_images").insert({ id: imageId, project_id: id, path, caption, sort_order: sortOrder });
    if (error) {
      const { error: cleanupError } = await auth.client.storage.from("portfolio-images").remove([path]);
      return NextResponse.json({ error: cleanupError ? "Image metadata could not be saved; the private upload may need cleanup in Supabase Storage." : "Image metadata could not be saved." }, { status: 503 });
    }
    return NextResponse.json({ image: { id: imageId, path, url: getProjectImageUrl(imageId, path), caption, sortOrder } }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof ImageUploadError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Image upload did not complete." }, { status: 502 });
  }
}
