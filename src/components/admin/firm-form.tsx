"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export type FirmFormValues = {
  name: string;
  regulator: "SRA" | "CLC";
  regulatorNumber: string;
  listed: boolean;
  clientMoneyOk: boolean;
  diligenceNotes: string;
  diligencePassedAt: string;
};

export function FirmForm({
  initial,
  firmId,
}: {
  initial: FirmFormValues;
  firmId?: string;
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
      name: values.name,
      regulator: values.regulator,
      regulatorNumber: values.regulatorNumber,
      listed: values.listed,
      clientMoneyOk: values.clientMoneyOk,
      diligenceNotes: values.diligenceNotes || null,
      diligencePassedAt: values.diligencePassedAt
        ? new Date(values.diligencePassedAt).toISOString()
        : null,
    };

    const path = firmId ? `/api/admin/firms/${firmId}` : "/api/admin/firms";
    const method = firmId ? "PATCH" : "POST";

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
      router.push("/admin/firms");
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
        <Label htmlFor="name">Firm name</Label>
        <Input
          id="name"
          value={values.name}
          onChange={(event) => setValues({ ...values, name: event.target.value })}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="regulator">Regulator</Label>
          <Select
            id="regulator"
            value={values.regulator}
            onChange={(event) =>
              setValues({
                ...values,
                regulator: event.target.value === "CLC" ? "CLC" : "SRA",
              })
            }
          >
            <option value="SRA">SRA</option>
            <option value="CLC">CLC</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="regulatorNumber">Regulator number</Label>
          <Input
            id="regulatorNumber"
            value={values.regulatorNumber}
            onChange={(event) =>
              setValues({ ...values, regulatorNumber: event.target.value })
            }
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="diligencePassedAt">Diligence passed at</Label>
        <Input
          id="diligencePassedAt"
          type="datetime-local"
          value={values.diligencePassedAt}
          onChange={(event) =>
            setValues({ ...values, diligencePassedAt: event.target.value })
          }
        />
        <p className="text-xs text-muted-foreground">
          Required before listed can be true. Register presence alone is not enough (O9).
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="diligenceNotes">Diligence notes</Label>
        <Textarea
          id="diligenceNotes"
          value={values.diligenceNotes}
          onChange={(event) =>
            setValues({ ...values, diligenceNotes: event.target.value })
          }
        />
      </div>
      <div className="flex items-center justify-between rounded-lg border px-3 py-2">
        <Label htmlFor="clientMoneyOk">Client money checked</Label>
        <Switch
          id="clientMoneyOk"
          checked={values.clientMoneyOk}
          onCheckedChange={(checked) => setValues({ ...values, clientMoneyOk: checked })}
        />
      </div>
      <div className="flex items-center justify-between rounded-lg border px-3 py-2">
        <div>
          <Label htmlFor="listed">Listed on directory</Label>
          <p className="text-xs text-muted-foreground">Blocked by the API until diligence is set.</p>
        </div>
        <Switch
          id="listed"
          checked={values.listed}
          onCheckedChange={(checked) => setValues({ ...values, listed: checked })}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : "Save firm"}
      </Button>
    </form>
  );
}
