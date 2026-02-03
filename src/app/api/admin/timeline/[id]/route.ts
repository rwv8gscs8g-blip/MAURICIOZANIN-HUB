import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await requireAuth(["ADMIN"]);
    const id = params.id;
    const body = await request.json();
    const data: Record<string, any> = {};

    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.summary = body.description || null;
    if (body.axis !== undefined) data.axis = body.axis || null;
    if (body.hub !== undefined) data.hub = body.hub || null;
    if (body.source !== undefined) data.sourceName = body.source || null;
    if (body.url !== undefined) data.sourceUrl = body.url || null;
    if (body.date !== undefined) data.eventDate = body.date ? new Date(body.date) : null;

    if (body.approved !== undefined) {
      data.status = body.approved ? "APPROVED" : "PENDING";
    }
    if (body.visibility !== undefined) {
      data.isPublic = body.visibility === "PUBLICO";
    }

    const item = await prisma.contentItem.update({
      where: { id },
      data,
    });

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    console.error("admin timeline update error", error);
    return NextResponse.json({ error: "Erro ao atualizar item" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await requireAuth(["ADMIN"]);
    const id = params.id;
    const timelineChannel = await prisma.contentChannel.findFirst({ where: { key: "timeline" } });
    if (timelineChannel) {
      await prisma.contentItemChannel.deleteMany({
        where: { contentItemId: id, channelId: timelineChannel.id },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("admin timeline delete error", error);
    return NextResponse.json({ error: "Erro ao excluir item" }, { status: 500 });
  }
}
