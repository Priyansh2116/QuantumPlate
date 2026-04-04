import { Zone, ZoneRiskData } from "./types";

// Bengaluru zone coordinates
const ZONE_COORDS: Record<Zone, { lat: number; lon: number }> = {
  Koramangala:  { lat: 12.9352, lon: 77.6245 },
  Indiranagar:  { lat: 12.9784, lon: 77.6408 },
  "HSR Layout": { lat: 12.9116, lon: 77.6389 },
  Whitefield:   { lat: 12.9698, lon: 77.7499 },
  Marathahalli: { lat: 12.9591, lon: 77.7021 },
  "BTM Layout": { lat: 12.9166, lon: 77.6101 },
};

// OpenWeatherMap AQI (1-5) → approximate NAQI index
function owmAqiToNaqi(aqi: number, components: Record<string, number>): number {
  // Use PM2.5 for better NAQI approximation
  const pm25 = components.pm2_5 || 0;
  if (pm25 <= 30) return Math.round(pm25 * 1.67);       // 0–50
  if (pm25 <= 60) return Math.round(50 + (pm25 - 30) * 1.67);  // 51–100
  if (pm25 <= 90) return Math.round(100 + (pm25 - 60) * 3.33); // 101–200
  if (pm25 <= 120) return Math.round(200 + (pm25 - 90) * 3.33);// 201–300
  return Math.min(500, Math.round(300 + (pm25 - 120) * 2.5));  // 301+
}

// Zone base risk profiles (static)
const ZONE_BASE_RISK: Record<Zone, number> = {
  Koramangala:  1.10,
  Indiranagar:  1.05,
  "HSR Layout": 0.95,
  Whitefield:   1.00,
  Marathahalli: 1.15,
  "BTM Layout": 1.08,
};

async function fetchWeatherForZone(zone: Zone): Promise<ZoneRiskData> {
  const { lat, lon } = ZONE_COORDS[zone];
  const apiKey = process.env.OPENWEATHER_API_KEY;

  // If no API key, fall back to realistic mock data
  if (!apiKey) {
    return getMockZoneData(zone);
  }

  try {
    const [weatherRes, aqiRes] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
        { next: { revalidate: 1800 } } // cache 30 min
      ),
      fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`,
        { next: { revalidate: 1800 } }
      ),
    ]);

    if (!weatherRes.ok || !aqiRes.ok) {
      console.warn(`[Weather] API error for zone ${zone}, using mock data`);
      return getMockZoneData(zone);
    }

    const weather = await weatherRes.json();
    const aqi = await aqiRes.json();

    const rainfallMm = weather.rain?.["1h"] || weather.rain?.["3h"] || 0;
    const tempCelsius = Math.round(weather.main.temp);
    const components = aqi.list?.[0]?.components || {};
    const aqiIndex = owmAqiToNaqi(aqi.list?.[0]?.main?.aqi || 1, components);

    return buildZoneRiskData(zone, rainfallMm, aqiIndex, tempCelsius);
  } catch (err) {
    console.error(`[Weather] Failed to fetch for zone ${zone}:`, err);
    return getMockZoneData(zone);
  }
}

function buildZoneRiskData(
  zone: Zone,
  rainfallMm: number,
  aqiIndex: number,
  tempCelsius: number
): ZoneRiskData {
  // Determine active triggers
  const activeTriggers: ZoneRiskData["activeTriggers"] = [];
  if (rainfallMm >= 35) activeTriggers.push("Rainfall");
  if (aqiIndex >= 300) activeTriggers.push("AQI");
  if (tempCelsius >= 44) activeTriggers.push("Extreme Heat");

  // Demand drop based on conditions (model: weather severity → demand impact)
  const demandDropPct = Math.min(
    80,
    Math.round(
      (rainfallMm >= 35 ? 30 : rainfallMm >= 20 ? 15 : 0) +
      (aqiIndex >= 300 ? 25 : aqiIndex >= 200 ? 10 : 0) +
      (tempCelsius >= 44 ? 20 : tempCelsius >= 40 ? 8 : 0)
    )
  );
  if (demandDropPct >= 50) activeTriggers.push("Demand Collapse");

  // Peer corroboration (simulated from conditions)
  const peerCorroboration = Math.min(95, Math.round(activeTriggers.length * 25 + Math.random() * 20));

  // Disruption probability model
  const disruptionProbability = Math.min(
    0.95,
    (rainfallMm / 100) * 0.4 +
    (aqiIndex / 500) * 0.3 +
    ((tempCelsius - 35) / 15) * 0.2 +
    (demandDropPct / 100) * 0.1
  );

  const weatherIntensityMultiplier =
    rainfallMm >= 35 ? 1.25 : rainfallMm >= 20 ? 1.15 : aqiIndex >= 300 ? 1.2 : tempCelsius >= 44 ? 1.2 : 1.0;

  // Seasonal (Bengaluru: monsoon June–Sep → higher, summer Mar–May → moderate)
  const month = new Date().getMonth() + 1;
  const seasonalAdjustment =
    month >= 6 && month <= 9 ? 1.1 :  // monsoon
    month >= 3 && month <= 5 ? 1.05 : // summer
    0.95;                               // winter

  return {
    zone,
    baseRisk: ZONE_BASE_RISK[zone],
    rainfallMm: Math.round(rainfallMm * 10) / 10,
    aqiIndex,
    tempCelsius,
    demandDropPct,
    peerCorroboration,
    activeTriggers,
    disruptionProbability: Math.round(disruptionProbability * 100) / 100,
    weatherIntensityMultiplier,
    seasonalAdjustment,
  };
}

/** Fallback mock data when no API key is configured */
export function getMockZoneData(zone: Zone): ZoneRiskData {
  const mocks: Record<Zone, { rain: number; aqi: number; temp: number }> = {
    Koramangala:  { rain: 42, aqi: 180, temp: 28 },
    Indiranagar:  { rain: 18, aqi: 145, temp: 32 },
    "HSR Layout": { rain: 8,  aqi: 95,  temp: 30 },
    Whitefield:   { rain: 25, aqi: 220, temp: 29 },
    Marathahalli: { rain: 38, aqi: 195, temp: 27 },
    "BTM Layout": { rain: 5,  aqi: 315, temp: 31 },
  };
  const m = mocks[zone];
  return buildZoneRiskData(zone, m.rain, m.aqi, m.temp);
}

export async function getZoneData(zone: Zone): Promise<ZoneRiskData> {
  return fetchWeatherForZone(zone);
}

export async function getAllZonesData(): Promise<ZoneRiskData[]> {
  const zones = Object.keys(ZONE_COORDS) as Zone[];
  return Promise.all(zones.map(getZoneData));
}

export function getRiskLevel(probability: number): "Low" | "Moderate" | "High" | "Elevated" {
  if (probability < 0.3) return "Low";
  if (probability < 0.5) return "Moderate";
  if (probability < 0.65) return "High";
  return "Elevated";
}
