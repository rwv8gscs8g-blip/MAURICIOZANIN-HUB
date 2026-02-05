import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchFile, getFileFromR2 } from "@/lib/storage";

export const dynamic = "force-dynamic";

const HEADERS_PDF = {
  "Content-Type": "application/pdf",
  "Content-Disposition": "inline",
  "Cache-Control": "public, max-age=3600",
};

/**
 * Proxy do PDF do produto.
 * - Primeiro tenta R2: products/{slug}/{slug}.pdf
 * - Se fileUrl for URL absoluta (R2, etc.): fetch e stream (evita CORS no viewer).
 * - Sem fallback local – produção usa R2.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> | { slug: string } }
) {
  const { slug } = await Promise.resolve(context.params);
  if (!slug) {
    return NextResponse.json({ error: "Slug ausente" }, { status: 400 });
  }

  const product = await prisma.product.findFirst({
    where: { slug },
    select: { fileUrl: true },
  });

  if (!product?.fileUrl) {
    return NextResponse.json({ error: "Produto ou arquivo não encontrado" }, { status: 404 });
  }

  const fileUrl = product.fileUrl.trim();

  // 1) R2 primeiro: products/{slug}/{slug}.pdf
  const r2Key = `products/${slug}/${slug}.pdf`;
  const bufferFromR2 = await getFileFromR2(r2Key);
  if (bufferFromR2 && bufferFromR2.length > 0) {
    return new NextResponse(new Uint8Array(bufferFromR2), { status: 200, headers: HEADERS_PDF });
  }

  // 2) URL absoluta (R2 público ou outro CDN): fetch e stream
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
    try {
      const buffer = await fetchFile(fileUrl);
      return new NextResponse(new Uint8Array(buffer), { status: 200, headers: HEADERS_PDF });
    } catch (err) {
      console.error("[products/pdf] Erro ao buscar PDF:", err);
      return NextResponse.json({ error: "Não foi possível carregar o PDF" }, { status: 502 });
    }
  }

  return NextResponse.json(
    { error: "Arquivo não encontrado. Configure R2 e reimporte o produto." },
    { status: 404 }
  );
}
