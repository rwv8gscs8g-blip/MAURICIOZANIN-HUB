import Link from "next/link";
import { HeroSection } from "@/components/home/HeroSection";
import { TriplePillar } from "@/components/home/TriplePillar";
import { InovajuntosTransition } from "@/components/home/InovajuntosTransition";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let timeline: Awaited<ReturnType<typeof prisma.contentItem.findMany>> = [];
  try {
    if (process.env.DATABASE_URL) {
      timeline = await prisma.contentItem.findMany({
        where: {
          status: "APPROVED",
          isPublic: true,
          channels: {
            some: { channel: { key: "timeline" }, isVisible: true },
          },
        },
        orderBy: [{ eventDate: "desc" }, { publishDate: "desc" }, { createdAt: "desc" }],
        take: 10,
      });
    }
  } catch {
    // Banco indisponível ou tabela não migrada: exibe página com timeline vazia
  }

  const timelineItems = timeline.map((item) => ({
    id: item.id,
    title: item.title,
    date: item.eventDate || item.publishDate || item.createdAt,
    axis: item.axis || "Linha do tempo",
    url: item.sourceUrl || "/trajetoria",
  }));

  return (
    <div className="min-h-screen">
      <HeroSection />
      <TriplePillar />
      <InovajuntosTransition />

      <section className="py-24 bg-white">
        <div className="container-fluid">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-fluid-3xl font-bold text-[#0F172A] mb-3">
                Últimas atualizações
              </h2>
              <p className="text-fluid-base text-[#64748B]">
                Linha do tempo pública com as atualizações mais recentes.
              </p>
            </div>
            <Link href="/trajetoria" className="text-sm text-[#1E3A8A] hover:underline">
              Ver timeline →
            </Link>
          </div>

          <div className="space-y-6">
            {timelineItems.map((item) => (
              <div
                key={item.id}
                className="border-l-2 border-[#1E3A8A] pl-6 relative"
              >
                <span className="absolute -left-[7px] top-2 h-3 w-3 rounded-full bg-[#1E3A8A]" />
                <div className="text-xs text-[#64748B] mb-1">
                  {item.axis}
                </div>
                <div className="text-fluid-base font-semibold text-[#0F172A]">
                  {item.title}
                </div>
                <Link href={item.url} className="text-xs text-[#1E3A8A] hover:underline">
                  Ver detalhes →
                </Link>
              </div>
            ))}
            {timelineItems.length === 0 && (
              <div className="border border-[#E2E8F0] bg-white p-8 text-sm text-[#64748B]">
                Ainda não há atualizações públicas disponíveis.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// Previous aggregated updates intentionally removed for now.

/*
  const [timeline, products, publications, mentions, linkedin] = await Promise.all([
    prisma.timelineItem.findMany({
      where: { approved: true, visibility: "PUBLICO" },
      orderBy: { date: "desc" },
      take: 4,
    }),
    prisma.product.findMany({
      where: { isVisiblePublic: true },
      orderBy: { updatedAt: "desc" },
      include: { client: true },
      take: 4,
    }),
    prisma.publication.findMany({
      where: { approved: true, isPublic: true, isActive: true },
      orderBy: { dateOriginal: "desc" },
      take: 4,
    }),
    prisma.newsMention.findMany({
      where: { status: "APROVADO" },
      orderBy: { publishedAt: "desc" },
      take: 4,
    }),
    prisma.linkedInPost.findMany({
      orderBy: { publishedAt: "desc" },
      take: 4,
    }),
  ]);
*/
