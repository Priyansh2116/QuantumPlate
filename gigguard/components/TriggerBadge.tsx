import { TriggerType } from "@/lib/types";
import { CloudRain, Wind, ZapOff, TrendingDown, Thermometer } from "lucide-react";

const config: Record<TriggerType, { color: string; bg: string; glow: string; Icon: React.ComponentType<{ className?: string }> }> = {
  Rainfall: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30", glow: "shadow-blue-500/30", Icon: CloudRain },
  AQI: { color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30", glow: "shadow-purple-500/30", Icon: Wind },
  "Zone Shutdown": { color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", glow: "shadow-red-500/30", Icon: ZapOff },
  "Demand Collapse": { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30", glow: "shadow-orange-500/30", Icon: TrendingDown },
  "Extreme Heat": { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", glow: "shadow-amber-500/30", Icon: Thermometer },
};

export default function TriggerBadge({
  type,
  active = false,
}: {
  type: TriggerType;
  active?: boolean;
}) {
  const { color, bg, glow, Icon } = config[type];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${bg} ${color} ${
        active ? `shadow-lg ${glow} animate-pulse` : ""
      }`}
    >
      <Icon className="w-3 h-3" />
      {type}
    </span>
  );
}
