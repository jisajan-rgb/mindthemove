import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [pendingBusinesses, approvedBusinesses, totalLeads, matchedLeads] =
      await Promise.all([
        prisma.business.count({ where: { status: "PENDING" } }),
        prisma.business.count({ where: { status: "APPROVED" } }),
        prisma.lead.count(),
        prisma.lead.count({ where: { matchedBusinessId: { not: null } } }),
      ]);

    return NextResponse.json({
      ok: true,
      metrics: {
        pendingBusinesses,
        approvedBusinesses,
        totalLeads,
        matchedLeads,
        matchRate: totalLeads > 0 ? Number(((matchedLeads / totalLeads) * 100).toFixed(1)) : 0,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to load metrics" }, { status: 500 });
  }
}
