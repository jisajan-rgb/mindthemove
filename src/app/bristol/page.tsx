import type { Metadata } from "next";
import { BuyerShortlist } from "@/components/buyer-shortlist";
import { EmptyReviewLedger } from "@/components/empty-review-ledger";
import { EnvMissing } from "@/components/env-missing";
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
        <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-6 py-12">
          <EnvMissing names={["DATABASE_URL"]} />
          <EmptyDirectoryCopy />
          <EmptyReviewLedger reviewCount={0} />
          <BuyerShortlist />
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
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-6 py-12">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Public directory
          </p>
          <h1 className="font-serif text-4xl tracking-tight">Bristol conveyancing firms</h1>
          <p className="max-w-2xl text-muted-foreground">
            Only firms that have passed Mind the Move diligence are listed here.
            A live SRA or CLC number is required, and register presence alone is
            not enough to publish.
          </p>
        </header>

        {listings.length === 0 ? (
          <EmptyDirectoryCopy />
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

        {listings.length === 0 ? <EmptyReviewLedger reviewCount={reviewCount} /> : null}
        <BuyerShortlist />
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
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>
          We are not filling this page with sample profiles. When a firm has
          passed diligence and ops activate a Bristol listing, it will appear
          here with its real regulator number.
        </p>
        <p>
          Until then, use the conversation shortlist below. Nothing you tick is
          sent to us.
        </p>
      </CardContent>
    </Card>
  );
}
