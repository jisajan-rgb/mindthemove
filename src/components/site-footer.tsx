import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>Mind the Move Ltd. Not legal advice.</p>
        <p>
          Consumer directory ·{" "}
          <Link href="/bristol" className="underline-offset-4 hover:underline">
            Bristol
          </Link>
        </p>
      </div>
    </footer>
  );
}
