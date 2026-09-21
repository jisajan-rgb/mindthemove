import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const prisma = getPrisma();
  if (!prisma) {
    return null;
  }

  const [firmCount, listedCount, listingCount, reviewCount] = await Promise.all([
    prisma.firm.count(),
    prisma.firm.count({ where: { listed: true, diligencePassedAt: { not: null } } }),
    prisma.listing.count({ where: { active: true, city: "BRISTOL" } }),
    prisma.review.count(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Directory ops</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          CRUD for firms and Bristol listings. Reviews have no write path in
          Phase 1. Listing a firm requires diligencePassedAt (O9).
        </p>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Firms</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{firmCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Diligence-listed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{listedCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Bristol listings
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{listingCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Review ledger
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{reviewCount}</CardContent>
        </Card>
      </section>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/admin/firms">Manage firms</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/listings">Manage listings</Link>
        </Button>
      </div>
    </div>
  );
}
