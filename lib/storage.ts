import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export const IMAGE_BUCKET = "portfolio-images";
const MAX_BYTES = 8 * 1024 * 1024;
const extensions = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"], ["image/avif", "avif"]]);

export class ImageUploadError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function matchesSignature(bytes: Uint8Array, type: string): boolean {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10";
  if (type === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (type === "image/avif") return String.fromCharCode(...bytes.slice(4, 12)) === "ftypavif";
  return false;
}

export async function storeProjectImage(client: SupabaseClient, projectId: string, file: File): Promise<string> {
  if (file.size <= 0 || file.size > MAX_BYTES) throw new ImageUploadError("Images must be under 8 MB.", 413);
  const extension = extensions.get(file.type);
  if (!extension) throw new ImageUploadError("Use a JPEG, PNG, WebP, or AVIF image.", 415);
  const buffer = await file.arrayBuffer();
  if (!matchesSignature(new Uint8Array(buffer), file.type)) throw new ImageUploadError("The file contents do not match an accepted image type.", 415);

  const path = `projects/${projectId}/${randomUUID()}.${extension}`;
  const { error } = await client.storage.from(IMAGE_BUCKET).upload(path, buffer, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new ImageUploadError("Supabase Storage could not accept the image.", 502);
  return path;
}
