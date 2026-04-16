"use client";
import { useState, useEffect } from "react";
import { getSession, DEMO_WORKER_ID } from "@/lib/client-auth";
import { Claim, TriggerType } from "@/lib/types";
import TriggerBadge from "@/components/TriggerBadge";
import {
  AlertTriangle, CheckCircle, Clock, Zap, Shield, IndianRupee,
  CloudRain, Wind, Thermometer, TrendingDown, ZapOff, Activity,
} from "lucide-react";

const TRIGGER_OPTIONS: { type: TriggerType; icon: React.ComponentType<{ className?: string }>; desc: string; color: string; iconColor: string }[] = [
  { type: "Rainfall", icon: CloudRain, desc: ">35mm/hr for 90min", color: "text-blue-400", iconColor: "text-blue-400" },
  { type: "AQI", icon: Wind, desc: "NAQI >300 + advisory", color: "text-purple-400", iconColor: "text-purple-400" },
  { type: "Zone Shutdown", icon: ZapOff, desc: "Official curfew 4+hrs", color: "text-red-400", iconColor: "text-red-400" },
  { type: "Demand Collapse", icon: TrendingDown, desc: ">50% drop for 3hrs", color: "text-orange-400", iconColor: "text-orange-400" },
  { type: "Extreme Heat", icon: Thermometer, desc: ">44°C between 11–4PM", color: "text-amber-400", iconColor: "text-amber-400" },
];

