import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFileFromR2 } from "@/lib/storage";

export const dynamic = "force-dynamic";

const HEADERS_JPEG = {
  "Content-Type": "image/jpeg",
  "Cache-Control": "public, max-age=3600",
};

/**
 * Proxy da capa do produto. R2 only: products/{slug}/cover.jpg
 * Em produção/preview não há fallback local – configure R2 e reimporte produtos.
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
    select: { id: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  const r2Key = `products/${slug}/cover.jpg`;
  const bufferFromR2 = await getFileFromR2(r2Key);
  if (bufferFromR2 && bufferFromR2.length > 0) {
    return new NextResponse(new Uint8Array(bufferFromR2), { status: 200, headers: HEADERS_JPEG });
  }

  return NextResponse.json({ error: "Capa não encontrada. Configure R2 e reimporte o produto." }, { status: 404 });
}
