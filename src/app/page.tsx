"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const services = [
  "Conveyancing Solicitors",
  "Mortgage Brokers",
  "Surveyors",
  "Removal Companies",
  "Home Insurance Advisors",
];

const steps = [
  {
    title: "Tell us your move",
    body: "Choose buying, selling, or both. Add postcode and timeline.",
  },
  {
    title: "Get matched fast",
    body: "We surface vetted professionals who specialize in your area.",
  },
  {
    title: "Compare and choose",
    body: "Review profiles, response times, and ratings before you decide.",
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
      setMessage("Nice. Your request is in — we’ll match you with professionals shortly.");
      event.currentTarget.reset();
    } else {
      setMessage(data.error || "Couldn’t submit your request. Please try again.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="inline-flex rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
          MindTheMove.co · UK Property Services Marketplace
        </p>

        <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
          Find trusted pros for buying or selling your home.
        </h1>

        <p className="mt-5 max-w-2xl text-lg text-slate-300">
          Checkatrade-style matching built for property transactions. Start with legal services, then scale to the full moving journey.
        </p>

        <form onSubmit={onSubmit} className="mt-8 grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 md:grid-cols-3">
          <input name="fullName" required placeholder="Your full name" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" />
          <input name="email" required type="email" placeholder="Email" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" />
          <input name="phone" placeholder="Phone (optional)" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" />

          <select name="moveType" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2">
            <option value="BUYING">Buying</option>
            <option value="SELLING">Selling</option>
            <option value="BOTH">Both</option>
          </select>
          <input name="postcode" required placeholder="Postcode (e.g. SW1A 1AA)" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" />
          <select name="serviceNeeded" required className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2">
            <option value="">Service needed</option>
            {services.map((service) => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>

          <input name="propertyValue" placeholder="Property value (optional)" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" />
          <input name="timeline" placeholder="Timeline (e.g. within 8 weeks)" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" />
          <button disabled={loading} className="rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-50">
            {loading ? "Sending..." : "Find professionals"}
          </button>

          <textarea name="notes" placeholder="Anything else we should know?" className="md:col-span-3 min-h-24 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" />
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />
        </form>

        {message ? <p className="mt-4 text-sm text-cyan-300">{message}</p> : null}

        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
          <span>✓ Verified profiles</span>
          <span>✓ Fast responses</span>
          <span>✓ Compare before committing</span>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-14">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <article key={step.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <p className="text-sm text-cyan-300">Step {i + 1}</p>
              <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-slate-300">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-16 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="text-xl font-semibold">For homeowners</h3>
          <p className="mt-2 text-slate-300">Get multiple expert options without spending hours searching and calling around.</p>
          <Link href="/professionals" className="mt-4 inline-block rounded-xl border border-slate-700 px-4 py-2 font-medium hover:bg-slate-800">Browse professionals</Link>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="text-xl font-semibold">For professionals</h3>
          <p className="mt-2 text-slate-300">Receive qualified local leads and build trust with reviews and verified badges.</p>
          <Link href="/list-your-business" className="mt-4 inline-block rounded-xl bg-slate-100 px-4 py-2 font-medium text-slate-900 hover:bg-white">
            List your business
          </Link>
        </article>
      </section>
    </main>
  );
}
