import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { requireAuth, isAuthError, getAuthErrorMessage } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    await requireAuth(["ADMIN"]);
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        certificateOnly: true,
        clientOrganizationId: true,
        clientAccessApproved: true,
        createdAt: true,
        lastLogin: true,
        lockedUntil: true,
        hubAccesses: { select: { hub: true } },
        projectAccesses: { select: { projectId: true } },
      },
    });
    return NextResponse.json({ users });
  } catch (error) {
    console.error("admin users list error", error);
    const status = isAuthError(error) ? 403 : 500;
    const message = isAuthError(error) ? getAuthErrorMessage(error) : "Erro ao carregar usuários.";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(["ADMIN"]);
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").toLowerCase().trim();
    const role = body.role || "MUNICIPIO";
    const password = String(body.password || "");
    const certificateOnly = Boolean(body.certificateOnly);
    const clientOrganizationId = body.clientOrganizationId || null;
    const certificateThumbprint = body.certificateThumbprint
      ? String(body.certificateThumbprint).trim()
      : null;

    if (!name || !email) {
      return NextResponse.json({ error: "Nome e e-mail são obrigatórios." }, { status: 400 });
    }

    if (!certificateOnly && password.length < 8) {
      return NextResponse.json(
        { error: "Senha com no mínimo 8 caracteres." },
        { status: 400 }
      );
    }

    const passwordHash = certificateOnly ? null : await hashPassword(password);
    const clientAccessApproved =
      role === "CLIENTE" ? Boolean(body.clientAccessApproved) : true;

    let hubs = Array.isArray(body.hubs) ? body.hubs : [];
    const projects = Array.isArray(body.projects) ? body.projects : [];
    if (role === "CLIENTE" && hubs.length === 0) {
      hubs = [
        "COOPERACAO_INTERNACIONAL",
        "COMPRAS_GOVERNAMENTAIS",
        "SUPORTE_MUNICIPIOS",
        "DESENVOLVIMENTO_SOFTWARE",
      ];
    }
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        passwordHash,
        certificateOnly,
        certificateThumbprint,
        clientOrganizationId,
        clientAccessApproved,
        hubAccesses: hubs.length
          ? {
              createMany: {
                data: hubs.map((hub: string) => ({ hub })),
              },
            }
          : undefined,
        projectAccesses: projects.length
          ? {
              createMany: {
                data: projects.map((projectId: string) => ({ projectId })),
              },
            }
          : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        clientOrganizationId: true,
        hubAccesses: { select: { hub: true } },
        projectAccesses: { select: { projectId: true } },
      },
    });

    const resourceRows = [];
    if (clientOrganizationId) {
      resourceRows.push({
        userId: user.id,
        role: "OWNER",
        clientId: clientOrganizationId,
      });
    }
    resourceRows.push(
      ...hubs.map((hub: string) => ({
        userId: user.id,
        role: "MEMBER",
        hubAxis: hub,
      }))
    );
    resourceRows.push(
      ...projects.map((projectId: string) => ({
        userId: user.id,
        role: "MEMBER",
        projectId,
      }))
    );
    if (resourceRows.length) {
      await prisma.resourceAccess.createMany({
        data: resourceRows,
        skipDuplicates: true,
      });
    }

    await logAudit({
      entity: "User",
      entityId: user.id,
      action: "USER_CREATED",
      performedBy: session.user.id,
      data: { role: user.role, email: user.email },
    });

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error("admin users create error", error);
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 });
  }
}
