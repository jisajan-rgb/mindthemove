import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (!isSupabaseConfigured() || !code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = createServerSupabaseClient();
  await supabase.auth.exchangeCodeForSession(code);
  return NextResponse.redirect(`${origin}${next}`);
}
