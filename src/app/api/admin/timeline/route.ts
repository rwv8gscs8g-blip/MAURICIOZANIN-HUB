import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthError, getAuthErrorMessage } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(["ADMIN"]);
    const { searchParams } = new URL(request.url);
    const approved = searchParams.get("approved");
    const status = searchParams.get("status");
    const visibility = searchParams.get("visibility");
    const hub = searchParams.get("hub");
    const q = searchParams.get("q");

    const where: Record<string, unknown> = {};

    if (approved !== null) {
      where.status = approved === "true" ? "APPROVED" : "PENDING";
    }

    if (status === "publicado") {
      where.status = "APPROVED";
      where.isPublic = true;
    }
    if (status === "pendente") {
      where.status = "PENDING";
    }
    if (status === "aprovado") {
      where.status = "APPROVED";
    }
    if (status === "interno") {
      where.isPublic = false;
    }

    if (visibility) {
      where.isPublic = visibility === "PUBLICO";
    }

    if (hub) {
      where.hub = hub;
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
        { sourceName: { contains: q, mode: "insensitive" } },
        { sourceUrl: { contains: q, mode: "insensitive" } },
        { axis: { contains: q, mode: "insensitive" } },
      ];
    }

    const items = await prisma.contentItem.findMany({
      where: {
        ...where,
        channels: {
          some: { channel: { key: "timeline" }, isVisible: true },
        },
      },
      orderBy: [{ eventDate: "desc" }, { publishDate: "desc" }, { createdAt: "desc" }],
    });

    const mapped = items.map((item) => ({
      id: item.id,
      date: item.eventDate || item.publishDate || item.createdAt,
      title: item.title,
      description: item.summary || null,
      axis: item.axis || null,
      hub: item.hub || null,
      type: item.type,
      category: item.axis || null,
      source: item.sourceName || null,
      url: item.sourceUrl || null,
      approved: item.status === "APPROVED",
      visibility: item.isPublic ? "PUBLICO" : "INTERNO",
    }));

    return NextResponse.json({ items: mapped });
  } catch (error) {
    console.error("admin timeline list error", error);
    const status = isAuthError(error) ? 403 : 500;
    const message = isAuthError(error) ? getAuthErrorMessage(error) : "Erro ao carregar timeline.";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth(["ADMIN"]);
    const body = await request.json();
    const channel = await prisma.contentChannel.findFirst({ where: { key: "timeline" } });
    if (!channel) {
      return NextResponse.json({ error: "Canal timeline nao configurado" }, { status: 400 });
    }

    const item = await prisma.contentItem.create({
      data: {
        type: body.type || "EVENT",
        title: body.title,
        summary: body.description || null,
        axis: body.axis || null,
        hub: body.hub || null,
        sourceName: body.source || null,
        sourceUrl: body.url || null,
        eventDate: body.date ? new Date(body.date) : null,
        status: body.approved ? "APPROVED" : "PENDING",
        isPublic: body.visibility === "PUBLICO",
        channels: {
          create: {
            channelId: channel.id,
            isVisible: true,
          },
        },
      },
    });

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    console.error("admin timeline create error", error);
    return NextResponse.json({ error: "Erro ao criar item" }, { status: 500 });
  }
}
