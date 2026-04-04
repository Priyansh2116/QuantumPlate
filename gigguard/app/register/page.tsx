"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, ChevronRight, CheckCircle, Zap } from "lucide-react";
import { Platform, Zone } from "@/lib/types";
import { saveSession } from "@/lib/client-auth";

const PLATFORMS: Platform[] = ["Blinkit", "Zepto", "Swiggy Instamart", "BigBasket Now", "Amazon"];
const ZONES: Zone[] = ["Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "Marathahalli", "BTM Layout"];

const PLATFORM_COLORS: Record<Platform, string> = {
  Blinkit: "#f59e0b",
  Zepto: "#8b5cf6",
  "Swiggy Instamart": "#f97316",
  "BigBasket Now": "#10b981",
  Amazon: "#3b82f6",
};

const EXCLUSIONS = [
  "Health, illness, or hospitalization",
  "Vehicle repairs or accidents",
  "Platform account suspension",
  "War, pandemic (unless parametric threshold met)",
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [worker, setWorker] = useState<{ id: string; name: string } | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    zone: "" as Zone | "",
    platforms: [] as Platform[],
    weeklyEarnings: "",
    hoursPerWeek: "",
  });

  function togglePlatform(p: Platform) {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter((x) => x !== p) : [...f.platforms, p],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setWorker(data);
      saveSession(data.id, data.name, data.token);
      setStep(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  if (step === 3 && worker) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-6">
        <div className="relative inline-block">
          <CheckCircle className="w-24 h-24 text-emerald-400 mx-auto" />
          <div className="absolute inset-0 blur-2xl bg-emerald-400 opacity-20 rounded-full" />
        </div>
        <h1 className="text-3xl font-black text-white">You're in, {worker.name.split(" ")[0]}!</h1>
        <p className="text-slate-400">
          Your AI risk profile is being computed. Get your first weekly policy to activate protection.
        </p>
        <div className="glass rounded-xl border border-emerald-500/20 p-4 text-sm text-left space-y-2">
          <div className="text-emerald-400 font-semibold text-xs uppercase tracking-wide mb-2">What happens next</div>
          {["AI computes your zone's disruption probability", "Weekly premium calculated using your earnings baseline", "Policy activated on UPI payment", "System monitors triggers 24/7 — no action needed"].map((s, i) => (
            <div key={i} className="flex gap-2 text-slate-300">
              <span className="text-emerald-400 font-bold">{i + 1}.</span> {s}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={() => router.push("/policies")} className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-3 rounded-xl transition-all">
            Get This Week's Policy
          </button>
          <button onClick={() => router.push("/dashboard")} className="glass border border-white/10 text-slate-300 font-medium px-6 py-3 rounded-xl hover:border-white/20 transition-all">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 font-black text-2xl text-white">
          <Shield className="w-7 h-7 text-emerald-400" />
          Register with GigGuard
        </div>
        <p className="text-slate-400">Income protection for gig delivery workers · Under 2 minutes</p>
      </div>

      {/* Steps */}
      <div className="flex items-center justify-center gap-3">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              step >= s ? "bg-emerald-500 text-black" : "bg-white/5 text-slate-500"
            }`}>{s}</div>
            <span className={`text-sm font-medium ${step >= s ? "text-emerald-400" : "text-slate-500"}`}>
              {s === 1 ? "Basic Info" : "Earnings & Platforms"}
            </span>
            {s < 2 && <ChevronRight className="w-4 h-4 text-slate-600" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-2xl border border-white/5 p-8 space-y-6">
        {step === 1 && (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text" required value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full glass border border-white/10 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  placeholder="e.g. Rajan Kumar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Mobile Number</label>
                <div className="flex gap-2">
                  <span className="flex items-center px-4 py-3 glass border border-white/10 rounded-xl text-slate-400 text-sm">+91</span>
                  <input
                    type="tel" required value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/, "") }))}
                    maxLength={10}
                    className="flex-1 glass border border-white/10 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                    placeholder="10-digit number"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Primary Operating Zone — Bengaluru</label>
                <select
                  required value={form.zone}
                  onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value as Zone }))}
                  className="w-full glass border border-white/10 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30 bg-transparent transition-all"
                >
                  <option value="" className="bg-slate-900">Select your zone</option>
                  {ZONES.map((z) => <option key={z} value={z} className="bg-slate-900">{z}</option>)}
                </select>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="button"
              onClick={() => {
                if (!form.name || !form.phone || !form.zone) { setError("Please fill all fields"); return; }
                setError("");
                setStep(2);
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition-all hover:scale-105"
            >
              Next: Earnings & Platforms
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Active Platforms <span className="text-slate-500 text-xs">(select all you deliver for — coverage is aggregated)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p} type="button" onClick={() => togglePlatform(p)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                        form.platforms.includes(p)
                          ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                          : "glass border-white/10 text-slate-400 hover:border-white/20"
                      }`}
                      style={form.platforms.includes(p) ? { boxShadow: `0 0 15px ${PLATFORM_COLORS[p]}30` } : {}}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Avg Weekly Earnings (Rs.)</label>
                  <input
                    type="number" required min={500} max={20000}
                    value={form.weeklyEarnings}
                    onChange={(e) => setForm((f) => ({ ...f, weeklyEarnings: e.target.value }))}
                    className="w-full glass border border-white/10 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                    placeholder="e.g. 4800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Active Hours / Week</label>
                  <input
                    type="number" required min={10} max={84}
                    value={form.hoursPerWeek}
                    onChange={(e) => setForm((f) => ({ ...f, hoursPerWeek: e.target.value }))}
                    className="w-full glass border border-white/10 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                    placeholder="e.g. 60"
                  />
                </div>
              </div>

              {form.weeklyEarnings && form.hoursPerWeek && (
                <div className="glass-emerald rounded-xl border border-emerald-500/20 p-3 text-sm text-emerald-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 flex-shrink-0" />
                  Estimated Rs. {Math.round(Number(form.weeklyEarnings) / Number(form.hoursPerWeek))}/hr · AI will compute your disruption probability and weekly premium after registration.
                </div>
              )}

              <div className="glass rounded-xl border border-white/5 p-4">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Coverage exclusions (Key Information Sheet)</div>
                <ul className="space-y-1">
                  {EXCLUSIONS.map((e) => (
                    <li key={e} className="text-xs text-slate-500 flex gap-1.5">
                      <span className="text-red-400 font-bold">✗</span> {e}
                    </li>
                  ))}
                  <li className="text-xs text-slate-600">+ 9 more exclusions · Full list on policy page</li>
                </ul>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 glass border border-white/10 text-slate-300 font-semibold py-3 rounded-xl hover:border-white/20 transition-all">
                Back
              </button>
              <button type="submit" disabled={loading || form.platforms.length === 0}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-all hover:scale-105">
                {loading ? "Registering..." : "Complete Registration"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
