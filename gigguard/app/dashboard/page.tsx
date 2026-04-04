"use client";
import { useState, useEffect } from "react";
import { getSession, DEMO_WORKER_ID } from "@/lib/client-auth";
import { Worker, Policy, Claim, ZoneRiskData, TriggerType } from "@/lib/types";
import RiskBadge from "@/components/RiskBadge";
import TriggerBadge from "@/components/TriggerBadge";
import MetricGauge from "@/components/MetricGauge";
import Link from "next/link";
import {
  Shield, Zap, AlertTriangle, CheckCircle, IndianRupee,
  CloudRain, Wind, Thermometer, TrendingDown, ChevronRight,
  Users, Activity, Star, ArrowRight, Brain, MapPin,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";

const earningsData = [
  { day: "Mon", earnings: 750, baseline: 685 },
  { day: "Tue", earnings: 620, baseline: 685 },
  { day: "Wed", earnings: 200, baseline: 685, disrupted: true },
  { day: "Thu", earnings: 810, baseline: 685 },
  { day: "Fri", earnings: 900, baseline: 685 },
  { day: "Sat", earnings: 480, baseline: 685 },
  { day: "Sun", earnings: 685, baseline: 685 },
];

const platformData = [
  { platform: "Blinkit", earnings: 2800, hours: 35 },
  { platform: "Zepto", earnings: 2000, hours: 25 },
];

const recommendations = [
  { text: "Shift Tuesday afternoon to morning — AQI forecast elevated after 2 PM", action: "Adjust schedule", urgency: "amber" },
  { text: "Zone 4 (Koramangala) has 70% disruption probability Wednesday — Zone 7 is safer", action: "Switch zone", urgency: "red" },
  { text: "Renew coverage before Sunday — monsoon probability spikes next week", action: "Renew now", urgency: "emerald" },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="glass border border-white/10 rounded-lg p-3 text-xs">
        <div className="text-slate-400 mb-1">{label}</div>
        {payload.map((p) => (
          <div key={p.name} className="flex justify-between gap-4">
            <span className="text-slate-400">{p.name}</span>
            <span className="text-white font-bold">Rs. {p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [zoneData, setZoneData] = useState<ZoneRiskData | null>(null);
  const [loading, setLoading] = useState(true);

  const workerId =
    typeof window !== "undefined"
      ? getSession()?.workerId || DEMO_WORKER_ID
      : DEMO_WORKER_ID;

  useEffect(() => {
    async function load() {
      try {
        const [wRes, pRes, cRes] = await Promise.all([
          fetch("/api/workers"),
          fetch(`/api/policies?workerId=${workerId}`),
          fetch(`/api/claims?workerId=${workerId}`),
        ]);
        const workers: Worker[] = await wRes.json();
        const w = workers.find((x) => x.id === workerId) || workers[0];
        setWorker(w);
        setPolicies(await pRes.json());
        setClaims(await cRes.json());
        if (w) {
          const zdRes = await fetch(`/api/zone-data?zone=${w.zone}`);
          setZoneData(await zdRes.json());
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [workerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const activePolicy = policies.find((p) => p.status === "Active");
  const totalPaid = claims.filter((c) => c.status === "Approved").reduce((s, c) => s + c.approvedAmount, 0);
  const totalPremiums = policies.reduce((s, p) => s + p.premium, 0);
  const thisWeekEarnings = earningsData.reduce((s, d) => s + d.earnings, 0);
  const weekBaseline = 685 * 7;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">
            Welcome back, <span className="text-emerald-400">{worker?.name?.split(" ")[0] || "Rajan"}</span>
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-slate-400 text-sm flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {worker?.zone}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 text-sm">{worker?.platforms?.join(", ")}</span>
            {worker && <RiskBadge level={worker.riskLevel} />}
          </div>
        </div>
        <Link
          href="/policies"
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-4 py-2 rounded-xl text-sm transition-all hover:scale-105"
        >
          <Shield className="w-4 h-4" /> {activePolicy ? "View Policy" : "Get Protected"}
        </Link>
      </div>

      {/* Active Policy Banner */}
      {activePolicy ? (
        <div className="glass-emerald rounded-xl border border-emerald-500/30 p-4 flex items-center justify-between glow-emerald">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Shield className="w-8 h-8 text-emerald-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-emerald-300">Protected this week · Ends {activePolicy.weekEnd}</div>
              <div className="text-sm text-slate-400">
                Paid <strong className="text-white">Rs. {activePolicy.premium}</strong> ·
                Coverage up to <strong className="text-emerald-400">Rs. {activePolicy.coverageCeiling}</strong> ·
                5 triggers monitored
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 max-w-xs">
            {(["Rainfall", "AQI", "Zone Shutdown", "Demand Collapse", "Extreme Heat"] as TriggerType[]).slice(0, 3).map((t) => (
              <TriggerBadge key={t} type={t} active={zoneData?.activeTriggers?.includes(t)} />
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-amber rounded-xl border border-amber-500/30 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-amber-400" />
            <div>
              <div className="font-bold text-amber-300">No active policy</div>
              <div className="text-sm text-slate-400">You are unprotected from income disruptions this week.</div>
            </div>
          </div>
          <Link href="/policies" className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-xl text-sm">
            Get Protected
          </Link>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassKPI
          label="This Week Earnings"
          value={`Rs. ${thisWeekEarnings.toLocaleString()}`}
          delta={`${Math.round(((thisWeekEarnings - weekBaseline) / weekBaseline) * 100)}% vs baseline`}
          negative={thisWeekEarnings < weekBaseline}
          icon={IndianRupee}
          color="emerald"
        />
        <GlassKPI
          label="Coverage Ceiling"
          value={`Rs. ${activePolicy?.coverageCeiling || 810}`}
          delta="Active policy"
          icon={Shield}
          color="blue"
        />
        <GlassKPI
          label="Payouts Received"
          value={`Rs. ${totalPaid.toLocaleString()}`}
          delta={`${claims.filter((c) => c.status === "Approved").length} claims approved`}
          icon={Zap}
          color="violet"
        />
        <GlassKPI
          label="Loss Ratio"
          value={totalPremiums > 0 ? `${((totalPaid / totalPremiums) * 100).toFixed(0)}%` : "0%"}
          delta={`Paid Rs. ${totalPremiums} · Got Rs. ${totalPaid}`}
          icon={Activity}
          color="amber"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Earnings Chart */}
        <div className="md:col-span-2 glass rounded-xl border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">Weekly Earnings vs Baseline</h2>
            <span className="text-xs text-slate-500">Wed = AQI disruption (payout triggered)</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={earningsData}>
              <defs>
                <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#475569" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#475569" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="baseline" stroke="#475569" strokeWidth={1} strokeDasharray="4 4" fill="url(#baseGrad)" name="Baseline" />
              <Area type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} fill="url(#earnGrad)" name="Earnings" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Behavioral Score */}
        <div className="glass rounded-xl border border-white/5 p-5 flex flex-col items-center justify-center gap-4">
          <div className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Behavioral Score</div>
          <MetricGauge
            value={worker?.behavioralScore || 72}
            label="score"
            color="#10b981"
            size={140}
          />
          <div className="text-center">
            <div className="text-xs text-emerald-400 font-medium">10% premium discount</div>
            <div className="text-xs text-slate-500 mt-1">Based on AI recommendation compliance</div>
          </div>
          <div className="w-full space-y-1.5 text-xs">
            {[
              { label: "Zone Consistency", pct: 85 },
              { label: "Recommendation Follow", pct: 72 },
              { label: "Platform Regularity", pct: 68 },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>{s.label}</span><span>{s.pct}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Multi-Platform Earnings */}
        <div className="glass rounded-xl border border-white/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-blue-400" />
            <h2 className="font-bold text-white text-sm">Multi-Platform Aggregation</h2>
          </div>
          <div className="space-y-3 mb-4">
            {platformData.map((p) => (
              <div key={p.platform}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{p.platform}</span>
                  <span className="text-white font-bold">Rs. {p.earnings.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                    style={{ width: `${(p.earnings / 5000) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{p.hours} hrs/week</div>
              </div>
            ))}
          </div>
          <div className="glass-emerald rounded-lg p-3 border border-emerald-500/20">
            <div className="text-xs text-slate-400">Total Aggregated Income</div>
            <div className="text-xl font-black text-emerald-400">Rs. 4,800 / week</div>
            <div className="text-xs text-slate-500 mt-0.5">Covered across all platforms</div>
          </div>
          <ResponsiveContainer width="100%" height={100} className="mt-3">
            <BarChart data={platformData} barSize={30}>
              <XAxis dataKey="platform" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="earnings" name="Earnings" radius={[4, 4, 0, 0]} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Live Zone Conditions */}
        <div className="glass rounded-xl border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h2 className="font-bold text-white text-sm">Live Zone — {worker?.zone}</h2>
            </div>
            <Link href="/map" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              3D Map <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {zoneData ? (
            <div className="space-y-3">
              {[
                { Icon: CloudRain, label: "Rainfall", value: zoneData.rainfallMm, max: 80, threshold: 35, unit: "mm/hr", color: "text-blue-400", bar: "bg-blue-500" },
                { Icon: Wind, label: "AQI", value: zoneData.aqiIndex, max: 500, threshold: 300, unit: "", color: "text-purple-400", bar: "bg-purple-500" },
                { Icon: Thermometer, label: "Temperature", value: zoneData.tempCelsius, max: 50, threshold: 44, unit: "°C", color: "text-amber-400", bar: "bg-amber-500" },
                { Icon: TrendingDown, label: "Demand Drop", value: zoneData.demandDropPct, max: 100, threshold: 50, unit: "%", color: "text-orange-400", bar: "bg-orange-500" },
              ].map((c) => {
                const breached = c.value >= c.threshold;
                const pct = Math.min((c.value / c.max) * 100, 100);
                return (
                  <div key={c.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`flex items-center gap-1 ${c.color}`}>
                        <c.Icon className="w-3 h-3" /> {c.label}
                      </span>
                      <span className={breached ? "text-red-400 font-bold" : "text-slate-300"}>
                        {c.value}{c.unit} {breached && "⚠ TRIGGERED"}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${breached ? "bg-red-500 animate-pulse" : c.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {zoneData.activeTriggers.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <div className="text-xs text-slate-500 mb-2">Active Triggers</div>
                  <div className="flex flex-wrap gap-1.5">
                    {zoneData.activeTriggers.map((t) => <TriggerBadge key={t} type={t} active />)}
                  </div>
                </div>
              )}
              <div className="mt-2 text-xs text-slate-500 flex justify-between">
                <span>Peer signal: <strong className="text-slate-300">{zoneData.peerCorroboration}% workers affected</strong></span>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-sm">Loading...</div>
          )}
        </div>

        {/* AI Behavioral Recommendations */}
        <div className="glass rounded-xl border border-white/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-violet-400" />
            <h2 className="font-bold text-white text-sm">AI Recommendations</h2>
          </div>
          <div className="space-y-3">
            {recommendations.map((r, i) => (
              <div
                key={i}
                className={`rounded-lg p-3 border text-xs ${
                  r.urgency === "red"
                    ? "glass-red border-red-500/20"
                    : r.urgency === "amber"
                    ? "glass-amber border-amber-500/20"
                    : "glass-emerald border-emerald-500/20"
                }`}
              >
                <p className="text-slate-300 leading-relaxed mb-2">{r.text}</p>
                <button
                  className={`font-medium flex items-center gap-1 ${
                    r.urgency === "red" ? "text-red-400" : r.urgency === "amber" ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  {r.action} <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Star className="w-3 h-3 text-amber-400" />
              Follow all 3 → earn extra compliance points this week
            </div>
          </div>
        </div>
      </div>

      {/* Recent Claims */}
      <div className="glass rounded-xl border border-white/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white">Recent Claims</h2>
          <Link href="/claims" className="text-emerald-400 text-sm hover:text-emerald-300 flex items-center gap-1">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {claims.length === 0 ? (
          <div className="text-slate-500 text-sm text-center py-6">
            No claims yet. Trigger evaluation runs automatically with your active policy.
          </div>
        ) : (
          <div className="space-y-2">
            {claims.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  {c.status === "Approved" ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  )}
                  <div>
                    <TriggerBadge type={c.triggerType} active={c.status === "Approved"} />
                    <div className="text-xs text-slate-500 mt-0.5">
                      {new Date(c.createdAt).toLocaleDateString("en-IN")} · Fraud score: {c.fraudScore}/100
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white flex items-center gap-0.5">
                    <IndianRupee className="w-3.5 h-3.5" />{c.approvedAmount.toLocaleString()}
                  </div>
                  <span className={`text-xs font-medium ${c.status === "Approved" ? "text-emerald-400" : "text-amber-400"}`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actuarial summary */}
      <div className="glass rounded-xl border border-white/5 p-5">
        <div className="text-xs text-slate-500 uppercase tracking-widest mb-4">Actuarial Summary</div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
          {[
            { label: "Premiums Paid", value: `Rs. ${totalPremiums}` },
            { label: "Payouts Received", value: `Rs. ${totalPaid}`, color: "text-emerald-400" },
            { label: "Loss Ratio", value: totalPremiums > 0 ? `${((totalPaid / totalPremiums) * 100).toFixed(0)}%` : "—" },
            { label: "Policies Taken", value: policies.length.toString() },
            { label: "Claims Filed", value: claims.length.toString() },
            { label: "Fraud Score (avg)", value: claims.length > 0 ? `${Math.round(claims.reduce((s, c) => s + c.fraudScore, 0) / claims.length)}/100` : "—" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-lg p-3">
              <div className={`text-lg font-black ${s.color || "text-white"}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GlassKPI({
  label, value, delta, negative = false, icon: Icon, color,
}: {
  label: string; value: string; delta: string; negative?: boolean; icon: React.ComponentType<{ className?: string }>; color: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-400 bg-emerald-500/10",
    blue: "text-blue-400 bg-blue-500/10",
    violet: "text-violet-400 bg-violet-500/10",
    amber: "text-amber-400 bg-amber-500/10",
  };
  const [iconColor, iconBg] = (colorMap[color] || "text-slate-400 bg-slate-500/10").split(" ");
  return (
    <div className="glass rounded-xl border border-white/5 p-5 card-3d">
      <div className={`inline-flex p-2 rounded-lg ${iconBg} mb-3`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-xl font-black text-white">{value}</div>
      <div className={`text-xs mt-1 ${negative ? "text-red-400" : "text-emerald-400"}`}>{delta}</div>
    </div>
  );
}
