import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthError, getAuthErrorMessage } from "@/lib/auth";

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
    const status = isAuthError(error) ? 403 : 500;
    const message = isAuthError(error) ? getAuthErrorMessage(error) : "Erro ao carregar mídia.";
    return NextResponse.json({ error: message }, { status });
  }
}
