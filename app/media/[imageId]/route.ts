import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireOwner } from "@/lib/auth";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { IMAGE_BUCKET } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const idSchema = z.string().uuid();
type ImageRecord = { path: string; projects: { published: boolean } | { published: boolean }[] };

async function imageRecord(client: SupabaseClient, imageId: string): Promise<ImageRecord | null> {
  const { data, error } = await client.from("project_images")
    .select("path, projects!inner(published)")
    .eq("id", imageId)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as ImageRecord | null;
}

async function imageResponse(client: SupabaseClient, image: ImageRecord, published: boolean): Promise<NextResponse> {
  const { data: file, error } = await client.storage.from(IMAGE_BUCKET).download(image.path);
  if (error || !file) return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  return new NextResponse(file, {
    status: 200,
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": published ? "public, max-age=60, s-maxage=300, stale-while-revalidate=300" : "private, no-store",
    },
  });
}

export async function GET(_request: NextRequest, context: { params: Promise<{ imageId: string }> }) {
  const { imageId } = await context.params;
  if (!idSchema.safeParse(imageId).success) return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  const publicClient = createSupabasePublicClient();
  if (!publicClient) return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });

  try {
    const publishedImage = await imageRecord(publicClient, imageId);
    const publishedProject = publishedImage && (Array.isArray(publishedImage.projects) ? publishedImage.projects[0] : publishedImage.projects);
    if (publishedImage && publishedProject?.published) return imageResponse(publicClient, publishedImage, true);
  } catch {
    return new NextResponse(null, { status: 503, headers: { "Cache-Control": "private, no-store" } });
  }

  const auth = await requireOwner();
  if (!auth.ok) return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  try {
    const privateImage = await imageRecord(auth.client, imageId);
    const project = privateImage && (Array.isArray(privateImage.projects) ? privateImage.projects[0] : privateImage.projects);
    if (!privateImage || !project) return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
    return imageResponse(auth.client, privateImage, project.published);
  } catch {
    return new NextResponse(null, { status: 503, headers: { "Cache-Control": "private, no-store" } });
  }
}
