const samplePros = [
  {
    name: "Harper Conveyancing",
    service: "Conveyancing Solicitor",
    location: "London",
    rating: 4.9,
    reviews: 124,
    response: "Usually replies in 30 mins",
  },
  {
    name: "Elm Street Mortgages",
    service: "Mortgage Broker",
    location: "Manchester",
    rating: 4.8,
    reviews: 97,
    response: "Usually replies in 1 hour",
  },
  {
    name: "Northpoint Surveys",
    service: "Surveyor",
    location: "Birmingham",
    rating: 4.7,
    reviews: 86,
    response: "Usually replies same day",
  },
];

export default function ProfessionalsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-14 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">Find professionals</h1>
        <p className="mt-2 text-slate-300">Browse vetted services for your property move.</p>

        <div className="mt-8 grid gap-4">
          {samplePros.map((pro) => (
            <article key={pro.name} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">{pro.name}</h2>
                  <p className="text-slate-300">{pro.service} · {pro.location}</p>
                </div>
                <button className="rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950">Request quote</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-400">
                <span>⭐ {pro.rating} ({pro.reviews} reviews)</span>
                <span>{pro.response}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
