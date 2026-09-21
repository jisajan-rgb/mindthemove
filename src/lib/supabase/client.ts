import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "@/lib/env";

export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase env is not configured");
  }
  return createBrowserClient(url, key);
}

export { isSupabaseConfigured };
