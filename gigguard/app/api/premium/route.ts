import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculatePremium } from "@/lib/premium";
import { getZoneData } from "@/lib/weather";
import { Zone } from "@/lib/types";
import { z } from "zod";

const Schema = z.object({ workerId: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "workerId required" }, { status: 400 });
    }

    const worker = await prisma.worker.findUnique({ where: { id: parsed.data.workerId } });
    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    const zoneData = await getZoneData(worker.zone as Zone);

    const breakdown = calculatePremium({
      weeklyEarnings: worker.weeklyEarnings,
      hoursPerWeek: worker.hoursPerWeek,
      zone: worker.zone as Zone,
      behavioralScore: worker.behavioralScore,
      zoneRisk: zoneData,
    });

    return NextResponse.json({
      workerId: worker.id,
      zone: worker.zone,
      zoneConditions: {
        rainfallMm: zoneData.rainfallMm,
        aqiIndex: zoneData.aqiIndex,
        tempCelsius: zoneData.tempCelsius,
        demandDropPct: zoneData.demandDropPct,
        activeTriggers: zoneData.activeTriggers,
        peerCorroboration: zoneData.peerCorroboration,
        disruptionProbability: zoneData.disruptionProbability,
      },
      breakdown,
    });
  } catch (err) {
    console.error("[POST /api/premium]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
