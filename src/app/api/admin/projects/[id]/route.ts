import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await requireAuth(["ADMIN"]);
    const body = await request.json();
    const id = params.id;

    const data: Record<string, any> = {};
    if (body.name) data.name = String(body.name).trim();
    if (body.slug)
      data.slug = String(body.slug)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/(^-|-$)/g, "");
    if (body.description !== undefined) data.description = body.description || null;
    if (body.clientId) data.clientId = body.clientId;
    if (body.hub) data.hub = body.hub;
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    const project = await prisma.project.update({ where: { id }, data });
    return NextResponse.json({ ok: true, project });
  } catch (error) {
    console.error("admin projects update error", error);
    return NextResponse.json({ error: "Erro ao atualizar projeto." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await requireAuth(["ADMIN"]);
    const id = params.id;
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("admin projects delete error", error);
    return NextResponse.json({ error: "Erro ao excluir projeto." }, { status: 500 });
  }
}
