import Link from "next/link";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { EnvMissing } from "@/components/env-missing";
import { getAdminContext } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isDatabaseConfigured()) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <EnvMissing names={["DATABASE_URL"]} />
      </div>
    );
  }

  const admin = await getAdminContext();

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Ops</p>
            <Link href="/admin" className="font-serif text-xl">
              Mind the Move
            </Link>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin/firms" className="hover:underline">
              Firms
            </Link>
            <Link href="/admin/listings" className="hover:underline">
              Listings
            </Link>
            <Link href="/bristol" className="text-muted-foreground hover:underline">
              Public directory
            </Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        {admin ? (
          children
        ) : (
          <p className="text-sm text-muted-foreground">
            Your Auth user is signed in but is not linked as <code>OPS_ADMIN</code>{" "}
            in the <code>users</code> table. See README seed instructions.
          </p>
        )}
      </main>
    </div>
  );
}
