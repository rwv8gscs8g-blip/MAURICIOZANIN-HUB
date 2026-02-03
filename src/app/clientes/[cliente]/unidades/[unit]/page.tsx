import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ClienteUnidadePage({
  params,
}: {
  params: Promise<{ cliente: string; unit: string }>;
}) {
  const resolvedParams = await params;
  const unit = await prisma.clientUnit.findFirst({
    where: {
      client: { slug: resolvedParams.cliente },
      OR: [{ id: resolvedParams.unit }, { slug: resolvedParams.unit }],
    },
    include: {
      client: true,
      products: { where: { isVisiblePublic: true }, orderBy: { name: "asc" } },
    },
  });

  if (!unit) return notFound();

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-16">
      <div className="container-fluid">
        <div className="mb-10">
          <Link
            href={`/clientes/${unit.client.slug}`}
            className="text-sm text-[#1E3A8A] hover:underline"
          >
            ← {unit.client.name}
          </Link>
          <h1 className="text-fluid-3xl font-bold text-[#0F172A] mt-2">
            {unit.name}
          </h1>
        </div>

        {unit.products.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] p-6 text-sm text-[#64748B]">
            Nenhum produto público disponível para esta unidade.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {unit.products.map((product) => {
              const productLink =
                product.slug === "diagnostico-compras-municipios"
                  ? `/diagnostico?client=${unit.client.slug}&unit=${unit.slug}`
                  : product.path || `/produtos/${product.slug}`;
              return (
                <div key={product.id} className="bg-white border border-[#E2E8F0] p-5">
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
            );})}
          </div>
        )}
      </div>
    </div>
  );
}
