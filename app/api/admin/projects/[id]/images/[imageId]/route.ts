import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getProjectImageUrl } from "@/lib/image-url";
import { isSameOriginMutation, requireOwner } from "@/lib/auth";
import { ImageUploadError, storeProjectImage } from "@/lib/storage";

export const runtime = "nodejs";
const idSchema = z.string().uuid();
const patchSchema = z.object({ caption: z.string().max(240), sortOrder: z.number().int().min(0).max(500) }).strict();

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string; imageId: string }> }) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Cross-site replacement rejected." }, { status: 403 });
  const auth = await requireOwner();
  if (!auth.ok) return auth.response;
  const { id, imageId } = await context.params;
  if (!idSchema.safeParse(id).success || !idSchema.safeParse(imageId).success) return NextResponse.json({ error: "Invalid project or image ID." }, { status: 400 });
  const { data: existing, error: findError } = await auth.client.from("project_images").select("id, path, caption, sort_order").eq("id", imageId).eq("project_id", id).maybeSingle();
  if (findError) return NextResponse.json({ error: "Screenshot data is unavailable." }, { status: 503 });
  if (!existing) return NextResponse.json({ error: "Screenshot not found." }, { status: 404 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a replacement image." }, { status: 400 });

  let newPath: string | null = null;
  try {
    newPath = await storeProjectImage(auth.client, id, file);
    const { error } = await auth.client.from("project_images").update({ path: newPath }).eq("id", imageId).eq("project_id", id);
    if (error) {
      await auth.client.storage.from("portfolio-images").remove([newPath]);
      return NextResponse.json({ error: "Screenshot metadata could not be updated." }, { status: 503 });
    }
    const { error: removalError } = await auth.client.storage.from("portfolio-images").remove([existing.path]);
    return NextResponse.json({
      image: { id: imageId, path: newPath, url: getProjectImageUrl(imageId, newPath), caption: existing.caption, sortOrder: existing.sort_order },
      note: removalError ? "The new image is active, but the old file may need manual cleanup in Supabase Storage." : "",
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof ImageUploadError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Image replacement did not complete." }, { status: 502 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string; imageId: string }> }) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Cross-site update rejected." }, { status: 403 });
  const auth = await requireOwner();
  if (!auth.ok) return auth.response;
  const { id, imageId } = await context.params;
  if (!idSchema.safeParse(id).success || !idSchema.safeParse(imageId).success) return NextResponse.json({ error: "Invalid project or image ID." }, { status: 400 });
  const body = patchSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Caption or order is invalid." }, { status: 400 });
  const { error } = await auth.client.from("project_images").update({ caption: body.data.caption.trim(), sort_order: body.data.sortOrder }).eq("id", imageId).eq("project_id", id);
  if (error) return NextResponse.json({ error: "Screenshot details could not be saved." }, { status: 503 });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string; imageId: string }> }) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Cross-site removal rejected." }, { status: 403 });
  const auth = await requireOwner();
  if (!auth.ok) return auth.response;
  const { id, imageId } = await context.params;
  if (!idSchema.safeParse(id).success || !idSchema.safeParse(imageId).success) return NextResponse.json({ error: "Invalid project or image ID." }, { status: 400 });
  const { data: image, error: findError } = await auth.client.from("project_images").select("path").eq("id", imageId).eq("project_id", id).maybeSingle();
  if (findError) return NextResponse.json({ error: "Screenshot data is unavailable." }, { status: 503 });
  if (!image) return NextResponse.json({ error: "Screenshot not found." }, { status: 404 });
  const { error } = await auth.client.from("project_images").delete().eq("id", imageId).eq("project_id", id);
  if (error) return NextResponse.json({ error: "Screenshot could not be removed." }, { status: 503 });
  const { error: storageError } = await auth.client.storage.from("portfolio-images").remove([image.path]);
  return NextResponse.json({ ok: true, note: storageError ? "Removed from the gallery; the stored file may need manual cleanup in Supabase Storage." : "Removed from the gallery and Supabase Storage." }, { headers: { "Cache-Control": "private, no-store" } });
}
