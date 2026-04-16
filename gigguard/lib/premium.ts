import { Zone, PremiumBreakdown, ZoneRiskData } from "./types";
import { predictDisruptionProbability, getRiskMultiplier } from "./risk-model";

// Zone historical disruption base rates (from IMD + CPCB + platform data 2019-2024)
const ZONE_BASE_DISRUPTION_RATE: Record<Zone, number> = {
  Koramangala:   0.38,
  Indiranagar:   0.34,
  "HSR Layout":  0.28,
  Whitefield:    0.32,
  Marathahalli:  0.42,
  "BTM Layout":  0.36,
};

// Behavioral score → premium discount rate
function getBehavioralDiscount(score: number): number {
  if (score <= 40) return 0;
  if (score <= 60) return 0.05;
  if (score <= 80) return 0.10;
  return 0.15;
}

const PLATFORM_FEE = 15;
const WORKING_DAYS_PER_WEEK = 6;

/**
 * Core premium formula:
 *   Weekly Premium = (Expected Loss × R) + F − D
 *
 *   Expected Loss   = P(disruption) × Daily Earnings
 *   P(disruption)   = logistic regression model output
 *   R               = risk multiplier derived from P (0.7 – 1.5)
 *   Coverage Ceiling = 1 day's gross earnings (industry benchmark)
 *   F               = Platform Fee (Rs. 15)
 *   D               = Behavioral Discount
 */
export function calculatePremium(params: {
  weeklyEarnings: number;
  hoursPerWeek: number;
  zone: Zone;
  behavioralScore: number;
  zoneRisk: ZoneRiskData;
}): PremiumBreakdown {
  const { weeklyEarnings, hoursPerWeek, zone, behavioralScore, zoneRisk } = params;

  const avgHourlyEarnings = weeklyEarnings / hoursPerWeek;

  // Coverage ceiling = one day's gross earnings
  const dailyEarnings = Math.round(weeklyEarnings / WORKING_DAYS_PER_WEEK);
  const coverageCeiling = dailyEarnings;

  // Run logistic regression model to get disruption probability
  const now = new Date();
  const features = {
    zoneBaseRisk:       ZONE_BASE_DISRUPTION_RATE[zone],
    rainfallMm:         zoneRisk.rainfallMm,
    aqiIndex:           zoneRisk.aqiIndex,
    tempCelsius:        zoneRisk.tempCelsius,
    demandDropPct:      zoneRisk.demandDropPct,
    hourOfDay:          now.getHours(),
    monthOfYear:        now.getMonth() + 1,
    peerCorroboration:  zoneRisk.peerCorroboration,
  };

  const disruptionProbability = predictDisruptionProbability(features);
  const riskScore = getRiskMultiplier(disruptionProbability) * zoneRisk.seasonalAdjustment;

  // Expected weekly loss = probability × full-day payout
  const expectedLoss = disruptionProbability * coverageCeiling;

  // Base premium = actuarial expected loss × risk multiplier
  const basePremium = expectedLoss * riskScore;

  // Add platform fee
  const withFee = basePremium + PLATFORM_FEE;

  // Apply behavioral discount
  const discountRate = getBehavioralDiscount(behavioralScore);
  const behavioralDiscount = withFee * discountRate;

  const finalPremium = Math.max(Math.round(withFee - behavioralDiscount), 29);

  return {
    avgHourlyEarnings: Math.round(avgHourlyEarnings),
    expectedLostHours: Math.round((disruptionProbability * 8) * 100) / 100,
    riskScore:         Math.round(riskScore * 100) / 100,
    basePremium:       Math.round(basePremium),
    platformFee:       PLATFORM_FEE,
    behavioralDiscount: Math.round(behavioralDiscount),
    finalPremium,
    coverageCeiling,
    disruptionProbability: Math.round(disruptionProbability * 100) / 100,
  };
}

// Loss ratio — sustainability metric
export function computeLossRatio(totalPayouts: number, totalPremiums: number): number {
  if (totalPremiums === 0) return 0;
  return totalPayouts / totalPremiums;
}

// Expected utility for a worker
export function computeExpectedUtility(
  weeklyEarnings: number,
  riskScore: number,
  coverageCeiling: number
): number {
  return weeklyEarnings - riskScore * coverageCeiling;
}
