#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const ROOT_DIR = path.resolve(process.cwd());
const PUBLIC_DIR = path.join(ROOT_DIR, "public");

const channels = [
  { key: "timeline", name: "Timeline", description: "Linha do tempo principal" },
  { key: "compartilhe", name: "Compartilhe", description: "Conteudo publico para compartilhamento" },
  { key: "publicacoes", name: "Publicacoes", description: "Publicacoes e materiais" },
  { key: "midia", name: "Na Midia", description: "Noticias e midia" },
  { key: "produtos", name: "Produtos", description: "Produtos de clientes" },
  { key: "clientes", name: "Clientes", description: "Conteudos por cliente" },
  { key: "linkedin", name: "LinkedIn", description: "Postagens do LinkedIn" },
];

const normalizePt = (value) => {
  if (!value || typeof value !== "string") return value;
  return value.normalize("NFC").replace(/\s+/g, " ").trim();
};

const getCoverForPdf = (fileUrl) => {
  if (!fileUrl || !fileUrl.toLowerCase().endsWith(".pdf")) return null;
  const coverUrl = fileUrl.replace(/\.pdf$/i, "-cover.jpg");
  const diskPath = path.join(PUBLIC_DIR, coverUrl.replace(/^\//, ""));
  return fs.existsSync(diskPath) ? coverUrl : null;
};

const upsertChannel = async (channel) =>
  prisma.contentChannel.upsert({
    where: { key: channel.key },
    update: { name: channel.name, description: channel.description ?? null },
    create: { key: channel.key, name: channel.name, description: channel.description ?? null },
  });

const ensureChannels = async () => {
  for (const channel of channels) {
    await upsertChannel(channel);
  }
};

const getChannelMap = async () => {
  const rows = await prisma.contentChannel.findMany();
  return new Map(rows.map((row) => [row.key, row.id]));
};

const syncChannel = async (contentItemId, channelId, enabled) => {
  if (!channelId) return;
  if (enabled) {
    await prisma.contentItemChannel.upsert({
      where: { contentItemId_channelId: { contentItemId, channelId } },
      update: { isVisible: true },
      create: { contentItemId, channelId, isVisible: true },
    });
  } else {
    await prisma.contentItemChannel.deleteMany({
      where: { contentItemId, channelId },
    });
  }
};

const main = async () => {
  await ensureChannels();
  const channelMap = await getChannelMap();

  const products = await prisma.product.findMany({
    include: { client: true, clientUnit: true },
  });

  for (const product of products) {
    const title = normalizePt(product.name);
    const summary = normalizePt(product.description ?? "");
    const publishDate =
      product.client?.slug === "inovajuntos"
        ? new Date("2024-10-30")
        : product.year
          ? new Date(`${product.year}-10-30`)
          : null;
    const productUrl = product.path || `/produtos/${product.slug}`;

    const existingContent = product.contentItemId
      ? await prisma.contentItem.findUnique({ where: { id: product.contentItemId } })
      : null;

    const contentItem = existingContent
      ? await prisma.contentItem.update({
          where: { id: existingContent.id },
          data: {
            type: "PRODUCT",
            title,
            summary: summary || null,
            hub: product.hub ?? null,
            axis: product.client?.name ?? null,
            sourceName: product.client?.name ?? null,
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
            title,
            summary: summary || null,
            hub: product.hub ?? null,
            axis: product.client?.name ?? null,
            sourceName: product.client?.name ?? null,
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

    const attachmentUrl = product.fileUrl ?? null;
    if (attachmentUrl) {
      const coverUrl = getCoverForPdf(attachmentUrl);
      const existingAttachment = await prisma.contentAttachment.findFirst({
        where: { contentItemId: contentItem.id, url: attachmentUrl },
      });
      if (existingAttachment) {
        await prisma.contentAttachment.update({
          where: { id: existingAttachment.id },
          data: { coverUrl, type: "PDF" },
        });
      } else {
        await prisma.contentAttachment.create({
          data: {
            contentItemId: contentItem.id,
            type: "PDF",
            url: attachmentUrl,
            coverUrl,
          },
        });
      }
    }

    await syncChannel(contentItem.id, channelMap.get("produtos"), true);
    await syncChannel(contentItem.id, channelMap.get("clientes"), true);
    await syncChannel(contentItem.id, channelMap.get("timeline"), product.isVisibleTimeline);
    await syncChannel(contentItem.id, channelMap.get("compartilhe"), product.isVisibleShare);
  }

  console.log(`Migracao concluida: ${products.length} produtos.`);
};

main()
  .catch((error) => {
    console.error("Falha na migracao de conteudo", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
