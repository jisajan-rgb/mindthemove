import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { requireAdminApi } from "@/lib/auth";
import { logError } from "@/lib/logging";
import { getPrisma } from "@/lib/prisma";
import { assertFirmCanBeListed, firmPatchSchema, parseDiligenceAt } from "@/lib/validations";

export const dynamic = "force-dynamic";

type RouteContext = { params: { id: string } };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  }

  const firm = await prisma.firm.findUnique({ where: { id: context.params.id } });
  if (!firm) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ firm });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  }

  try {
    const existing = await prisma.firm.findUnique({ where: { id: context.params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const json: unknown = await request.json();
    const parsed = firmPatchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid firm payload" }, { status: 400 });
    }

    const diligencePassedAt =
      parsed.data.diligencePassedAt !== undefined
        ? parseDiligenceAt(parsed.data.diligencePassedAt)
        : existing.diligencePassedAt;

    const listed = parsed.data.listed ?? existing.listed;
    const listedGate = assertFirmCanBeListed({
      listed,
      diligencePassedAt: diligencePassedAt ?? null,
    });
    if (listedGate) {
      return NextResponse.json({ error: listedGate }, { status: 400 });
    }

    const firm = await prisma.firm.update({
      where: { id: context.params.id },
      data: {
        name: parsed.data.name,
        regulator: parsed.data.regulator,
        regulatorNumber: parsed.data.regulatorNumber,
        listed: parsed.data.listed,
        clientMoneyOk: parsed.data.clientMoneyOk,
        diligenceNotes: parsed.data.diligenceNotes,
        diligencePassedAt,
      },
    });

    if (firm.listed === false) {
      await prisma.listing.updateMany({
        where: { firmId: firm.id, active: true },
        data: { active: false },
      });
    }

    await writeAuditLog(prisma, {
      actorUserId: auth.admin.authUserId,
      action: "firm.update",
      entityType: "firm",
      entityId: firm.id,
      metadata: { listed: firm.listed, hasDiligence: Boolean(firm.diligencePassedAt) },
    });

    return NextResponse.json({ firm });
  } catch (error) {
    logError("firm_update_failed", error);
    return NextResponse.json({ error: "Failed to update firm" }, { status: 500 });
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
    const existing = await prisma.firm.findUnique({ where: { id: context.params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.firm.delete({ where: { id: context.params.id } });
    await writeAuditLog(prisma, {
      actorUserId: auth.admin.authUserId,
      action: "firm.delete",
      entityType: "firm",
      entityId: context.params.id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logError("firm_delete_failed", error);
    return NextResponse.json({ error: "Failed to delete firm" }, { status: 500 });
  }
}
