import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
import { prisma } from "@/lib/prisma";
import { login } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const thumbprint =
      request.headers.get("x-cert-thumbprint") ||
      request.headers.get("x-ssl-client-sha1") ||
      "";

    if (!thumbprint) {
      return NextResponse.json(
        { error: "Certificado não informado." },
        { status: 400 }
      );
    }

    let user;
    try {
      user = await prisma.user.findFirst({
        where: { certificateThumbprint: thumbprint },
        include: {
          hubAccesses: { select: { hub: true } },
          projectAccesses: { select: { projectId: true } },
        },
      });
    } catch (err: any) {
      if (err?.code === "P2021" && String(err?.message || "").includes("UserProjectAccess")) {
        user = await prisma.user.findFirst({
          where: { certificateThumbprint: thumbprint },
          include: {
            hubAccesses: { select: { hub: true } },
          },
        });
      } else {
        throw err;
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Certificado não autorizado." }, { status: 401 });
    }

    await login({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        clientOrganizationId: user.clientOrganizationId,
        hubAccesses: user.hubAccesses?.map((h) => h.hub) || [],
        projectAccesses: (user as any).projectAccesses?.map((p: any) => p.projectId) || [],
      },
      sessionMinutes: 60,
    });

    await logAudit({
      entity: "User",
      entityId: user.id,
      action: "LOGIN_CERTIFICATE",
      performedBy: user.id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("certificate login error", error);
    return NextResponse.json({ error: "Erro ao validar certificado" }, { status: 500 });
  }
}
