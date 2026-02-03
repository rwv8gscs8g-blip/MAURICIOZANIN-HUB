import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const items = await prisma.contentItem.findMany({
      where: {
        type: "PRODUCT",
        status: "APPROVED",
        isPublic: true,
        channels: {
          some: { channel: { key: "compartilhe" }, isVisible: true },
        },
      },
      orderBy: [{ publishDate: "desc" }, { createdAt: "desc" }],
      include: {
        product: {
          include: {
            client: { select: { name: true, slug: true } },
            clientUnit: { select: { name: true } },
          },
        },
      },
    });
    const products = items
      .map((item) => {
        if (!item.product) return null;
        return { ...item.product, content: item };
      })
      .filter(Boolean);
    return NextResponse.json({ products });
  } catch (error) {
    console.error("compartilhe products error", error);
    return NextResponse.json({ products: [] });
  }
}
