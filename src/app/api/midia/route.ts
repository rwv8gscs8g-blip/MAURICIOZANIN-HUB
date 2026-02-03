import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const items = await prisma.newsMention.findMany({
    where: { status: "APROVADO" },
    orderBy: { publishedAt: "desc" },
  });
  return NextResponse.json({ items });
}
