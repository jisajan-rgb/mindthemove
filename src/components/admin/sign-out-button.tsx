"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";

export function SignOutButton() {
  const router = useRouter();

  async function onSignOut() {
    if (!isSupabaseConfigured()) {
      router.push("/login");
      return;
    }
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={() => void onSignOut()}>
      Sign out
    </Button>
  );
}
