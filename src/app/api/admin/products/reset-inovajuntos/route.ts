import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

export const runtime = "nodejs";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

function getR2Client() {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
    return null;
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID.trim()}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID.trim(),
      secretAccessKey: R2_SECRET_ACCESS_KEY.trim(),
    },
  });
}

async function listFolder(s3: S3Client, prefix: string): Promise<string[]> {
  const keys: string[] = [];
  let token: string | undefined;
  do {
    const res = await s3.send(
      new ListObjectsV2Command({
        Bucket: R2_BUCKET_NAME,
        Prefix: prefix,
        ContinuationToken: token,
      })
    );
    for (const item of res.Contents ?? []) {
      if (item.Key) keys.push(item.Key);
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return keys;
}

async function deleteFolder(s3: S3Client, prefix: string): Promise<number> {
  const keys = await listFolder(s3, prefix);
  if (keys.length === 0) return 0;
  const batch = 1000;
  let n = 0;
  for (let i = 0; i < keys.length; i += batch) {
    const chunk = keys.slice(i, i + batch);
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: R2_BUCKET_NAME,
        Delete: { Objects: chunk.map((Key) => ({ Key })) },
      })
    );
    n += chunk.length;
  }
  return n;
}

export async function POST(request: Request) {
  try {
    await requireAuth(["ADMIN"]);

    const body = await request.json().catch(() => ({}));
    if (body.confirm !== true) {
      return NextResponse.json(
        { error: "Confirme com { confirm: true } no body." },
        { status: 400 }
      );
    }

    const client = await prisma.clientOrganization.findUnique({
      where: { slug: "inovajuntos" },
      select: { id: true, name: true },
    });

    if (!client) {
      return NextResponse.json({
        deleted: { products: 0, contentItems: 0, r2Objects: 0 },
        message: "Cliente Inovajuntos não encontrado.",
      });
    }

    const products = await prisma.product.findMany({
      where: { clientId: client.id },
      select: { id: true, slug: true, contentItemId: true },
    });

    if (products.length === 0) {
      return NextResponse.json({
        deleted: { products: 0, contentItems: 0, r2Objects: 0 },
        message: "Nenhum produto Inovajuntos para remover.",
      });
    }

    let r2Deleted = 0;
    const s3 = getR2Client();
    if (s3) {
      for (const p of products) {
        r2Deleted += await deleteFolder(s3, `products/${p.slug}`);
      }
    }

    const contentItemIds = products.map((p) => p.contentItemId).filter(Boolean) as string[];
    let contentDeleted = 0;
    if (contentItemIds.length > 0) {
      const r = await prisma.contentItem.deleteMany({
        where: { id: { in: contentItemIds } },
      });
      contentDeleted = r.count;
    }

    const productResult = await prisma.product.deleteMany({
      where: { clientId: client.id },
    });

    return NextResponse.json({
      deleted: {
        products: productResult.count,
        contentItems: contentDeleted,
        r2Objects: r2Deleted,
      },
      message: `Inovajuntos resetado: ${productResult.count} produto(s), ${contentDeleted} ContentItem(s), ${r2Deleted} objeto(s) no R2.`,
    });
  } catch (error: unknown) {
    console.error("[admin/products/reset-inovajuntos]", error);
    const msg = error instanceof Error ? error.message : "Erro ao resetar Inovajuntos.";
    const isAuthError = msg.includes("Acesso negado") || msg.includes("login") || msg.includes("permissão");
    return NextResponse.json(
      { error: isAuthError ? "Sessão expirada ou sem permissão. Faça login como Admin e tente novamente." : msg },
      { status: isAuthError ? 403 : 500 }
    );
  }
}
