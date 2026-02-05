#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Reset produtos do Inovajuntos: apaga arquivos no R2 (products/{slug}/) e registros no banco.
 * Exige CONFIRM_RESET_INOVAJUNTOS=1.
 * Uso: CONFIRM_RESET_INOVAJUNTOS=1 node scripts/reset-inovajuntos-with-r2.js
 * Ver: docs/PLANO_RESET_PRODUTOS.md e docs/VALIDACAO_PRODUTO_TESTE.md
 */
try {
  require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
} catch (_) {}

const { PrismaClient } = require("@prisma/client");
const {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");

const prisma = new PrismaClient();
const CONFIRM_ENV = "CONFIRM_RESET_INOVAJUNTOS";

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

async function listFolder(s3, prefix) {
  const keys = [];
  let ContinuationToken;
  do {
    const cmd = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: prefix,
      ContinuationToken,
    });
    const res = await s3.send(cmd);
    for (const item of res.Contents || []) {
      if (item.Key) keys.push(item.Key);
    }
    ContinuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return keys;
}

async function deleteFolder(s3, prefix) {
  const keys = await listFolder(s3, prefix);
  if (keys.length === 0) return 0;
  const batchSize = 1000;
  let deleted = 0;
  for (let i = 0; i < keys.length; i += batchSize) {
    const chunk = keys.slice(i, i + batchSize);
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: R2_BUCKET_NAME,
        Delete: { Objects: chunk.map((Key) => ({ Key })) },
      })
    );
    deleted += chunk.length;
  }
  return deleted;
}

async function main() {
  if (process.env[CONFIRM_ENV] !== "1") {
    console.error(
      `[reset-inovajuntos-with-r2] Confirmação obrigatória. Defina ${CONFIRM_ENV}=1 e rode novamente.`
    );
    console.error("Antes, faça backup: bash scripts/backup-db.sh");
    process.exit(1);
  }

  const client = await prisma.clientOrganization.findUnique({
    where: { slug: "inovajuntos" },
    select: { id: true, name: true },
  });

  if (!client) {
    console.log("Cliente Inovajuntos não encontrado. Nada a apagar.");
    process.exit(0);
  }

  const products = await prisma.product.findMany({
    where: { clientId: client.id },
    select: { id: true, name: true, slug: true, contentItemId: true },
  });

  if (products.length === 0) {
    console.log("Nenhum produto do Inovajuntos encontrado. Nada a apagar.");
    process.exit(0);
  }

  console.log(`Cliente: ${client.name} (id: ${client.id})`);
  console.log(`Produtos a remover: ${products.length}`);

  // 1) Apagar pastas no R2 (products/{slug}/)
  const s3 = getR2Client();
  if (s3) {
    let totalR2 = 0;
    for (const p of products) {
      const prefix = `products/${p.slug}`;
      const n = await deleteFolder(s3, prefix);
      if (n > 0) {
        console.log(`  R2: ${prefix} -> ${n} objeto(s) removido(s)`);
        totalR2 += n;
      }
    }
    if (totalR2 > 0) {
      console.log(`Total objetos removidos no R2: ${totalR2}`);
    } else {
      console.log("Nenhum objeto encontrado no R2 para esses slugs (ok).");
    }
  } else {
    console.warn("R2 não configurado (.env). Pulando limpeza do R2.");
  }

  // 2) Apagar ContentItem e Product no banco
  const contentItemIds = products.map((p) => p.contentItemId).filter(Boolean);
  const result = await prisma.$transaction(async (tx) => {
    let contentDeleted = 0;
    if (contentItemIds.length > 0) {
      const r = await tx.contentItem.deleteMany({
        where: { id: { in: contentItemIds } },
      });
      contentDeleted = r.count;
    }
    const productResult = await tx.product.deleteMany({
      where: { clientId: client.id },
    });
    return { contentDeleted, productsDeleted: productResult.count };
  });

  console.log("Reset concluído (banco):");
  console.log(`  - ContentItem removidos: ${result.contentDeleted}`);
  console.log(`  - Product removidos: ${result.productsDeleted}`);
  console.log("");
  console.log("Próximos passos:");
  console.log("  1. (Opcional) Subir um produto de teste e validar: node scripts/seed-one-inovajuntos-test.js");
  console.log("  2. Reimportar base: node scripts/import-inovajuntos-products.js");
  console.log("  3. Sincronizar conteúdo: node scripts/migrate-content-structure.js");
}

main()
  .catch((err) => {
    console.error("[reset-inovajuntos-with-r2] Erro:", err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
