import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="font-serif text-lg tracking-tight">
          Mind the Move
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/bristol" className="text-muted-foreground hover:text-foreground">
            Bristol directory
          </Link>
          <Link href="/login" className="text-muted-foreground hover:text-foreground">
            Ops
          </Link>
        </nav>
      </div>
    </header>
  );
}
