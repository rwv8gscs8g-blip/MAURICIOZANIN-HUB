import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await requireAuth(["ADMIN"]);
    const body = await request.json();
    const item = await prisma.newsMention.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json({ ok: true, item });
  } catch (error) {
    console.error("admin midia update error", error);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}
