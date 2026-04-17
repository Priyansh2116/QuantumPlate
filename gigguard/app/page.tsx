"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Shield, Zap, Brain, IndianRupee, ChevronRight, Activity, Users, MapPin, TrendingUp, Eye, Lock } from "lucide-react";

const GlobeHero = dynamic(() => import("@/components/GlobeHero"), { ssr: false });

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Risk Assessment",
    desc: "XGBoost classifier trained on disruption-earnings data predicts weekly risk probability. Dynamic premium = E_h × L_h × R + F − D",
    color: "text-violet-400",
    border: "border-violet-500/20",
    glow: "rgba(139,92,246,0.15)",
    tag: "ML Model",
  },
  {
    icon: Activity,
    title: "Peer-Based Risk Intelligence",
    desc: "Rolling z-score on 5–30 min zone activity windows. Drop >1.8σ raises peer signal. 3 consecutive signals → trigger-ready. Faster than any weather API.",
    color: "text-blue-400",
    border: "border-blue-500/20",
    glow: "rgba(59,130,246,0.15)",
    tag: "Real-time",
  },
  {
    icon: TrendingUp,
    title: "Behavioral Incentive Engine",
    desc: "AI recommends zone shifts ahead of disruptions. Compliance tracked via GPS. Behavioral Score (0–100) earns 5–15% premium discounts each week.",
    color: "text-emerald-400",
    border: "border-emerald-500/20",
    glow: "rgba(16,185,129,0.15)",
    tag: "Innovation",
  },
  {
    icon: Zap,
    title: "Parametric Auto-Payouts",
    desc: "5 trigger types monitored 24/7. GPS + peer corroboration + Isolation Forest fraud check. Zero forms. Payout in < 2 hours via UPI.",
    color: "text-amber-400",
    border: "border-amber-500/20",
    glow: "rgba(245,158,11,0.15)",
    tag: "Core Feature",
  },
  {
    icon: Users,
    title: "Platform-Agnostic Coverage",
    desc: "Worker earning across Blinkit + Zepto gets unified coverage on total income. Multi-platform baseline aggregated from declared earnings across all apps.",
    color: "text-pink-400",
    border: "border-pink-500/20",
    glow: "rgba(236,72,153,0.15)",
    tag: "USP",
  },
  {
    icon: Eye,
    title: "Intelligent Fraud Detection",
    desc: "Layer 1: GPS mismatch, activity-during-claim, peer comparison. Layer 2: Isolation Forest for adverse selection patterns. 24h review queue for flagged claims.",
    color: "text-cyan-400",
    border: "border-cyan-500/20",
    glow: "rgba(34,211,238,0.15)",
    tag: "Security",
  },
];

const TRIGGERS = [
  { name: "Sustained Rainfall", threshold: ">35 mm/hr for 90+ min", color: "#3b82f6", payout: "Verified shortfall" },
  { name: "Air Quality Restriction", threshold: "AQI >300 NAQI + advisory", color: "#8b5cf6", payout: "Prop. to restricted hrs" },
  { name: "Zone Shutdown", threshold: "Official curfew 4+ hrs", color: "#ef4444", payout: "Full daily equivalent" },
  { name: "Demand Collapse", threshold: ">50% drop for 3+ hrs", color: "#f97316", payout: "Prop. to demand drop" },
  { name: "Extreme Heat", threshold: ">44°C for 4+ hrs (11–4 PM)", color: "#f59e0b", payout: "Lost-hours × hourly rate" },
];

const PRICING_VARS = [
  { symbol: "E_h", name: "Avg Hourly Earnings", desc: "4-week trailing avg, outliers excluded", color: "#10b981" },
  { symbol: "L_h", name: "Expected Lost Hours", desc: "Disruption Prob × Avg Duration × Active Fraction", color: "#3b82f6" },
  { symbol: "R", name: "Risk Score", desc: "Zone Risk × Weather Intensity × Seasonal Adj.", color: "#8b5cf6" },
  { symbol: "F", name: "Platform Fee", desc: "Fixed Rs. 15 per policy", color: "#f59e0b" },
  { symbol: "D", name: "Behavioral Discount", desc: "Score 0–100 → 0–15% discount on premium", color: "#10b981" },
];

