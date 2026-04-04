import { TriggerType, TriggerData, ZoneRiskData } from "./types";

// Trigger thresholds per the system design
const THRESHOLDS = {
  rainfall: { mmPerHr: 35, durationHrs: 1.5, peerDropPct: 30 },
  aqi: { index: 300, restrictionHrs: 2 },
  zoneShutdown: { durationHrs: 4 },
  demandCollapse: { dropPct: 50, durationHrs: 3, workerDropPct: 40 },
  extremeHeat: { tempCelsius: 44, durationHrs: 4 },
};

/** Evaluate which parametric triggers are breached for a given zone reading */
export function evaluateTriggers(data: ZoneRiskData): TriggerData[] {
  const triggered: TriggerData[] = [];

  // Trigger 1: Sustained Rainfall
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

  // Trigger 2: Air Quality Restriction
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

  // Trigger 3: Demand Collapse
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

  // Trigger 4: Extreme Heat
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

/** Calculate payout amount for a given trigger */
export function calculatePayout(
  triggerData: TriggerData,
  avgHourlyEarnings: number,
  coverageCeiling: number
): number {
  let payout = 0;

  switch (triggerData.type) {
    case "Rainfall":
    case "Extreme Heat":
      // Payout = lost hours × hourly earnings
      payout = triggerData.duration * avgHourlyEarnings;
      break;

    case "AQI":
      // Proportional to restricted hours
      payout = (triggerData.duration / 8) * avgHourlyEarnings * 8;
      break;

    case "Zone Shutdown":
      // Full daily equivalent per day
      payout = avgHourlyEarnings * 8;
      break;

    case "Demand Collapse":
      // Proportional to demand drop %
      payout = (triggerData.value / 100) * avgHourlyEarnings * triggerData.duration;
      break;
  }

  // Cap at coverage ceiling
  return Math.min(Math.round(payout), coverageCeiling);
}

export { THRESHOLDS };
