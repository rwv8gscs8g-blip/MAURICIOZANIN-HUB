import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthError, getAuthErrorMessage } from "@/lib/auth";

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
    const status = isAuthError(error) ? 403 : 500;
    const message = isAuthError(error) ? getAuthErrorMessage(error) : "Erro ao carregar publicações.";
    return NextResponse.json({ error: message }, { status });
  }
}
