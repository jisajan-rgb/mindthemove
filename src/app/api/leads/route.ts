import { MoveType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { findBestBusinessMatch } from "@/lib/matching";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp, isSpamTrapFilled } from "@/lib/security";

const leadSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().max(30).optional(),
  postcode: z.string().trim().min(3).max(12),
  moveType: z.enum([MoveType.BUYING, MoveType.SELLING, MoveType.BOTH]),
  serviceNeeded: z.string().trim().min(2).max(80),
  propertyValue: z.string().trim().max(50).optional(),
  timeline: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(1200).optional(),
  website: z.string().optional(), // honeypot
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`leads:${ip}`, 10, 60_000);

    if (!rate.allowed) {
      return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid lead payload" },
        { status: 400 },
      );
    }

    if (isSpamTrapFilled(parsed.data.website)) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    const safeData = { ...parsed.data };
    delete safeData.website;
    const lead = await prisma.lead.create({ data: safeData });

    const match = await findBestBusinessMatch(lead);
    if (match) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { matchedBusinessId: match.business.id },
      });
    }

    return NextResponse.json(
      {
        ok: true,
        leadId: lead.id,
        matchedBusinessId: match?.business.id ?? null,
        matchScore: match?.score ?? null,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to create lead" },
      { status: 500 },
    );
  }
}
