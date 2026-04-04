import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  console.log("Seeding database...");

  const worker = await prisma.worker.upsert({
    where: { phone: "9876543210" },
    update: {},
    create: {
      id: "worker_rajan",
      name: "Rajan Kumar",
      phone: "9876543210",
      zone: "Koramangala",
      platforms: ["Blinkit", "Zepto"],
      weeklyEarnings: 4800,
      hoursPerWeek: 60,
      behavioralScore: 72,
      riskLevel: "High",
    },
  });
  console.log("  Worker:", worker.name);

  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const breakdown = {
    avgHourlyEarnings: 80,
    expectedLostHours: 6,
    disruptionProbability: 0.42,
    riskScore: 1.3,
    basePremium: 249,
    platformFee: 29,
    behavioralDiscount: 18,
    coverageCeiling: 2400,
    finalPremium: 260,
  };

  const policy = await prisma.policy.upsert({
    where: { id: "policy_seed_001" },
    update: {},
    create: {
      id: "policy_seed_001",
      workerId: worker.id,
      weekStart: now,
      weekEnd,
      premium: breakdown.finalPremium,
      coverageCeiling: breakdown.coverageCeiling,
      status: "Active",
      triggers: ["Rainfall", "AQI", "Zone Shutdown", "Demand Collapse", "Extreme Heat"],
      premiumBreakdown: breakdown,
      razorpayOrderId: "order_seed_001",
      paidAt: now,
    },
  });
  console.log("  Policy:", policy.id, "— Premium: Rs.", policy.premium);

  const claim = await prisma.claim.upsert({
    where: { id: "claim_seed_001" },
    update: {},
    create: {
      id: "claim_seed_001",
      policyId: policy.id,
      workerId: worker.id,
      triggerType: "Rainfall",
      triggerData: {
        type: "Rainfall",
        value: 42,
        duration: 2.5,
        peerCorroboration: 65,
        gpsConfirmed: true,
        source: "OpenWeatherMap + Peer Signal",
      },
      status: "Approved",
      claimedAmount: 420,
      approvedAmount: 420,
      fraudScore: 8,
      fraudFlags: [],
      resolvedAt: new Date(),
    },
  });
  console.log("  Claim:", claim.id, "— Amount: Rs.", claim.approvedAmount);

  console.log("Seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