export default function ClaimsPage() {
  const workerId = typeof window !== "undefined"
    ? getSession()?.workerId || DEMO_WORKER_ID
    : DEMO_WORKER_ID;

  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType | "">("");

  useEffect(() => { loadClaims(); }, []);

  async function loadClaims() {
    setLoading(true);
    const res = await fetch(`/api/claims?workerId=${workerId}`);
    const data = await res.json();
    setClaims(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function runTriggerCheck() {
    setTriggering(true); setMessage(""); setError("");
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, simulatedTrigger: selectedTrigger || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.claims?.length > 0) {
        const approved = data.claims.filter((c: Claim) => c.status === "Approved");
        const total = approved.reduce((s: number, c: Claim) => s + c.approvedAmount, 0);
        setMessage(`${data.claims.length} trigger(s) confirmed! ${approved.length} auto-approved — Rs. ${total} payout initiated via UPI.`);
      } else {
        setMessage(data.message || "No thresholds breached. System continues monitoring.");
      }
      loadClaims();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Evaluation failed");
    } finally { setTriggering(false); }
  }

  const totalApproved = claims.filter((c) => c.status === "Approved").reduce((s, c) => s + c.approvedAmount, 0);
  const totalClaims = claims.length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-amber-400" /> Claims Management
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Parametric — all claims triggered automatically by measured conditions, not manual reporting
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Claims", value: totalClaims.toString(), color: "text-white" },
          { label: "Approved", value: claims.filter((c) => c.status === "Approved").length.toString(), color: "text-emerald-400" },
          { label: "Total Payout", value: `Rs. ${totalApproved.toLocaleString()}`, color: "text-emerald-400" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl border border-white/5 p-5 text-center card-3d">
            <div className={`text-2xl font-black ${s.color} flex items-center justify-center gap-1`}>
              {s.label === "Total Payout" && <IndianRupee className="w-5 h-5" />}{s.value}
            </div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Trigger Thresholds Visual */}
      <div className="glass rounded-xl border border-white/5 p-5">
        <h2 className="font-bold text-white mb-3 text-sm">5 Parametric Trigger Thresholds</h2>
        <div className="grid grid-cols-5 gap-2">
          {TRIGGER_OPTIONS.map((t) => {
            const TIcon = t.icon;
            return (
              <div key={t.type} className="glass rounded-lg p-3 text-center border border-white/5">
                <TIcon className={`w-5 h-5 ${t.iconColor} mx-auto mb-1`} />
                <div className="text-xs font-medium text-slate-300">{t.type}</div>
                <div className="text-xs text-slate-500 mt-0.5">{t.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trigger Simulation Panel */}
      <div className="glass rounded-xl border border-amber-500/20 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h2 className="font-bold text-white">Parametric Trigger Evaluation</h2>
          <span className="ml-auto text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
            Demo Mode
          </span>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">
          In production, the system evaluates triggers every 30 minutes using live weather, AQI, and peer activity APIs.
          Select a trigger below to simulate it for demo purposes, or run auto-detect from live zone data.
        </p>

        {/* Trigger selector */}
        <div>
          <div className="text-xs text-slate-500 mb-2">Simulate specific trigger (optional)</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button" onClick={() => setSelectedTrigger("")}
              className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                selectedTrigger === ""
                  ? "bg-white/10 border-white/20 text-white"
                  : "glass border-white/5 text-slate-400 hover:border-white/10"
              }`}
            >
              Auto-detect
            </button>
            {TRIGGER_OPTIONS.map((t) => {
              const TIcon = t.icon;
              return (
              <button
                key={t.type} type="button" onClick={() => setSelectedTrigger(t.type)}
                className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                  selectedTrigger === t.type
                    ? "bg-white/10 border-white/20 text-white"
                    : "glass border-white/5 text-slate-400 hover:border-white/10"
                }`}
              >
                <TIcon className={`w-3.5 h-3.5 ${t.color}`} />
                {t.type}
              </button>
            );})}

          </div>
        </div>

        {/* Fraud detection explanation */}
        <div className="glass rounded-lg border border-white/5 p-3 text-xs text-slate-400 space-y-1">
          <div className="text-slate-300 font-semibold mb-1">Fraud Detection (runs on each claim):</div>
          <div><strong className="text-slate-300">Layer 1 — Rules:</strong> GPS zone mismatch · GPS velocity spoofing (≥80 km/h = impossible for bike) · Activity during claim (&gt;60% normal = flag) · Historical weather baseline (claim vs 5yr IMD P99)</div>
          <div><strong className="text-slate-300">Layer 2 — ML:</strong> Isolation Forest (50 trees, path-length anomaly score) · Rolling Z-score vs 30 most recent zone payouts · Adverse selection pattern detection</div>
        </div>

        {message && (
          <div className={`flex items-start gap-2 p-4 rounded-xl text-sm border ${
            message.includes("payout") || message.includes("approved")
              ? "glass-emerald border-emerald-500/20 text-emerald-300"
              : "glass border-blue-500/20 text-blue-300"
          }`}>
            {message.includes("payout") ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <Shield className="w-5 h-5 flex-shrink-0" />}
            {message}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 glass-red border border-red-500/20 rounded-xl p-3 text-sm text-red-300">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}

        <button
          onClick={runTriggerCheck} disabled={triggering}
          className="w-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 disabled:opacity-50 text-amber-300 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 hover:border-amber-500/50"
        >
          <Zap className="w-4 h-4" />
          {triggering ? "Evaluating triggers..." : "Run Parametric Trigger Check"}
        </button>
      </div>

      {/* Claims History */}
      <div className="space-y-3">
        <h2 className="font-bold text-white">Claim History</h2>
        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => <div key={i} className="animate-pulse h-28 glass rounded-xl" />)}
          </div>
        ) : claims.length === 0 ? (
          <div className="glass rounded-xl border border-white/5 p-8 text-center text-slate-500 text-sm">
            No claims yet. Run a trigger check above to generate claims when thresholds are breached.
          </div>
        ) : claims.map((c) => <ClaimCard key={c.id} claim={c} />)}
      </div>
    </div>
  );
}

