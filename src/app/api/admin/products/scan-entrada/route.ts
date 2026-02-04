import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { processPdf } from "@/lib/pdf-processor";
import { uploadFile } from "@/lib/storage";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST() {
    try {
        await requireAuth(["ADMIN"]);

        const entradaDir = path.join(process.cwd(), "entrada");
        if (!fs.existsSync(entradaDir)) {
            fs.mkdirSync(entradaDir);
            return NextResponse.json({ message: "Pasta 'entrada' criada. Adicione arquivos PDF nela." });
        }

        function getAllPdfs(dir: string): string[] {
            let results: string[] = [];
            const list = fs.readdirSync(dir);
            list.forEach(file => {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                if (stat && stat.isDirectory()) {
                    results = results.concat(getAllPdfs(filePath));
                } else {
                    if (file.toLowerCase().endsWith(".pdf")) {
                        results.push(filePath);
                    }
                }
            });
            return results;
        }

        const files = getAllPdfs(entradaDir);

        if (files.length === 0) {
            return NextResponse.json({ message: "Nenhum PDF encontrado na pasta 'entrada' ou subpastas." });
        }

        const results = [];

        for (const filePath of files) {
            // Extrair nome do arquivo para usar como slug (ignorando caminho)
            const fileName = path.basename(filePath);
            const slug = fileName.replace(/\.pdf$/i, "");
            const file = path.relative(entradaDir, filePath); // Para relatório

            try {
                // 1. Buscar produto pelo slug (nome do arquivo)
                // Como slug não é único globalmente (depende do clientId), vamos pegar o primeiro match.
                // O ideal seria o arquivo ter "slug-do-cliente_slug-do-produto.pdf" se houver colisão.
                // Mas vamos assumir unicidade prática.
                const product = await prisma.product.findFirst({ where: { slug } });

                if (!product) {
                    results.push({ file, status: "error", message: "Produto não encontrado para este slug." });
                    continue;
                }

                // 2. Ler e Upload do PDF novo
                const pdfBuffer = fs.readFileSync(filePath);
                const r2Folder = `products/${slug}`;
                const pdfFileName = `${slug}.pdf`;

                // Upload do PDF (sobrescreve ou cria novo no R2)
                const uploadedPdfUrl = await uploadFile(pdfBuffer, pdfFileName, "application/pdf", r2Folder);
                console.log(`[Bulk] PDF uploaded: ${uploadedPdfUrl}`);

                // 3. Processar Imagens (Capa + Galeria)
                const images = await processPdf(pdfBuffer);

                // Upload Capa
                if (images.length > 0) {
                    await uploadFile(images[0], "cover.jpg", "image/jpeg", r2Folder);
                }

                // Upload Galeria
                for (let i = 0; i < images.length; i++) {
                    const pageName = `page-${i + 1}.jpg`;
                    await uploadFile(images[i], pageName, "image/jpeg", r2Folder);
                }

                // 4. Atualizar DB
                // - Atualiza fileUrl com o novo link
                // - Garante visibilidade pública
                // - Atualiza ContentItem se existir (para garantir aprovação)
                await prisma.product.update({
                    where: { id: product.id },
                    data: {
                        fileUrl: uploadedPdfUrl,
                        isVisiblePublic: true,
                        isVisibleClient: true,
                        isVisibleTimeline: true, // Garante visibilidade na linha do tempo
                        updatedAt: new Date(),
                    }
                });

                // Se tiver contentItem associado, aprova também
                if (product.contentItemId) {
                    await prisma.contentItem.update({
                        where: { id: product.contentItemId },
                        data: {
                            status: "APPROVED",
                            isPublic: true,
                        }
                    });
                }

                // 5. Deletar arquivo local
                fs.unlinkSync(filePath);

                results.push({ file, status: "success", product: product.name });

            } catch (err: any) {
                console.error(`Error processing ${file}:`, err);
                results.push({ file, status: "error", message: err.message });
            }
        }

        return NextResponse.json({
            processed: results.length,
            results
        });

    } catch (error: any) {
        console.error("[BulkImport] Error:", error);
        return NextResponse.json(
            { error: error.message || "Erro interno." },
            { status: 500 }
        );
    }
}
