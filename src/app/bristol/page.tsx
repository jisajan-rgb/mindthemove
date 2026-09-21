import type { Metadata } from "next";
import { EmptyReviewLedger } from "@/components/empty-review-ledger";
import { EnvMissing } from "@/components/env-missing";
import { FirmTeaser, SoftLedgerExplainer, SoftLedgerFormCard, SoftLedgerHero } from "@/components/soft-ledger";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPrisma } from "@/lib/prisma";
import { publicDirectoryWhere } from "@/lib/validations";

export const metadata: Metadata = {
  title: "Bristol conveyancing directory",
};

export const dynamic = "force-dynamic";

export default async function BristolDirectoryPage() {
  const prisma = getPrisma();

  if (!prisma) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 space-y-12 px-6 py-12">
          <EnvMissing names={["DATABASE_URL"]} />
          <SoftLedgerHero />
          <SoftLedgerExplainer />
          <EmptyDirectoryCopy />
          <EmptyReviewLedger reviewCount={0} />
          <SoftLedgerFormCard />
          <FirmTeaser />
        </main>
        <SiteFooter />
      </div>
    );
  }

  const listings = await prisma.listing.findMany({
    where: publicDirectoryWhere(),
    include: {
      firm: {
        include: {
          _count: { select: { reviews: true } },
        },
      },
    },
    orderBy: { firm: { name: "asc" } },
  });

  const reviewCount = listings.reduce(
    (sum, listing) => sum + listing.firm._count.reviews,
    0,
  );

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-12 px-6 py-12">
        <SoftLedgerHero />
        <SoftLedgerExplainer />

        {listings.length === 0 ? (
          <>
            <EmptyDirectoryCopy />
            <EmptyReviewLedger reviewCount={reviewCount} />
          </>
        ) : (
          <ul className="space-y-4">
            {listings.map((listing) => (
              <li key={listing.id}>
                <Card>
                  <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <CardTitle className="font-serif text-2xl">
                        {listing.firm.name}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          {listing.firm.regulator} {listing.firm.regulatorNumber}
                        </Badge>
                        <Badge variant="outline">Bristol</Badge>
                        {listing.firm.clientMoneyOk ? (
                          <Badge variant="outline">Client money checked</Badge>
                        ) : null}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {listing.postcodeOutwardCodes.length > 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Corridor: {listing.postcodeOutwardCodes.join(", ")}
                      </p>
                    ) : null}
                    <EmptyReviewLedger reviewCount={listing.firm._count.reviews} />
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}

        <SoftLedgerFormCard />
        <FirmTeaser />
      </main>
      <SiteFooter />
    </div>
  );
}

function EmptyDirectoryCopy() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No firms are live on this directory yet</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        We are not filling this page with sample profiles or placeholder reviews.
      </CardContent>
    </Card>
  );
}
