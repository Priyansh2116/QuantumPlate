"use client";
import { useState, useEffect } from "react";
import { getSession, DEMO_WORKER_ID } from "@/lib/client-auth";
import { Policy, PremiumBreakdown } from "@/lib/types";
import { Shield, CheckCircle, IndianRupee, ChevronDown, ChevronUp, Zap, Brain } from "lucide-react";
import TriggerBadge from "@/components/TriggerBadge";
import { COVERAGE_EXCLUSIONS } from "@/lib/fraud";

export default function PoliciesPage() {
  const workerId = typeof window !== "undefined"
    ? getSession()?.workerId || DEMO_WORKER_ID
    : DEMO_WORKER_ID;

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [quote, setQuote] = useState<{ breakdown: PremiumBreakdown; zoneConditions: { activeTriggers: string[] } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showExclusions, setShowExclusions] = useState(false);

  useEffect(() => { loadPolicies(); fetchQuote(); }, []);

  async function loadPolicies() {
    const res = await fetch(`/api/policies?workerId=${workerId}`);
    const data = await res.json();
    setPolicies(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function fetchQuote() {
    setQuoteLoading(true);
    try {
      const res = await fetch("/api/premium", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workerId }) });
      if (res.ok) setQuote(await res.json());
    } finally { setQuoteLoading(false); }
  }

  async function purchasePolicy() {
    setPurchasing(true); setError("");
    try {
      const res = await fetch("/api/policies", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workerId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(`Policy activated! Coverage up to Rs. ${data.coverageCeiling} this week.`);
      loadPolicies();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Purchase failed");
    } finally { setPurchasing(false); }
  }

  const activePolicy = policies.find((p) => p.status === "Active");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-emerald-400" /> Insurance Policies
        </h1>
        <p className="text-slate-400 text-sm mt-1">Weekly parametric income protection · Loss of income only</p>
      </div>

      {/* Active status */}
      {activePolicy ? (
        <div className="glass-emerald rounded-2xl border border-emerald-500/30 p-5 glow-emerald">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <Shield className="w-9 h-9 text-emerald-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-emerald-300 text-lg">You're protected this week</div>
              <div className="text-sm text-slate-400">Policy active until {activePolicy.weekEnd}</div>
            </div>
            <CheckCircle className="w-6 h-6 text-emerald-400 ml-auto" />
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="glass rounded-lg p-3">
              <div className="text-lg font-black text-emerald-400">Rs. {activePolicy.premium}</div>
              <div className="text-xs text-slate-500">Premium Paid</div>
            </div>
            <div className="glass rounded-lg p-3">
              <div className="text-lg font-black text-white">Rs. {activePolicy.coverageCeiling}</div>
              <div className="text-xs text-slate-500">Max Coverage</div>
            </div>
            <div className="glass rounded-lg p-3">
              <div className="text-lg font-black text-blue-400">5</div>
              <div className="text-xs text-slate-500">Triggers Covered</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {activePolicy.triggers.map((t) => <TriggerBadge key={t} type={t} />)}
          </div>
        </div>
      ) : null}

      {/* Premium Quote */}
      {!activePolicy && (
        <div className="glass rounded-2xl border border-white/5 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-400" />
            <h2 className="font-bold text-white">This Week's AI-Computed Premium</h2>
            <span className="ml-auto text-xs glass border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Live calculation</span>
          </div>

          {quoteLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-4 bg-white/5 rounded" />)}
            </div>
          ) : quote ? (
            <>
              {/* Formula display */}
              <div className="glass rounded-xl border border-blue-500/20 p-4 text-center">
                <div className="text-slate-400 text-xs mb-1">Premium Formula</div>
                <div className="text-lg font-bold font-mono text-blue-300">
                  (E<sub>h</sub> × L<sub>h</sub> × R) + F − D
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Avg Hourly Earnings (E_h)", value: `Rs. ${quote.breakdown.avgHourlyEarnings}/hr`, color: "text-emerald-400" },
                  { label: "Expected Lost Hours (L_h)", value: `${quote.breakdown.expectedLostHours} hrs`, color: "text-blue-400" },
                  { label: "Disruption Probability", value: `${Math.round(quote.breakdown.disruptionProbability * 100)}%`, color: "text-amber-400" },
                  { label: "Risk Score (R)", value: quote.breakdown.riskScore.toString(), color: "text-violet-400" },
                  { label: "Base Premium", value: `Rs. ${quote.breakdown.basePremium}`, color: "text-slate-300" },
                  { label: "Platform Fee (F)", value: `+ Rs. ${quote.breakdown.platformFee}`, color: "text-slate-400" },
                  { label: "Behavioral Discount (D)", value: `− Rs. ${quote.breakdown.behavioralDiscount}`, color: "text-emerald-400" },
                  { label: "Coverage Ceiling", value: `Rs. ${quote.breakdown.coverageCeiling}`, color: "text-emerald-400" },
                ].map((r) => (
                  <div key={r.label} className="glass rounded-lg p-3 flex justify-between items-center text-xs">
                    <span className="text-slate-500">{r.label}</span>
                    <span className={`font-bold ${r.color}`}>{r.value}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 text-4xl font-black text-white">
                    <IndianRupee className="w-7 h-7" />{quote.breakdown.finalPremium}
                    <span className="text-base font-normal text-slate-500 ml-1">/week</span>
                  </div>
                  <div className="text-emerald-400 text-sm mt-1">Coverage up to Rs. {quote.breakdown.coverageCeiling}</div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <div>5 triggers covered</div>
                  <div>UPI · simulated payment</div>
                </div>
              </div>

              {quote.zoneConditions?.activeTriggers?.length > 0 && (
                <div className="glass-amber rounded-xl border border-amber-500/20 p-3 text-xs">
                  <div className="text-amber-400 font-bold mb-1.5">Active disruptions in your zone (elevating premium):</div>
                  <div className="flex flex-wrap gap-1.5">
                    {quote.zoneConditions.activeTriggers.map((t) => (
                      <TriggerBadge key={t} type={t as import("@/lib/types").TriggerType} active />
                    ))}
                  </div>
                </div>
              )}

              {success ? (
                <div className="flex items-center gap-2 glass-emerald border border-emerald-500/20 rounded-xl p-4 text-emerald-300">
                  <CheckCircle className="w-5 h-5" /> {success}
                </div>
              ) : (
                <>
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <button
                    onClick={purchasePolicy} disabled={purchasing}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold py-4 rounded-xl transition-all hover:scale-105 text-lg flex items-center justify-center gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    {purchasing ? "Processing..." : `Pay Rs. ${quote.breakdown.finalPremium} via UPI · Get Protected`}
                  </button>
                  <p className="text-center text-xs text-slate-600">Razorpay sandbox simulation · No real charges</p>
                </>
              )}
            </>
          ) : <p className="text-slate-500 text-sm">Could not load quote.</p>}
        </div>
      )}

      {/* Coverage Exclusions */}
      <div className="glass rounded-xl border border-white/5 overflow-hidden">
        <button
          onClick={() => setShowExclusions(!showExclusions)}
          className="w-full flex items-center justify-between p-4 hover:bg-white/2 transition-colors"
        >
          <span className="text-sm font-medium text-slate-300">Full Coverage Exclusions (Key Information Sheet)</span>
          {showExclusions ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>
        {showExclusions && (
          <div className="border-t border-white/5 p-4">
            <ul className="grid grid-cols-2 gap-1.5">
              {COVERAGE_EXCLUSIONS.map((e, i) => (
                <li key={i} className="text-xs text-slate-500 flex gap-1.5">
                  <span className="text-red-400 font-bold flex-shrink-0">✗</span> {e}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Policy History */}
      <div className="space-y-3">
        <h2 className="font-bold text-white">Policy History</h2>
        {loading ? <div className="animate-pulse h-20 glass rounded-xl" /> :
          policies.length === 0 ? (
            <div className="glass rounded-xl border border-white/5 p-8 text-center text-slate-500 text-sm">
              No policies yet. Get your first weekly policy above.
            </div>
          ) : policies.map((p) => (
            <div key={p.id} className="glass rounded-xl border border-white/5 overflow-hidden">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/2 transition-colors"
                onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
              >
                <div className="flex items-center gap-3">
                  <Shield className={`w-5 h-5 ${p.status === "Active" ? "text-emerald-400" : "text-slate-600"}`} />
                  <div>
                    <div className="font-medium text-white text-sm">{p.weekStart} → {p.weekEnd}</div>
                    <div className="text-xs text-slate-500">Premium: Rs. {p.premium} · Coverage: Rs. {p.coverageCeiling}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-white/5 text-slate-500"}`}>
                    {p.status}
                  </span>
                  {expandedId === p.id ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </div>
              </div>
              {expandedId === p.id && (
                <div className="border-t border-white/5 p-4 space-y-3">
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {[
                      ["E_h", `Rs. ${p.premiumBreakdown.avgHourlyEarnings}/hr`],
                      ["L_h", `${p.premiumBreakdown.expectedLostHours} hrs`],
                      ["Risk Score (R)", p.premiumBreakdown.riskScore],
                      ["Discount (D)", `Rs. ${p.premiumBreakdown.behavioralDiscount}`],
                    ].map(([k, v]) => (
                      <div key={String(k)} className="glass rounded-lg p-2 text-center">
                        <div className="text-slate-500">{k}</div>
                        <div className="text-white font-bold">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.triggers.map((t) => <TriggerBadge key={t} type={t} />)}
                  </div>
                </div>
              )}
            </div>
          ))
        }
      </div>
    </div>
  );
}
