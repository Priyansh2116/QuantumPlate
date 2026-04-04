import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { VerifyOtpSchema, formatZodError } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = VerifyOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { phone, otp } = parsed.data;

    const record = await prisma.otpCode.findUnique({ where: { phone } });
    if (!record) {
      return NextResponse.json({ error: "OTP not found. Please request a new one." }, { status: 400 });
    }
    if (record.expiresAt < new Date()) {
      return NextResponse.json({ error: "OTP expired. Please request a new one." }, { status: 400 });
    }
    if (record.code !== otp) {
      return NextResponse.json({ error: "Invalid OTP." }, { status: 400 });
    }

    // Clean up used OTP
    await prisma.otpCode.delete({ where: { phone } });

    // Find existing worker
    const worker = await prisma.worker.findUnique({ where: { phone } });
    if (!worker) {
      return NextResponse.json(
        { error: "Phone not registered. Please complete registration first." },
        { status: 404 }
      );
    }

    const token = signToken({ workerId: worker.id, phone: worker.phone });
    return NextResponse.json({ token, worker });
  } catch (err) {
    console.error("[verify-otp]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
