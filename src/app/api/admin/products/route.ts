import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAuth(["ADMIN"]);
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
      include: {
        client: { select: { id: true, name: true, slug: true } },
        clientUnit: { select: { name: true } },
        contentItem: {
          select: {
            id: true,
            status: true,
            isPublic: true,
            channels: {
              select: { channel: { select: { key: true } }, isVisible: true },
            },
          },
        },
      },
    });
    const productsWithTimeline = products.map((product) => {
      const channels = product.contentItem?.channels ?? [];
      const timelineChannel = channels.find((item) => item.channel.key === "timeline");
      const timeline = timelineChannel
        ? {
            approved: product.contentItem?.status === "APPROVED",
            visibility: product.contentItem?.isPublic ? "PUBLICO" : "INTERNO",
          }
        : null;
      return { ...product, timeline };
    });
    return NextResponse.json({ products: productsWithTimeline });
  } catch (error) {
    console.error("admin products list error", error);
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
}
