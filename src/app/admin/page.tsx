import { prisma } from "@/lib/prisma";
import { BusinessReviewActions } from "./_components/business-review-actions";

export default async function AdminPage() {
  const [pendingBusinesses, recentLeads, approvedBusinesses, matchedLeads, totalLeads] =
    await Promise.all([
      prisma.business.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.business.count({ where: { status: "APPROVED" } }),
      prisma.lead.count({ where: { matchedBusinessId: { not: null } } }),
      prisma.lead.count(),
    ]);

  const matchRate = totalLeads > 0 ? ((matchedLeads / totalLeads) * 100).toFixed(1) : "0.0";

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <h1 className="text-3xl font-bold">Admin dashboard</h1>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400">Pending businesses</p>
            <p className="mt-2 text-3xl font-semibold">{pendingBusinesses.length}</p>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400">Approved businesses</p>
            <p className="mt-2 text-3xl font-semibold">{approvedBusinesses}</p>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400">Total leads</p>
            <p className="mt-2 text-3xl font-semibold">{totalLeads}</p>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400">Lead match rate</p>
            <p className="mt-2 text-3xl font-semibold">{matchRate}%</p>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-xl font-semibold">
            Pending business applications ({pendingBusinesses.length})
          </h2>
          <div className="mt-4 space-y-3">
            {pendingBusinesses.length === 0 ? (
              <p className="text-slate-400">No pending applications.</p>
            ) : (
              pendingBusinesses.map((biz) => (
                <article key={biz.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="font-medium">{biz.name}</p>
                  <p className="text-sm text-slate-400">
                    {biz.service} · {biz.coverageArea}
                  </p>
                  <p className="text-sm text-slate-400">{biz.email}</p>
                  <BusinessReviewActions businessId={biz.id} />
                </article>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-xl font-semibold">Recent leads ({recentLeads.length})</h2>
          <div className="mt-4 space-y-3">
            {recentLeads.length === 0 ? (
              <p className="text-slate-400">No leads yet.</p>
            ) : (
              recentLeads.map((lead) => (
                <article key={lead.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="font-medium">
                    {lead.fullName} · {lead.postcode}
                  </p>
                  <p className="text-sm text-slate-400">
                    {lead.serviceNeeded} · {lead.moveType}
                  </p>
                  <p className="text-sm text-slate-400">{lead.email}</p>
                  <p className="text-sm text-cyan-300">
                    {lead.matchedBusinessId ? "Matched to partner" : "Unmatched"}
                  </p>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
