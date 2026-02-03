import { NextResponse } from "next/server";

export const runtime = "nodejs";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({
      user: session.user,
      expires: session.expires,
    });
  } catch (error) {
    console.error("auth session error", error);
    return NextResponse.json({ user: null });
  }
}
