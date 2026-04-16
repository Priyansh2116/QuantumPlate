"use client";
import { useState, useEffect, useRef } from "react";
import { getSession, DEMO_WORKER_ID } from "@/lib/client-auth";
import { Policy, PremiumBreakdown } from "@/lib/types";
import { Shield, CheckCircle, IndianRupee, ChevronDown, ChevronUp, Zap, Brain, Smartphone, QrCode, Loader2, Lock, X } from "lucide-react";
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
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showExclusions, setShowExclusions] = useState(false);

  // Payment modal state
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"idle" | "qr" | "processing" | "done">("idle");
  const [paymentTxnId, setPaymentTxnId] = useState("");
  const [paymentOrderId, setPaymentOrderId] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  async function startPayment() {
    setError("");
    setPaymentModal(true);
    setPaymentStep("qr");

    // Step 1: Show QR for 2.5s
    timerRef.current = setTimeout(async () => {
      setPaymentStep("processing");

      // Step 2: Actually call the API while "processing" is shown
      try {
        const res = await fetch("/api/policies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workerId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setPaymentTxnId(`TXN${Date.now()}`);
        setPaymentOrderId(data.razorpayOrder?.orderId || `order_sim_${Date.now()}`);

        // Step 3: Show success after 1.5s more
        timerRef.current = setTimeout(() => {
          setPaymentStep("done");
          loadPolicies();
        }, 1500);
      } catch (err: unknown) {
        setPaymentModal(false);
        setPaymentStep("idle");
        setError(err instanceof Error ? err.message : "Payment failed");
      }
    }, 2500);
  }

  function closePaymentModal() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPaymentModal(false);
    setPaymentStep("idle");
  }

  const activePolicy = policies.find((p) => p.status === "Active");
  const premium = quote?.breakdown.finalPremium ?? 0;
  const coverage = quote?.breakdown.coverageCeiling ?? 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* UPI Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass rounded-2xl border border-white/10 w-full max-w-sm p-6 space-y-5 relative">

            {paymentStep !== "done" && (
              <button onClick={closePaymentModal} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="font-bold text-white">GigGuard Weekly Premium</div>
                <div className="text-xs text-slate-400">Powered by Razorpay · Sandbox Mode</div>
              </div>
            </div>

            {/* Amount */}
            <div className="glass rounded-xl border border-white/5 p-4 text-center">
              <div className="text-3xl font-black text-white flex items-center justify-center gap-1">
                <IndianRupee className="w-6 h-6" />{premium}
              </div>
              <div className="text-xs text-slate-500 mt-1">Coverage up to Rs. {coverage} · 5 triggers</div>
            </div>

            {/* Steps */}
            {paymentStep === "qr" && (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    {/* Simulated QR code grid */}
                    <div className="w-36 h-36 bg-white rounded-xl p-2 grid grid-cols-7 gap-0.5">
                      {Array.from({ length: 49 }).map((_, i) => (
                        <div key={i} className={`rounded-sm ${
                          [0,1,2,3,4,5,6,7,13,14,20,21,27,28,34,35,41,42,43,44,45,46,47,48,8,15,22,29,36,10,17,24,31,38,11,18,25,32].includes(i)
                            ? "bg-black" : "bg-white"
                        }`} />
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white rounded-lg p-1">
                        <QrCode className="w-8 h-8 text-black" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-sm font-medium text-slate-300">Scan with any UPI app</div>
                  <div className="text-xs text-slate-500">GPay · PhonePe · Paytm · BHIM</div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Waiting for payment confirmation...
                </div>
              </div>
            )}

            {paymentStep === "processing" && (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-400 animate-spin" />
                  <div className="text-sm font-medium text-slate-300">Verifying payment...</div>
                  <div className="text-xs text-slate-500">Confirming with Razorpay gateway</div>
                </div>
                <div className="space-y-2">
                  {["Payment received", "Signature verified", "Activating policy..."].map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {paymentStep === "done" && (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div className="text-lg font-bold text-emerald-400">Payment Successful!</div>
                  <div className="text-xs text-slate-500 text-center">You're protected for the next 7 days</div>
                </div>
                <div className="glass rounded-xl border border-emerald-500/20 p-3 space-y-2 text-xs">
                  {[
                    ["Amount paid", `Rs. ${premium}`],
                    ["Coverage", `Rs. ${coverage}`],
                    ["Transaction ID", paymentTxnId],
                    ["Order ID", paymentOrderId.slice(0, 20) + "..."],
                    ["Payment method", "UPI (Simulated)"],
                    ["Status", "✓ Confirmed"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-slate-500">{k}</span>
                      <span className="font-mono text-slate-300 text-right">{v}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={closePaymentModal}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition-all"
                >
                  View My Policy
                </button>
              </div>
            )}

            {/* Razorpay branding */}
            {paymentStep !== "done" && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 pt-1 border-t border-white/5">
                <Lock className="w-3 h-3" /> Secured by Razorpay · Test Environment
              </div>
            )}
          </div>
        </div>
      )}
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

              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                onClick={startPayment}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-xl transition-all hover:scale-105 text-lg flex items-center justify-center gap-2"
              >
                <Smartphone className="w-5 h-5" />
                Pay Rs. {quote.breakdown.finalPremium} via UPI · Get Protected
              </button>
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600">
                <Lock className="w-3 h-3" /> Razorpay sandbox simulation · No real charges
              </div>
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
