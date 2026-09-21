import Link from "next/link";
import { DeleteEntityButton } from "@/components/admin/delete-entity-button";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminFirmsPage() {
  const prisma = getPrisma();
  if (!prisma) return null;

  const firms = await prisma.firm.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { listings: true, reviews: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl">Firms</h1>
          <p className="text-sm text-muted-foreground">
            Listed defaults to false until diligence passes.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/firms/new">Add firm</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Regulator</TableHead>
            <TableHead>Listed</TableHead>
            <TableHead>Diligence</TableHead>
            <TableHead>Listings</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {firms.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground">
                No firms yet. Seed creates Nexa Law Limited (SRA 633024).
              </TableCell>
            </TableRow>
          ) : (
            firms.map((firm) => (
              <TableRow key={firm.id}>
                <TableCell className="font-medium">{firm.name}</TableCell>
                <TableCell>
                  {firm.regulator} {firm.regulatorNumber}
                </TableCell>
                <TableCell>{firm.listed ? "Yes" : "No"}</TableCell>
                <TableCell>{firm.diligencePassedAt ? "Passed" : "Not set"}</TableCell>
                <TableCell>{firm._count.listings}</TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/firms/${firm.id}`}>Edit</Link>
                  </Button>
                  <DeleteEntityButton path={`/api/admin/firms/${firm.id}`} label="firm" />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
