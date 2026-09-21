import type { Metadata } from "next";
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
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
          <EnvMissing names={["DATABASE_URL"]} />
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
            Only firms that have passed Mind the Move diligence are listed. A
            live SRA or CLC number is required, and register presence alone is
            not enough to publish.
          </p>
        </header>

        {listings.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No listed firms in Bristol yet</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              When a firm passes diligence and ops activate a Bristol listing, it
              will appear here. We will not fill this page with sample profiles.
            </CardContent>
          </Card>
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
      </main>
      <SiteFooter />
    </div>
  );
}
