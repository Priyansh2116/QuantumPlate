import { RiskLevel } from "@/lib/types";

const config: Record<RiskLevel, { cls: string; dot: string }> = {
  Low:      { cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400" },
  Moderate: { cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",   dot: "bg-yellow-400" },
  High:     { cls: "bg-orange-500/10 text-orange-400 border-orange-500/30",   dot: "bg-orange-400" },
  Elevated: { cls: "bg-red-500/10 text-red-400 border-red-500/30",             dot: "bg-red-400 animate-pulse" },
};

export default function RiskBadge({ level }: { level: RiskLevel }) {
  const { cls, dot } = config[level];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {level}
    </span>
  );
}
