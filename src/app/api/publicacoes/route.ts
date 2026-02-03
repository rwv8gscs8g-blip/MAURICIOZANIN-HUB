import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const items = await prisma.publication.findMany({
    where: { approved: true, isPublic: true, isActive: true },
    orderBy: { dateOriginal: "desc" },
  });
  return NextResponse.json({ items });
}
