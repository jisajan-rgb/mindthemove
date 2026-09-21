import Link from "next/link";
import { WaitlistForm } from "@/components/waitlist-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WAITLIST_COPY } from "@/lib/waitlist-copy";

function HonestyStrip() {
  return <p className="text-sm text-muted-foreground">{WAITLIST_COPY.honesty}</p>;
}

export function SoftLedgerHero() {
  return (
    <section className="max-w-3xl space-y-5">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Bristol · soft launch
      </p>
      <h1 className="font-serif text-4xl leading-tight tracking-tight md:text-5xl">
        {WAITLIST_COPY.headline}
      </h1>
      <p className="text-lg text-muted-foreground">{WAITLIST_COPY.subhead}</p>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <a href="#request-shortlist">{WAITLIST_COPY.primaryCta}</a>
        </Button>
        <Button asChild variant="outline">
          <a href="#firm-teaser">{WAITLIST_COPY.secondaryCta}</a>
        </Button>
      </div>
      <HonestyStrip />
    </section>
  );
}

export function SoftLedgerExplainer() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {WAITLIST_COPY.bullets.map((bullet) => (
        <article key={bullet.title} className="rounded-xl border bg-card p-5">
          <h2 className="font-medium">{bullet.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{bullet.rest}</p>
        </article>
      ))}
    </section>
  );
}

export function SoftLedgerFormCard() {
  return (
    <Card id="request-shortlist">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">{WAITLIST_COPY.formTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <WaitlistForm />
      </CardContent>
    </Card>
  );
}

export function FirmTeaser() {
  const email = process.env.NEXT_PUBLIC_FIRM_INTEREST_EMAIL?.trim();
  const href = email
    ? `mailto:${email}?subject=${encodeURIComponent("Firm listing interest")}`
    : "mailto:?subject=Firm%20listing%20interest";

  return (
    <section id="firm-teaser" className="rounded-xl border bg-card p-6">
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
        For regulated firms
      </p>
      <p className="mt-3 text-sm text-muted-foreground">{WAITLIST_COPY.firmTeaser}</p>
      <Link href={href} className="mt-4 inline-block text-sm font-medium underline-offset-4 hover:underline">
        {WAITLIST_COPY.firmCta}
      </Link>
    </section>
  );
}
