import { ListingForm } from "@/components/admin/listing-form";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const prisma = getPrisma();
  const firms = prisma
    ? await prisma.firm.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, regulator: true, regulatorNumber: true },
      })
    : [];

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl">Add listing</h1>
      <ListingForm
        firms={firms}
        initial={{
          firmId: firms[0]?.id ?? "",
          postcodeOutwardCodes: "",
          active: false,
        }}
      />
    </div>
  );
}
