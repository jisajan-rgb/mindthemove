import Link from "next/link";
import { DeleteEntityButton } from "@/components/admin/delete-entity-button";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminListingsPage() {
  const prisma = getPrisma();
  if (!prisma) return null;

  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    include: { firm: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl">Listings</h1>
          <p className="text-sm text-muted-foreground">Bristol corridor only in Phase 1.</p>
        </div>
        <Button asChild>
          <Link href="/admin/listings/new">Add listing</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Firm</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Outward codes</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {listings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground">
                No listings yet.
              </TableCell>
            </TableRow>
          ) : (
            listings.map((listing) => (
              <TableRow key={listing.id}>
                <TableCell className="font-medium">{listing.firm.name}</TableCell>
                <TableCell>{listing.city === "BRISTOL" ? "Bristol" : listing.city}</TableCell>
                <TableCell>{listing.active ? "Yes" : "No"}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {listing.postcodeOutwardCodes.join(", ") || "—"}
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/listings/${listing.id}`}>Edit</Link>
                  </Button>
                  <DeleteEntityButton path={`/api/admin/listings/${listing.id}`} label="listing" />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
