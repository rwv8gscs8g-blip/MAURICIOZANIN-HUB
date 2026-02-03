#!/usr/bin/env node
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const normalizePt = (value) => {
  if (!value || typeof value !== "string") return value;
  return value.normalize("NFC").replace(/\s+/g, " ").trim();
};

async function main() {
  const client = await prisma.clientOrganization.upsert({
    where: { slug: "sebrae" },
    update: { name: "Sebrae" },
    create: {
      name: "Sebrae",
      slug: "sebrae",
      description: "Cliente institucional",
    },
  });

  const unit = await prisma.clientUnit.upsert({
    where: { clientId_slug: { clientId: client.id, slug: "sebrae-nacional" } },
    update: { name: "Sebrae Nacional" },
    create: {
      clientId: client.id,
      name: "Sebrae Nacional",
      slug: "sebrae-nacional",
      uf: "BR",
    },
  });

  const productName = normalizePt("Diagnóstico de Maturidade em Compras Governamentais");
  const productDescription = normalizePt(
    "Diagnóstico de maturidade em compras governamentais para municípios, com análise técnica e devolutiva.",
  );

  const product = await prisma.product.upsert({
    where: { clientId_slug: { clientId: client.id, slug: "diagnostico-compras-municipios" } },
    update: {
      name: productName,
      description: productDescription,
      hub: "COMPRAS_GOVERNAMENTAIS",
      clientUnitId: unit.id,
      path: "/clientes/sebrae/sebrae-nacional/produtos/diagnostico-compras-municipios",
    },
    create: {
      clientId: client.id,
      clientUnitId: unit.id,
      name: productName,
      slug: "diagnostico-compras-municipios",
      description: productDescription,
      hub: "COMPRAS_GOVERNAMENTAIS",
      path: "/clientes/sebrae/sebrae-nacional/produtos/diagnostico-compras-municipios",
      isVisibleClient: true,
      isVisiblePublic: false,
      isVisibleTimeline: false,
      isVisibleShare: false,
    },
  });

  const updated = await prisma.diagnostico.updateMany({
    data: {
      clientOrganizationId: client.id,
      clientUnitId: unit.id,
      productId: product.id,
    },
  });

  console.log(`Diagnosticos atualizados: ${updated.count}`);
}

main()
  .catch((error) => {
    console.error("Falha ao vincular diagnostico ao Sebrae", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
