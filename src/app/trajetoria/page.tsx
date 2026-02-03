import { prisma } from "@/lib/prisma";
import { JsonLd } from "@/components/seo/JsonLd";
import { MultimediaTimeline } from "@/components/timeline/MultimediaTimeline";
import { TimelineHubFilters } from "@/components/timeline/TimelineHubFilters";

export const dynamic = "force-dynamic";

export default async function TrajetoriaPage() {
  const items = await prisma.contentItem.findMany({
    where: {
      status: "APPROVED",
      isPublic: true,
      channels: {
        some: { channel: { key: "timeline" }, isVisible: true },
      },
    },
    orderBy: [{ eventDate: "desc" }, { publishDate: "desc" }, { createdAt: "desc" }],
  });

  const events = items.map((item) => ({
    id: item.id,
    date: item.eventDate || item.publishDate || item.createdAt,
    title: item.title,
    description: item.summary || undefined,
    type: item.type as any,
    category: item.axis || undefined,
    url: item.sourceUrl || undefined,
    axis: item.axis || undefined,
    hub: item.hub || "SEM_HUB",
  }));

  const hubLabels: Record<string, string> = {
    COOPERACAO_INTERNACIONAL: "Cooperação Internacional",
    COMPRAS_GOVERNAMENTAIS: "Compras Governamentais e Governança",
    SUPORTE_MUNICIPIOS: "Suporte aos Municípios",
    DESENVOLVIMENTO_SOFTWARE: "Desenvolvimento de Software",
    SEM_HUB: "Sem hub definido",
  };

  const byHub = events.reduce<Record<string, typeof events>>((acc, item) => {
    const key = item.hub || "SEM_HUB";
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <>
      <JsonLd type="person" />
      <div className="min-h-screen bg-[#FAFAFA] py-16">
        <div className="container-fluid">
          <div className="mb-12">
            <h1 className="text-fluid-3xl font-bold text-[#0F172A] mb-4 tracking-tight">
              Linha do Tempo
            </h1>
            <p className="text-fluid-base text-[#64748B] leading-[1.7] max-w-3xl">
              A página é pública e reúne apenas conteúdos aprovados na curadoria, item por item.
            </p>
          </div>

          <div>
            <h2 className="text-fluid-2xl font-bold text-[#0F172A] mb-6 tracking-tight">
              Linha do Tempo Completa
            </h2>
            <TimelineHubFilters
              byHub={byHub}
              hubLabels={hubLabels}
            />
          </div>
        </div>
      </div>
    </>
  );
}
