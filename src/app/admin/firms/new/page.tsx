import { FirmForm } from "@/components/admin/firm-form";

export default function NewFirmPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl">Add firm</h1>
      <FirmForm
        initial={{
          name: "",
          regulator: "SRA",
          regulatorNumber: "",
          listed: false,
          clientMoneyOk: false,
          diligenceNotes: "",
          diligencePassedAt: "",
        }}
      />
    </div>
  );
}
