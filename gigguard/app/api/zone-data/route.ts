import { NextRequest, NextResponse } from "next/server";
import { getZoneData, getAllZonesData, getRiskLevel } from "@/lib/weather";
import { Zone } from "@/lib/types";

const ALL_ZONES: Zone[] = [
  "Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "Marathahalli", "BTM Layout",
];

// GET /api/zone-data?zone=Koramangala
export async function GET(req: NextRequest) {
  try {
    const zone = req.nextUrl.searchParams.get("zone");

    if (zone) {
      if (!ALL_ZONES.includes(zone as Zone)) {
        return NextResponse.json({ error: "Invalid zone" }, { status: 400 });
      }
      const data = await getZoneData(zone as Zone);
      return NextResponse.json({
        ...data,
        riskLevel: getRiskLevel(data.disruptionProbability),
      });
    }

    const allData = await getAllZonesData();
    return NextResponse.json(
      allData.map((d) => ({ ...d, riskLevel: getRiskLevel(d.disruptionProbability) }))
    );
  } catch (err) {
    console.error("[zone-data]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
