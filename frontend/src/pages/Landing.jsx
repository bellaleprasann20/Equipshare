import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const gridBg = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
  backgroundSize: "48px 48px",
};

const SAMPLE_RANKING = [
  { rank: 1, name: "EX-12 Excavator", site: "Whitefield", km: 12.5, score: 87.4 },
  { rank: 2, name: "EX-07 Excavator", site: "Hebbal", km: 19.8, score: 81.2 },
  { rank: 3, name: "EX-19 Excavator", site: "Electronic City", km: 31.0, score: 74.9 },
];

const TILES = [
  { stat: "5", title: "Factors per machine", text: "Utilization, reliability, maintenance, age and cost feed one score." },
  { stat: "EEI", title: "Learned, not guessed", text: "Weights come from a trained regression model, not hand-picked numbers." },
  { stat: "#1", title: "Ranked for every request", text: "Distance, cost and duration fit are scored against each project." },
  { stat: "100%", title: "Explained", text: "Every recommendation shows exactly why a machine ranked where it did." },
];

const EQUIPMENT = ["Excavators", "Cranes", "Bulldozers", "Loaders", "Concrete mixers", "Dump trucks"];

const BREAKDOWN = [
  { label: "Equipment efficiency", value: 82 },
  { label: "Proximity to site", value: 91 },
  { label: "Transfer cost", value: 88 },
  { label: "Availability fit", value: 100 },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="bg-ink text-white">
      {/* Top bar */}
      <header className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="font-display text-lg font-semibold">EquipShare</span>
        <nav className="flex items-center gap-4 text-sm">
          <a href="#how" className="hidden text-white/70 hover:text-white sm:inline">How it works</a>
          <a href="#equipment" className="hidden text-white/70 hover:text-white sm:inline">Equipment</a>
          {user ? (
            <Link to="/dashboard" className="bg-signal px-4 py-2 font-medium hover:bg-signal-dark">
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-white/80 hover:text-white">Log in</Link>
              <Link to="/register" className="bg-signal px-4 py-2 font-medium hover:bg-signal-dark">
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-24 pt-40 text-center sm:px-10" style={gridBg}>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-ink" />
        <div className="relative mx-auto max-w-4xl">
          <p className="mb-5 text-sm text-white/60">Intelligent construction equipment allocation</p>
          <h1 className="font-display text-5xl font-bold uppercase leading-[1.05] sm:text-7xl">
            Put the right machine on every jobsite
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-white/65">
            EquipShare scores every machine in your fleet and ranks the best match for each request, so idle
            equipment gets used and nothing travels farther than it has to.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to={user ? "/allocation" : "/register"} className="bg-signal px-6 py-3 text-sm font-semibold hover:bg-signal-dark">
              {user ? "New requirement" : "Get started"}
            </Link>
            <a href="#how" className="border border-white/25 px-6 py-3 text-sm font-medium hover:border-white/50">
              See how it works
            </a>
          </div>
        </div>

        {/* Live-style ranking preview */}
        <div className="relative mx-auto mt-16 max-w-2xl border border-white/15 bg-ink/80 text-left backdrop-blur">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-sm text-white/70">Request: excavator, Whitefield, 15 Oct to 30 Oct</span>
            <span className="font-mono text-xs text-signal">3 matches</span>
          </div>
          {SAMPLE_RANKING.map((r) => (
            <div key={r.rank} className="flex items-center gap-4 border-b border-white/5 px-4 py-3 last:border-0">
              <span className={`flex h-6 w-6 items-center justify-center font-mono text-xs font-bold ${r.rank === 1 ? "bg-signal" : "bg-white/10"}`}>
                {r.rank}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium">{r.name}</p>
                <p className="text-xs text-white/50">{r.site}</p>
              </div>
              <span className="font-mono text-xs text-white/60">{r.km} km</span>
              <span className="w-12 text-right font-mono text-sm font-semibold">{r.score}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Four tiles */}
      <section id="how" className="px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 font-display text-3xl font-bold">A smarter way to allocate</h2>
          <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {TILES.map((t) => (
              <div key={t.title} className="flex min-h-64 flex-col justify-between bg-ink p-6" style={gridBg}>
                <span className="font-mono text-4xl font-semibold text-signal">{t.stat}</span>
                <div>
                  <h3 className="mb-2 font-display text-lg font-semibold">{t.title}</h3>
                  <p className="text-sm text-white/60">{t.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature split (light section) */}
      <section className="bg-paper px-6 py-20 text-ink sm:px-10">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold">Every recommendation, explained</h2>
            <p className="mt-4 max-w-md text-steel">
              No black box. Each ranked machine comes with a factor-by-factor breakdown, so a project manager can
              see why the top pick won and choose another with confidence.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="border-l-2 border-signal pl-3">Machine health scored from usage, breakdowns and service history</li>
              <li className="border-l-2 border-signal pl-3">Transfer distance and cost estimated per request</li>
              <li className="border-l-2 border-signal pl-3">Results compared against nearest-first and first-available baselines</li>
            </ul>
            <div className="mt-8 flex gap-3">
              <Link to="/register" className="bg-signal px-5 py-2.5 text-sm font-semibold text-white hover:bg-signal-dark">
                Create an account
              </Link>
              <Link to="/login" className="border border-ink/20 px-5 py-2.5 text-sm font-medium hover:border-ink/40">
                Log in
              </Link>
            </div>
          </div>

          <div className="panel p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display font-semibold">EX-12 Excavator</h3>
              <span className="font-mono text-2xl font-semibold text-signal">87.4</span>
            </div>
            <div className="space-y-4">
              {BREAKDOWN.map((b) => (
                <div key={b.label} className="flex items-center gap-3">
                  <span className="w-40 text-sm text-steel">{b.label}</span>
                  <div className="h-1.5 flex-1 bg-line">
                    <div className="h-full bg-blueprint" style={{ width: `${b.value}%` }} />
                  </div>
                  <span className="w-8 text-right font-mono text-sm">{b.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Equipment types */}
      <section id="equipment" className="px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 font-display text-3xl font-bold">Built for your whole fleet</h2>
          <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {EQUIPMENT.map((name, i) => (
              <div key={name} className="flex items-center justify-between bg-ink p-6 transition-colors hover:bg-white/5">
                <span className="font-display text-lg font-semibold">{name}</span>
                <span className="font-mono text-sm text-white/40">{String(i + 1).padStart(2, "0")}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="px-6 pb-20 sm:px-10">
        <div className="mx-auto grid max-w-6xl gap-px bg-white/10 md:grid-cols-2">
          <div className="bg-ink p-8">
            <h3 className="font-display text-2xl font-bold">Ready to allocate?</h3>
            <p className="mt-2 text-sm text-white/60">Submit a requirement and get a ranked shortlist in seconds.</p>
            <Link to="/register" className="mt-5 inline-block bg-signal px-5 py-2.5 text-sm font-semibold hover:bg-signal-dark">
              Get started
            </Link>
          </div>
          <div className="bg-ink p-8">
            <h3 className="font-display text-2xl font-bold">Managing a fleet?</h3>
            <p className="mt-2 text-sm text-white/60">See utilization, idle time and overdue maintenance in one view.</p>
            <Link to="/login" className="mt-5 inline-block border border-white/25 px-5 py-2.5 text-sm font-medium hover:border-white/50">
              Admin log in
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-sm text-white/45 sm:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} EquipShare</span>
          <span>MCA capstone project, PES University</span>
        </div>
      </footer>
    </div>
  );
}