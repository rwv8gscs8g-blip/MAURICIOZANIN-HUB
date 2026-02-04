import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { PdfFlipViewer } from "@/components/documents/PdfFlipViewer";
import fs from "fs";
import path from "path";
import { ImageLightboxGallery } from "@/components/ui/ImageLightboxGallery";
import { verifyAccess } from "@/lib/auth-guard";
import { listFolder, getPublicUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function ProdutoDetalhePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  let product = await prisma.product.findFirst({
    where: { slug: resolvedParams.slug },
    include: {
      client: true,
      clientUnit: true,
      atestados: {
        include: { atestado: true },
        orderBy: { atestado: { issuedAt: "desc" } },
      },
    },
  });

  if (!product) {
    const fallbackPath = path.join(process.cwd(), "data", "inovajuntos-products.json");
    if (fs.existsSync(fallbackPath)) {
      const raw = JSON.parse(fs.readFileSync(fallbackPath, "utf8"));
      const found = raw.find((item: any) => item.slug === resolvedParams.slug);
      if (found) {
        product = {
          id: found.slug,
          name: found.title,
          slug: found.slug,
          description: `Documento do Inovajuntos (${found.year || "sem ano"}).`,
          path: `/produtos/${found.slug}`,
          fileUrl: found.publicPath,
          year: found.year,
          hub: "COOPERACAO_INTERNACIONAL",
          isVisiblePublic: true,
          isVisibleClient: true,
          client: { name: "Inovajuntos" },
          clientUnit: null,
          atestados: [],
        } as any;
      }
    }
  }

  if (!product) return notFound();

  const session = await getSession();
  const isClient = session?.user?.role === "CLIENTE";
  const showClientBreadcrumb = isClient;
  let canView = product.isVisiblePublic;
  if (!canView && session?.user) {
    const clientAccess = await verifyAccess({
      resource: "client",
      id: product.clientId,
      minRole: "VIEWER",
    });
    const projectAccess = product.projectId
      ? await verifyAccess({
        resource: "project",
        id: product.projectId,
        minRole: "VIEWER",
      })
      : false;
    canView = canView || clientAccess || projectAccess;
  }

  const publicRoot = path.join(process.cwd(), "public");
  // Nova lógica via R2 (prioritária)
  const r2Folder = `products/${product.slug}`;
  let galleryKeys: string[] = [];
  try {
    galleryKeys = await listFolder(r2Folder);
  } catch (err) {
    console.warn("Failed to list R2 folder", err);
  }

  // Filtrar imagens da galeria (page-*.jpg) e capa (cover.jpg)
  const r2GalleryImages = galleryKeys
    .filter(key => key.match(/page-\d+\.jpg$/))
    .sort((a, b) => {
      const numA = parseInt(a.match(/page-(\d+)\.jpg$/)?.[1] || "0");
      const numB = parseInt(b.match(/page-(\d+)\.jpg$/)?.[1] || "0");
      return numA - numB;
    })
    .map(key => ({
      src: getPublicUrl(key),
      alt: `Página ${key.match(/page-(\d+)/)?.[1]}`
    }));

  const r2CoverKey = galleryKeys.find(key => key.endsWith("cover.jpg"));
  const r2CoverUrl = r2CoverKey ? getPublicUrl(r2CoverKey) : null;

  // Fallback (sistema antigo de arquivos locais, mantido por compatibilidade se R2 falhar ou estiver vazio)
  const localCoverUrl =
    product.fileUrl && product.fileUrl.toLowerCase().endsWith(".pdf")
      ? product.fileUrl.replace(/\.pdf$/i, "-cover.jpg")
      : null;
  const localCoverPath = localCoverUrl ? path.join(publicRoot, localCoverUrl.replace(/^\//, "")) : null;
  const hasLocalCover = localCoverPath ? fs.existsSync(localCoverPath) : false;

  // Decisão final
  const coverUrl = r2CoverUrl || (hasLocalCover ? localCoverUrl : null);
  const hasCover = !!coverUrl;

  // Gallery final
  const galleryImages = r2GalleryImages.length > 0 ? r2GalleryImages : [];

  // Se não tem galeria no R2, tenta local (código legado)
  if (galleryImages.length === 0 && product.fileUrl) {
    const galleryDir = path.join(
      publicRoot,
      path.dirname(product.fileUrl.replace(/^\//, "")),
      product.slug
    );
    if (galleryDir && fs.existsSync(galleryDir)) {
      const localFiles = fs.readdirSync(galleryDir)
        .filter((file) => /\.(png|jpe?g|webp)$/i.test(file))
        .map((file) => ({
          src: `${path.dirname(product.fileUrl || "")}/${product.slug}/${file}`,
          alt: `Página ${file}`,
        }));
      if (localFiles.length > 0) {
        galleryImages.push(...localFiles);
      }
    }
  }

  if (!canView) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] py-16">
        <div className="container-fluid">
          <p className="text-fluid-base text-[#64748B]">
            Este produto é restrito ao cliente responsável.
          </p>
          <Link href="/auth/login" className="text-sm text-[#1E3A8A] hover:underline">
            Fazer login →
          </Link>
        </div>
      </div>
    );
  }

  if (product.slug === "diagnostico-compras-municipios") {
    const unitSlug = product.clientUnit?.slug || "sebrae-nacional";
    const clientSlug = product.client?.slug || "sebrae";
    redirect(`/diagnostico?client=${clientSlug}&unit=${unitSlug}`);
  }

  const clientSlug = product.client?.slug;
  const unitSlug = product.clientUnit?.slug;
  const clientPath = clientSlug
    ? unitSlug
      ? `/clientes/${clientSlug}/${unitSlug}`
      : `/clientes/${clientSlug}`
    : null;
  const hubSlug =
    product.hub === "COOPERACAO_INTERNACIONAL"
      ? "cooperacao-internacional"
      : product.hub === "COMPRAS_GOVERNAMENTAIS"
        ? "compras-governamentais-governanca"
        : product.hub === "SUPORTE_MUNICIPIOS"
          ? "suporte-aos-municipios"
          : product.hub === "DESENVOLVIMENTO_SOFTWARE"
            ? "desenvolvimento-software"
            : null;
  const hubLabel =
    product.hub === "COOPERACAO_INTERNACIONAL"
      ? "Cooperação Internacional"
      : product.hub === "COMPRAS_GOVERNAMENTAIS"
        ? "Compras Governamentais e Governança"
        : product.hub === "SUPORTE_MUNICIPIOS"
          ? "Suporte aos Municípios"
          : product.hub === "DESENVOLVIMENTO_SOFTWARE"
            ? "Desenvolvimento de Software"
            : null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-16">
      <div className="container-fluid">
        <div className="flex flex-wrap items-center gap-4 text-sm text-[#1E3A8A]">
          {clientPath && (
            <Link href={clientPath} className="hover:underline">
              ← Voltar
            </Link>
          )}
          <Link href="/produtos" className="hover:underline">
            ← Voltar
          </Link>
        </div>
        {showClientBreadcrumb && (
          <div className="mt-3 text-xs text-[#64748B]">
            {hubSlug && hubLabel && (
              <>
                <Link href={`/hubs/${hubSlug}`} className="hover:underline text-[#1E3A8A]">
                  {hubLabel}
                </Link>
                <span className="mx-2">/</span>
              </>
            )}
            {clientPath && (
              <>
                <Link href={clientPath} className="hover:underline text-[#1E3A8A]">
                  {product.client?.name}
                  {product.clientUnit ? ` • ${product.clientUnit.name}` : ""}
                </Link>
                <span className="mx-2">/</span>
              </>
            )}
            <span className="text-[#0F172A]">{product.name}</span>
          </div>
        )}
        <h1 className="text-fluid-3xl font-bold text-[#0F172A] mt-2">
          {product.name}
        </h1>
        <p className="text-fluid-sm text-[#64748B] mt-2">
          {product.client.name}
          {product.clientUnit ? ` • ${product.clientUnit.name}` : ""}
          {product.year ? ` • ${product.year}` : ""}
        </p>
        {product.hub && (
          <div className="mt-2 text-xs text-[#64748B]">
            Hub:{" "}
            {product.hub === "COOPERACAO_INTERNACIONAL"
              ? "Cooperação Internacional"
              : product.hub === "COMPRAS_GOVERNAMENTAIS"
                ? "Compras Governamentais e Governança"
                : product.hub === "SUPORTE_MUNICIPIOS"
                  ? "Suporte aos Municípios"
                  : product.hub === "DESENVOLVIMENTO_SOFTWARE"
                    ? "Desenvolvimento de Software"
                    : "Sem hub definido"}
          </div>
        )}

        {hasCover && coverUrl && (
          <div className="mt-6 border border-[#E2E8F0] bg-white p-3">
            <img
              src={coverUrl}
              alt={`Capa de ${product.name}`}
              className="w-full max-h-[420px] object-contain"
            />
          </div>
        )}

        {product.description && (
          <p className="text-fluid-base text-[#64748B] mt-6 max-w-3xl">
            {product.description}
          </p>
        )}

        {product.path && (
          <div className="mt-6">
            <Link
              href={product.path}
              className="px-4 py-2 border border-[#1E3A8A] text-[#1E3A8A] text-sm hover:bg-[#F8FAFF]"
            >
              Acessar produto
            </Link>
          </div>
        )}

        {product.fileUrl && (
          <div className="mt-10 bg-white border border-[#E2E8F0] p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-fluid-lg font-semibold text-[#0F172A]">
                Visualização do documento
              </h2>
              <a
                href={encodeURI(product.fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#1E3A8A] hover:underline"
              >
                Baixar PDF
              </a>
            </div>
            {galleryImages.length > 0 ? (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#0F172A] mb-3">
                  Leitura em galeria
                </h3>
                <ImageLightboxGallery
                  images={galleryImages}
                  coverSrc={hasCover ? coverUrl : null}
                  downloadUrl={encodeURI(product.fileUrl)}
                />
              </div>
            ) : (
              <PdfFlipViewer url={encodeURI(product.fileUrl)} height="80vh" />
            )}
          </div>
        )}

        <div className="mt-12 bg-white border border-[#E2E8F0] p-6">
          <h2 className="text-fluid-lg font-semibold text-[#0F172A] mb-2">
            Área interna
          </h2>
          <p className="text-fluid-sm text-[#64748B] mb-4">
            Atestados de capacidade técnica e documentos associados ao produto.
          </p>
          {session?.user ? (
            <Link
              href={`/produtos/${product.slug}/atestados`}
              className="px-4 py-2 bg-[#1E3A8A] text-white text-sm"
            >
              Acessar atestados
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="px-4 py-2 border border-[#1E3A8A] text-[#1E3A8A] text-sm"
            >
              Fazer login para acessar
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
