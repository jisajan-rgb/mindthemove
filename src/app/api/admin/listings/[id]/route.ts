import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { requireAdminApi } from "@/lib/auth";
import { logError } from "@/lib/logging";
import { getPrisma } from "@/lib/prisma";
import { assertListingCanBeActive, listingPatchSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string } };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: context.params.id },
    include: { firm: true },
  });
  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ listing });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  }

  try {
    const existing = await prisma.listing.findUnique({ where: { id: context.params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const json: unknown = await request.json();
    const parsed = listingPatchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid listing payload" }, { status: 400 });
    }

    const firmId = parsed.data.firmId ?? existing.firmId;
    const active = parsed.data.active ?? existing.active;
    const firm = await prisma.firm.findUnique({ where: { id: firmId } });
    const activeGate = assertListingCanBeActive(firm, active);
    if (activeGate) {
      return NextResponse.json({ error: activeGate }, { status: 400 });
    }

    const listing = await prisma.listing.update({
      where: { id: context.params.id },
      data: {
        firmId: parsed.data.firmId,
        city: parsed.data.city,
        postcodeOutwardCodes: parsed.data.postcodeOutwardCodes,
        active: parsed.data.active,
      },
    });

    await writeAuditLog(prisma, {
      actorUserId: auth.admin.authUserId,
      action: "listing.update",
      entityType: "listing",
      entityId: listing.id,
      metadata: { active: listing.active, city: listing.city },
    });

    return NextResponse.json({ listing });
  } catch (error) {
    logError("listing_update_failed", error);
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  }

  try {
    const existing = await prisma.listing.findUnique({ where: { id: context.params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.listing.delete({ where: { id: context.params.id } });
    await writeAuditLog(prisma, {
      actorUserId: auth.admin.authUserId,
      action: "listing.delete",
      entityType: "listing",
      entityId: context.params.id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logError("listing_delete_failed", error);
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}
