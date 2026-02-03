import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(["ADMIN"]);
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId") || undefined;

    const atestados = await prisma.atestado.findMany({
      where: productId
        ? {
            products: {
              some: { productId },
            },
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        products: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
      },
    });
    return NextResponse.json({ atestados });
  } catch (error) {
    console.error("admin atestados list error", error);
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(["ADMIN"]);
    const body = await request.json();

    const productIds = Array.isArray(body.productIds)
      ? body.productIds.map((value: string) => String(value))
      : body.productId
        ? [String(body.productId)]
        : [];
    const title = String(body.title || "").trim();
    const issuedBy = body.issuedBy ? String(body.issuedBy).trim() : null;
    const issuedAt = body.issuedAt ? new Date(body.issuedAt) : null;
    const summary = body.summary ? String(body.summary).trim() : null;
    const fileUrl = body.fileUrl ? String(body.fileUrl).trim() : null;

    if (!productIds.length || !title) {
      return NextResponse.json({ error: "Produto e título são obrigatórios." }, { status: 400 });
    }

    const atestado = await prisma.atestado.create({
      data: {
        title,
        issuedBy,
        issuedAt,
        summary,
        fileUrl,
        products: {
          create: productIds.map((id: string) => ({ productId: id })),
        },
      },
      include: {
        products: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
      },
    });

    await logAudit({
      entity: "Atestado",
      entityId: atestado.id,
      action: "ATESTADO_CREATED",
      performedBy: session.user.id,
    });

    return NextResponse.json({ ok: true, atestado });
  } catch (error) {
    console.error("admin atestados create error", error);
    return NextResponse.json({ error: "Erro ao criar atestado" }, { status: 500 });
  }
}
