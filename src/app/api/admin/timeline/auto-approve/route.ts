import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    await requireAuth(["ADMIN"]);
    const body = await request.json();
    const url = String(body.url || "");
    const visibility = body.visibility === "PUBLICO" ? "PUBLICO" : "INTERNO";

    if (!url) {
      return NextResponse.json({ error: "URL obrigatória" }, { status: 400 });
    }

    const item = await prisma.contentItem.findFirst({ where: { sourceUrl: url } });
    if (!item) {
      return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
    }

    const updated = await prisma.contentItem.update({
      where: { id: item.id },
      data: {
        status: "APPROVED",
        isPublic: visibility === "PUBLICO",
      },
    });

    return NextResponse.json({ ok: true, item: updated });
  } catch (error) {
    console.error("auto approve timeline error", error);
    return NextResponse.json({ error: "Erro ao aprovar item" }, { status: 500 });
  }
}
