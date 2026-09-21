export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function missingPublicEnv(): string[] {
  const missing: string[] = [];
  if (!process.env.DATABASE_URL) missing.push("DATABASE_URL");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return missing;
}
