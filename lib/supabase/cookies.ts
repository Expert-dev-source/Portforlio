export function getSupabaseCookieOptions() {
  let localHttp = false;
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredOrigin) {
    try {
      const url = new URL(configuredOrigin);
      localHttp = url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]", "::1"].includes(url.hostname);
    } catch {
      localHttp = false;
    }
  }
  return localHttp
    ? { sameSite: "lax" as const, secure: false }
    : { sameSite: "none" as const, secure: true };
}
