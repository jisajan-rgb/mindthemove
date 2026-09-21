import { type UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AdminContext = {
  authUserId: string;
  role: UserRole;
};

export async function getAdminContext(): Promise<AdminContext | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const prisma = getPrisma();
  if (!prisma) {
    return null;
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (!profile || profile.role !== "OPS_ADMIN") {
    return null;
  }

  return { authUserId: user.id, role: profile.role };
}

export async function requireAdminApi(): Promise<
  { ok: true; admin: AdminContext } | { ok: false; response: NextResponse }
> {
  const admin = await getAdminContext();
  if (!admin) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true, admin };
}
