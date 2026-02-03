import { NextResponse } from "next/server";

export const runtime = "nodejs";
import { getSession, logout } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST() {
  try {
    const session = await getSession();
    await logout();
    if (session?.user?.id) {
      await logAudit({
        entity: "User",
        entityId: session.user.id,
        action: "LOGOUT",
        performedBy: session.user.id,
      });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("auth logout error", error);
    return NextResponse.json({ error: "Erro ao sair" }, { status: 500 });
  }
}
