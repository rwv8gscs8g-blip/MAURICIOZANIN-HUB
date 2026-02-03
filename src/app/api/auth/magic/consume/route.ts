import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
import { consumeAuthToken } from "@/lib/auth-tokens";
import { login } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = String(body.token || "");

    if (!token) {
      return NextResponse.json({ error: "Token inválido." }, { status: 400 });
    }

    const record = await consumeAuthToken({ token, type: "MAGIC_LINK" });
    if (!record) {
      return NextResponse.json({ error: "Token inválido ou expirado." }, { status: 400 });
    }

    const user = record.user;
    const resourceAccesses = await prisma.resourceAccess.findMany({
      where: { userId: user.id },
      select: { hubAxis: true },
    });
    const resourceHubs = resourceAccesses
      .map((r) => r.hubAxis)
      .filter(Boolean) as string[];

    await login({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        clientOrganizationId: user.clientOrganizationId,
        clientAccessApproved: user.clientAccessApproved,
        hubAccesses: Array.from(
          new Set([...(user.hubAccesses?.map((h: any) => h.hub) || []), ...resourceHubs])
        ),
        projectAccesses: (user as any).projectAccesses
          ? (user as any).projectAccesses.map((p: any) => p.projectId)
          : [],
      },
      sessionMinutes: user.role === "ADMIN" ? 60 : 30,
    });

    await logAudit({
      entity: "User",
      entityId: user.id,
      action: "LOGIN_MAGIC_LINK",
      performedBy: user.id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("magic link consume error", error);
    return NextResponse.json({ error: "Erro ao validar token" }, { status: 500 });
  }
}
