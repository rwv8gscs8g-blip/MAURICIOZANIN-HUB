import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFileFromR2 } from "@/lib/storage";

export const dynamic = "force-dynamic";

const HEADERS_JPEG = {
  "Content-Type": "image/jpeg",
  "Cache-Control": "public, max-age=3600",
};

/** Nome do arquivo permitido (evita path traversal). */
function safeKey(key: string): boolean {
  return /^[a-z0-9_.-]+\.(jpg|jpeg|png|webp)$/i.test(key);
}

/**
 * Proxy de imagem do produto (capa ou galeria). R2 only: products/{slug}/{key}
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string; key: string }> | { slug: string; key: string } }
) {
  const { slug, key } = await Promise.resolve(context.params);
  if (!slug || !key || !safeKey(key)) {
    return NextResponse.json({ error: "Slug ou key inválido" }, { status: 400 });
  }

  const product = await prisma.product.findFirst({
    where: { slug },
    select: { id: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  const r2Key = `products/${slug}/${key}`;
  const bufferFromR2 = await getFileFromR2(r2Key);
  if (bufferFromR2 && bufferFromR2.length > 0) {
    return new NextResponse(new Uint8Array(bufferFromR2), { status: 200, headers: HEADERS_JPEG });
  }

  return NextResponse.json({ error: "Imagem não encontrada. Configure R2 e reimporte o produto." }, { status: 404 });
}
