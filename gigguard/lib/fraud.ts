import { TriggerData } from "./types";
import {
  isolationForestScore,
  rollingZScore,
  detectGPSSpoofing,
  checkWeatherBaseline,
  GPSReading,
} from "./risk-model";

interface FraudCheckInput {
  triggerData: TriggerData;
  workerActivityDuringClaim: number; // % of normal activity (0-100)
  claimedAmount: number;
  coverageCeiling: number;           // worker's daily earnings ceiling
  zoneHistoricalPayouts: number[];   // recent approved payouts in zone (for z-score)
  purchaseLeadHours: number;         // hours between policy purchase and claim
  recentPurchasePrior24h: boolean;
  adverseSelectionCount: number;
  gpsReadings?: GPSReading[];        // GPS trace during claim window (optional)
  claimMonth?: number;               // month of claim (1-12) for weather baseline
}

interface FraudResult {
  score: number; // 0-100, higher = more suspicious
  flags: string[];
  autoApprove: boolean;
  requiresManualReview: boolean;
  isolationScore: number;
  zScore: number;
  gpsSpoofed: boolean;
  weatherPlausible: boolean;
}

/**
 * Two-layer fraud detection:
 *
 * Layer 1 — Rule-based (GPS, activity, peer corroboration)
 * Layer 2 — Statistical models:
 *   • Isolation Forest: random partition anomaly score on 5 claim features
 *   • Rolling Z-score: checks if claimed amount is within 2.5 SD of zone distribution
 */
export function runFraudCheck(input: FraudCheckInput): FraudResult {
  const flags: string[] = [];
  let score = 0;

  // --- Layer 1: Rule-based ---

  if (!input.triggerData.gpsConfirmed) {
    flags.push("GPS zone mismatch: worker not in declared zone during disruption");
    score += 40;
  }

  if (input.workerActivityDuringClaim > 60) {
    flags.push(
      `High activity during claim: ${input.workerActivityDuringClaim}% of normal rate (threshold: 60%)`
    );
    score += 30;
  }

  if (input.triggerData.peerCorroboration < 20) {
    flags.push(
      `Low peer corroboration: only ${input.triggerData.peerCorroboration}% of zone workers affected`
    );
    score += 15;
  }

  if (input.recentPurchasePrior24h && input.adverseSelectionCount > 2) {
    flags.push(
      "Adverse selection pattern: policy purchased within 24h of high-probability forecast (repeat)"
    );
    score += 25;
  }

  // --- Layer 1b: GPS Spoofing Detection ---

  if (input.gpsReadings && input.gpsReadings.length >= 2) {
    const gpsResult = detectGPSSpoofing(input.gpsReadings);
    if (gpsResult.spoofed) {
      flags.push(...gpsResult.flags);
      score += 35;
    }
  }

  // --- Layer 1c: Historical Weather Baseline ---

  const weatherTriggerTypes = ["Rainfall", "AQI", "Extreme Heat"] as const;
  type WeatherTrigger = typeof weatherTriggerTypes[number];
  const isWeatherTrigger = (weatherTriggerTypes as readonly string[]).includes(input.triggerData.type);

  let weatherPlausible = true;
  if (isWeatherTrigger) {
    const month = input.claimMonth ?? new Date().getMonth() + 1;
    const baseline = checkWeatherBaseline(
      input.triggerData.type as WeatherTrigger,
      input.triggerData.value,
      month
    );
    weatherPlausible = baseline.plausible;
    if (!baseline.plausible && baseline.flag) {
      flags.push(baseline.flag);
      score += 25;
    }
  }

  // --- Layer 2: Isolation Forest ---

  const ifScore = isolationForestScore({
    claimToMedianRatio: input.claimedAmount / (input.coverageCeiling || 1),
    purchaseLeadHours: input.purchaseLeadHours,
    activityDuringClaim: input.workerActivityDuringClaim,
    adverseSelectionCount: input.adverseSelectionCount,
    peerCorroboration: input.triggerData.peerCorroboration,
  });

  if (ifScore > 0.75) {
    flags.push(
      `Isolation Forest anomaly score ${ifScore.toFixed(2)} — claim pattern deviates significantly from zone distribution`
    );
    score += 20;
  } else if (ifScore > 0.60) {
    flags.push(`Isolation Forest score ${ifScore.toFixed(2)} — mild anomaly, flagged for review`);
    score += 10;
  }

  // --- Layer 2: Rolling Z-score ---

  const { z, isNormal } = rollingZScore(input.claimedAmount, input.zoneHistoricalPayouts);

  if (!isNormal) {
    flags.push(
      `Z-score ${z} — claimed amount is >2.5 SD above zone historical mean (peer comparison required)`
    );
    score += 15;
  }

  score = Math.min(score, 100);

  // Auto-approve if low fraud score and claim is within coverage ceiling
  const autoApprove = score < 30 && input.claimedAmount <= input.coverageCeiling;
  const requiresManualReview = score >= 50 || input.claimedAmount > input.coverageCeiling * 1.1;

  const gpsSpoofed = input.gpsReadings
    ? detectGPSSpoofing(input.gpsReadings).spoofed
    : false;

  return {
    score,
    flags,
    autoApprove,
    requiresManualReview,
    isolationScore: Math.round(ifScore * 100) / 100,
    zScore: z,
    gpsSpoofed,
    weatherPlausible,
  };
}

export const COVERAGE_EXCLUSIONS = [
  "Health, illness, or hospitalization",
  "Life insurance or death benefits",
  "Road accidents or vehicle damage",
  "Vehicle repair or maintenance costs",
  "Mechanical breakdown of delivery vehicle",
  "Personal liability or third-party injury",
  "Theft of vehicle or goods in transit",
  "Income loss due to personal unavailability (not external disruption)",
  "Losses caused by war, civil war, or terrorism",
  "Pandemic-mandated lockdowns (covered only if specific parametric threshold is met)",
  "Platform account suspension or deactivation",
  "Losses from personal misconduct or policy violation",
  "Retrospective claims for periods before policy activation",
];

export const REGULATORY_NOTES = {
  framework: "IRDAI Regulatory Sandbox (Parametric Insurance Products)",
  partnerRequirement: "Licensed insurer required as risk-carrying entity for commercial launch",
  grievanceRedressal: "In-app escalation within 48 hours; IRDAI portal for unresolved cases",
  capitalAdequacy: "Minimum solvency margin per IRDAI (Registration of Indian Insurance Companies) Regulations, 2000",
  dataProtection: "Compliant with Digital Personal Data Protection Act, 2023 (DPDPA)",
  disclosureRequirement: "Full Key Information Sheet (KIS) presented before each weekly policy purchase",
};
