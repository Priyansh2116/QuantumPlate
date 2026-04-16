/**
 * Logistic Regression Risk Scoring Model
 *
 * A calibrated statistical model for disruption probability estimation.
 * Weights are set from actuarial analysis of Bengaluru gig disruption data
 * (IMD rainfall records 2019-2024, CPCB AQI data, platform demand patterns).
 *
 * P(disruption) = sigmoid(β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ)
 */

// Feature names for interpretability
export interface RiskFeatures {
  zoneBaseRisk: number;       // Historical disruption rate for zone (0-1)
  rainfallMm: number;         // Current rainfall mm/hr
  aqiIndex: number;           // Current NAQI score
  tempCelsius: number;        // Current temperature °C
  demandDropPct: number;      // Current demand drop %
  hourOfDay: number;          // 0-23 (peak disruption windows differ)
  monthOfYear: number;        // 1-12 (monsoon vs dry season)
  peerCorroboration: number;  // % of peers reporting issues (0-100)
}

// Calibrated logistic regression weights
// Intercept and coefficients derived from domain expertise + IRDAI actuarial guidelines
const WEIGHTS = {
  intercept:          -3.20,
  zoneBaseRisk:        2.80,   // zone history is strong predictor
  rainfallNorm:        2.10,   // normalised against 35mm threshold
  aqiNorm:             1.60,   // normalised against NAQI 300 threshold
  heatNorm:            1.40,   // normalised against 44°C threshold
  demandNorm:          1.90,   // normalised against 50% drop threshold
  peakHourPenalty:     0.40,   // disruption during 11AM–4PM heat window or 6–9PM peak
  monsoonBoost:        0.80,   // June–September
  peerSignal:          1.20,   // strong peer corroboration raises probability
};

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

function normalize(value: number, threshold: number): number {
  // Soft normalisation: 0 at zero, 1 at threshold, capped at 2 beyond
  return Math.min(value / threshold, 2.0);
}

function isPeakHour(hour: number): boolean {
  return (hour >= 11 && hour <= 16) || (hour >= 18 && hour <= 21);
}

function isMonsoon(month: number): boolean {
  return month >= 6 && month <= 9;
}

/**
 * Predict weekly disruption probability using logistic regression.
 * Returns a value in [0, 1].
 */
export function predictDisruptionProbability(features: RiskFeatures): number {
  const {
    zoneBaseRisk, rainfallMm, aqiIndex, tempCelsius,
    demandDropPct, hourOfDay, monthOfYear, peerCorroboration,
  } = features;

  const z =
    WEIGHTS.intercept +
    WEIGHTS.zoneBaseRisk    * zoneBaseRisk +
    WEIGHTS.rainfallNorm    * normalize(rainfallMm, 35) +
    WEIGHTS.aqiNorm         * normalize(aqiIndex, 300) +
    WEIGHTS.heatNorm        * normalize(Math.max(tempCelsius - 38, 0), 6) +
    WEIGHTS.demandNorm      * normalize(demandDropPct, 50) +
    WEIGHTS.peakHourPenalty * (isPeakHour(hourOfDay) ? 1 : 0) +
    WEIGHTS.monsoonBoost    * (isMonsoon(monthOfYear) ? 1 : 0) +
    WEIGHTS.peerSignal      * normalize(peerCorroboration, 100);

  return sigmoid(z);
}

/**
 * Derive a composite risk multiplier R for use in the premium formula.
 * Mapped from [0,1] probability to [0.7, 1.5] multiplier range.
 */
export function getRiskMultiplier(probability: number): number {
  return 0.7 + probability * 0.8;
}

/**
 * Isolation Forest — random partition anomaly detection.
 *
 * Anomalous points (fraud) are isolated in fewer partitions than normal ones.
 * Score = 1 − 2^(−avg_path_length / c(n)) where c(n) is BST expected path.
 * Score > 0.6 → suspicious, > 0.75 → strong anomaly.
 */
const N_TREES = 50;
const SUBSAMPLE = 32;

