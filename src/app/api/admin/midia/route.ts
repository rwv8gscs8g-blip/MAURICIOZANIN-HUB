import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAuth(["ADMIN"]);
    const items = await prisma.newsMention.findMany({
      orderBy: { publishedAt: "desc" },
    });
    return NextResponse.json({ items });
  } catch (error) {
    console.error("admin midia list error", error);
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
}
