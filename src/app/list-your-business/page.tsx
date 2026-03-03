"use client";

import { FormEvent, useState } from "react";

export default function ListYourBusinessPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      website: String(formData.get("website") || ""),
      service: String(formData.get("service") || ""),
      coverageArea: String(formData.get("coverageArea") || ""),
      description: String(formData.get("description") || ""),
      companyName: String(formData.get("companyName") || ""),
    };

    const response = await fetch("/api/business-applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.ok) {
      setMessage("Application submitted. We’ll review and get back to you soon.");
      event.currentTarget.reset();
    } else {
      setMessage(data.error || "Could not submit application. Please try again.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-14 text-slate-100">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h1 className="text-3xl font-bold">List your business</h1>
        <p className="mt-2 text-slate-300">
          Join MindTheMove and receive local property transaction leads.
        </p>

        <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
          <input name="name" required className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Business name" />
          <input name="service" required className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Primary service (e.g. Conveyancing Solicitor)" />
          <input name="coverageArea" required className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Coverage area (postcodes or city)" />
          <input name="email" required className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Email" type="email" />
          <input name="phone" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Phone (optional)" />
          <input name="website" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Website (optional)" />
          <textarea name="description" className="min-h-28 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Tell us about your experience" />
          <input
            name="companyName"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />
          <button disabled={loading} type="submit" className="rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950 disabled:opacity-50">
            {loading ? "Submitting..." : "Submit application"}
          </button>
        </form>

        {message ? <p className="mt-4 text-sm text-cyan-300">{message}</p> : null}
      </div>
    </main>
  );
}