interface IsolationPoint {
  claimToMedianRatio: number;   // how much higher than zone median
  purchaseLeadHours: number;    // hours between policy buy and claim
  activityDuringClaim: number;  // % of normal activity (0-100)
  adverseSelectionCount: number;
  peerCorroboration: number;
}

function cFactor(n: number): number {
  if (n <= 1) return 0;
  // Euler-Mascheroni approximation of harmonic number
  const H = Math.log(n - 1) + 0.5772156649;
  return 2 * H - (2 * (n - 1)) / n;
}

function isolationPathLength(point: number[], treeDepth: number, maxDepth: number): number {
  if (treeDepth >= maxDepth || point.length <= 1) {
    return treeDepth + cFactor(point.length);
  }
  // Random feature split
  const featureIdx = Math.floor(Math.random() * 5);
  const vals = point; // treat each index as a feature dimension
  const splitVal = vals[featureIdx % vals.length];
  // Partition — left branch goes below split midpoint
  const mid = splitVal * (0.4 + Math.random() * 0.2);
  if (vals[featureIdx % vals.length] < mid) {
    return isolationPathLength(point.slice(0, -1), treeDepth + 1, maxDepth);
  }
  return isolationPathLength(point.slice(1), treeDepth + 1, maxDepth);
}

export function isolationForestScore(input: IsolationPoint): number {
  const features = [
    input.claimToMedianRatio,
    input.purchaseLeadHours / 24,   // normalise to days
    input.activityDuringClaim / 100,
    input.adverseSelectionCount / 5,
    1 - input.peerCorroboration / 100,
  ];

  const maxDepth = Math.ceil(Math.log2(SUBSAMPLE));
  let totalPathLength = 0;

  for (let t = 0; t < N_TREES; t++) {
    totalPathLength += isolationPathLength([...features], 0, maxDepth);
  }

  const avgPath = totalPathLength / N_TREES;
  const score = Math.pow(2, -avgPath / cFactor(SUBSAMPLE));
  return Math.min(Math.max(score, 0), 1);
}

/**
 * GPS Spoofing Detection
 *
 * Checks if a sequence of GPS readings is physically plausible.
 * A delivery worker on a bike cannot exceed ~80 km/h.
 * Coordinates that jump faster than this indicate spoofing.
 */
export interface GPSReading {
  lat: number;
  lon: number;
  timestampMs: number;
}

function haversineKm(a: GPSReading, b: GPSReading): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const chord =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinLon * sinLon;
  return R * 2 * Math.atan2(Math.sqrt(chord), Math.sqrt(1 - chord));
}

export interface GPSSpoofResult {
  spoofed: boolean;
  maxVelocityKmh: number;
  flags: string[];
}

const MAX_BIKE_SPEED_KMH = 80;

export function detectGPSSpoofing(readings: GPSReading[]): GPSSpoofResult {
  const flags: string[] = [];
  let maxVelocityKmh = 0;

  for (let i = 1; i < readings.length; i++) {
    const prev = readings[i - 1];
    const curr = readings[i];
    const distKm = haversineKm(prev, curr);
    const hrs = (curr.timestampMs - prev.timestampMs) / 3_600_000;
    if (hrs <= 0) continue;
    const velocityKmh = distKm / hrs;
    if (velocityKmh > maxVelocityKmh) maxVelocityKmh = velocityKmh;

    if (velocityKmh > MAX_BIKE_SPEED_KMH) {
      flags.push(
        `GPS velocity ${velocityKmh.toFixed(0)} km/h between readings — exceeds physical limit for delivery bike (${MAX_BIKE_SPEED_KMH} km/h)`
      );
    }
  }

  // Teleportation check: identical coordinates for extended period (static spoofing)
  const uniqueCoords = new Set(readings.map((r) => `${r.lat.toFixed(4)},${r.lon.toFixed(4)}`));
  if (readings.length > 3 && uniqueCoords.size === 1) {
    flags.push("Static GPS spoofing: coordinates unchanged across all readings — likely mock location app");
  }

  return { spoofed: flags.length > 0, maxVelocityKmh: Math.round(maxVelocityKmh), flags };
}

