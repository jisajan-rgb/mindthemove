import { notFound } from "next/navigation";
import { FirmForm } from "@/components/admin/firm-form";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function toDatetimeLocal(value: Date | null): string {
  if (!value) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export default async function EditFirmPage({ params }: { params: { id: string } }) {
  const prisma = getPrisma();
  if (!prisma) return null;

  const firm = await prisma.firm.findUnique({ where: { id: params.id } });
  if (!firm) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl">Edit firm</h1>
      <FirmForm
        firmId={firm.id}
        initial={{
          name: firm.name,
          regulator: firm.regulator,
          regulatorNumber: firm.regulatorNumber,
          listed: firm.listed,
          clientMoneyOk: firm.clientMoneyOk,
          diligenceNotes: firm.diligenceNotes ?? "",
          diligencePassedAt: toDatetimeLocal(firm.diligencePassedAt),
        }}
      />
    </div>
  );
}
