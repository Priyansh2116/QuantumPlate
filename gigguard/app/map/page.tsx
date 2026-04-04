"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ZoneRiskData } from "@/lib/types";
import RiskBadge from "@/components/RiskBadge";
import TriggerBadge from "@/components/TriggerBadge";
import { Activity, CloudRain, Wind, Thermometer, TrendingDown, RefreshCw } from "lucide-react";

const ZoneMap3D = dynamic(() => import("@/components/ZoneMap3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto" />
        <div className="text-slate-400 text-sm">Loading 3D zone map...</div>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const [zones, setZones] = useState<(ZoneRiskData & { riskLevel: string })[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>("Koramangala");
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  async function loadZones() {
    setLoading(true);
    const res = await fetch("/api/zone-data");
    const data = await res.json();
    setZones(data);
    setLoading(false);
    setLastRefresh(new Date());
  }

  useEffect(() => {
    loadZones();
    const interval = setInterval(loadZones, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const selected = zones.find((z) => z.zone === selectedZone);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            Live Zone Risk Map
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            3D visualization of real-time disruption risk across Bengaluru delivery zones
          </p>
        </div>
        <button
          onClick={loadZones}
          disabled={loading}
          className="flex items-center gap-2 glass border border-white/10 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-400 px-4 py-2 rounded-lg text-sm transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="flex gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500" /> Low risk (&lt;30%)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-yellow-500" /> Moderate (30–50%)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-orange-500" /> High (50–65%)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-500 animate-pulse" /> Elevated (&gt;65%)
        </div>
        <div className="flex items-center gap-1.5 ml-4">
          <span className="w-3 h-3 rounded-full bg-blue-400 opacity-60" /> Rain particles = rainfall triggered
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4" style={{ height: "70vh" }}>
        {/* 3D Map */}
        <div className="md:col-span-2 glass rounded-2xl border border-white/5 overflow-hidden relative">
          {loading && zones.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <ZoneMap3D
              zones={zones}
              selectedZone={selectedZone}
              onSelect={(z) => setSelectedZone(z)}
            />
          )}
          <div className="absolute bottom-3 left-3 text-xs text-slate-500 glass px-2 py-1 rounded">
            Drag to orbit · Scroll to zoom · Click zone to inspect
          </div>
          <div className="absolute top-3 right-3 text-xs text-slate-500">
            Last updated: {lastRefresh.toLocaleTimeString("en-IN")}
          </div>
        </div>

        {/* Zone details panel */}
        <div className="flex flex-col gap-3 overflow-y-auto">
          {/* Selected zone details */}
          {selected && (
            <div className="glass rounded-xl border border-emerald-500/20 p-4 space-y-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white">{selected.zone}</h3>
                <RiskBadge level={(selected.riskLevel as "Low" | "Moderate" | "High" | "Elevated") || "Low"} />
              </div>

              <div className="text-3xl font-black text-emerald-400">
                {Math.round(selected.disruptionProbability * 100)}%
                <span className="text-sm font-normal text-slate-400 ml-2">disruption probability</span>
              </div>

              {/* Condition bars */}
              <div className="space-y-2.5">
                <ConditionBar
                  Icon={CloudRain}
                  label="Rainfall"
                  value={selected.rainfallMm}
                  max={80}
                  threshold={35}
                  unit="mm/hr"
                  color="text-blue-400"
                  barColor="bg-blue-500"
                />
                <ConditionBar
                  Icon={Wind}
                  label="AQI"
                  value={selected.aqiIndex}
                  max={500}
                  threshold={300}
                  unit=""
                  color="text-purple-400"
                  barColor="bg-purple-500"
                />
                <ConditionBar
                  Icon={Thermometer}
                  label="Temperature"
                  value={selected.tempCelsius}
                  max={50}
                  threshold={44}
                  unit="°C"
                  color="text-amber-400"
                  barColor="bg-amber-500"
                />
                <ConditionBar
                  Icon={TrendingDown}
                  label="Demand Drop"
                  value={selected.demandDropPct}
                  max={100}
                  threshold={50}
                  unit="%"
                  color="text-orange-400"
                  barColor="bg-orange-500"
                />
              </div>

              {/* Active triggers */}
              {selected.activeTriggers.length > 0 ? (
                <div>
                  <div className="text-xs text-slate-500 mb-2">Active Triggers</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.activeTriggers.map((t) => (
                      <TriggerBadge key={t} type={t} active />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  No active triggers — zone safe
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="glass rounded-lg p-2">
                  <div className="text-slate-400">Peer Signal</div>
                  <div className="text-white font-bold">{selected.peerCorroboration}% workers</div>
                </div>
                <div className="glass rounded-lg p-2">
                  <div className="text-slate-400">Base Zone Risk</div>
                  <div className="text-white font-bold">{selected.baseRisk}×</div>
                </div>
              </div>
            </div>
          )}

          {/* All zones list */}
          <div className="space-y-2">
            <div className="text-xs text-slate-500 uppercase tracking-wide px-1">All Zones</div>
            {zones.map((z) => (
              <button
                key={z.zone}
                onClick={() => setSelectedZone(z.zone)}
                className={`w-full text-left glass rounded-xl p-3 border transition-all ${
                  selectedZone === z.zone
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{z.zone}</span>
                  <RiskBadge level={(z.riskLevel as "Low" | "Moderate" | "High" | "Elevated") || "Low"} />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{Math.round(z.disruptionProbability * 100)}% risk</span>
                  <span>
                    {z.activeTriggers.length > 0 ? (
                      <span className="text-amber-400 font-medium">{z.activeTriggers.length} trigger{z.activeTriggers.length > 1 ? "s" : ""} active</span>
                    ) : (
                      <span className="text-emerald-400">Safe</span>
                    )}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConditionBar({
  Icon, label, value, max, threshold, unit, color, barColor,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  max: number;
  threshold: number;
  unit: string;
  color: string;
  barColor: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  const breached = value >= threshold;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className={`flex items-center gap-1 ${color}`}>
          <Icon className="w-3 h-3" /> {label}
        </span>
        <span className={`font-medium ${breached ? "text-red-400" : "text-slate-300"}`}>
          {value}{unit} {breached && "⚠"}
        </span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${breached ? "bg-red-500" : barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
