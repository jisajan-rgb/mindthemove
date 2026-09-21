import { FirmTeaser, SoftLedgerExplainer, SoftLedgerFormCard, SoftLedgerHero } from "@/components/soft-ledger";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-16">
        <SoftLedgerHero />
        <SoftLedgerExplainer />
        <SoftLedgerFormCard />
        <FirmTeaser />
      </main>
      <SiteFooter />
    </div>
  );
}
