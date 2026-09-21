import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-16">
        <section className="max-w-3xl space-y-5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Bristol · Phase 1
          </p>
          <h1 className="font-serif text-4xl leading-tight tracking-tight md:text-5xl">
            Conveyancing you can check, not a marketplace of placeholder stars.
          </h1>
          <p className="text-lg text-muted-foreground">
            Mind the Move lists authorised conveyancing firms after a diligence
            check. A regulator number on its own is not enough to appear here.
            Reviews unlock after completion — this ledger starts empty, and we
            do not invent ratings.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/bristol">Open the Bristol directory</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">Ops sign in</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border bg-card p-5">
            <h2 className="font-medium">Authorised firms only</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Live SRA or CLC number, plus ops-recorded diligence, before a firm
              can be listed.
            </p>
          </article>
          <article className="rounded-xl border bg-card p-5">
            <h2 className="font-medium">Honest cold start</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The review ledger is empty until a completed matter. We never show
              fake stars to look established.
            </p>
          </article>
          <article className="rounded-xl border bg-card p-5">
            <h2 className="font-medium">Bristol first</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Phase 1 is locked to the Bristol corridor. Expanding cities is a
              later product decision, not a switch we hide in code.
            </p>
          </article>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
