import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAuth(["ADMIN"]);
    const items = await prisma.publication.findMany({
      orderBy: { dateOriginal: "desc" },
    });
    return NextResponse.json({ items });
  } catch (error) {
    console.error("admin publicacoes list error", error);
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
}
