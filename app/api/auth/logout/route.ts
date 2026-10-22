import { NextRequest, NextResponse } from "next/server";
import { isSameOriginMutation } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Cross-site sign-out rejected." }, { status: 403 });
  const client = await createSupabaseServerClient();
  if (!client) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { error } = await client.auth.signOut();
  if (error) return NextResponse.json({ error: "Sign-out did not complete." }, { status: 502 });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
}
