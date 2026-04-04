import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateOtp } from "@/lib/auth";
import { SendOtpSchema, formatZodError } from "@/lib/validation";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SendOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }
    const { phone } = parsed.data;

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await prisma.otpCode.upsert({
      where: { phone },
      update: { code: otp, expiresAt },
      create: { phone, code: otp, expiresAt },
    });

    // In production, send via SMS (Twilio/MSG91/AWS SNS)
    // For now, return the OTP in dev mode only
    const isDev = process.env.NODE_ENV !== "production";

    console.log(`[OTP] Phone: ${phone} → OTP: ${otp}`);

    return NextResponse.json({
      message: "OTP sent",
      ...(isDev ? { otp, note: "OTP visible in dev mode only" } : {}),
    });
  } catch (err) {
    console.error("[send-otp]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
