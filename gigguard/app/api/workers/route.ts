import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signToken, hashPassword } from "@/lib/auth";
import { RegisterWorkerSchema, formatZodError } from "@/lib/validation";
import { getZoneData, getRiskLevel } from "@/lib/weather";
import { Zone } from "@/lib/types";

// GET /api/workers — list workers (admin use)
export async function GET() {
  const workers = await prisma.worker.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(workers);
}

// POST /api/workers — register new worker
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterWorkerSchema.safeParse({
      ...body,
      weeklyEarnings: Number(body.weeklyEarnings),
      hoursPerWeek: Number(body.hoursPerWeek),
    });

    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }

    const { name, phone, password, zone, platforms, weeklyEarnings, hoursPerWeek } = parsed.data;

    // Duplicate phone check
    const existing = await prisma.worker.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json({ error: "Phone number already registered. Please sign in." }, { status: 409 });
    }

    // Get live zone risk for initial risk level
    const zoneData = await getZoneData(zone as Zone);
    const riskLevel = getRiskLevel(zoneData.disruptionProbability);

    const passwordHash = await hashPassword(password);

    const worker = await prisma.worker.create({
      data: {
        name,
        phone,
        passwordHash,
        zone,
        platforms,
        weeklyEarnings,
        hoursPerWeek,
        behavioralScore: 50,
        riskLevel,
      },
    });

    // Auto-issue JWT on registration (no OTP required for registration flow)
    const token = signToken({ workerId: worker.id, phone: worker.phone });

    return NextResponse.json({ ...worker, token }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/workers]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
