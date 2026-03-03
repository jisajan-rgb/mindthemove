import { BusinessStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { baselineBusinessQualityScore } from "@/lib/scoring";

const schema = z.object({
  status: z.enum([BusinessStatus.APPROVED, BusinessStatus.REJECTED]),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
    }

    const existing = await prisma.business.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Business not found" }, { status: 404 });
    }

    const qualityScore =
      parsed.data.status === BusinessStatus.APPROVED
        ? baselineBusinessQualityScore(existing)
        : existing.qualityScore;

    const updated = await prisma.business.update({
      where: { id },
      data: { status: parsed.data.status, qualityScore },
      select: { id: true, status: true, qualityScore: true },
    });

    return NextResponse.json({ ok: true, business: updated });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to update business" }, { status: 500 });
  }
}
