import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Not found",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16">
        <h1 className="font-serif text-3xl">Page not found</h1>
        <p className="mt-2 text-muted-foreground">That route is not part of Phase 1.</p>
        <Button asChild className="mt-6 w-fit">
          <Link href="/bristol">Back to the Bristol directory</Link>
        </Button>
      </main>
      <SiteFooter />
    </div>
  );
}
