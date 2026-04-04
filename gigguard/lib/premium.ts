import { Zone, PremiumBreakdown, ZoneRiskData } from "./types";

// Zone base risk profiles
const ZONE_BASE_RISK: Record<Zone, number> = {
  Koramangala: 1.1,
  Indiranagar: 1.05,
  "HSR Layout": 0.95,
  Whitefield: 1.0,
  Marathahalli: 1.15,
  "BTM Layout": 1.08,
};

// Behavioral score → discount rate
function getBehavioralDiscount(score: number): number {
  if (score <= 40) return 0;
  if (score <= 60) return 0.05;
  if (score <= 80) return 0.1;
  return 0.15;
}

// Platform fee (fixed)
const PLATFORM_FEE = 15;

/**
 * Core premium formula:
 * Weekly Premium = (E_h × L_h × R) + F − D
 *
 * E_h = Avg Hourly Earnings
 * L_h = Expected Lost Hours
 * R   = Risk Score (composite multiplier)
 * F   = Platform Fee (Rs. 15)
 * D   = Behavioral Discount
 */
export function calculatePremium(params: {
  weeklyEarnings: number;
  hoursPerWeek: number;
  zone: Zone;
  behavioralScore: number;
  zoneRisk: ZoneRiskData;
}): PremiumBreakdown {
  const { weeklyEarnings, hoursPerWeek, zone, behavioralScore, zoneRisk } = params;

  // E_h: avg hourly earnings
  const avgHourlyEarnings = weeklyEarnings / hoursPerWeek;

  // Risk Score R = Base Zone Risk × Weather Intensity × Seasonal
  const riskScore =
    ZONE_BASE_RISK[zone] *
    zoneRisk.weatherIntensityMultiplier *
    zoneRisk.seasonalAdjustment;

  // L_h = Disruption Probability × Avg Disruption Duration (4 hrs) × Active Hours Fraction (0.40)
  const avgDisruptionDuration = 4; // hours, zone historical avg
  const activeHoursFraction = 0.4;
  const expectedLostHours =
    zoneRisk.disruptionProbability * avgDisruptionDuration * activeHoursFraction;

  // Coverage ceiling
  const coverageCeiling = Math.round(avgHourlyEarnings * expectedLostHours);

  // Base premium
  const basePremium = avgHourlyEarnings * expectedLostHours * riskScore;

  // After platform fee
  const withFee = basePremium + PLATFORM_FEE;

  // Behavioral discount
  const discountRate = getBehavioralDiscount(behavioralScore);
  const behavioralDiscount = withFee * discountRate;

  const finalPremium = Math.round(withFee - behavioralDiscount);

  return {
    avgHourlyEarnings: Math.round(avgHourlyEarnings),
    expectedLostHours: Math.round(expectedLostHours * 100) / 100,
    riskScore: Math.round(riskScore * 100) / 100,
    basePremium: Math.round(basePremium),
    platformFee: PLATFORM_FEE,
    behavioralDiscount: Math.round(behavioralDiscount),
    finalPremium,
    coverageCeiling,
    disruptionProbability: zoneRisk.disruptionProbability,
  };
}

// Loss ratio check — sustainability metric
export function computeLossRatio(totalPayouts: number, totalPremiums: number): number {
  if (totalPremiums === 0) return 0;
  return totalPayouts / totalPremiums;
}

// Expected utility for a worker (used in recommendations)
export function computeExpectedUtility(
  weeklyEarnings: number,
  riskScore: number,
  coverageCeiling: number
): number {
  return weeklyEarnings - riskScore * coverageCeiling;
}
