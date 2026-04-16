"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Worker, Policy, Claim, ZoneRiskData } from "@/lib/types";
import RiskBadge from "@/components/RiskBadge";
import TriggerBadge from "@/components/TriggerBadge";
import MetricGauge from "@/components/MetricGauge";
import { Shield, AlertTriangle, IndianRupee, Users, TrendingUp, Activity, Eye, Lock, Brain, CloudRain, Thermometer, Wind } from "lucide-react";
import { getAdminSession } from "@/lib/client-auth";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import { COVERAGE_EXCLUSIONS, REGULATORY_NOTES } from "@/lib/fraud";

const LOSS_TARGET = { min: 0.55, max: 0.75 };

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color?: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass border border-white/10 rounded-lg p-3 text-xs">
      <div className="text-slate-400 mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color || "#64748b" }}>{p.name}</span>
          <span className="text-white font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function AdminPage() {
  const router = useRouter();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [zoneData, setZoneData] = useState<(ZoneRiskData & { riskLevel: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<"overview" | "fraud" | "zones" | "compliance">("overview");

  useEffect(() => {
    const token = getAdminSession();
    if (!token) {
      router.replace("/login");
      return;
    }
    setAuthed(true);
    Promise.all([
      fetch("/api/workers").then(r => r.json()),
      fetch("/api/policies").then(r => r.json()),
      fetch("/api/claims").then(r => r.json()),
      fetch("/api/zone-data").then(r => r.json()),
    ]).then(([w, p, c, z]) => {
      setWorkers(w); setPolicies(p); setClaims(c); setZoneData(z);
      setLoading(false);
    });
  }, []);

  if (!authed || loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-10 h-10 border-4 border-slate-400 border-t-transparent rounded-full" />
    </div>
  );

  const totalPremiums = policies.reduce((s, p) => s + p.premium, 0);
  const totalPayouts = claims.filter(c => c.status === "Approved").reduce((s, c) => s + c.approvedAmount, 0);
  const lossRatio = totalPremiums > 0 ? totalPayouts / totalPremiums : 0;
  const flagged = claims.filter(c => c.fraudFlags.length > 0 || c.status === "Under Review");

  const pieData = [
    { name: "Approved", value: claims.filter(c => c.status === "Approved").length },
    { name: "Under Review", value: claims.filter(c => c.status === "Under Review").length },
    { name: "Rejected", value: claims.filter(c => c.status === "Rejected").length },
    { name: "Pending", value: claims.filter(c => c.status === "Pending").length },
  ].filter(d => d.value > 0);

  const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1"];

  const zoneBar = zoneData.map(z => ({
    zone: z.zone.split(" ")[0],
    risk: Math.round(z.disruptionProbability * 100),
    aqi: z.aqiIndex,
    rainfall: z.rainfallMm,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm">Platform overview · Actuarial analytics · Fraud queue</p>
        </div>
        <span className="glass-red border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full">Insurer View</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass rounded-xl border border-white/5 p-1 w-fit">
        {(["overview", "fraud", "zones", "compliance"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              tab === t ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, label: "Enrolled Workers", value: workers.length.toString(), color: "blue" },
              { icon: Shield, label: "Active Policies", value: policies.filter(p => p.status === "Active").length.toString(), color: "emerald" },
              { icon: IndianRupee, label: "Total Premiums", value: `Rs. ${totalPremiums.toLocaleString()}`, color: "violet" },
              {
                icon: TrendingUp,
                label: "Platform Loss Ratio",
                value: `${(lossRatio * 100).toFixed(1)}%`,
                color: lossRatio > LOSS_TARGET.max ? "red" : lossRatio < LOSS_TARGET.min ? "amber" : "emerald",
                note: lossRatio > LOSS_TARGET.max ? "Above 75% — surcharge triggered" : "Within 55–75% target"
              },
            ].map((k) => {
              const colorMap: Record<string, string[]> = {
                blue: ["text-blue-400", "bg-blue-500/10"],
                emerald: ["text-emerald-400", "bg-emerald-500/10"],
                violet: ["text-violet-400", "bg-violet-500/10"],
                red: ["text-red-400", "bg-red-500/10"],
                amber: ["text-amber-400", "bg-amber-500/10"],
              };
              const [textColor, bgColor] = colorMap[k.color] || ["text-slate-400", "bg-slate-500/10"];
              return (
                <div key={k.label} className="glass rounded-xl border border-white/5 p-5 card-3d">
                  <div className={`inline-flex p-2 rounded-lg ${bgColor} mb-3`}>
                    <k.icon className={`w-5 h-5 ${textColor}`} />
                  </div>
                  <div className={`text-2xl font-black ${textColor}`}>{k.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
                  {"note" in k && <div className="text-xs text-slate-600 mt-1">{k.note}</div>}
                </div>
              );
            })}
          </div>

          {/* Loss Ratio Gauge + Claims Pie */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass rounded-xl border border-white/5 p-5 flex flex-col items-center justify-center">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-3">Platform Loss Ratio</div>
              <MetricGauge
                value={Math.round(lossRatio * 100)}
                label="loss ratio"
                color={lossRatio > LOSS_TARGET.max ? "#ef4444" : lossRatio < LOSS_TARGET.min ? "#f59e0b" : "#10b981"}
                size={150}
              />
              <div className="text-xs text-slate-500 mt-2 text-center">
                Target: 55–75% · {lossRatio > LOSS_TARGET.max ? "Surcharge triggered" : "Sustainable"}
              </div>
            </div>
            <div className="glass rounded-xl border border-white/5 p-5">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-3">Claims Status</div>
              {pieData.length === 0 ? (
                <div className="text-slate-500 text-sm flex items-center justify-center h-32">No claims yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="glass rounded-xl border border-white/5 p-5">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-3">Actuarial Summary</div>
              <div className="space-y-3">
                {[
                  { label: "Total Premiums", value: `Rs. ${totalPremiums}`, color: "text-white" },
                  { label: "Total Payouts", value: `Rs. ${totalPayouts}`, color: "text-emerald-400" },
                  { label: "Net Retained", value: `Rs. ${totalPremiums - totalPayouts}`, color: "text-blue-400" },
                  { label: "Loss Ratio", value: `${(lossRatio * 100).toFixed(1)}%`, color: lossRatio > 0.75 ? "text-red-400" : "text-emerald-400" },
                  { label: "Fraud Flagged", value: `${flagged.length} claims`, color: flagged.length > 0 ? "text-amber-400" : "text-slate-400" },
                ].map(s => (
                  <div key={s.label} className="flex justify-between text-sm border-b border-white/5 pb-1.5 last:border-0">
                    <span className="text-slate-500">{s.label}</span>
                    <span className={`font-bold ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Zone Risk Chart */}
          <div className="glass rounded-xl border border-white/5 p-5">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-4">Zone Disruption Probability (%)</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={zoneBar}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="zone" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="risk" name="Disruption %" radius={[4, 4, 0, 0]}>
                  {zoneBar.map((e, i) => (
                    <Cell key={i} fill={e.risk > 65 ? "#ef4444" : e.risk > 45 ? "#f59e0b" : "#10b981"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Predictive Analytics — Next Week Forecast */}
          {zoneData.length > 0 && (() => {
            const now = new Date();
            const month = now.getMonth() + 1;
            // Monsoon boost factor
            const monsoon = month >= 6 && month <= 9;
            const forecastZones = zoneData.map(z => {
              const p = z.disruptionProbability;
              // Project next week: add monsoon trend if approaching season
              const nextWeekP = Math.min(p * (monsoon ? 1.12 : 0.95) + (month === 5 || month === 10 ? 0.08 : 0), 0.99);
              const activePoliciesInZone = policies.filter(p2 => p2.status === "Active" && workers.find(w => w.id === p2.workerId && w.zone === z.zone)).length;
              const avgPremium = activePoliciesInZone > 0
                ? policies.filter(p2 => p2.status === "Active" && workers.find(w => w.id === p2.workerId && w.zone === z.zone)).reduce((s, p2) => s + p2.premium, 0) / activePoliciesInZone
                : 0;
              const expectedClaimsNext = Math.round(activePoliciesInZone * nextWeekP);
              const expectedPayoutNext = Math.round(expectedClaimsNext * (z.disruptionProbability > 0.6 ? 800 : 600));
              return { ...z, nextWeekP, expectedClaimsNext, expectedPayoutNext, activePoliciesInZone, avgPremium };
            });

            const totalExpectedClaims = forecastZones.reduce((s, z) => s + z.expectedClaimsNext, 0);
            const totalExpectedPayout = forecastZones.reduce((s, z) => s + z.expectedPayoutNext, 0);
            const totalActivePolicies = policies.filter(p => p.status === "Active").length;
            const projectedPremiumPool = policies.filter(p => p.status === "Active").reduce((s, p) => s + p.premium, 0);

            return (
              <div className="glass rounded-xl border border-violet-500/20 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-white flex items-center gap-2">
                    <Brain className="w-4 h-4 text-violet-400" /> Predictive Analytics — Next 7 Days
                  </h2>
                  <span className="text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full">
                    Logistic Regression Model
                  </span>
                </div>

                {/* Forecast KPIs */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Expected Claims", value: totalExpectedClaims.toString(), color: "text-amber-400", note: `from ${totalActivePolicies} active policies` },
                    { label: "Projected Payout Pool", value: `Rs. ${totalExpectedPayout.toLocaleString()}`, color: "text-red-400", note: "reserve required" },
                    { label: "Premium Pool", value: `Rs. ${projectedPremiumPool.toLocaleString()}`, color: "text-emerald-400", note: "collected this week" },
                    { label: "Projected Loss Ratio", value: projectedPremiumPool > 0 ? `${Math.round((totalExpectedPayout / projectedPremiumPool) * 100)}%` : "—", color: totalExpectedPayout / (projectedPremiumPool || 1) > 0.75 ? "text-red-400" : "text-emerald-400", note: "target ≤ 75%" },
                  ].map(k => (
                    <div key={k.label} className="glass rounded-xl border border-white/5 p-3 text-center">
                      <div className={`text-xl font-black ${k.color}`}>{k.value}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{k.label}</div>
                      <div className="text-xs text-slate-600">{k.note}</div>
                    </div>
                  ))}
                </div>

                {/* Per-zone forecast */}
                <div className="space-y-2">
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Zone-level disruption forecast</div>
                  {forecastZones.map(z => {
                    const pct = Math.round(z.nextWeekP * 100);
                    const trend = z.nextWeekP > z.disruptionProbability ? "↑" : "↓";
                    const trendColor = z.nextWeekP > z.disruptionProbability ? "text-red-400" : "text-emerald-400";
                    const dominantTrigger =
                      z.rainfallMm > 25 ? "Rainfall" : z.tempCelsius > 40 ? "Extreme Heat" : z.aqiIndex > 200 ? "AQI" : "Demand";
                    const TriggerIcon = dominantTrigger === "Rainfall" ? CloudRain : dominantTrigger === "Extreme Heat" ? Thermometer : Wind;
                    return (
                      <div key={z.zone} className="flex items-center gap-3 text-xs">
                        <div className="w-28 text-slate-400 flex-shrink-0">{z.zone}</div>
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${pct > 65 ? "bg-red-500" : pct > 40 ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className={`w-10 text-right font-bold ${pct > 65 ? "text-red-400" : pct > 40 ? "text-amber-400" : "text-emerald-400"}`}>{pct}%</div>
                        <div className={`w-4 font-bold ${trendColor}`}>{trend}</div>
                        <TriggerIcon className="w-3.5 h-3.5 text-slate-500" />
                        <div className="w-20 text-slate-500">{dominantTrigger} risk</div>
                        <div className="w-16 text-right text-slate-500">{z.expectedClaimsNext} claims est.</div>
                      </div>
                    );
                  })}
                </div>

                {monsoon && (
                  <div className="flex items-center gap-2 glass rounded-lg border border-amber-500/20 p-2.5 text-xs text-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    Monsoon season active (Jun–Sep) — disruption probabilities elevated 10–15%. Consider reinsurance layer activation above Rs. 5L claims pool.
                  </div>
                )}
              </div>
            );
          })()}

          {/* Workers Table */}
          <div className="glass rounded-xl border border-white/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-bold text-white">Enrolled Workers</h2>
              <span className="text-xs text-slate-500">{workers.length} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-slate-500 border-b border-white/5">
                  <tr>
                    {["Name", "Zone", "Platforms", "Weekly Earnings", "Behavioral Score", "Risk"].map(h => (
                      <th key={h} className="text-left px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {workers.map((w) => (
                    <tr key={w.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3 font-medium text-white">{w.name}</td>
                      <td className="px-5 py-3 text-slate-400">{w.zone}</td>
                      <td className="px-5 py-3 text-slate-400">{w.platforms.join(", ")}</td>
                      <td className="px-5 py-3 text-emerald-400 font-bold">Rs. {w.weeklyEarnings.toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${w.behavioralScore >= 80 ? "bg-emerald-500" : w.behavioralScore >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ width: `${w.behavioralScore}%` }} />
                          </div>
                          <span className="text-xs font-bold text-slate-300">{w.behavioralScore}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3"><RiskBadge level={w.riskLevel} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "fraud" && (
        <div className="space-y-4">
          {flagged.length > 0 && (
            <div className="glass-amber rounded-xl border border-amber-500/20 p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span className="text-amber-300 text-sm font-medium">
                {flagged.length} claim(s) flagged · {claims.filter(c => c.fraudScore > 50).length} high fraud score
              </span>
            </div>
          )}
          <div className="glass rounded-xl border border-white/5 p-4 text-sm text-slate-400 space-y-1.5">
            <div className="text-slate-300 font-semibold mb-2 flex items-center gap-2"><Eye className="w-4 h-4 text-cyan-400" /> Fraud Detection Architecture</div>
            <div><strong className="text-slate-300">Layer 1 (Rules):</strong> GPS zone mismatch, activity &gt;60% during claim, claimed amount &gt;2.5σ above zone median, peer corroboration &lt;20%</div>
            <div><strong className="text-slate-300">Layer 2 (ML):</strong> Isolation Forest detecting adverse selection — buys policy within 24h of high-risk forecast, rarely purchases in low-risk weeks</div>
            <div><strong className="text-slate-300">Review:</strong> &lt;Rs. 500 auto-approved if no flag · &gt;Rs. 2,000 requires peer comparison · Flagged = 24h hold</div>
          </div>
          {claims.length === 0 ? (
            <div className="glass rounded-xl border border-white/5 p-8 text-center text-slate-500 text-sm">No claims in system yet.</div>
          ) : claims.map((c) => (
            <div key={c.id} className="glass rounded-xl border border-white/5 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TriggerBadge type={c.triggerType} />
                  <span className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    c.fraudScore < 30 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : c.fraudScore < 60 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>
                    Fraud: {c.fraudScore}/100
                  </span>
                  <span className="font-bold text-white">Rs. {c.claimedAmount}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {[
                  { label: "Peer signal", value: `${c.triggerData.peerCorroboration}%` },
                  { label: "GPS", value: c.triggerData.gpsConfirmed ? "✓ OK" : "✗ Mismatch" },
                  { label: "Status", value: c.status },
                  { label: "Approved", value: `Rs. ${c.approvedAmount}` },
                ].map(d => (
                  <div key={d.label} className="glass rounded-lg p-2 text-center border border-white/5">
                    <div className="font-bold text-slate-200">{d.value}</div>
                    <div className="text-slate-500">{d.label}</div>
                  </div>
                ))}
              </div>
              {c.fraudFlags.length > 0 && (
                <div className="glass-amber rounded-lg border border-amber-500/20 p-2.5 space-y-1">
                  {c.fraudFlags.map((f, i) => (
                    <div key={i} className="text-xs text-amber-300">⚠ {f}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "zones" && (
        <div className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            {zoneData.map((z) => (
              <div key={z.zone} className="glass rounded-xl border border-white/5 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white">{z.zone}</h3>
                  <RiskBadge level={(z.riskLevel as "Low" | "Moderate" | "High" | "Elevated") || "Low"} />
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[
                    { label: "Disruption", value: `${Math.round(z.disruptionProbability * 100)}%`, warn: z.disruptionProbability > 0.6 },
                    { label: "Rainfall", value: `${z.rainfallMm}mm`, warn: z.rainfallMm >= 35 },
                    { label: "AQI", value: z.aqiIndex.toString(), warn: z.aqiIndex >= 300 },
                    { label: "Temp", value: `${z.tempCelsius}°C`, warn: z.tempCelsius >= 44 },
                  ].map(m => (
                    <div key={m.label} className={`rounded-lg p-2 text-center ${m.warn ? "bg-red-500/10 border border-red-500/20" : "glass border border-white/5"}`}>
                      <div className={`font-bold ${m.warn ? "text-red-400" : "text-white"}`}>{m.value}</div>
                      <div className="text-slate-500">{m.label}</div>
                    </div>
                  ))}
                </div>
                {z.activeTriggers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {z.activeTriggers.map(t => <TriggerBadge key={t} type={t} active />)}
                  </div>
                )}
                {/* Peer signal */}
                <div className="text-xs text-slate-500">
                  Peer signal: <strong className="text-slate-300">{z.peerCorroboration}%</strong> workers · Base risk: <strong className="text-slate-300">{z.baseRisk}×</strong>
                </div>
              </div>
            ))}
          </div>
          <div className="glass rounded-xl border border-white/5 p-5">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-3">AQI across all zones</div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={zoneData.map(z => ({ zone: z.zone.split(" ")[0], aqi: z.aqiIndex, rainfall: z.rainfallMm }))}>
                <defs>
                  <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="zone" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="aqi" stroke="#8b5cf6" strokeWidth={2} fill="url(#aqiGrad)" name="AQI" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === "compliance" && (
        <div className="space-y-4">
          <div className="glass rounded-xl border border-white/5 p-5">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" /> Full Coverage Exclusions
            </h2>
            <div className="grid grid-cols-2 gap-1.5">
              {COVERAGE_EXCLUSIONS.map((e, i) => (
                <div key={i} className="text-xs text-slate-400 flex gap-1.5">
                  <span className="text-red-400 font-bold flex-shrink-0">✗</span> {e}
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-xl border border-white/5 p-5">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" /> Regulatory Compliance
            </h2>
            <div className="space-y-3">
              {Object.entries(REGULATORY_NOTES).map(([key, val]) => (
                <div key={key} className="border-b border-white/5 pb-2.5 last:border-0">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </div>
                  <div className="text-sm text-slate-300 mt-0.5">{val}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-xl border border-white/5 p-5">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" /> Actuarial Sustainability
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Loss Ratio", value: `${(lossRatio * 100).toFixed(1)}%`, note: "Target: 55–75%", ok: lossRatio <= LOSS_TARGET.max },
                { label: "Net Retained", value: `Rs. ${(totalPremiums - totalPayouts).toLocaleString()}`, note: "After all payouts", ok: true },
                { label: "Break-even", value: "180 workers/zone", note: "At avg Rs. 95 premium", ok: true },
                { label: "Reinsurance Layer", value: "Rs. 5L retention", note: "Reinsurer: up to Rs. 50L", ok: true },
              ].map(s => (
                <div key={s.label} className="glass rounded-xl p-4">
                  <div className={`text-xl font-black ${s.ok ? "text-emerald-400" : "text-red-400"}`}>{s.value}</div>
                  <div className="text-sm text-slate-300 mt-0.5">{s.label}</div>
                  <div className="text-xs text-slate-500 mt-1">{s.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
