import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/auth";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "gigguard-admin-2026";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signToken({ workerId: "admin", phone: "admin", role: "admin" });
    return NextResponse.json({ token, username: ADMIN_USERNAME });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
