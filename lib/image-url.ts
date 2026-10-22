export function getProjectImageUrl(imageId: string, version: string): string {
  const params = new URLSearchParams({ v: version });
  return `/media/${encodeURIComponent(imageId)}?${params.toString()}`;
}
