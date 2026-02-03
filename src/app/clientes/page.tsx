import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clientes = await prisma.clientOrganization.findMany({
    orderBy: { name: "asc" },
    include: {
      units: { select: { id: true } },
      products: { select: { id: true, isVisiblePublic: true, year: true } },
    },
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-16">
      <div className="container-fluid">
        <div className="mb-10">
          <h1 className="text-fluid-3xl font-bold text-[#0F172A] mb-3">
            Clientes
          </h1>
          <p className="text-fluid-base text-[#64748B]">
            Relação de clientes e suas unidades estratégicas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {clientes.map((cliente) => (
            <div key={cliente.id} className="bg-white border border-[#E2E8F0] p-6">
              <div className="flex items-center gap-3 mb-4">
                {cliente.logoUrl ? (
                  <img
                    src={cliente.logoUrl}
                    alt={cliente.name}
                    className="h-12 w-12 object-contain"
                  />
                ) : (
                  <div className="h-12 w-12 bg-slate-100 border border-slate-200" />
                )}
                <div>
                  <h2 className="text-fluid-lg font-semibold text-[#0F172A]">
                    {cliente.name}
                  </h2>
                  <p className="text-fluid-xs text-[#64748B]">
                    {cliente.units.length} unidades •{" "}
                    {cliente.products.filter((p) => p.isVisiblePublic).length} produtos
                  </p>
                  {(() => {
                    const years = cliente.products
                      .filter((p) => p.isVisiblePublic && p.year)
                      .map((p) => p.year as number);
                    const latest = years.length ? Math.max(...years) : null;
                    return latest ? (
                      <div className="text-[11px] inline-block mt-1 px-2 py-1 border border-slate-200 text-slate-600 bg-slate-50">
                        Ano {latest}
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
              {cliente.description && (
                <p className="text-fluid-sm text-[#64748B] mb-4">
                  {cliente.description}
                </p>
              )}
              <Link
                href={`/clientes/${cliente.slug}`}
                className="text-fluid-sm text-[#1E3A8A] hover:underline"
              >
                Ver detalhes →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
