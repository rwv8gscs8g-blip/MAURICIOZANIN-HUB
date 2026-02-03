import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    await requireAuth(["ADMIN"]);
    const params = await Promise.resolve(context.params);
    const id = params.id;
    const body = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        isVisiblePublic: body.isVisiblePublic,
        isVisibleClient: body.isVisibleClient,
        isVisibleTimeline: body.isVisibleTimeline,
        isVisibleShare: body.isVisibleShare,
      },
      include: { client: true },
    });

    const productUrl = product.path || `/produtos/${product.slug}`;
    const publishDate =
      product.client?.slug === "inovajuntos"
        ? new Date("2024-10-30")
        : product.year
          ? new Date(`${product.year}-10-30`)
          : new Date();

    const existingContent = product.contentItemId
      ? await prisma.contentItem.findUnique({ where: { id: product.contentItemId } })
      : null;

    const contentItem = existingContent
      ? await prisma.contentItem.update({
          where: { id: existingContent.id },
          data: {
            title: product.name,
            summary: product.description || null,
            hub: product.hub || null,
            axis: product.client?.name || null,
            sourceName: product.client?.name || null,
            sourceUrl: productUrl,
            publishDate,
            isPublic: product.isVisiblePublic,
            status: product.isVisiblePublic ? "APPROVED" : "PENDING",
            clientId: product.clientId,
            clientUnitId: product.clientUnitId ?? null,
          },
        })
      : await prisma.contentItem.create({
          data: {
            type: "PRODUCT",
            title: product.name,
            summary: product.description || null,
            hub: product.hub || null,
            axis: product.client?.name || null,
            sourceName: product.client?.name || null,
            sourceUrl: productUrl,
            publishDate,
            isPublic: product.isVisiblePublic,
            status: product.isVisiblePublic ? "APPROVED" : "PENDING",
            clientId: product.clientId,
            clientUnitId: product.clientUnitId ?? null,
          },
        });

    if (!product.contentItemId) {
      await prisma.product.update({
        where: { id: product.id },
        data: { contentItemId: contentItem.id },
      });
    }

    const channels = await prisma.contentChannel.findMany({
      where: { key: { in: ["timeline", "compartilhe", "produtos", "clientes"] } },
    });
    const channelMap = new Map(channels.map((channel) => [channel.key, channel.id]));

    const syncChannel = async (key: string, enabled: boolean) => {
      const channelId = channelMap.get(key);
      if (!channelId) return;
      if (enabled) {
        await prisma.contentItemChannel.upsert({
          where: { contentItemId_channelId: { contentItemId: contentItem.id, channelId } },
          update: { isVisible: true },
          create: { contentItemId: contentItem.id, channelId, isVisible: true },
        });
      } else {
        await prisma.contentItemChannel.deleteMany({
          where: { contentItemId: contentItem.id, channelId },
        });
      }
    };

    await syncChannel("produtos", true);
    await syncChannel("clientes", true);
    await syncChannel("timeline", product.isVisibleTimeline);
    await syncChannel("compartilhe", product.isVisibleShare);

    return NextResponse.json({ ok: true, product });
  } catch (error) {
    console.error("admin product update error", error);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}
