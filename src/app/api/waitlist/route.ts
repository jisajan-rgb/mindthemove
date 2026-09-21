import { NextResponse } from "next/server";
import { logError } from "@/lib/logging";
import { getPrisma } from "@/lib/prisma";
import { waitlistWriteSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({ code: "unavailable" }, { status: 503 });
  }

  try {
    const json: unknown = await request.json();
    const parsed = waitlistWriteSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ code: "invalid" }, { status: 400 });
    }

    const signal = await prisma.waitlistSignal.create({
      data: {
        firstName: parsed.data.firstName,
        email: parsed.data.email,
        area: parsed.data.area,
        moveIntent: parsed.data.moveIntent,
        timeline: parsed.data.timeline || null,
        notes: parsed.data.notes || null,
        consent: parsed.data.consent,
        via: "waitlist",
        status: "shortlist_pending",
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: signal.id }, { status: 201 });
  } catch (error) {
    logError("waitlist_create_failed", error);
    return NextResponse.json({ code: "failed" }, { status: 500 });
  }
}
