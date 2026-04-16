import { TriggerType, TriggerData, ZoneRiskData } from "./types";

// Trigger thresholds per the system design
const THRESHOLDS = {
  rainfall:       { mmPerHr: 35, durationHrs: 1.5, peerDropPct: 30 },
  aqi:            { index: 300, restrictionHrs: 2 },
  zoneShutdown:   { durationHrs: 4 },
  demandCollapse: { dropPct: 50, durationHrs: 3, workerDropPct: 40 },
  extremeHeat:    { tempCelsius: 44, durationHrs: 4 },
};

/** Evaluate which parametric triggers are breached for a given zone reading */
export function evaluateTriggers(data: ZoneRiskData): TriggerData[] {
  const triggered: TriggerData[] = [];

  if (
    data.rainfallMm >= THRESHOLDS.rainfall.mmPerHr &&
    data.peerCorroboration >= THRESHOLDS.rainfall.peerDropPct
  ) {
    triggered.push({
      type: "Rainfall",
      value: data.rainfallMm,
      duration: THRESHOLDS.rainfall.durationHrs,
      peerCorroboration: data.peerCorroboration,
      gpsConfirmed: true,
      source: "OpenWeatherMap + Peer Signal",
    });
  }

  if (data.aqiIndex >= THRESHOLDS.aqi.index) {
    triggered.push({
      type: "AQI",
      value: data.aqiIndex,
      duration: THRESHOLDS.aqi.restrictionHrs,
      peerCorroboration: data.peerCorroboration,
      gpsConfirmed: true,
      source: "CPCB AQI Feed",
    });
  }

  if (
    data.demandDropPct >= THRESHOLDS.demandCollapse.dropPct &&
    data.peerCorroboration >= THRESHOLDS.demandCollapse.workerDropPct
  ) {
    triggered.push({
      type: "Demand Collapse",
      value: data.demandDropPct,
      duration: THRESHOLDS.demandCollapse.durationHrs,
      peerCorroboration: data.peerCorroboration,
      gpsConfirmed: true,
      source: "Platform Demand Feed + Peer Signal",
    });
  }

  if (data.tempCelsius >= THRESHOLDS.extremeHeat.tempCelsius) {
    triggered.push({
      type: "Extreme Heat",
      value: data.tempCelsius,
      duration: THRESHOLDS.extremeHeat.durationHrs,
      peerCorroboration: data.peerCorroboration,
      gpsConfirmed: true,
      source: "Weather API + Peer Signal",
    });
  }

  return triggered;
}

/**
 * Calculate payout for a triggered event.
 *
 * Coverage ceiling = one day's gross earnings.
 * Payouts are designed to replace meaningful income loss:
 *   - Full-day shutdowns (Rainfall, Extreme Heat, Zone Shutdown) → 100% of daily earnings
 *   - Partial disruptions (AQI advisory) → 75% of daily earnings
 *   - Demand collapse → proportional to drop severity (min 50%)
 */
export function calculatePayout(
  triggerData: TriggerData,
  _avgHourlyEarnings: number,
  coverageCeiling: number
): number {
  let payout = 0;

  switch (triggerData.type) {
    case "Rainfall":
    case "Extreme Heat":
    case "Zone Shutdown":
      // Full day replacement — worker cannot operate during these events
      payout = coverageCeiling;
      break;

    case "AQI":
      // Partial — advisory restricts operations but doesn't fully shut zone
      payout = Math.round(coverageCeiling * 0.75);
      break;

    case "Demand Collapse":
      // Proportional to demand drop, minimum 50% of daily earnings
      // e.g. 60% demand drop → 60% of daily earnings
      payout = Math.round(Math.max(triggerData.value / 100, 0.5) * coverageCeiling);
      break;
  }

  return Math.min(payout, coverageCeiling);
}

export { THRESHOLDS };
