import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { processPdf } from "@/lib/pdf-processor";
import { fetchFile, uploadFile } from "@/lib/storage";
import path from "path";

export const runtime = "nodejs";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAuth(["ADMIN"]);
        const { id } = await params;

        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product || !product.fileUrl) {
            return NextResponse.json(
                { error: "Produto não encontrado ou sem arquivo PDF." },
                { status: 404 }
            );
        }

        // 1. Baixar PDF
        console.log(`[ProcessPDF] Baixando ${product.fileUrl}...`);
        const pdfBuffer = await fetchFile(product.fileUrl);

        // 2. Processar PDF -> Imagens
        console.log(`[ProcessPDF] Gerando imagens...`);
        const images = await processPdf(pdfBuffer);

        if (images.length === 0) {
            return NextResponse.json({ error: "Nenhuma página encontrada no PDF." }, { status: 400 });
        }

        // 3. Fazer Upload das Imagens
        // Estrutura: uploads/products/{slug}/page-1.jpg, page-2.jpg...
        // Capa: uploads/products/{slug}-cover.jpg (para compatibilidade com lógica existente)
        // OU ajustar lógica para buscar capa na pasta.
        // A lógica atual do page.tsx busca capa em: fileUrl.replace(".pdf", "-cover.jpg")
        // Se fileUrl for "uploads/arquivo.pdf", capa deve ser "uploads/arquivo-cover.jpg"

        // Vamos extrair a pasta base do fileUrl original para manter images perto do PDF se possível, ou usar convenção.
        // Se product.slug for garantido, usamos ele.

        // Assumindo que fileUrl é uma URL completa ou path relativo.
        // Se for URL completa, precisamos extrair o path no bucket. 
        // Como fileUrl costuma ser armazenada como path ou URL, vamos tentar normalizar.

        // Strategy:
        // 1. Cover: Salvar como fileUrl-cover.jpg (substituindo .pdf por -cover.jpg) para manter compatibilidade
        // 2. Gallery: Salvar em uploads/galleries/{slug}/page-N.jpg

        // Mas precisamos saber o "path" relativo para salvar no R2.
        // Se fileUrl for "https://bucket.../uploads/file.pdf", é difícil saber o key exato sem parse.
        // Vamos assumir que uploads novos caem em "uploads/..."

        // Workaround: Vamos salvar em "products/{slug}/" e atualizar o visualizador para olhar lá.
        // Mas para a CAPA funcionar com o código existente, ela deve estar "ao lado" do PDF.

        // Vamos fazer o seguinte: Salvar a capa e as imagens em uma pasta dedicada "products/{slug}/".
        // E vamos atualizar o page.tsx para buscar lá.
        // Isso é mais limpo do que tentar adivinhar onde o PDF está.

        const baseFolder = `products/${product.slug}`;
        const uploadedUrls: string[] = [];

        // Capa (Página 1)
        const coverBuffer = images[0];
        const coverUrl = await uploadFile(coverBuffer, "cover.jpg", "image/jpeg", baseFolder);
        uploadedUrls.push(coverUrl);
        console.log(`[ProcessPDF] Capa salva em ${coverUrl}`);

        // Páginas da Galeria
        for (let i = 0; i < images.length; i++) {
            const fileName = `page-${i + 1}.jpg`;
            const url = await uploadFile(images[i], fileName, "image/jpeg", baseFolder);
            uploadedUrls.push(url);
        }

        return NextResponse.json({
            success: true,
            message: `${images.length} imagens geradas.`,
            coverUrl,
            pages: uploadedUrls.length
        });

    } catch (error: any) {
        console.error("[ProcessPDF] Error:", error);
        return NextResponse.json(
            { error: error.message || "Erro interno ao processar PDF." },
            { status: 500 }
        );
    }
}
