import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthError, getAuthErrorMessage } from "@/lib/auth";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

/**
 * GET /api/admin/clients/[id]/units
 * Lista unidades (filiais) do cliente.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await requireAuth(["ADMIN"]);
    const params = await Promise.resolve(context.params);
    const clientId = params.id;

    const units = await prisma.clientUnit.findMany({
      where: { clientId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, uf: true, clientId: true },
    });

    return NextResponse.json({ units });
  } catch (error) {
    console.error("admin client units error", error);
    const status = isAuthError(error) ? 403 : 500;
    const message = isAuthError(error) ? getAuthErrorMessage(error) : "Erro ao carregar unidades.";
    return NextResponse.json({ error: message }, { status });
  }
}

