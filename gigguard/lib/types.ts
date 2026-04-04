export type Platform = "Blinkit" | "Zepto" | "Swiggy Instamart" | "BigBasket Now" | "Amazon";
export type Zone = "Koramangala" | "Indiranagar" | "HSR Layout" | "Whitefield" | "Marathahalli" | "BTM Layout";
export type RiskLevel = "Low" | "Moderate" | "High" | "Elevated";
export type TriggerType = "Rainfall" | "AQI" | "Zone Shutdown" | "Demand Collapse" | "Extreme Heat";
export type ClaimStatus = "Pending" | "Approved" | "Rejected" | "Under Review";
export type PolicyStatus = "Active" | "Expired" | "Pending Payment";

export interface Worker {
  id: string;
  name: string;
  phone: string;
  zone: Zone;
  platforms: Platform[];
  weeklyEarnings: number; // declared avg weekly earnings in INR
  hoursPerWeek: number;
  behavioralScore: number; // 0-100
  riskLevel: RiskLevel;
  createdAt: string;
}

export interface Policy {
  id: string;
  workerId: string;
  weekStart: string; // ISO date
  weekEnd: string;
  premium: number;
  coverageCeiling: number;
  status: PolicyStatus;
  triggers: TriggerType[];
  premiumBreakdown: PremiumBreakdown;
  createdAt: string;
}

export interface PremiumBreakdown {
  avgHourlyEarnings: number;
  expectedLostHours: number;
  riskScore: number;
  basePremium: number;
  platformFee: number;
  behavioralDiscount: number;
  finalPremium: number;
  coverageCeiling: number;
  disruptionProbability: number;
}

export interface Claim {
  id: string;
  policyId: string;
  workerId: string;
  triggerType: TriggerType;
  triggerData: TriggerData;
  status: ClaimStatus;
  claimedAmount: number;
  approvedAmount: number;
  fraudScore: number; // 0-100, higher = more suspicious
  fraudFlags: string[];
  createdAt: string;
  resolvedAt?: string;
}

export interface TriggerData {
  type: TriggerType;
  value: number; // rainfall mm/hr, AQI index, temperature, demand drop %
  duration: number; // hours
  peerCorroboration: number; // % of zone workers affected
  gpsConfirmed: boolean;
  source: string;
}

export interface ZoneRiskData {
  zone: Zone;
  baseRisk: number;
  rainfallMm: number;
  aqiIndex: number;
  tempCelsius: number;
  demandDropPct: number;
  peerCorroboration: number; // % of zone workers showing disruption in peer signal
  activeTriggers: TriggerType[];
  disruptionProbability: number;
  weatherIntensityMultiplier: number;
  seasonalAdjustment: number;
}