export default function Home() {
  return (
    <div className="space-y-24">
      {/* HERO */}
      <section className="relative min-h-[85vh] flex items-center">
        <div className="grid md:grid-cols-2 gap-12 items-center w-full">
          <div className="space-y-8 z-10">
            <div className="inline-flex items-center gap-2 glass border border-emerald-500/20 px-4 py-2 rounded-full text-sm">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 font-medium">Guidewire DEVTrails 2026</span>
              <span className="text-slate-400">— Phase 3 Submission</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black leading-tight">
              Income protection for<br />
              <span className="gradient-text text-glow-emerald">India's gig workers</span>
            </h1>

            <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
              When rain shuts your zone, AQI spikes your city, or demand collapses —
              GigGuard pays out <strong className="text-white">automatically</strong>, no forms, no calls.
              Weekly cover from Rs. 60.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-3 rounded-xl transition-all glow-emerald hover:scale-105"
              >
                Get Protected <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/map"
                className="inline-flex items-center gap-2 glass border border-white/10 hover:border-emerald-500/30 text-slate-200 font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105"
              >
                <MapPin className="w-4 h-4 text-emerald-400" /> Live Zone Map
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 glass border border-white/10 text-slate-400 font-medium px-6 py-3 rounded-xl transition-all hover:text-slate-200"
              >
                Demo Dashboard
              </Link>
            </div>

            {/* Quick stats */}
            <div className="flex gap-6">
              {[
                { v: "5", l: "Trigger Types" },
                { v: "<2hr", l: "Payout Time" },
                { v: "Rs. 60", l: "From / Week" },
                { v: "0", l: "Forms to Fill" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-black text-emerald-400">{s.v}</div>
                  <div className="text-xs text-slate-500">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 3D Globe */}
          <div className="relative h-[480px] hidden md:block">
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <GlobeHero />
            </div>
            {/* Floating info cards */}
            <div className="absolute top-8 right-4 glass border border-emerald-500/20 rounded-xl p-3 text-xs float">
              <div className="text-emerald-400 font-bold">Koramangala</div>
              <div className="text-slate-400">Rainfall triggered ⚠</div>
              <div className="text-emerald-400 font-bold mt-1">Rs. 420 payout</div>
            </div>
            <div className="absolute bottom-16 left-2 glass border border-blue-500/20 rounded-xl p-3 text-xs float" style={{ animationDelay: "1s" }}>
              <div className="text-blue-400 font-bold">BTM Layout</div>
              <div className="text-slate-400">AQI: 315 NAQI ⚠</div>
              <div className="text-blue-400 font-bold mt-1">AQI trigger active</div>
            </div>
            <div className="absolute bottom-8 right-8 glass border border-amber-500/20 rounded-xl p-3 text-xs float" style={{ animationDelay: "2s" }}>
              <div className="text-amber-400 font-bold">AI Risk Engine</div>
              <div className="text-slate-400">Scanning 6 zones</div>
              <div className="flex gap-1 mt-1">
                {[1,2,3,4,5].map(i => <div key={i} className={`w-1.5 h-3 rounded-full ${i <= 3 ? 'bg-amber-400' : 'bg-slate-600'}`} />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PERSONA */}
      <section className="glass rounded-2xl p-8 border border-white/5">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="text-xs text-emerald-400 font-semibold tracking-widest uppercase mb-2">
              User Persona
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Meet Rajan, 29</h2>
            <div className="space-y-1 text-sm text-slate-400">
              <div className="flex justify-between"><span>Platforms</span><span className="text-slate-200">Blinkit + Zepto</span></div>
              <div className="flex justify-between"><span>Zone</span><span className="text-slate-200">Koramangala, Bengaluru</span></div>
              <div className="flex justify-between"><span>Weekly Earnings</span><span className="text-slate-200">Rs. 4,800–5,600</span></div>
              <div className="flex justify-between"><span>Savings Buffer</span><span className="text-red-400">3–5 days only</span></div>
              <div className="flex justify-between"><span>Dependents</span><span className="text-slate-200">Wife + 1 child</span></div>
            </div>
          </div>
          <div className="md:col-span-2 glass-emerald rounded-xl p-5 border border-emerald-500/10">
            <div className="text-xs text-emerald-400 font-semibold mb-2">THE SCENARIO</div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Week 3 of July. AQI in Koramangala crosses 315. Municipal advisory restricts outdoor delivery 12–4 PM.
              Dark stores suspend dispatch. Rajan's window shrinks by 4 hours. Weekly income drops to{" "}
              <strong className="text-red-400">Rs. 2,900</strong> — 45% below average.
            </p>
            <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <div className="text-xs text-emerald-400 font-semibold mb-1">WITH GIGGUARD</div>
              <p className="text-sm text-slate-300">
                AQI trigger confirmed. GPS validated. Peer signal: 62% zone workers inactive.
                <strong className="text-emerald-400"> Rs. 1,800 transferred to UPI within 2 hours.</strong> No claim form. No phone call.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section>
        <div className="text-center mb-12">
          <div className="text-xs text-emerald-400 font-semibold tracking-widest uppercase mb-3">
            Platform Features
          </div>
          <h2 className="text-3xl font-black text-white">
            Every layer is purpose-built for gig work
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`glass card-3d rounded-xl p-5 border ${f.border} hover:border-opacity-60 transition-all group cursor-default`}
              style={{ "--glow": f.glow } as React.CSSProperties}
            >
              <div className="flex items-start justify-between mb-3">
                <f.icon className={`w-6 h-6 ${f.color}`} />
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${f.border} ${f.color}`}>
                  {f.tag}
                </span>
              </div>
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PARAMETRIC TRIGGERS */}
      <section>
        <div className="text-center mb-10">
          <div className="text-xs text-emerald-400 font-semibold tracking-widest uppercase mb-3">
            Automated Protection
          </div>
          <h2 className="text-3xl font-black text-white">5 Parametric Trigger Types</h2>
          <p className="text-slate-400 mt-2 max-w-xl mx-auto">
            All triggered automatically from live data — no human claim initiation required
          </p>
        </div>
        <div className="grid md:grid-cols-5 gap-3">
          {TRIGGERS.map((t, i) => (
            <div
              key={t.name}
              className="glass rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all card-3d"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div
                className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center text-xl font-black"
                style={{ background: `${t.color}20`, color: t.color }}
              >
                {i + 1}
              </div>
              <div className="font-semibold text-white text-sm mb-1">{t.name}</div>
              <div className="text-xs text-slate-500 mb-2">{t.threshold}</div>
              <div className="text-xs font-medium" style={{ color: t.color }}>
                Payout: {t.payout}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING FORMULA */}
      <section className="glass rounded-2xl p-8 border border-white/5">
        <div className="text-center mb-8">
          <div className="text-xs text-blue-400 font-semibold tracking-widest uppercase mb-3">
            Dynamic Pricing Engine
          </div>
          <h2 className="text-2xl font-black text-white">Weekly Premium Formula</h2>
        </div>
        <div className="glass rounded-xl p-6 border border-blue-500/20 mb-6 text-center">
          <div className="text-2xl md:text-3xl font-black font-mono text-blue-300">
            Premium = (E<sub className="text-sm">h</sub> × L<sub className="text-sm">h</sub> × R) + F − D
          </div>
          <div className="text-slate-500 text-sm mt-2">Computed fresh every Monday. Paid weekly via UPI.</div>
        </div>
        <div className="grid md:grid-cols-5 gap-3">
          {PRICING_VARS.map((v) => (
            <div key={v.symbol} className="glass rounded-xl p-4 border border-white/5 text-center">
              <div className="text-2xl font-black font-mono mb-1" style={{ color: v.color }}>
                {v.symbol}
              </div>
              <div className="text-sm font-semibold text-white mb-1">{v.name}</div>
              <div className="text-xs text-slate-500">{v.desc}</div>
            </div>
          ))}
        </div>
        {/* Worked example */}
        <div className="mt-6 glass-emerald rounded-xl p-5 border border-emerald-500/10">
          <div className="text-xs text-emerald-400 font-semibold uppercase mb-3">Worked Example — Rajan, Koramangala, Monsoon Week</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[
              ["E_h", "Rs. 75/hr"],
              ["Disruption Prob.", "60%"],
              ["L_h", "1.44 hrs"],
              ["R = 1.10 × 1.05 × 1.10", "= 1.27"],
              ["Base Premium", "Rs. 137"],
              ["Platform Fee", "+ Rs. 15"],
              ["Behavioral Discount (72 score)", "− Rs. 15"],
              ["FINAL PREMIUM", "Rs. 137"],
            ].map(([k, v]) => (
              <div key={k} className="glass rounded-lg p-2">
                <div className="text-slate-400 text-xs">{k}</div>
                <div className="text-emerald-400 font-bold">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COVERAGE */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="glass-emerald rounded-2xl p-6 border border-emerald-500/20">
          <h3 className="font-bold text-emerald-400 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" /> What GigGuard Covers
          </h3>
          <ul className="space-y-2.5">
            {[
              "Income loss from extreme rainfall (>35mm/hr)",
              "Income loss from severe AQI events (>300 NAQI)",
              "Income loss from zone/curfew shutdowns (4+ hrs)",
              "Income loss from demand collapse (>50% drop)",
              "Income loss from extreme heat (>44°C)",
            ].map((i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <span className="text-emerald-400 font-bold flex-shrink-0">✓</span> {i}
              </li>
            ))}
          </ul>
        </div>
        <div className="glass-red rounded-2xl p-6 border border-red-500/20">
          <h3 className="font-bold text-red-400 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" /> Explicit Exclusions
          </h3>
          <ul className="space-y-2.5">
            {[
              "Health, illness, or hospitalization",
              "Life insurance or death benefits",
              "Vehicle repairs or accident costs",
              "Platform account suspension",
              "War, pandemic (unless parametric threshold met)",
              "Personal unavailability — non-disruption",
            ].map((i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <span className="text-red-400 font-bold flex-shrink-0">✗</span> {i}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* TECH STACK */}
      <section>
        <div className="text-center mb-8">
          <div className="text-xs text-slate-400 font-semibold tracking-widest uppercase mb-3">Architecture</div>
          <h2 className="text-2xl font-black text-white">Tech Stack</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { layer: "Frontend", tech: "Next.js 16 + TypeScript", detail: "Tailwind · Recharts · Three.js" },
            { layer: "AI/ML Service", tech: "Python + FastAPI", detail: "XGBoost · scikit-learn · Isolation Forest" },
            { layer: "Data / Cache", tech: "PostgreSQL + Redis", detail: "Policies · Triggers · Peer signals" },
            { layer: "Task Queue", tech: "Bull (Redis-backed)", detail: "30-min trigger polls · weekly pricing" },
            { layer: "External APIs", tech: "OpenWeatherMap + CPCB", detail: "Weather · AQI · Zone mock feeds" },
            { layer: "Payments", tech: "Razorpay Sandbox", detail: "UPI payout simulation" },
            { layer: "Infrastructure", tech: "Docker + Compose", detail: "Vercel + Railway for demo" },
            { layer: "CI/CD", tech: "GitHub Actions", detail: "Auto-deploy on push" },
          ].map((s) => (
            <div key={s.layer} className="glass rounded-xl p-4 border border-white/5 card-3d">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">{s.layer}</div>
              <div className="font-semibold text-white text-sm mb-1">{s.tech}</div>
              <div className="text-xs text-slate-500">{s.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-12 glass rounded-2xl border border-emerald-500/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-emerald" />
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-black text-white">
            Protect your income this week
          </h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Register as a delivery worker, get your AI-computed premium, and activate coverage in under 2 minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-4 rounded-xl transition-all glow-emerald hover:scale-105 text-lg"
            >
              Register Now <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/map"
              className="inline-flex items-center gap-2 glass border border-white/10 hover:border-emerald-500/30 text-slate-200 font-semibold px-8 py-4 rounded-xl transition-all text-lg"
            >
              <MapPin className="w-5 h-5 text-emerald-400" /> Open 3D Zone Map
            </Link>
          </div>
          <div className="flex justify-center gap-8 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><IndianRupee className="w-4 h-4 text-emerald-400" /> From Rs. 60/week</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-400" /> Auto-payout in &lt;2hrs</span>
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-blue-400" /> 5 trigger types</span>
          </div>
        </div>
      </section>
    </div>
  );
}
