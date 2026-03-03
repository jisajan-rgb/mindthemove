import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp, isSpamTrapFilled } from "@/lib/security";

const businessSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().max(30).optional(),
  website: z.string().trim().max(200).optional(),
  service: z.string().trim().min(2).max(100),
  coverageArea: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1200).optional(),
  companyName: z.string().optional(), // honeypot
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`business:${ip}`, 8, 60_000);

    if (!rate.allowed) {
      return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const parsed = businessSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid business payload" },
        { status: 400 },
      );
    }

    if (isSpamTrapFilled(parsed.data.companyName)) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    const safeData = { ...parsed.data };
    delete safeData.companyName;

    const business = await prisma.business.create({
      data: {
        ...safeData,
        website: safeData.website || null,
      },
    });

    return NextResponse.json({ ok: true, businessId: business.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to create business application" },
      { status: 500 },
    );
  }
}
