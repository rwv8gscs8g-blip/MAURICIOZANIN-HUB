import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { verifyAccess } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function ProdutoAtestadosPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const product = await prisma.product.findFirst({
    where: { slug: resolvedParams.slug },
    include: {
      atestados: {
        include: { atestado: true },
        orderBy: { atestado: { issuedAt: "desc" } },
      },
    },
  });

  if (!product) return notFound();

  const session = await getSession();
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-16">
        <div className="container-fluid">
          <p className="text-fluid-base text-[#64748B]">
            Faça login para acessar os atestados.
          </p>
          <Link href="/auth/login" className="text-sm text-[#1E3A8A] hover:underline">
            Acessar login →
          </Link>
        </div>
      </div>
    );
  }

  const hasAccess =
    session.user.role === "ADMIN" ||
    (await verifyAccess({
      resource: "client",
      id: product.clientId,
      minRole: "VIEWER",
    })) ||
    (product.projectId
      ? await verifyAccess({
          resource: "project",
          id: product.projectId,
          minRole: "VIEWER",
        })
      : false);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-16">
        <div className="container-fluid">
          <p className="text-fluid-base text-[#64748B]">
            Acesso restrito ao cliente responsável.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-16">
      <div className="container-fluid">
        <Link href={`/produtos/${product.slug}`} className="text-sm text-[#1E3A8A] hover:underline">
          ← Voltar ao produto
        </Link>
        <h1 className="text-fluid-2xl font-bold text-[#0F172A] mt-2">
          Atestados de capacidade técnica
        </h1>

        <div className="mt-6 space-y-4">
          {product.atestados.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] p-6 text-sm text-[#64748B]">
              Nenhum atestado cadastrado ainda.
            </div>
          ) : (
            product.atestados.map((link) => {
              const item = link.atestado;
              if (!item) return null;
              return (
                <div key={item.id} className="bg-white border border-[#E2E8F0] p-5">
                <h3 className="text-fluid-lg font-semibold text-[#0F172A] mb-2">
                  {item.title}
                </h3>
                {item.issuedBy && (
                  <p className="text-fluid-sm text-[#64748B] mb-1">
                    Emitente: {item.issuedBy}
                  </p>
                )}
                {item.issuedAt && (
                  <p className="text-fluid-sm text-[#64748B] mb-3">
                    Data: {new Date(item.issuedAt).toLocaleDateString("pt-BR")}
                  </p>
                )}
                {item.summary && (
                  <p className="text-fluid-sm text-[#64748B] mb-3">{item.summary}</p>
                )}
                {item.fileUrl && (
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#1E3A8A] hover:underline"
                  >
                    Abrir documento
                  </a>
                )}
              </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
