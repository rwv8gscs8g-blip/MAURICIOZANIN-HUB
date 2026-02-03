import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const hubs = {
  "cooperacao-internacional": {
    key: "COOPERACAO_INTERNACIONAL",
    title: "Cooperação Internacional",
    description: "Rede Inovajuntos e cooperação internacional integrada ao eixo.",
    axisHighlight: "Inovajuntos",
  },
  "compras-governamentais-governanca": {
    key: "COMPRAS_GOVERNAMENTAIS",
    title: "Compras Governamentais e Governança",
    description: "Diagnósticos, licitações, governança e capacitações.",
  },
  "suporte-aos-municipios": {
    key: "SUPORTE_MUNICIPIOS",
    title: "Suporte aos Municípios",
    description: "Ações técnicas, desenvolvimento local e apoio institucional.",
  },
  "desenvolvimento-software": {
    key: "DESENVOLVIMENTO_SOFTWARE",
    title: "Desenvolvimento de Software",
    description: "Plataformas digitais, sistemas e soluções tecnológicas.",
  },
} as const;

type HubSlug = keyof typeof hubs;

export const dynamic = "force-dynamic";

export default async function HubDetailPage({
  params,
}: {
  params: Promise<{ hub: string }>;
}) {
  const resolvedParams = await params;
  const hubData = hubs[resolvedParams.hub as HubSlug];
  if (!hubData) return notFound();

  const session = await getSession();
  const isLogged = Boolean(session?.user);
  const isClient = session?.user?.role === "CLIENTE";
  const isAdmin = session?.user?.role === "ADMIN";
  const resourceAccesses = session?.user
    ? await prisma.resourceAccess.findMany({
      where: { userId: session.user.id },
      select: { clientId: true, projectId: true, hubAxis: true },
    })
    : [];
  const allowedClientIds = resourceAccesses
    .map((r) => r.clientId)
    .filter(Boolean) as string[];
  const allowedProjectIds = resourceAccesses
    .map((r) => r.projectId)
    .filter(Boolean) as string[];
  const allowedHubs = resourceAccesses
    .map((r) => r.hubAxis)
    .filter(Boolean) as string[];

  const products = await prisma.product.findMany({
    where: isLogged
      ? isClient && session?.user?.clientAccessApproved === false
        ? { hub: hubData.key, isVisiblePublic: true }
        : isAdmin
          ? { hub: hubData.key }
          : {
            hub: hubData.key,
            OR: [
              { isVisiblePublic: true },
              allowedClientIds.length ? { clientId: { in: allowedClientIds } } : undefined,
              allowedProjectIds.length
                ? { projectId: { in: allowedProjectIds } }
                : undefined,
              allowedHubs.length ? { hub: { in: allowedHubs as any } } : undefined,
            ].filter(Boolean) as any,
          }
      : { hub: hubData.key, isVisiblePublic: true },
    orderBy: { year: "desc" },
    include: { client: true },
  });

  let projects: any[] = [];
  try {
    projects = await prisma.project.findMany({
      where: { hub: hubData.key, isActive: true },
      orderBy: { createdAt: "desc" },
      include: { client: true },
    });
  } catch (err: any) {
    if (!(err?.code === "P2021" && String(err?.message || "").includes("Project"))) {
      throw err;
    }
  }

  const filteredProducts = products.filter((product) => {
    if (product.isVisiblePublic) return true;
    if (isAdmin) return true;
    if (allowedClientIds.includes(product.clientId)) return true;
    if (product.projectId && allowedProjectIds.includes(product.projectId)) return true;
    if (allowedHubs.includes(hubData.key)) return true;
    return false;
  });

  const publications = await prisma.publication.findMany({
    where: { hub: hubData.key, approved: true, isPublic: true, isActive: true },
    orderBy: { dateOriginal: "desc" },
  });

  const mentions = await prisma.newsMention.findMany({
    where: { hub: hubData.key, status: "APROVADO" },
    orderBy: { publishedAt: "desc" },
  });

  const timeline = await prisma.contentItem.findMany({
    where: {
      hub: hubData.key,
      status: "APPROVED",
      isPublic: true,
      channels: {
        some: { channel: { key: "timeline" }, isVisible: true },
      },
    },
    orderBy: [{ eventDate: "desc" }, { publishDate: "desc" }, { createdAt: "desc" }],
    take: 6,
  });

  const filteredProjects = projects.filter((project) => {
    if (isAdmin) return true;
    if (allowedHubs.includes(hubData.key)) return true;
    if (allowedProjectIds.includes(project.id)) return true;
    return false;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-16">
      <div className="container-fluid space-y-12">
        <div>
          <Link href="/hubs" className="text-sm text-[#1E3A8A] hover:underline">
            ← Voltar aos hubs
          </Link>
          <h1 className="text-fluid-3xl font-bold text-[#0F172A] mt-2">
            {hubData.title}
          </h1>
          <p className="text-fluid-base text-[#64748B] max-w-3xl mt-3">
            {hubData.description}
          </p>
          {(hubData as any).axisHighlight && (
            <p className="text-fluid-sm text-[#1E3A8A] mt-2">
              Inovajuntos aparece dentro deste eixo. Use filtros na linha do tempo para separar.
            </p>
          )}
        </div>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-[#E2E8F0] p-6">
            <h2 className="text-fluid-xl font-semibold text-[#0F172A] mb-3">
              Produtos do hub
            </h2>
            <p className="text-fluid-sm text-[#64748B] mb-4">
              {filteredProducts.length} produto(s) associados.
            </p>
            <div className="space-y-3">
              {filteredProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="border border-[#E2E8F0] p-3 bg-[#F8FAFC]">
                  <div className="text-xs text-[#64748B]">{product.client.name}</div>
                  <Link href={`/produtos/${product.slug}`} className="text-sm text-[#1E3A8A] hover:underline">
                    {product.name}
                  </Link>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <p className="text-sm text-[#64748B]">Nenhum produto cadastrado.</p>
              )}
              <Link href="/produtos" className="text-sm text-[#1E3A8A] hover:underline">
                Ver todos os produtos →
              </Link>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] p-6">
            <h2 className="text-fluid-xl font-semibold text-[#0F172A] mb-3">
              Publicações do hub
            </h2>
            <p className="text-fluid-sm text-[#64748B] mb-4">
              {publications.length} publicações aprovadas.
            </p>
            <div className="space-y-3">
              {publications.slice(0, 5).map((pub) => (
                <div key={pub.id} className="border border-[#E2E8F0] p-3 bg-[#F8FAFC]">
                  <div className="text-xs text-[#64748B]">
                    {new Date(pub.dateOriginal).toLocaleDateString("pt-BR")}
                  </div>
                  <Link href="/publicacoes" className="text-sm text-[#1E3A8A] hover:underline">
                    {pub.title}
                  </Link>
                </div>
              ))}
              {publications.length === 0 && (
                <p className="text-sm text-[#64748B]">Nenhuma publicação aprovada.</p>
              )}
              <Link href="/publicacoes" className="text-sm text-[#1E3A8A] hover:underline">
                Ver publicações →
              </Link>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-[#E2E8F0] p-6">
            <h2 className="text-fluid-xl font-semibold text-[#0F172A] mb-3">
              Projetos do hub
            </h2>
            <p className="text-fluid-sm text-[#64748B] mb-4">
              {filteredProjects.length} projeto(s) disponíveis.
            </p>
            <div className="space-y-3">
              {filteredProjects.slice(0, 5).map((project) => (
                <div key={project.id} className="border border-[#E2E8F0] p-3 bg-[#F8FAFC]">
                  <div className="text-xs text-[#64748B]">{project.client.name}</div>
                  <div className="text-sm text-[#0F172A]">{project.name}</div>
                </div>
              ))}
              {filteredProjects.length === 0 && (
                <p className="text-sm text-[#64748B]">Nenhum projeto cadastrado.</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] p-6">
            <h2 className="text-fluid-xl font-semibold text-[#0F172A] mb-3">
              Na mídia
            </h2>
            <p className="text-fluid-sm text-[#64748B] mb-4">
              {mentions.length} menções aprovadas.
            </p>
            <div className="space-y-3">
              {mentions.slice(0, 4).map((mention) => (
                <div key={mention.id} className="border border-[#E2E8F0] p-3 bg-[#F8FAFC]">
                  <div className="text-xs text-[#64748B]">{mention.source}</div>
                  <a
                    href={mention.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#1E3A8A] hover:underline"
                  >
                    {mention.title}
                  </a>
                </div>
              ))}
              {mentions.length === 0 && (
                <p className="text-sm text-[#64748B]">Nenhuma menção aprovada.</p>
              )}
              <Link href="/midia" className="text-sm text-[#1E3A8A] hover:underline">
                Ver na mídia →
              </Link>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] p-6">
            <h2 className="text-fluid-xl font-semibold text-[#0F172A] mb-3">
              Linha do tempo
            </h2>
            <p className="text-fluid-sm text-[#64748B] mb-4">
              {timeline.length} registros aprovados.
            </p>
            <div className="space-y-3">
              {timeline.slice(0, 4).map((item) => (
                <div key={item.id} className="border border-[#E2E8F0] p-3 bg-[#F8FAFC]">
                  <div className="text-xs text-[#64748B]">
                    {new Date(item.eventDate || item.publishDate || item.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                  {item.sourceUrl ? (
                    <Link
                      href={item.sourceUrl}
                      className="text-sm text-[#1E3A8A] hover:underline"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <div className="text-sm text-[#0F172A]">{item.title}</div>
                  )}
                </div>
              ))}
              {timeline.length === 0 && (
                <p className="text-sm text-[#64748B]">Nenhum item aprovado.</p>
              )}
              <Link href="/trajetoria" className="text-sm text-[#1E3A8A] hover:underline">
                Ver linha do tempo →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
