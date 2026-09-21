import { getPrisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

function initials(firstName: string): string {
  const part = firstName.trim();
  if (!part) return "—";
  return part.slice(0, 1).toUpperCase();
}

export default async function AdminWaitlistPage() {
  const prisma = getPrisma();
  if (!prisma) return null;

  const signals = await prisma.waitlistSignal.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Waitlist signals</h1>
        <p className="text-sm text-muted-foreground">
          Soft-test interest only — not leads, intros, or matches. No confirmation
          email is sent until Counsel clears it.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Initials</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Intent</TableHead>
            <TableHead>Contact?</TableHead>
            <TableHead>Via</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {signals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-muted-foreground">
                No waitlist signals yet. Public form writes to waitlist_signals.
              </TableCell>
            </TableRow>
          ) : (
            signals.map((signal) => (
              <TableRow key={signal.id}>
                <TableCell>{signal.createdAt.toISOString().slice(0, 10)}</TableCell>
                <TableCell>{initials(signal.firstName)}</TableCell>
                <TableCell>{signal.area}</TableCell>
                <TableCell>{signal.email}</TableCell>
                <TableCell>{signal.moveIntent}</TableCell>
                <TableCell>{signal.consent ? "Yes" : "No"}</TableCell>
                <TableCell>{signal.via}</TableCell>
                <TableCell>{signal.status}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
