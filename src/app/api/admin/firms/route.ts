import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit";
import { requireAdminApi } from "@/lib/auth";
import { logError } from "@/lib/logging";
import { getPrisma } from "@/lib/prisma";
import {
  assertFirmCanBeListed,
  firmWriteSchema,
  parseDiligenceAt,
} from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  }

  const firms = await prisma.firm.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ firms });
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
    const parsed = firmWriteSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid firm payload" }, { status: 400 });
    }

    const diligencePassedAt = parseDiligenceAt(parsed.data.diligencePassedAt) ?? null;
    const listedGate = assertFirmCanBeListed({
      listed: parsed.data.listed,
      diligencePassedAt,
    });
    if (listedGate) {
      return NextResponse.json({ error: listedGate }, { status: 400 });
    }

    const firm = await prisma.firm.create({
      data: {
        name: parsed.data.name,
        regulator: parsed.data.regulator,
        regulatorNumber: parsed.data.regulatorNumber,
        listed: parsed.data.listed,
        clientMoneyOk: parsed.data.clientMoneyOk,
        diligenceNotes: parsed.data.diligenceNotes ?? null,
        diligencePassedAt,
      },
    });

    await writeAuditLog(prisma, {
      actorUserId: auth.admin.authUserId,
      action: "firm.create",
      entityType: "firm",
      entityId: firm.id,
      metadata: { listed: firm.listed, hasDiligence: Boolean(firm.diligencePassedAt) },
    });

    return NextResponse.json({ firm }, { status: 201 });
  } catch (error) {
    logError("firm_create_failed", error);
    return NextResponse.json({ error: "Failed to create firm" }, { status: 500 });
  }
}
