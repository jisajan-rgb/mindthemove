import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { requireAdminApi } from "@/lib/auth";
import { logError } from "@/lib/logging";
import { getPrisma } from "@/lib/prisma";
import { assertListingCanBeActive, listingWriteSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  }

  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    include: { firm: true },
  });
  return NextResponse.json({ listings });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  }

  try {
    const json: unknown = await request.json();
    const parsed = listingWriteSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid listing payload" }, { status: 400 });
    }

    const firm = await prisma.firm.findUnique({ where: { id: parsed.data.firmId } });
    const activeGate = assertListingCanBeActive(firm, parsed.data.active);
    if (activeGate) {
      return NextResponse.json({ error: activeGate }, { status: 400 });
    }

    const listing = await prisma.listing.create({
      data: {
        firmId: parsed.data.firmId,
        city: parsed.data.city,
        postcodeOutwardCodes: parsed.data.postcodeOutwardCodes,
        active: parsed.data.active,
      },
    });

    await writeAuditLog(prisma, {
      actorUserId: auth.admin.authUserId,
      action: "listing.create",
      entityType: "listing",
      entityId: listing.id,
      metadata: { active: listing.active, city: listing.city },
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    logError("listing_create_failed", error);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