function ClaimCard({ claim }: { claim: Claim }) {
  const statusConfig = {
    Approved: { icon: CheckCircle, color: "text-emerald-400", bg: "glass-emerald border-emerald-500/20" },
    "Under Review": { icon: Clock, color: "text-amber-400", bg: "glass-amber border-amber-500/20" },
    Rejected: { icon: AlertTriangle, color: "text-red-400", bg: "glass-red border-red-500/20" },
    Pending: { icon: Clock, color: "text-blue-400", bg: "glass border-blue-500/20" },
  }[claim.status];

  const { icon: Icon, color, bg } = statusConfig;
  const isApproved = claim.status === "Approved";
  const payoutId = `pout_sim_${new Date(claim.createdAt).getTime()}`;

  const triggerUnit =
    claim.triggerType === "Rainfall" ? "mm/hr"
    : claim.triggerType === "AQI" ? " NAQI"
    : claim.triggerType === "Extreme Heat" ? "°C"
    : "%";

  return (
    <div className={`rounded-xl border p-5 space-y-3 ${bg}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <TriggerBadge type={claim.triggerType} active={isApproved} />
              <span className={`text-xs font-semibold ${color}`}>{claim.status}</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {new Date(claim.createdAt).toLocaleString("en-IN")}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-black flex items-center gap-0.5 ${color}`}>
            <IndianRupee className="w-4 h-4" />{claim.approvedAmount}
          </div>
          <div className="text-xs text-slate-500">of Rs. {claim.claimedAmount} claimed</div>
        </div>
      </div>

      {/* Trigger data */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        {[
          { label: "Trigger value", value: `${claim.triggerData.value}${triggerUnit}` },
          { label: "Duration", value: `${claim.triggerData.duration}hrs` },
          { label: "Peer signal", value: `${claim.triggerData.peerCorroboration}%` },
          { label: "GPS", value: claim.triggerData.gpsConfirmed ? "✓ Confirmed" : "✗ Mismatch" },
        ].map((d) => (
          <div key={d.label} className="glass rounded-lg p-2 text-center border border-white/5">
            <div className="font-semibold text-slate-200">{d.value}</div>
            <div className="text-slate-500">{d.label}</div>
          </div>
        ))}
      </div>

      {/* Payout receipt — shown only for approved claims */}
      {isApproved && (
        <div className="glass rounded-xl border border-emerald-500/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5" /> Instant Payout Receipt
            </span>
            <span className="text-xs text-slate-500 font-mono">{payoutId}</span>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            {[
              { step: "Parametric threshold breached", detail: `${claim.triggerType} trigger confirmed via ${claim.triggerData.source}`, done: true },
              { step: "Fraud check passed", detail: `Score ${claim.fraudScore}/100 — GPS ✓ · Peer signal ${claim.triggerData.peerCorroboration}% · Isolation Forest clear`, done: true },
              { step: "Claim auto-approved", detail: `Rs. ${claim.approvedAmount} approved — no manual adjudication required`, done: true },
              { step: "UPI payout initiated", detail: `Rs. ${claim.approvedAmount} → worker UPI account (Razorpay simulated)`, done: true },
              { step: "Funds credited", detail: "Typically within 2–4 hours on production Razorpay Payouts API", done: true },
            ].map((s, i) => (
              <div key={i} className="flex gap-3 text-xs">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
                  </div>
                  {i < 4 && <div className="w-px flex-1 bg-emerald-500/20 my-0.5" />}
                </div>
                <div className="pb-2">
                  <div className="font-semibold text-emerald-300">{s.step}</div>
                  <div className="text-slate-500">{s.detail}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-emerald-500/20">
            <span className="text-xs text-slate-500">Total time to payout</span>
            <span className="text-xs font-bold text-emerald-400">&lt; 30 seconds (automated)</span>
          </div>
        </div>
      )}

      {/* Fraud info */}
      <div className="flex items-center gap-1.5 text-xs">
        <Shield className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-slate-500">Fraud Score:</span>
        <span className={`font-bold ${claim.fraudScore < 30 ? "text-emerald-400" : claim.fraudScore < 60 ? "text-amber-400" : "text-red-400"}`}>
          {claim.fraudScore}/100
        </span>
        <span className="text-slate-600">· Source: {claim.triggerData.source}</span>
      </div>

      {claim.fraudFlags.length > 0 && (
        <div className="glass rounded-lg border border-amber-500/20 p-2.5 space-y-1">
          {claim.fraudFlags.map((f, i) => (
            <div key={i} className="text-xs text-amber-300 flex gap-1.5">
              <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" /> {f}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
