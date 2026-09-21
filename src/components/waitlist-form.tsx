"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WAITLIST_COPY } from "@/lib/waitlist-copy";

const SAVE_FAILED = "Request could not be saved. Try again later.";

export function WaitlistForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const firstName = String(form.get("firstName") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const area = String(form.get("area") ?? "").trim();
    const moveIntent = String(form.get("moveIntent") ?? "");
    const timeline = String(form.get("timeline") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim();
    const consent = form.get("consent") === "on";

    if (!firstName || !email || !area || !consent) {
      setError(WAITLIST_COPY.error);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          email,
          area,
          moveIntent,
          timeline: timeline || undefined,
          notes: notes || undefined,
          consent,
        }),
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        const code =
          typeof data === "object" && data && "code" in data
            ? String((data as { code: unknown }).code)
            : "";
        setError(code === "invalid" ? WAITLIST_COPY.error : SAVE_FAILED);
        return;
      }
      setSuccess(true);
      event.currentTarget.reset();
    } catch {
      setError(SAVE_FAILED);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return <p className="text-sm">{WAITLIST_COPY.success}</p>;
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <div className="space-y-2">
        <Label htmlFor="firstName">First name</Label>
        <Input id="firstName" name="firstName" autoComplete="given-name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="area">Rough area (BS postcode or town)</Label>
        <Input id="area" name="area" placeholder="e.g. BS8, Knowle, Bath" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="moveIntent">Buying / selling / both / not sure</Label>
        <Select id="moveIntent" name="moveIntent" defaultValue="NOT_SURE" required>
          <option value="BUYING">Buying</option>
          <option value="SELLING">Selling</option>
          <option value="BOTH">Both</option>
          <option value="NOT_SURE">Not sure</option>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="timeline">Timeline</Label>
        <Input
          id="timeline"
          name="timeline"
          placeholder="e.g. under offer, viewing, 3–6 months"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Anything we should know</Label>
        <Textarea id="notes" name="notes" placeholder="No full address" />
      </div>
      <label className="flex items-start gap-3 text-sm">
        <input id="consent" name="consent" type="checkbox" className="mt-1 size-4 shrink-0" required />
        <span>{WAITLIST_COPY.consent}</span>
      </label>
      <p className="text-sm text-muted-foreground">{WAITLIST_COPY.honesty}</p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Sending…" : WAITLIST_COPY.submit}
      </Button>
    </form>
  );
}
