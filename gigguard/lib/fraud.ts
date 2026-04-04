import { TriggerData, Claim } from "./types";

interface FraudCheckInput {
  triggerData: TriggerData;
  workerActivityDuringClaim: number; // % of normal activity (0-100)
  claimedAmount: number;
  zoneMedianShortfall: number;
  recentPurchasePrior24h: boolean; // bought policy < 24h before high-risk event
  adverseSelectionCount: number; // how many times worker bought only before high-risk events
}

interface FraudResult {
  score: number; // 0-100, higher = more suspicious
  flags: string[];
  autoApprove: boolean;
  requiresManualReview: boolean;
}

/**
 * Two-layer fraud detection:
 * Layer 1: Rule-based (GPS mismatch, activity during claim, peer comparison)
 * Layer 2: Adverse selection pattern (Isolation Forest approximation)
 */
export function runFraudCheck(input: FraudCheckInput): FraudResult {
  const flags: string[] = [];
  let score = 0;

  // Rule 1: GPS not confirmed — major red flag
  if (!input.triggerData.gpsConfirmed) {
    flags.push("GPS zone mismatch: worker not in declared zone during disruption");
    score += 40;
  }

  // Rule 2: Activity during claim — worker active at >60% normal rate
  if (input.workerActivityDuringClaim > 60) {
    flags.push(
      `High activity during claim: ${input.workerActivityDuringClaim}% of normal rate (threshold: 60%)`
    );
    score += 30;
  }

  // Rule 3: Claimed amount far above zone median (>2.5 SD proxy check)
  const deviationRatio = input.claimedAmount / (input.zoneMedianShortfall || 1);
  if (deviationRatio > 2.5) {
    flags.push(
      `Claimed amount ${deviationRatio.toFixed(1)}x above zone median — held for peer comparison`
    );
    score += 20;
  }

  // Rule 4: Low peer corroboration
  if (input.triggerData.peerCorroboration < 20) {
    flags.push(
      `Low peer corroboration: only ${input.triggerData.peerCorroboration}% of zone workers affected`
    );
    score += 15;
  }

  // Layer 2: Adverse selection pattern
  if (input.recentPurchasePrior24h && input.adverseSelectionCount > 2) {
    flags.push(
      "Adverse selection pattern: policy purchased within 24h of high-probability forecast (repeat)"
    );
    score += 25;
  }

  score = Math.min(score, 100);

  const autoApprove = score < 30 && input.claimedAmount <= 500;
  const requiresManualReview = score >= 50 || input.claimedAmount > 2000;

  return { score, flags, autoApprove, requiresManualReview };
}

// Get exclusion reasons (what GigGuard does NOT cover)
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

// Regulatory compliance notes
export const REGULATORY_NOTES = {
  framework: "IRDAI Regulatory Sandbox (Parametric Insurance Products)",
  partnerRequirement: "Licensed insurer required as risk-carrying entity for commercial launch",
  grievanceRedressal: "In-app escalation within 48 hours; IRDAI portal for unresolved cases",
  capitalAdequacy: "Minimum solvency margin per IRDAI (Registration of Indian Insurance Companies) Regulations, 2000",
  dataProtection: "Compliant with Digital Personal Data Protection Act, 2023 (DPDPA)",
  disclosureRequirement: "Full Key Information Sheet (KIS) presented before each weekly policy purchase",
};
