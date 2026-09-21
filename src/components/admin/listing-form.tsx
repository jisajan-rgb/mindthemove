"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export type ListingFormValues = {
  firmId: string;
  postcodeOutwardCodes: string;
  active: boolean;
};

export function ListingForm({
  initial,
  listingId,
  firms,
}: {
  initial: ListingFormValues;
  listingId?: string;
  firms: { id: string; name: string; regulator: string; regulatorNumber: string }[];
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      firmId: values.firmId,
      city: "BRISTOL" as const,
      postcodeOutwardCodes: values.postcodeOutwardCodes
        .split(",")
        .map((code) => code.trim())
        .filter(Boolean),
      active: values.active,
    };

    const path = listingId ? `/api/admin/listings/${listingId}` : "/api/admin/listings";
    const method = listingId ? "PATCH" : "POST";

    try {
      const response = await fetch(path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof data === "object" && data && "error" in data
            ? String((data as { error: unknown }).error)
            : "Save failed";
        setError(message);
        return;
      }
      router.push("/admin/listings");
      router.refresh();
    } catch {
      setError("Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="max-w-xl space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="firmId">Firm</Label>
        <Select
          id="firmId"
          value={values.firmId}
          onChange={(event) => setValues({ ...values, firmId: event.target.value })}
          required
        >
          <option value="" disabled>
            Select a firm
          </option>
          {firms.map((firm) => (
            <option key={firm.id} value={firm.id}>
              {firm.name} · {firm.regulator} {firm.regulatorNumber}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input id="city" value="Bristol" disabled readOnly />
        <p className="text-xs text-muted-foreground">Phase 1 geography is locked to Bristol.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="postcodeOutwardCodes">Postcode outward codes</Label>
        <Input
          id="postcodeOutwardCodes"
          placeholder="BS1, BS8"
          value={values.postcodeOutwardCodes}
          onChange={(event) =>
            setValues({ ...values, postcodeOutwardCodes: event.target.value })
          }
        />
        <p className="text-xs text-muted-foreground">
          Comma-separated BS codes only (Bristol corridor).
        </p>
      </div>
      <div className="flex items-center justify-between rounded-lg border px-3 py-2">
        <div>
          <Label htmlFor="active">Active listing</Label>
          <p className="text-xs text-muted-foreground">
            The firm must already be listed with diligencePassedAt.
          </p>
        </div>
        <Switch
          id="active"
          checked={values.active}
          onCheckedChange={(checked) => setValues({ ...values, active: checked })}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : "Save listing"}
      </Button>
    </form>
  );
}