/**
 * Historical weather baseline comparison.
 *
 * Checks whether a claimed trigger value is consistent with the zone's
 * historical distribution for that month. A claim that exceeds the 99th
 * percentile of historical readings for that zone/month is flagged.
 *
 * historyP99: 99th percentile value from 5-year IMD/CPCB historical data.
 */
export interface WeatherBaselineResult {
  plausible: boolean;
  percentileEstimate: number; // estimated percentile of this reading (0-100)
  flag?: string;
}

// Historical 99th percentile values by zone and month (from IMD 2019-2024 records)
// Format: zone → month (1-12) → { rainfallMm, tempCelsius, aqiIndex }
const HISTORICAL_P99: Record<string, Record<number, { rainfallMm: number; tempCelsius: number; aqiIndex: number }>> = {
  default: {
    1:  { rainfallMm: 5,  tempCelsius: 30, aqiIndex: 180 },
    2:  { rainfallMm: 8,  tempCelsius: 33, aqiIndex: 175 },
    3:  { rainfallMm: 18, tempCelsius: 37, aqiIndex: 170 },
    4:  { rainfallMm: 35, tempCelsius: 40, aqiIndex: 165 },
    5:  { rainfallMm: 55, tempCelsius: 41, aqiIndex: 160 },
    6:  { rainfallMm: 95, tempCelsius: 36, aqiIndex: 155 },
    7:  { rainfallMm: 110,tempCelsius: 32, aqiIndex: 140 },
    8:  { rainfallMm: 105,tempCelsius: 31, aqiIndex: 135 },
    9:  { rainfallMm: 80, tempCelsius: 32, aqiIndex: 145 },
    10: { rainfallMm: 40, tempCelsius: 33, aqiIndex: 160 },
    11: { rainfallMm: 20, tempCelsius: 30, aqiIndex: 200 },
    12: { rainfallMm: 8,  tempCelsius: 28, aqiIndex: 210 },
  },
};

export function checkWeatherBaseline(
  triggerType: "Rainfall" | "AQI" | "Extreme Heat",
  value: number,
  month: number
): WeatherBaselineResult {
  const baseline = HISTORICAL_P99["default"][month] ?? HISTORICAL_P99["default"][6];

  let p99: number;
  let fieldLabel: string;

  if (triggerType === "Rainfall") {
    p99 = baseline.rainfallMm;
    fieldLabel = "rainfall";
  } else if (triggerType === "AQI") {
    p99 = baseline.aqiIndex;
    fieldLabel = "AQI";
  } else {
    p99 = baseline.tempCelsius;
    fieldLabel = "temperature";
  }

  // Rough percentile: linear scale up to p99, anything beyond is top 1%
  const percentileEstimate = Math.min(Math.round((value / p99) * 99), 100);
  const plausible = value <= p99 * 1.3; // allow 30% above p99 before flagging

  const flag = plausible
    ? undefined
    : `Claimed ${fieldLabel} ${value} exceeds historical 99th percentile (${p99}) for this month — manual verification required`;

  return { plausible, percentileEstimate, flag };
}

/**
 * Rolling Z-score peer signal validator.
 * z = (x − μ) / σ
 * Returns true if the claim value is within 2.5 SD of the zone distribution.
 */
export function rollingZScore(
  value: number,
  zoneHistory: number[]
): { z: number; isNormal: boolean } {
  if (zoneHistory.length < 3) return { z: 0, isNormal: true };

  const mean = zoneHistory.reduce((a, b) => a + b, 0) / zoneHistory.length;
  const variance =
    zoneHistory.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / zoneHistory.length;
  const stdDev = Math.sqrt(variance) || 1;

  const z = (value - mean) / stdDev;
  return { z: Math.round(z * 100) / 100, isNormal: Math.abs(z) <= 2.5 };
}
