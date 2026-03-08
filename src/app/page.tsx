"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const services = [
  "Conveyancing Solicitor",
  "Mortgage Broker",
  "Surveyor",
  "Removals",
  "Home Insurance",
];

const stats = [
  { label: "Verified local partners", value: "120+" },
  { label: "Avg first response", value: "< 30 mins" },
  { label: "Customer satisfaction", value: "4.8/5" },
];

const steps = [
  {
    title: "Tell us your move",
    body: "Share postcode, timing, and what support you need.",
  },
  {
    title: "Get matched quickly",
    body: "We match you to trusted local professionals with the right expertise.",
  },
  {
    title: "Pick with confidence",
    body: "Compare options, check response times, and choose who to contact.",
  },
];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      fullName: String(formData.get("fullName") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      postcode: String(formData.get("postcode") || ""),
      moveType: String(formData.get("moveType") || "BUYING"),
      serviceNeeded: String(formData.get("serviceNeeded") || ""),
      propertyValue: String(formData.get("propertyValue") || ""),
      timeline: String(formData.get("timeline") || ""),
      notes: String(formData.get("notes") || ""),
      website: String(formData.get("website") || ""),
    };

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (data.ok) {
      setMessage("Request received. We’ll send matching options shortly.");
      event.currentTarget.reset();
    } else {
      setMessage(data.error || "Could not submit request. Please try again.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <p className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-200">
              MindTheMove · Bristol Property Services
            </p>

            <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
              Find trusted conveyancing and moving experts, without the noise.
            </h1>

            <p className="mt-5 max-w-2xl text-lg text-slate-300">
              We help buyers and sellers connect with vetted local professionals. Transparent, fast, and built for real property timelines.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <article key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                  <p className="text-xl font-bold text-cyan-200">{item.value}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.label}</p>
                </article>
              ))}
            </div>
          </div>

          <form
            onSubmit={onSubmit}
            className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-cyan-500/5"
          >
            <h2 className="text-xl font-semibold">Get matched now</h2>
            <p className="mt-1 text-sm text-slate-400">No obligation. Takes about 60 seconds.</p>

            <div className="mt-4 grid gap-3">
              <input name="fullName" required placeholder="Full name" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5" />
              <input name="email" required type="email" placeholder="Email" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5" />
              <input name="phone" placeholder="Phone (optional)" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5" />

              <div className="grid gap-3 sm:grid-cols-2">
                <select name="moveType" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5">
                  <option value="BUYING">Buying</option>
                  <option value="SELLING">Selling</option>
                  <option value="BOTH">Both</option>
                </select>
                <input name="postcode" required placeholder="Postcode" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5" />
              </div>

              <select name="serviceNeeded" required className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5">
                <option value="">Service needed</option>
                {services.map((service) => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>

              <div className="grid gap-3 sm:grid-cols-2">
                <input name="propertyValue" placeholder="Property value" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5" />
                <input name="timeline" placeholder="Timeline" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5" />
              </div>

              <textarea name="notes" placeholder="Anything else we should know?" className="min-h-20 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5" />
              <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

              <button disabled={loading} className="rounded-xl bg-cyan-300 px-4 py-2.5 font-semibold text-slate-950 hover:bg-cyan-200 disabled:opacity-60">
                {loading ? "Submitting..." : "Find professionals"}
              </button>
            </div>

            {message ? <p className="mt-3 text-sm text-cyan-200">{message}</p> : null}
            <p className="mt-3 text-xs text-slate-500">MindTheMove is a referral platform and does not provide legal advice.</p>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <article key={step.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <p className="text-sm font-semibold text-cyan-200">Step {i + 1}</p>
              <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-slate-300">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-14 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="text-xl font-semibold">For homeowners</h3>
          <p className="mt-2 text-slate-300">Compare trusted options and move faster with less stress.</p>
          <Link href="/professionals" className="mt-4 inline-block rounded-xl border border-slate-700 px-4 py-2 font-medium hover:bg-slate-800">
            Browse professionals
          </Link>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="text-xl font-semibold">For professionals</h3>
          <p className="mt-2 text-slate-300">Join as a partner and receive qualified local enquiries.</p>
          <Link href="/list-your-business" className="mt-4 inline-block rounded-xl bg-slate-100 px-4 py-2 font-medium text-slate-900 hover:bg-white">
            List your business
          </Link>
        </article>
      </section>
    </main>
  );
}
