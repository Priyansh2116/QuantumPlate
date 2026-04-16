import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signToken, verifyPassword } from "@/lib/auth";
import { LoginSchema, formatZodError } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
    }

    const { phone, password } = parsed.data;

    const worker = await prisma.worker.findUnique({ where: { phone } });
    if (!worker) {
      return NextResponse.json({ error: "No account found with this phone number" }, { status: 401 });
    }

    if (!worker.passwordHash) {
      return NextResponse.json({ error: "Account registered without password. Use OTP login." }, { status: 401 });
    }

    const valid = await verifyPassword(password, worker.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    const token = signToken({ workerId: worker.id, phone: worker.phone, role: "worker" });

    // Never return passwordHash to client
    const { passwordHash: _, ...safeWorker } = worker;
    return NextResponse.json({ ...safeWorker, token });
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
