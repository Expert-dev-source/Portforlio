import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseCookieOptions } from "@/lib/supabase/cookies";

function applySecurityHeaders(response: NextResponse, nonce: string, allowWidget: boolean) {
  const development = process.env.NODE_ENV === "development";
  const widgetOrigin = allowWidget ? " https://mywidgetflow.vercel.app" : "";
  const widgetStyleOrigin = allowWidget ? " https://fonts.googleapis.com" : "";
  const widgetFontOrigin = allowWidget ? " https://fonts.gstatic.com" : "";
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'unsafe-inline'${widgetStyleOrigin}`,
    `img-src 'self' https://*.supabase.co${widgetOrigin} data: blob:`,
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co${widgetOrigin}${development ? " ws://localhost:*" : ""}`,
    `font-src 'self' data:${widgetFontOrigin}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
  response.headers.set("Content-Security-Policy", policy);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-DNS-Prefetch-Control", "on");
  if (process.env.NODE_ENV === "production") response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
}

export async function middleware(request: NextRequest) {
  const nonceBytes = crypto.getRandomValues(new Uint8Array(18));
  const nonce = btoa(String.fromCharCode(...nonceBytes));
  const publicWidgetPath = request.nextUrl.pathname === "/" || request.nextUrl.pathname.startsWith("/work/");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  let response = NextResponse.next({ request: { headers: requestHeaders } });
  applySecurityHeaders(response, nonce, publicWidgetPath);

  const protectedPath = request.nextUrl.pathname === "/admin" || request.nextUrl.pathname.startsWith("/admin/") || request.nextUrl.pathname.startsWith("/api/admin/") || request.nextUrl.pathname === "/api/auth/logout";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (protectedPath && url && key) {
    const supabase = createServerClient(url, key, {
      cookieOptions: getSupabaseCookieOptions(),
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          const refreshedCookieHeader = request.cookies.getAll().map(({ name, value }) => `${name}=${value}`).join("; ");
          if (refreshedCookieHeader) requestHeaders.set("cookie", refreshedCookieHeader);
          else requestHeaders.delete("cookie");
          response = NextResponse.next({ request: { headers: requestHeaders } });
          for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
          if (headers) Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
          applySecurityHeaders(response, nonce, publicWidgetPath);
        },
      },
    });
    await supabase.auth.getClaims();
  }
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"] };
