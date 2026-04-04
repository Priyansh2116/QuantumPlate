import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculatePremium } from "@/lib/premium";
import { getZoneData } from "@/lib/weather";
import { createPremiumOrder } from "@/lib/razorpay";
import { CreatePolicySchema, formatZodError } from "@/lib/validation";
import { Zone, TriggerType } from "@/lib/types";

const ALL_TRIGGERS: TriggerType[] = [
  "Rainfall", "AQI", "Zone Shutdown", "Demand Collapse", "Extreme Heat",
];

// GET /api/policies?workerId=xxx
export async function GET(req: NextRequest) {
  const workerId = req.nextUrl.searchParams.get("workerId");
  const policies = await prisma.policy.findMany({
    where: workerId ? { workerId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { worker: { select: { name: true, zone: true } } },
  });
  return NextResponse.json(policies);
}

// POST /api/policies — create policy + Razorpay order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreatePolicySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { workerId } = parsed.data;

    const worker = await prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    // Block if already active policy this week
    const alreadyActive = await prisma.policy.findFirst({
      where: { workerId, status: "Active" },
    });
    if (alreadyActive) {
      return NextResponse.json(
        { error: "Worker already has an active policy this week" },
        { status: 409 }
      );
    }

    const zoneData = await getZoneData(worker.zone as Zone);
    const breakdown = calculatePremium({
      weeklyEarnings: worker.weeklyEarnings,
      hoursPerWeek: worker.hoursPerWeek,
      zone: worker.zone as Zone,
      behavioralScore: worker.behavioralScore,
      zoneRisk: zoneData,
    });

    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Create Razorpay order
    const order = await createPremiumOrder(breakdown.finalPremium, workerId, {
      zone: worker.zone,
      weekEnd: weekEnd.toISOString().split("T")[0],
    });

    // Save policy as Pending Payment
    const policy = await prisma.policy.create({
      data: {
        workerId,
        weekStart: now,
        weekEnd,
        premium: breakdown.finalPremium,
        coverageCeiling: breakdown.coverageCeiling,
        status: order.simulated ? "Active" : "Pending Payment",
        triggers: ALL_TRIGGERS,
        premiumBreakdown: breakdown as object,
        razorpayOrderId: order.orderId,
        paidAt: order.simulated ? now : null,
      },
    });

    return NextResponse.json({
      ...policy,
      razorpayOrder: {
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID || null,
        simulated: order.simulated,
      },
    }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/policies]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
