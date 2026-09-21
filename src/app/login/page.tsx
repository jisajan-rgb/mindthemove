import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";
import { missingPublicEnv } from "@/lib/env";
import { EnvMissing } from "@/components/env-missing";

export const metadata: Metadata = {
  title: "Ops sign in",
};

export default function LoginPage() {
  const missing = missingPublicEnv().filter((name) => name.startsWith("NEXT_PUBLIC_"));

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Ops sign in</CardTitle>
            <CardDescription>
              Admin CRUD for firms and listings. You need a Supabase Auth user
              linked as <code>OPS_ADMIN</code> (see README).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {missing.length > 0 ? <EnvMissing names={missing} /> : <LoginForm />}
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
