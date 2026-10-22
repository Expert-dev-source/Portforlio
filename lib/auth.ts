import type { User, SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type OwnerSession = { id: string; email: string; name: string };
type OwnerAccess = { ok: true; client: SupabaseClient; user: User } | { ok: false; response: NextResponse };

export function isSameOriginMutation(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (!origin || fetchSite !== "same-origin") return false;
  try {
    const parsed = new URL(origin);
    return parsed.protocol === "https:" || parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

async function verifyOwner(client: SupabaseClient): Promise<boolean> {
  const { data, error } = await client.rpc("is_portfolio_owner");
  return !error && data === true;
}

export async function requireOwner(): Promise<OwnerAccess> {
  const client = await createSupabaseServerClient();
  if (!client) {
    return { ok: false, response: NextResponse.json({ error: "Supabase is not configured. Add the project URL and publishable key to the Vercel environment." }, { status: 503 }) };
  }
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    return { ok: false, response: NextResponse.json({ error: "Sign in with the portfolio owner account to continue." }, { status: 401 }) };
  }
  if (!(await verifyOwner(client))) {
    return { ok: false, response: NextResponse.json({ error: "This account is not authorized to manage the portfolio." }, { status: 403 }) };
  }
  return { ok: true, client, user: data.user };
}

export async function getPageSession(): Promise<OwnerSession | null> {
  const client = await createSupabaseServerClient();
  if (!client) return null;
  const { data, error } = await client.auth.getUser();
  if (error || !data.user || !(await verifyOwner(client))) return null;
  return {
    id: data.user.id,
    email: data.user.email ?? "",
    name: typeof data.user.user_metadata?.full_name === "string" ? data.user.user_metadata.full_name : "Obadasa Kayode",
  };
}
