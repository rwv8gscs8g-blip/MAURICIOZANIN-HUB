import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function DELETE(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await requireAuth(["ADMIN"]);
    const id = params.id;
    await prisma.atestado.delete({ where: { id } });
    await logAudit({
      entity: "Atestado",
      entityId: id,
      action: "ATESTADO_DELETED",
      performedBy: session.user.id,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("admin atestado delete error", error);
    return NextResponse.json({ error: "Erro ao excluir atestado" }, { status: 500 });
  }
}
