import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { processPdf } from "@/lib/pdf-processor";
import { uploadFile, getFileFromR2 } from "@/lib/storage";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase()
    .slice(0, 80);
}

/** Lê PDF: path relativo → public/; URL absoluta → fetch (não usado aqui). */
async function getPdfBuffer(fileUrl: string): Promise<Buffer> {
  const trimmed = fileUrl.trim();
  if (trimmed.startsWith("/")) {
    const publicPath = path.join(process.cwd(), "public", trimmed.replace(/^\//, ""));
    if (!fs.existsSync(publicPath)) throw new Error(`Arquivo não encontrado: ${publicPath}`);
    return fs.readFileSync(publicPath);
  }
  throw new Error("URL do arquivo inválida.");
}

export async function POST(request: Request) {
  try {
    await requireAuth(["ADMIN"]);

    const formData = await request.formData();
    const file = formData.get("file");
    const clientId = String(formData.get("clientId") || "").trim();
    const projectId = (formData.get("projectId") as string)?.trim() || null;
    const yearStr = (formData.get("year") as string)?.trim();
    const nameOverride = (formData.get("name") as string)?.trim() || null;
    const processPdfNow = formData.get("processPdfNow") === "1" || formData.get("processPdfNow") === "true";

    if (!(file instanceof File) || !clientId) {
      return NextResponse.json(
        { error: "Envie um arquivo PDF e selecione o cliente." },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "O arquivo deve ser um PDF." }, { status: 400 });
    }

    const client = await prisma.clientOrganization.findUnique({
      where: { id: clientId },
      select: { id: true, name: true, slug: true },
    });
    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
    }

    const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();
    if (Number.isNaN(year) || year < 1990 || year > 2100) {
      return NextResponse.json({ error: "Ano inválido." }, { status: 400 });
    }

    const baseName = file.name.replace(/\.pdf$/i, "");
    let slug = slugify(nameOverride || baseName);
    const existing = await prisma.product.findFirst({
      where: { clientId: client.id, slug },
    });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36).slice(-6)}`;
    }

    const safeFilename = `${slug}.pdf`;
    const destDir = path.join(process.cwd(), "public", "resources", String(year), client.slug);
    fs.mkdirSync(destDir, { recursive: true });
    const destPath = path.join(destDir, safeFilename);

    const bytes = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(bytes);
    fs.writeFileSync(destPath, pdfBuffer);

    const publicPath = `/resources/${year}/${client.slug}/${safeFilename}`;
    let fileUrlToSave = publicPath;
    // Em produção (Vercel) o filesystem é efêmero; enviar PDF para R2 garante que o proxy sirva o arquivo.
    try {
      const r2PdfUrl = await uploadFile(pdfBuffer, safeFilename, "application/pdf", `products/${slug}`);
      fileUrlToSave = r2PdfUrl;
    } catch {
      // R2 não configurado ou falha: manter path local (funciona em dev com arquivo em public/)
    }

    const name = nameOverride || baseName;
    const description = `Documento: ${name}`;

    const project = projectId
      ? await prisma.project.findFirst({
          where: { id: projectId, clientId: client.id },
        })
      : await prisma.project.findFirst({
          where: { clientId: client.id },
          orderBy: { createdAt: "desc" },
        });

    const product = await prisma.product.upsert({
      where: { clientId_slug: { clientId: client.id, slug } },
      update: {
        name,
        description,
        year,
        path: `/produtos/${slug}`,
        fileUrl: fileUrlToSave,
        projectId: project?.id || null,
        isVisiblePublic: true,
        isVisibleClient: true,
        isVisibleTimeline: false,
        isVisibleShare: false,
      },
      create: {
        clientId: client.id,
        name,
        slug,
        description,
        year,
        path: `/produtos/${slug}`,
        fileUrl: fileUrlToSave,
        hub: project?.hub ?? "COOPERACAO_INTERNACIONAL",
        projectId: project?.id || null,
        isVisiblePublic: true,
        isVisibleClient: true,
        isVisibleTimeline: false,
        isVisibleShare: false,
      },
    });

    if (processPdfNow) {
      try {
        let pdfBufferForImages: Buffer;
        if (fileUrlToSave.startsWith("/")) {
          pdfBufferForImages = await getPdfBuffer(fileUrlToSave);
        } else {
          const r2Key = `products/${slug}/${safeFilename}`;
          const fromR2 = await getFileFromR2(r2Key);
          if (!fromR2 || fromR2.length === 0) throw new Error("PDF no R2 não encontrado para processar imagens.");
          pdfBufferForImages = fromR2;
        }
        const images = await processPdf(pdfBufferForImages);
        const baseFolder = `products/${product.slug}`;
        if (images.length > 0) {
          await uploadFile(images[0], "cover.jpg", "image/jpeg", baseFolder);
          for (let i = 0; i < images.length; i++) {
            await uploadFile(images[i], `page-${i + 1}.jpg`, "image/jpeg", baseFolder);
          }
        }
      } catch (err) {
        console.error("[import] Processar PDF após import:", err);
        return NextResponse.json({
          product: { id: product.id, slug: product.slug, name: product.name },
          message: `Produto importado. Falha ao processar PDF (capa/galeria): ${(err as Error).message}. Você pode clicar em "Processar PDF" depois.`,
        });
      }
    }

    return NextResponse.json({
      product: { id: product.id, slug: product.slug, name: product.name },
      message: processPdfNow
        ? "Produto importado e PDF processado (capa e galeria geradas)."
        : "Produto importado. Use 'Processar PDF' para gerar capa e galeria.",
    });
  } catch (error: unknown) {
    console.error("[admin/products/import]", error);
    return NextResponse.json(
      { error: (error as Error).message || "Erro ao importar produto." },
      { status: 500 }
    );
  }
}
