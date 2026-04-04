import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { VerifyPaymentSchema, formatZodError } from "@/lib/validation";

// POST /api/policies/verify-payment — confirm Razorpay payment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = VerifyPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }

    const { policyId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

    const policy = await prisma.policy.findUnique({ where: { id: policyId } });
    if (!policy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }
    if (policy.status === "Active") {
      return NextResponse.json({ message: "Policy already active" });
    }

    // Verify signature
    const valid = verifyPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!valid) {
      return NextResponse.json({ error: "Payment signature verification failed" }, { status: 400 });
    }

    // Activate policy
    const updated = await prisma.policy.update({
      where: { id: policyId },
      data: { status: "Active", paidAt: new Date() },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[verify-payment]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
