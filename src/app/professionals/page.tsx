const samplePros = [
  {
    name: "Harper Legal Conveyancing",
    service: "Conveyancing Solicitor",
    location: "Bristol BS1",
    rating: 4.9,
    reviews: 124,
    response: "Usually replies in 25 mins",
    badge: "Preferred Partner",
  },
  {
    name: "Clifton Property Law",
    service: "Conveyancing Solicitor",
    location: "Bristol BS8",
    rating: 4.8,
    reviews: 97,
    response: "Usually replies in 45 mins",
    badge: "Verified",
  },
  {
    name: "Redland Move Legal",
    service: "Conveyancing Solicitor",
    location: "Bristol BS6",
    rating: 4.7,
    reviews: 86,
    response: "Usually replies same day",
    badge: "Verified",
  },
];

export default function ProfessionalsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h1 className="text-3xl font-bold">Compare trusted professionals</h1>
          <p className="mt-2 text-slate-300">
            Sample directory layout for Bristol launch. Profiles shown are placeholder demo data.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <input placeholder="Postcode (e.g. BS3)" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" />
            <select className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2">
              <option>Service</option>
              <option>Conveyancing Solicitor</option>
            </select>
            <select className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2">
              <option>Response time</option>
              <option>Under 1 hour</option>
              <option>Same day</option>
            </select>
            <button className="rounded-xl bg-cyan-300 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-200">
              Filter results
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {samplePros.map((pro) => (
            <article key={pro.name} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-400/10 px-2 py-0.5 text-xs font-semibold text-cyan-200">
                    {pro.badge}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">{pro.name}</h2>
                  <p className="text-slate-300">{pro.service} · {pro.location}</p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold">⭐ {pro.rating}</p>
                  <p className="text-sm text-slate-400">{pro.reviews} reviews</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
                <p className="text-sm text-slate-300">{pro.response}</p>
                <button className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-200">
                  Request quote
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
