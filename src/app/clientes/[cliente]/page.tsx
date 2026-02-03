import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { verifyAccess } from "@/lib/auth-guard";
import { ClientLogoUpload } from "@/components/ui/ClientLogoUpload";
import { ClientLogoutButton } from "@/components/ui/ClientLogoutButton";
import { FileEdit, LayoutDashboard, LogIn, Trash2, ClipboardCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ cliente: string }>;
}) {
  const resolvedParams = await params;
  if (!resolvedParams?.cliente) {
    return notFound();
  }
  const session = await getSession();
  if (session?.user?.role === "CLIENTE" && session.user.clientAccessApproved === false) {
    return notFound();
  }
  const cliente = await prisma.clientOrganization.findUnique({
    where: { slug: resolvedParams.cliente },
    include: {
      units: { orderBy: { name: "asc" } },
      products: { where: { isVisiblePublic: true }, orderBy: { name: "asc" } },
    },
  });

  if (!cliente) return notFound();

  const canAccessInternal = session?.user
    ? await verifyAccess({ resource: "client", id: cliente.id, minRole: "VIEWER" })
    : false;

  const internalProducts = canAccessInternal
    ? await prisma.product.findMany({
      where: { clientId: cliente.id, isVisibleClient: true },
      orderBy: { name: "asc" },
    })
    : [];
  const isSebrae = cliente.slug === "sebrae";
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-16">
      <div className="container-fluid">
        <div className="mb-10">
          {isSebrae ? (
            <div className="bg-white border border-[#E2E8F0] p-6">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  {cliente.logoUrl ? (
                    <img
                      key={cliente.logoUrl}
                      src={`${cliente.logoUrl}?v=${cliente.updatedAt}`}
                      alt={cliente.name}
                      className="h-16 w-16 object-contain"
                    />
                  ) : (
                    <div className="h-16 w-16 border border-[#E2E8F0] bg-slate-50" />
                  )}
                  <div>
                    <h1 className="text-fluid-3xl font-bold text-[#0F172A]">
                      {cliente.name}
                    </h1>
                    {cliente.description && (
                      <p className="text-fluid-base text-[#64748B]">
                        {cliente.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ClientLogoutButton />
                  {(isAdmin || (session?.user?.role === "CONSULTOR" && canAccessInternal)) && (
                    <ClientLogoUpload clientId={cliente.id} clientSlug={cliente.slug} />
                  )}
                </div>
              </div>
              {cliente.units.length > 0 && (
                <div className="mt-6 grid md:grid-cols-4 gap-3">
                  {cliente.units.map((unit) => (
                    <Link
                      key={unit.id}
                      href={`/clientes/${cliente.slug}/unidades/${unit.id}`}
                      className="border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm text-[#1E3A8A] hover:bg-white rounded-lg transition-colors"
                    >
                      {unit.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <h1 className="text-fluid-3xl font-bold text-[#0F172A] mb-2">
                {cliente.name}
              </h1>
              {cliente.description && (
                <p className="text-fluid-base text-[#64748B]">
                  {cliente.description}
                </p>
              )}
              <p className="text-fluid-sm text-[#64748B] mt-3">
                Este cliente pode atuar em todos os hubs do sistema.
              </p>
            </>
          )}
        </div>

        {isSebrae && cliente.products.some((p) => p.slug === "diagnostico-compras-municipios") && (
          <section className="mb-12">
            <h2 className="text-fluid-xl font-semibold text-[#0F172A] mb-4">
              Operar diagnóstico
            </h2>
            <p className="text-fluid-sm text-[#64748B] mb-4">
              Ações para preencher e editar diagnósticos dos municípios, gerenciar salas e entrar como participante.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href={`/diagnostico?client=${cliente.slug}&unit=sebrae-nacional`}
                className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 hover:border-[#1E3A8A]/30 hover:shadow transition-all flex flex-col"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#1E3A8A]/10 text-[#1E3A8A]">
                    <FileEdit className="h-5 w-5" />
                  </span>
                  <h3 className="text-fluid-lg font-semibold text-[#0F172A]">
                    Abrir diagnóstico
                  </h3>
                </div>
                <p className="text-fluid-sm text-[#64748B] flex-1">
                  Preencher e editar diagnósticos dos municípios. Escolha o estado, município e preencha os eixos.
                </p>
                <span className="text-fluid-sm text-[#1E3A8A] font-medium mt-3 inline-flex items-center gap-1">
                  Acessar →
                </span>
              </Link>
              <Link
                href="/diagnostico/perguntas"
                className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 hover:border-[#1E3A8A]/30 hover:shadow transition-all flex flex-col"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#1E3A8A]/10 text-[#1E3A8A]">
                    <FileEdit className="h-5 w-5" />
                  </span>
                  <h3 className="text-fluid-lg font-semibold text-[#0F172A]">
                    Editar perguntas do diagnóstico
                  </h3>
                </div>
                <p className="text-fluid-sm text-[#64748B] flex-1">
                  Definir e ajustar as perguntas e textos que aparecem no formulário do diagnóstico (conteúdo exibido nas salas).
                </p>
                <span className="text-fluid-sm text-[#1E3A8A] font-medium mt-3 inline-flex items-center gap-1">
                  Abrir editor →
                </span>
              </Link>
              <Link
                href="/sala"
                className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 hover:border-[#1E3A8A]/30 hover:shadow transition-all flex flex-col"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#1E3A8A]/10 text-[#1E3A8A]">
                    <LayoutDashboard className="h-5 w-5" />
                  </span>
                  <h3 className="text-fluid-lg font-semibold text-[#0F172A]">
                    Gerenciar salas
                  </h3>
                </div>
                <p className="text-fluid-sm text-[#64748B] flex-1">
                  Criar salas, ativar e encerrar. Acompanhar participantes e diagnósticos (consultor/admin).
                </p>
                <span className="text-fluid-sm text-[#1E3A8A] font-medium mt-3 inline-flex items-center gap-1">
                  Ir para salas →
                </span>
              </Link>
              <Link
                href="/sala/entrar"
                className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm p-6 hover:border-[#1E3A8A]/30 hover:shadow transition-all flex flex-col"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#1E3A8A]/10 text-[#1E3A8A]">
                    <LogIn className="h-5 w-5" />
                  </span>
                  <h3 className="text-fluid-lg font-semibold text-[#0F172A]">
                    Entrar na sala
                  </h3>
                </div>
                <p className="text-fluid-sm text-[#64748B] flex-1">
                  Participante: informe código e token fornecidos pelo consultor para preencher o diagnóstico na sala.
                </p>
                <span className="text-fluid-sm text-[#1E3A8A] font-medium mt-3 inline-flex items-center gap-1">
                  Página de entrada →
                </span>
              </Link>
              <Link
                href={`/diagnostico?client=${cliente.slug}&unit=sebrae-nacional&view=submitted`}
                className="bg-white border-2 border-amber-200 rounded-xl shadow-sm p-6 hover:border-amber-400 hover:shadow transition-all flex flex-col bg-amber-50/30"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 text-amber-700">
                    <ClipboardCheck className="h-5 w-5" />
                  </span>
                  <h3 className="text-fluid-lg font-semibold text-[#0F172A]">
                    Avaliar diagnósticos enviados
                  </h3>
                </div>
                <p className="text-fluid-sm text-[#64748B] flex-1">
                  Abre a tela só de diagnósticos <strong>pendentes de avaliação</strong> (quem participou de uma sala e enviou). Use os filtros e &quot;Abrir diagnóstico no wizard&quot; ou &quot;Notas do consultor →&quot; para avaliar.
                </p>
                <span className="text-fluid-sm text-amber-700 font-medium mt-3 inline-flex items-center gap-1">
                  Ir para lista (só pendentes) →
                </span>
              </Link>
            </div>
            <div className="mt-4 p-4 bg-slate-50 border border-[#E2E8F0] rounded-lg text-fluid-sm text-[#64748B]">
              <span className="inline-flex items-center gap-2 font-medium text-[#0F172A]">
                <Trash2 className="h-4 w-4" /> Rascunhos
              </span>
              <p className="mt-1">
                Rascunhos são salvos no navegador e no servidor. Para começar do zero, use o botão &quot;Limpar rascunho&quot; dentro do diagnóstico (cabeçalho da página).
              </p>
            </div>
          </section>
        )}

        {cliente.products.length > 0 && (
          <section className="mb-12">
            <h2 className="text-fluid-xl font-semibold text-[#0F172A] mb-4">
              Produtos em destaque
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {cliente.products.map((product) => {
                const productLink =
                  product.slug === "diagnostico-compras-municipios"
                    ? `/diagnostico?client=${cliente.slug}&unit=sebrae-nacional`
                    : product.path || `/produtos/${product.slug}`;
                return (
                  <div
                    key={product.id}
                    className="bg-white border border-[#E2E8F0] p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-fluid-lg font-semibold text-[#0F172A] mb-2">
                        {product.name}
                      </h3>
                      {product.year && (
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                          {product.year}
                        </span>
                      )}
                    </div>
                    {product.description && (
                      <p className="text-fluid-sm text-[#64748B] mb-3">
                        {product.description}
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
          </section>
        )}

        {cliente.units.length > 0 && !isSebrae && (
          <section className="mb-12">
            <h2 className="text-fluid-xl font-semibold text-[#0F172A] mb-4">
              Unidades
            </h2>
            <div className="grid md:grid-cols-4 gap-3">
              {cliente.units.map((unit) => (
                <Link
                  key={unit.id}
                  href={`/clientes/${cliente.slug}/unidades/${unit.id}`}
                  className="bg-white border border-[#E2E8F0] px-4 py-3 text-sm text-[#1E3A8A] hover:bg-slate-50"
                >
                  {unit.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="bg-white border border-[#E2E8F0] p-6">
          <h2 className="text-fluid-xl font-semibold text-[#0F172A] mb-2">
            Área interna do cliente
          </h2>
          <p className="text-fluid-sm text-[#64748B] mb-4">
            Produtos privados e informações operacionais disponíveis mediante autorização.
          </p>
          {!canAccessInternal ? (
            <Link
              href="/auth/login"
              className="text-fluid-sm text-[#1E3A8A] hover:underline"
            >
              Fazer login para acessar →
            </Link>
          ) : internalProducts.length === 0 ? (
            <p className="text-fluid-sm text-[#64748B]">
              Nenhum produto privado disponível para este cliente.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {internalProducts.map((product) => {
                const productLink =
                  product.slug === "diagnostico-compras-municipios"
                    ? `/diagnostico?client=${cliente.slug}&unit=sebrae-nacional`
                    : `/produtos/${product.slug}`;
                return (
                  <div
                    key={product.id}
                    className="bg-slate-50 border border-[#E2E8F0] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-fluid-base font-semibold text-[#0F172A] mb-2">
                        {product.name}
                      </h3>
                      {product.year && (
                        <span className="text-xs px-2 py-1 rounded-full bg-white text-slate-600 border border-slate-200">
                          {product.year}
                        </span>
                      )}
                    </div>
                    {product.description && (
                      <p className="text-fluid-sm text-[#64748B] mb-3">
                        {product.description}
                      </p>
                    )}
                    <Link
                      href={productLink}
                      className="text-fluid-sm text-[#1E3A8A] hover:underline"
                    >
                      Abrir produto →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>
        {isSebrae && (
          <div className="mt-10 flex items-center justify-between border-t border-[#E2E8F0] pt-6">
            <span className="text-sm text-[#64748B]">
              Navegue entre hubs do sistema.
            </span>
            <Link
              href="/hubs"
              className="px-4 py-2 border border-[#1E3A8A] text-[#1E3A8A] text-sm rounded-md"
            >
              Acessar o hub
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
