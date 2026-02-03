import { PdfFlipViewer } from "@/components/documents/PdfFlipViewer";
import { ImageLightboxGallery } from "@/components/ui/ImageLightboxGallery";
import Link from "next/link";
import fs from "fs";
import path from "path";

const PDF_URL = "/resources/2014/zanin-fgv-final.pdf";

export default function ZaninFgvPage() {
  const publicRoot = path.join(process.cwd(), "public");
  const galleryDir = path.join(
    publicRoot,
    path.dirname(PDF_URL.replace(/^\//, "")),
    path.basename(PDF_URL, ".pdf")
  );
  const galleryImages = fs.existsSync(galleryDir)
    ? fs
        .readdirSync(galleryDir)
        .filter((file) => /\.(png|jpe?g|webp)$/i.test(file))
        .map((file) => ({
          src: `${path.dirname(PDF_URL)}/${path.basename(PDF_URL, ".pdf")}/${file}`,
          alt: `Página ${file}`,
        }))
    : [];

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="container-fluid">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/publicacoes" className="text-sm text-[#1E3A8A] hover:underline">
              ← Voltar às publicações
            </Link>
            <h1 className="text-fluid-2xl font-bold text-[#0F172A] mt-2">
              Tese de MBA (FGV) – Compras Governamentais e MPE
            </h1>
            <p className="text-fluid-sm text-[#64748B]">
              Visualização em modo revista com paginação rápida.
            </p>
          </div>
          <a
            href={PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-[#1E3A8A] text-[#1E3A8A] text-sm hover:bg-[#F8FAFF]"
          >
            Baixar PDF
          </a>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-4 md:p-6">
          {galleryImages.length > 0 ? (
            <ImageLightboxGallery images={galleryImages} />
          ) : (
            <>
              <PdfFlipViewer url={PDF_URL} height="85vh" />
              <div className="mt-4 text-xs text-[#64748B]">
                Use o zoom do visualizador para leitura confortável.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
