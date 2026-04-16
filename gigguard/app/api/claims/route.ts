import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getZoneData } from "@/lib/weather";
import { evaluateTriggers, calculatePayout } from "@/lib/triggers";
import { runFraudCheck } from "@/lib/fraud";
import { initiatePayout } from "@/lib/razorpay";
import { EvaluateClaimsSchema, formatZodError } from "@/lib/validation";
import { Zone, TriggerType } from "@/lib/types";

// GET /api/claims?workerId=xxx
export async function GET(req: NextRequest) {
  const workerId = req.nextUrl.searchParams.get("workerId");
  const claims = await prisma.claim.findMany({
    where: workerId ? { workerId } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(claims);
}

// POST /api/claims — run parametric trigger evaluation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = EvaluateClaimsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { workerId, simulatedTrigger } = parsed.data;

    const worker = await prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    const policy = await prisma.policy.findFirst({
      where: { workerId, status: "Active" },
    });
    if (!policy) {
      return NextResponse.json(
        { error: "No active policy found for this worker" },
        { status: 404 }
      );
    }

    // Fetch live zone data
    const zoneData = await getZoneData(worker.zone as Zone);
    let triggeredEvents = evaluateTriggers(zoneData);

    // Optional demo trigger injection
    if (simulatedTrigger && !triggeredEvents.find((t) => t.type === simulatedTrigger)) {
      const typeValues: Record<TriggerType, number> = {
        Rainfall: 38,
        AQI: 320,
        "Zone Shutdown": 1,
        "Demand Collapse": 55,
        "Extreme Heat": 45,
      };
      triggeredEvents.push({
        type: simulatedTrigger as TriggerType,
        value: typeValues[simulatedTrigger as TriggerType] ?? 50,
        duration: 2,
        peerCorroboration: 58,
        gpsConfirmed: true,
        source: "Simulated (Demo Mode)",
      });
    }

    if (triggeredEvents.length === 0) {
      return NextResponse.json({
        message: "No parametric triggers breached. System continues monitoring.",
        zoneConditions: {
          rainfall: zoneData.rainfallMm,
          aqi: zoneData.aqiIndex,
          temp: zoneData.tempCelsius,
          demandDrop: zoneData.demandDropPct,
        },
      });
    }

    const avgHourlyEarnings = worker.weeklyEarnings / worker.hoursPerWeek;
    const createdClaims = [];

    for (const trigger of triggeredEvents) {
      // Prevent duplicate claims for same policy + trigger type
      const existingClaim = await prisma.claim.findFirst({
        where: { policyId: policy.id, triggerType: trigger.type },
      });
      if (existingClaim) continue;

      const payout = calculatePayout(trigger, avgHourlyEarnings, policy.coverageCeiling);

      // Fetch recent approved payouts in this zone for z-score baseline
      const recentZonePayouts = await prisma.claim.findMany({
        where: { status: "Approved", worker: { zone: worker.zone } },
        select: { approvedAmount: true },
        orderBy: { createdAt: "desc" },
        take: 30,
      });
      const zoneHistoricalPayouts = recentZonePayouts.map((c) => c.approvedAmount);

      const fraudResult = runFraudCheck({
        triggerData: trigger,
        workerActivityDuringClaim: Math.random() * 30, // real: pull from platform activity API
        claimedAmount: payout,
        coverageCeiling: policy.coverageCeiling,
        zoneHistoricalPayouts,
        purchaseLeadHours: policy.paidAt
          ? (Date.now() - new Date(policy.paidAt).getTime()) / 3_600_000
          : 999,
        recentPurchasePrior24h: false,
        adverseSelectionCount: 0,
      });

      let status: "Approved" | "Under Review" | "Pending" | "Rejected" = "Pending";
      if (fraudResult.score >= 50) {
        status = "Under Review";
      } else if (fraudResult.autoApprove) {
        status = "Approved";
      } else if (fraudResult.score < 30) {
        status = "Approved";
      }

      const claim = await prisma.claim.create({
        data: {
          policyId: policy.id,
          workerId,
          triggerType: trigger.type,
          triggerData: trigger as object,
          status,
          claimedAmount: payout,
          approvedAmount: status === "Approved" ? payout : 0,
          fraudScore: fraudResult.score,
          fraudFlags: fraudResult.flags,
          resolvedAt: status === "Approved" ? new Date() : null,
        },
      });

      // Initiate payout if approved
      if (status === "Approved" && payout > 0) {
        const pout = await initiatePayout({
          workerId,
          amount: payout,
          purpose: `GigGuard claim — ${trigger.type}`,
        });
        console.log(`[Payout] Worker ${workerId}: Rs. ${payout} → ${pout.payoutId}`);
      }

      createdClaims.push(claim);
    }

    return NextResponse.json(
      { claims: createdClaims, triggersEvaluated: triggeredEvents.length },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/claims]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
