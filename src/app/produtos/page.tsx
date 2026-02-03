import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Produtos | Maurício Zanin",
  description:
    "Produtos e soluções organizados por ano e cliente, com foco em compras governamentais, cooperação internacional e suporte a municípios.",
};

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams?: Promise<{ cliente?: string; q?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const session = await getSession();
  const isLogged = Boolean(session?.user);
  const isClient = session?.user?.role === "CLIENTE";
  const isAdmin = session?.user?.role === "ADMIN";
  const clienteFilter = resolvedSearchParams?.cliente;
  const searchQuery = resolvedSearchParams?.q?.trim();

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

  // Base Query
  const whereClause: any = {
    AND: [
      // Visibilidade
      isLogged
        ? isClient && session?.user?.clientAccessApproved === false
          ? { isVisiblePublic: true }
          : isAdmin
            ? {} // Admin vê tudo
            : {
              OR: [
                { isVisiblePublic: true },
                allowedClientIds.length ? { clientId: { in: allowedClientIds } } : undefined,
                allowedProjectIds.length ? { projectId: { in: allowedProjectIds } } : undefined,
                allowedHubs.length ? { hub: { in: allowedHubs as any } } : undefined,
              ].filter(Boolean),
            }
        : { isVisiblePublic: true }, // Público vê só público

      // Filtro de Texto (Pesquisa)
      searchQuery
        ? {
          OR: [
            { name: { contains: searchQuery, mode: "insensitive" } },
            { description: { contains: searchQuery, mode: "insensitive" } },
            { client: { name: { contains: searchQuery, mode: "insensitive" } } },
          ],
        }
        : {},
    ],
  };

  let produtos = await prisma.product.findMany({
    where: whereClause,
    orderBy: { name: "asc" },
    include: {
      client: true,
      clientUnit: true,
    },
  });

  if (clienteFilter) {
    produtos = produtos.filter((item: any) => item.client?.slug === clienteFilter);
  }

  // Fallback para Inovajuntos (JSON) - Aplica filtro de texto também se necessário
  if (produtos.length === 0 && !searchQuery) {
    const fallbackPath = path.join(process.cwd(), "data", "inovajuntos-products.json");
    if (fs.existsSync(fallbackPath)) {
      const raw = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));
      produtos = raw.map((item: any) => ({
        id: item.slug,
        name: item.title,
        slug: item.slug,
        description: `Documento do Inovajuntos (${item.year || "sem ano"}).`,
        path: `/produtos/${item.slug}`,
        fileUrl: item.publicPath,
        year: item.year,
        hub: "COOPERACAO_INTERNACIONAL",
        isVisiblePublic: true,
        isVisibleClient: true,
        client: { name: "Inovajuntos" },
        clientUnit: null,
      }));
    }
  }

  const hubs = [
    { key: "all", label: "Todos" },
    { key: "COOPERACAO_INTERNACIONAL", label: "Cooperação Internacional" },
    { key: "COMPRAS_GOVERNAMENTAIS", label: "Compras Governamentais e Governança" },
    { key: "SUPORTE_MUNICIPIOS", label: "Suporte aos Municípios" },
    { key: "DESENVOLVIMENTO_SOFTWARE", label: "Desenvolvimento de Software" },
  ] as const;

  const hubBuckets = hubs
    .filter((hub) => hub.key !== "all")
    .map((hub) => ({
      ...hub,
      items: produtos.filter((item) => item.hub === hub.key),
    }))
    .filter((bucket) => bucket.items.length > 0);

  const unassigned = produtos.filter((item) => !item.hub);
  const hubLabels: Record<string, string> = {
    COOPERACAO_INTERNACIONAL: "Cooperação Internacional",
    COMPRAS_GOVERNAMENTAIS: "Compras Governamentais e Governança",
    SUPORTE_MUNICIPIOS: "Suporte aos Municípios",
    DESENVOLVIMENTO_SOFTWARE: "Desenvolvimento de Software",
  };

  const publicRoot = path.join(process.cwd(), "public");
  const resolveCover = (fileUrl?: string | null) => {
    if (!fileUrl) return null;
    if (!fileUrl.toLowerCase().endsWith(".pdf")) return null;
    const cover = fileUrl.replace(/\.pdf$/i, "-cover.jpg");
    const diskPath = path.join(publicRoot, cover.replace(/^\//, ""));
    return fs.existsSync(diskPath) ? cover : null;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-16">
      <div className="container-fluid">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-fluid-3xl font-bold text-[#0F172A] mb-3">
              Produtos
            </h1>
            <p className="text-fluid-base text-[#64748B]">
              Soluções disponíveis para os clientes e público.
            </p>
          </div>

          {/* Search Bar - Client Action but Server Rendered Initial */}
          <form className="relative w-full md:w-80">
            <input
              name="q"
              type="text"
              placeholder="Buscar produto..."
              defaultValue={searchQuery}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </form>
        </div>

        {produtos.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] p-6 text-sm text-[#64748B] text-center py-12">
            {searchQuery ? `Nenhum produto encontrado para "${searchQuery}".` : "Nenhum produto disponível."}
          </div>
        ) : (
          <div className="space-y-10">
            {hubBuckets.map((bucket) => {
              const hubLabel =
                bucket.key === "DESENVOLVIMENTO_SOFTWARE"
                  ? "Desenvolvimento de Software"
                  : bucket.label;
              const grouped = bucket.items.reduce<Record<string, typeof produtos>>((acc, item) => {
                const key = item.year ? String(item.year) : "Sem ano"; // Fixed grouping
                acc[key] = acc[key] || [];
                acc[key].push(item);
                return acc;
              }, {});
              const years = Object.keys(grouped).sort((a, b) => {
                if (a === "Sem ano") return 1;
                if (b === "Sem ano") return -1;
                return Number(b) - Number(a);
              });
              return (
                <div key={bucket.key}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-fluid-xl font-semibold text-[#0F172A]">
                      {hubLabel}
                    </h2>
                    <span className="text-xs text-[#64748B]">
                      {bucket.items.length} produto(s)
                    </span>
                  </div>
                  <div className="space-y-6">
                    {years.map((year) => (
                      <div key={year}>
                        <div className="text-sm font-semibold text-[#0F172A] mb-3">
                          {year}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          {grouped[year].map((produto) => {
                            const productLink =
                              produto.slug === "diagnostico-compras-municipios"
                                ? `/diagnostico?client=${produto.client?.slug || "sebrae"}&unit=${produto.clientUnit?.slug || "sebrae-nacional"}`
                                : produto.path || `/produtos/${produto.slug}`;
                            return (
                              <div
                                key={produto.id}
                                className="bg-white border border-[#E2E8F0] p-5"
                              >
                                {resolveCover(produto.fileUrl) && (
                                  <div className="mb-3 overflow-hidden border border-[#E2E8F0] bg-slate-50">
                                    <img
                                      src={resolveCover(produto.fileUrl) as string}
                                      alt={`Capa de ${produto.name}`}
                                      className="w-full h-48 object-contain"
                                    />
                                  </div>
                                )}
                                <div className="text-xs text-[#64748B] mb-2">
                                  {produto.client.name}
                                  {produto.clientUnit ? ` • ${produto.clientUnit.name}` : ""}
                                </div>
                                {!produto.isVisiblePublic && (
                                  <div className="text-[11px] inline-block px-2 py-1 border border-amber-300 text-amber-700 bg-amber-50 mb-2">
                                    Privado (cliente)
                                  </div>
                                )}
                                <h3 className="text-fluid-lg font-semibold text-[#0F172A] mb-2">
                                  {produto.name}
                                </h3>
                                {produto.description && (
                                  <p className="text-fluid-sm text-[#64748B] mb-3 line-clamp-3">
                                    {produto.description}
                                  </p>
                                )}
                                <Link
                                  href={productLink}
                                  className="text-fluid-sm text-[#1E3A8A] hover:underline"
                                >
                                  Acessar produto →
                                </Link>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {unassigned.length > 0 && (
              /* ... unassigned render ... */
              <div>
                <h2 className="text-fluid-xl font-semibold text-[#0F172A] mb-4">Outros</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {unassigned.map(produto => (
                    <div key={produto.id} className="bg-white border border-[#E2E8F0] p-5">
                      <h3 className="font-semibold">{produto.name}</h3>
                      <Link href={`/produtos/${produto.slug}`} className="text-blue-700 text-sm">Ver detalhes</Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
