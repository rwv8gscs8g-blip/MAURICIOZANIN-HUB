import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const [publications, contentItems] = await Promise.all([
    // 1. Publicações (Tabela Antiga/Específica)
    prisma.publication.findMany({
      where: { approved: true, isPublic: true, isActive: true },
      orderBy: { dateOriginal: "desc" },
    }),
    // 2. Timeline (Content Items)
    prisma.contentItem.findMany({
      where: {
        status: "APPROVED",
        isPublic: true,
        // Opcional: filtrar apenas se tiver canal timeline ou se for generico
        // channels: { some: { channel: { key: "timeline" }, isVisible: true } } 
      },
      orderBy: { eventDate: "desc" },
    }),
  ]);

  // Normalização
  const normalizedPubs = publications.map((p) => ({
    id: `pub-${p.id}`,
    date: p.dateOriginal ? new Date(p.dateOriginal).toISOString() : new Date().toISOString(),
    title: p.title,
    description: p.description,
    category: mapCategory(p.category),
    type: "publication",
    hub: p.hub,
    link: p.link,
  }));

  const normalizedItems = contentItems.map((i) => ({
    id: `item-${i.id}`,
    date: i.eventDate ? new Date(i.eventDate).toISOString() : i.publishDate ? new Date(i.publishDate).toISOString() : new Date().toISOString(),
    title: i.title,
    description: i.summary,
    category: mapAxisToCategory(i.axis),
    type: "timeline", // ou i.type
    hub: i.hub,
    link: i.sourceUrl,
  }));

  const items = [...normalizedPubs, ...normalizedItems].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return NextResponse.json({ items });
}

function mapCategory(cat: string) {
  if (cat === "CARTILHA_SEBRAE") return "Cartilhas";
  if (cat === "ARTIGO_TECNICO") return "Artigos";
  return "Publicações";
}

function mapAxisToCategory(axis: string | null) {
  if (!axis) return "Atualizações";
  return "Notícias"; // Simplificação, pode ajustar
}
