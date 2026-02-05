#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Cria um único produto de teste do Inovajuntos para validar fluxo (PDF, proxy, lightbox).
 * Produto: 1.kit2023_postais_Inova_Juntos_Brasil (PDF em public/resources/2025/inovajuntos/).
 * Rode após reset-inovajuntos-with-r2.js para testar antes de reimportar a base inteira.
 */
try {
  require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
} catch (_) {}

const { PrismaClient } = require("@prisma/client");
const path = require("path");
const fs = require("fs");

const prisma = new PrismaClient();

const TEST_SLUG = "1-kit2023-postais-inova-juntos-brasil";
const TEST_FILE = "1-kit2023-postais-inova-juntos-brasil.pdf";
const TEST_YEAR = 2025;
const TEST_NAME = "1.kit2023_postais_Inova_Juntos_Brasil";
const FILE_PATH_REL = `/resources/${TEST_YEAR}/inovajuntos/${TEST_FILE}`;

async function main() {
  const publicPath = path.join(process.cwd(), "public", FILE_PATH_REL.replace(/^\//, ""));
  if (!fs.existsSync(publicPath)) {
    console.error(`Arquivo não encontrado: ${publicPath}`);
    console.error("Coloque o PDF em public/resources/2025/inovajuntos/1-kit2023-postais-inova-juntos-brasil.pdf");
    process.exit(1);
  }

  const client = await prisma.clientOrganization.upsert({
    where: { slug: "inovajuntos" },
    update: { name: "Inovajuntos" },
    create: {
      name: "Inovajuntos",
      slug: "inovajuntos",
      description: "Produtos e documentos do projeto Inovajuntos.",
    },
  });

  const project = await prisma.project.findFirst({
    where: { clientId: client.id, slug: "inovajuntos" },
  });

  if (!project) {
    await prisma.project.create({
      data: {
        clientId: client.id,
        name: "Inovajuntos",
        slug: "inovajuntos",
        description: "Projeto e acervo da Rede/Projeto Inovajuntos.",
        hub: "COOPERACAO_INTERNACIONAL",
      },
    });
  }

  const project2 = await prisma.project.findFirst({
    where: { clientId: client.id, slug: "inovajuntos" },
  });

  await prisma.product.upsert({
    where: { clientId_slug: { clientId: client.id, slug: TEST_SLUG } },
    update: {
      name: TEST_NAME,
      description: `Documento do Inovajuntos: ${TEST_NAME}`,
      year: TEST_YEAR,
      path: `/produtos/${TEST_SLUG}`,
      fileUrl: FILE_PATH_REL,
      hub: "COOPERACAO_INTERNACIONAL",
      projectId: project2?.id || null,
      isVisiblePublic: true,
      isVisibleClient: true,
    },
    create: {
      clientId: client.id,
      name: TEST_NAME,
      slug: TEST_SLUG,
      description: `Documento do Inovajuntos: ${TEST_NAME}`,
      year: TEST_YEAR,
      path: `/produtos/${TEST_SLUG}`,
      fileUrl: FILE_PATH_REL,
      hub: "COOPERACAO_INTERNACIONAL",
      projectId: project2?.id || null,
      isVisiblePublic: true,
      isVisibleClient: true,
      isVisibleTimeline: false,
      isVisibleShare: false,
    },
  });

  console.log("Produto de teste criado/atualizado:");
  console.log(`  Slug: ${TEST_SLUG}`);
  console.log(`  URL: /produtos/${TEST_SLUG}`);
  console.log(`  PDF: ${FILE_PATH_REL}`);
  console.log("");
  console.log("Valide: visualização do documento, Baixar PDF (proxy), e opcionalmente Processar PDF no Admin para lightbox.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
