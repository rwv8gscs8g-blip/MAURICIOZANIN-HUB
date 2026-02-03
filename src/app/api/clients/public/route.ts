import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const clients = await prisma.clientOrganization.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return NextResponse.json({ clients });
  } catch (error) {
    console.error("clients public error", error);
    return NextResponse.json({ clients: [] });
  }
}
