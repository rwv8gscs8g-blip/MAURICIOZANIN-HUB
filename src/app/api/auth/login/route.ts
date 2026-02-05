import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
import { prisma } from "@/lib/prisma";
import { login } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { verifyPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 400 });
    }

    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email },
        include: {
          clientOrganization: { select: { slug: true } },
          hubAccesses: { select: { hub: true } },
          projectAccesses: { select: { projectId: true } },
        },
      });
    } catch (err: any) {
      if (err?.code === "P2021" && String(err?.message || "").includes("UserProjectAccess")) {
        user = await prisma.user.findUnique({
          where: { email },
          include: {
            clientOrganization: { select: { slug: true } },
            hubAccesses: { select: { hub: true } },
          },
        });
      } else {
        throw err;
      }
    }
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    if (user.certificateOnly) {
      return NextResponse.json(
        { error: "Este usuário exige login por certificado digital." },
        { status: 403 }
      );
    }

    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      return NextResponse.json({ error: "Conta temporariamente bloqueada" }, { status: 423 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: { increment: 1 },
          lockedUntil:
            user.failedLoginAttempts + 1 >= 5
              ? new Date(Date.now() + 15 * 60 * 1000)
              : user.lockedUntil,
        },
      });
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });

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
          new Set([...(user.hubAccesses?.map((h) => h.hub) || []), ...resourceHubs])
        ),
        projectAccesses: (user as any).projectAccesses?.map((p: any) => p.projectId) || [],
      },
      sessionMinutes: user.role === "ADMIN" ? 60 : 30,
    });

    await logAudit({
      entity: "User",
      entityId: user.id,
      action: "LOGIN_PASSWORD",
      performedBy: user.id,
    });

    return NextResponse.json({
      ok: true,
      user: {
        role: user.role,
        clientOrganizationId: user.clientOrganizationId,
        clientAccessApproved: user.clientAccessApproved,
        clientOrganizationSlug: user.clientOrganization?.slug || null,
        hubAccesses: Array.from(
          new Set([...(user.hubAccesses?.map((h) => h.hub) || []), ...resourceHubs])
        ),
        projectAccesses: (user as any).projectAccesses?.map((p: any) => p.projectId) || [],
      },
    });
  } catch (error) {
    console.error("auth login error", error);
    return NextResponse.json({ error: "Erro ao autenticar" }, { status: 500 });
  }
}
