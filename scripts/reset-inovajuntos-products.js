#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Reset apenas produtos do Inovajuntos.
 * Remove Product do cliente Inovajuntos e os ContentItem ligados a eles.
 * Exige CONFIRM_RESET_INOVAJUNTOS=1 para executar.
 * Ver: docs/PLANO_RESET_PRODUTOS.md
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const CONFIRM_ENV = "CONFIRM_RESET_INOVAJUNTOS";

async function main() {
  if (process.env[CONFIRM_ENV] !== "1") {
    console.error(
      `[reset-inovajuntos-products] Confirmação obrigatória. Defina ${CONFIRM_ENV}=1 e rode novamente.`
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

  const contentItemIds = products
    .map((p) => p.contentItemId)
    .filter(Boolean);

  if (products.length === 0) {
    console.log(`Nenhum produto do Inovajuntos encontrado. Nada a apagar.`);
    process.exit(0);
  }

  console.log(`Cliente: ${client.name} (id: ${client.id})`);
  console.log(`Produtos a remover: ${products.length}`);
  console.log(`ContentItems a remover: ${contentItemIds.length}`);

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

  console.log("Reset concluído:");
  console.log(`  - ContentItem removidos: ${result.contentDeleted}`);
  console.log(`  - Product removidos: ${result.productsDeleted}`);
  console.log("");
  console.log("Próximos passos:");
  console.log("  1. node scripts/import-inovajuntos-products.js");
  console.log("  2. node scripts/migrate-content-structure.js");
}

main()
  .catch((err) => {
    console.error("[reset-inovajuntos-products] Erro:", err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
