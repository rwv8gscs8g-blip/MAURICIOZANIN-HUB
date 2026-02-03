import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(["ADMIN"]);
    const body = await request.json();
    const { id } = await context.params;

    const data: Record<string, any> = {};
    if (body.name) data.name = String(body.name).trim();
    if (body.email) data.email = String(body.email).toLowerCase().trim();
    if (body.role) data.role = body.role;
    if (body.avatarUrl !== undefined) data.avatarUrl = body.avatarUrl || null;
    if (body.clientOrganizationId !== undefined)
      data.clientOrganizationId = body.clientOrganizationId || null;
    if (body.clientAccessApproved !== undefined)
      data.clientAccessApproved = Boolean(body.clientAccessApproved);
    if (body.certificateOnly !== undefined) data.certificateOnly = Boolean(body.certificateOnly);
    if (body.certificateThumbprint !== undefined)
      data.certificateThumbprint = body.certificateThumbprint || null;
    if (body.lockedUntil !== undefined) data.lockedUntil = body.lockedUntil;
    if (body.failedLoginAttempts !== undefined)
      data.failedLoginAttempts = Number(body.failedLoginAttempts) || 0;

    if (body.password) {
      if (String(body.password).length < 8) {
        return NextResponse.json(
          { error: "Senha com no mínimo 8 caracteres." },
          { status: 400 }
        );
      }
      data.passwordHash = await bcrypt.hash(String(body.password), 10);
    }

    let hubs = Array.isArray(body.hubs) ? body.hubs : null;
    const projects = Array.isArray(body.projects) ? body.projects : null;
    if (body.role === "CLIENTE" && hubs && hubs.length === 0) {
      hubs = [
        "COOPERACAO_INTERNACIONAL",
        "COMPRAS_GOVERNAMENTAIS",
        "SUPORTE_MUNICIPIOS",
        "DESENVOLVIMENTO_SOFTWARE",
      ];
    }

    const user = await prisma.$transaction(async (tx) => {
      if (hubs) {
        await tx.userHubAccess.deleteMany({ where: { userId: id } });
        if (hubs.length) {
          await tx.userHubAccess.createMany({
            data: hubs.map((hub: string) => ({ userId: id, hub })),
          });
        }
      }
      if (projects) {
        await tx.userProjectAccess.deleteMany({ where: { userId: id } });
        if (projects.length) {
          await tx.userProjectAccess.createMany({
            data: projects.map((projectId: string) => ({ userId: id, projectId })),
          });
        }
      }

      if (body.clientOrganizationId !== undefined) {
        await tx.resourceAccess.deleteMany({
          where: { userId: id, clientId: { not: null } },
        });
        if (data.clientOrganizationId) {
          await tx.resourceAccess.create({
            data: {
              userId: id,
              role: "OWNER",
              clientId: data.clientOrganizationId,
            },
          });
        }
      }

      if (hubs) {
        await tx.resourceAccess.deleteMany({
          where: { userId: id, hubAxis: { not: null } },
        });
        if (hubs.length) {
          await tx.resourceAccess.createMany({
            data: hubs.map((hub: string) => ({ userId: id, role: "MEMBER", hubAxis: hub })),
            skipDuplicates: true,
          });
        }
      }

      if (projects) {
        await tx.resourceAccess.deleteMany({
          where: { userId: id, projectId: { not: null } },
        });
        if (projects.length) {
          await tx.resourceAccess.createMany({
            data: projects.map((projectId: string) => ({
              userId: id,
              role: "MEMBER",
              projectId,
            })),
            skipDuplicates: true,
          });
        }
      }
      return tx.user.update({ where: { id }, data });
    });

    await logAudit({
      entity: "User",
      entityId: user.id,
      action: "USER_UPDATED",
      performedBy: session.user.id,
      data,
    });

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error("admin users update error", error);
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(["ADMIN"]);
    const { id } = await context.params;

    await prisma.user.delete({ where: { id } });

    await logAudit({
      entity: "User",
      entityId: id,
      action: "USER_DELETED",
      performedBy: session.user.id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("admin users delete error", error);
    return NextResponse.json({ error: "Erro ao excluir usuário" }, { status: 500 });
  }
}
