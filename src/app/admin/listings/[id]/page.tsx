import { notFound } from "next/navigation";
import { ListingForm } from "@/components/admin/listing-form";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const prisma = getPrisma();
  if (!prisma) return null;

  const [listing, firms] = await Promise.all([
    prisma.listing.findUnique({ where: { id: params.id } }),
    prisma.firm.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, regulator: true, regulatorNumber: true },
    }),
  ]);

  if (!listing) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl">Edit listing</h1>
      <ListingForm
        listingId={listing.id}
        firms={firms}
        initial={{
          firmId: listing.firmId,
          postcodeOutwardCodes: listing.postcodeOutwardCodes.join(", "),
          active: listing.active,
        }}
      />
    </div>
  );
}
