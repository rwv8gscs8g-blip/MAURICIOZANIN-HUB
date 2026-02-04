import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import { PrismaClient } from "@prisma/client";
import { uploadFile } from "../src/lib/storage";
import { processPdf } from "../src/lib/pdf-processor";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Helper para recursão
function getAllPdfs(dir: string): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return [];
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

// Helper para slugify
function slugify(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

console.log(`[EnvCheck] ACCOUNT_ID: ${process.env.R2_ACCOUNT_ID?.length} chars`);
console.log(`[EnvCheck] ACCESS_KEY: ${process.env.R2_ACCESS_KEY_ID?.length} chars`);
console.log(`[EnvCheck] SECRET_KEY: ${process.env.R2_SECRET_ACCESS_KEY?.length} chars`);
console.log(`[EnvCheck] BUCKET: ${process.env.R2_BUCKET_NAME}`);

async function main() {
    const entradaDir = path.join(process.cwd(), "entrada");
    console.log(`[BulkImport] Buscando PDFs em: ${entradaDir}`);

    const files = getAllPdfs(entradaDir);
    if (files.length === 0) {
        console.log("[BulkImport] Nenhum PDF encontrado.");
        return;
    }

    console.log(`[BulkImport] Encontrados ${files.length} arquivos.`);

    for (const filePath of files) {
        const fileName = path.basename(filePath);
        const rawName = fileName.replace(/\.pdf$/i, "");
        const slug = slugify(rawName);

        console.log(`\n-----------------------------------`);
        console.log(`[BulkImport] Processando: ${fileName}`);
        console.log(`[BulkImport] Slug gerado: ${slug}`);

        try {
            // 1. Buscar produto
            let product = await prisma.product.findFirst({ where: { slug } });

            // Tentativa parcial ou exata se falhar
            if (!product) {
                // Tenta achar slug que CONTENHA o gerado ou vice-versa (perigoso, melhor logar erro)
                console.error(`[Error] Produto não encontrado para slug '${slug}'.`);
                // Tenta comparar com titles? Não, muito custoso.
                continue;
            }

            console.log(`[Info] Produto encontrado: ${product.name} (ID: ${product.id})`);

            // 2. Upload PDF
            const pdfBuffer = fs.readFileSync(filePath);
            const r2Folder = `products/${slug}`;
            const pdfFileName = `${slug}.pdf`;

            console.log(`[Step] Fazendo upload do PDF para R2...`);
            const uploadedPdfUrl = await uploadFile(pdfBuffer, pdfFileName, "application/pdf", r2Folder);
            console.log(`[Success] PDF salvo em: ${uploadedPdfUrl}`);

            // 3. Gerar Imagens
            console.log(`[Step] Processando imagens (Capa + Galeria)...`);
            const images = await processPdf(pdfBuffer);
            console.log(`[Info] ${images.length} páginas renderizadas.`);

            if (images.length > 0) {
                // Upload Capa
                await uploadFile(images[0], "cover.jpg", "image/jpeg", r2Folder);
                console.log(`[Success] Capa salva.`);

                // Upload Galeria
                for (let i = 0; i < images.length; i++) {
                    const pageName = `page-${i + 1}.jpg`;
                    await uploadFile(images[i], pageName, "image/jpeg", r2Folder);
                    if (i % 5 === 0) process.stdout.write(".");
                }
                console.log(`\n[Success] Galeria salva.`);
            }

            // 4. Atualizar DB
            console.log(`[Step] Atualizando banco de dados...`);

            // Garantir que existe ContentItem para aparecer na Timeline
            let contentItemId = product.contentItemId;

            if (!contentItemId) {
                console.log(`[Info] Criando ContentItem para o produto...`);
                // Precisamos criar um ContentItem e associar
                const newItem = await prisma.contentItem.create({
                    data: {
                        type: "PRODUCT", // Assumindo enum ContentType tem PRODUCT
                        title: product.name,
                        summary: product.description,
                        status: "APPROVED",
                        isPublic: true,
                        hub: product.hub,
                        clientId: product.clientId,
                        clientUnitId: product.clientUnitId,
                        publishDate: new Date(),
                    }
                });
                contentItemId = newItem.id;

                // Associar ao produto
                await prisma.product.update({
                    where: { id: product.id },
                    data: { contentItemId: newItem.id }
                });
            } else {
                await prisma.contentItem.update({
                    where: { id: contentItemId },
                    data: {
                        status: "APPROVED",
                        isPublic: true,
                        hub: product.hub,
                        publishDate: new Date(), // Atualiza data de publicação
                    }
                });
            }

            // Garantir Canal Timeline
            const timelineChannel = await prisma.contentChannel.findUnique({ where: { key: "timeline" } });
            if (timelineChannel && contentItemId) {
                await prisma.contentItemChannel.upsert({
                    where: {
                        contentItemId_channelId: {
                            contentItemId: contentItemId,
                            channelId: timelineChannel.id
                        }
                    },
                    create: {
                        contentItemId: contentItemId,
                        channelId: timelineChannel.id,
                        isVisible: true
                    },
                    update: {
                        isVisible: true
                    }
                });
                console.log(`[Success] Adicionado/Atualizado na Timeline.`);
            }

            // Atualizar Produto Principal
            await prisma.product.update({
                where: { id: product.id },
                data: {
                    fileUrl: uploadedPdfUrl,
                    isVisiblePublic: true,
                    isVisibleClient: true,
                    isVisibleTimeline: true,
                    updatedAt: new Date(),
                }
            });

            // 5. Deletar local
            fs.unlinkSync(filePath);
            console.log(`[Success] Arquivo local removido. Processo concluído para ${slug}.`);

        } catch (err: any) {
            console.error(`[Error] Falha ao processar ${fileName}:`, err.message);
        }
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
