import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const items = await prisma.contentItem.findMany({
    where: {
      status: "APPROVED",
      isPublic: true,
      channels: {
        some: {
          channel: { key: "timeline" },
          isVisible: true,
        },
      },
    },
    orderBy: [{ eventDate: "desc" }, { publishDate: "desc" }, { createdAt: "desc" }],
    include: { channels: { include: { channel: true } } },
  });

  const mapped = items.map((item) => ({
    id: item.id,
    date: item.eventDate || item.publishDate || item.createdAt,
    title: item.title,
    description: item.summary,
    axis: item.axis,
    hub: item.hub,
    type: item.type,
    category: item.axis,
    source: item.sourceName,
    url: item.sourceUrl,
    approved: item.status === "APPROVED",
    visibility: item.isPublic ? "PUBLICO" : "INTERNO",
  }));

  return NextResponse.json({ items: mapped });
}
