/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const SOURCE_DIR = "/Users/macbookpro/Downloads/Produtos Inovajuntos";
const DEST_ROOT = path.join(__dirname, "..", "public", "resources");
const OUTPUT_JSON = path.join(__dirname, "..", "data", "inovajuntos-products.json");

const slugify = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase();

function listPdfs(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listPdfs(full));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")) {
      results.push(full);
    }
  }
  return results;
}

async function main() {
  const files = listPdfs(SOURCE_DIR);
  if (!files.length) {
    console.log("Nenhum PDF encontrado.");
    return;
  }

  const client = await prisma.clientOrganization.upsert({
    where: { slug: "inovajuntos" },
    update: { name: "Inovajuntos" },
    create: { name: "Inovajuntos", slug: "inovajuntos", description: "Produtos e documentos do projeto Inovajuntos." },
  });

  const defaultProjects = [
    {
      name: "Inovajuntos",
      slug: "inovajuntos",
      description: "Projeto e acervo da Rede/Projeto Inovajuntos.",
      hub: "COOPERACAO_INTERNACIONAL",
    },
    {
      name: "Compras Governamentais e Governança",
      slug: "compras-governamentais-governanca",
      description: "Projetos de compras públicas e governança.",
      hub: "COMPRAS_GOVERNAMENTAIS",
    },
    {
      name: "Suporte aos Municípios",
      slug: "suporte-aos-municipios",
      description: "Projetos de apoio técnico e desenvolvimento municipal.",
      hub: "SUPORTE_MUNICIPIOS",
    },
    {
      name: "Desenvolvimento de Software",
      slug: "desenvolvimento-software",
      description: "Projetos de plataformas e soluções tecnológicas.",
      hub: "DESENVOLVIMENTO_SOFTWARE",
    },
  ];

  for (const projectData of defaultProjects) {
    await prisma.project.upsert({
      where: {
        clientId_slug: {
          clientId: client.id,
          slug: projectData.slug,
        },
      },
      update: {
        name: projectData.name,
        description: projectData.description,
        hub: projectData.hub,
      },
      create: {
        clientId: client.id,
        name: projectData.name,
        slug: projectData.slug,
        description: projectData.description,
        hub: projectData.hub,
      },
    });
  }

  const products = [];
  const usedNames = new Set();

  const project = await prisma.project.findFirst({
    where: { clientId: client.id, slug: "inovajuntos" },
  });

  for (const file of files) {
    const stats = fs.statSync(file);
    const year = new Date(stats.mtime).getFullYear();
    const filename = path.basename(file);
    const baseName = filename.replace(/\.pdf$/i, "");
    let safeName = slugify(baseName);
    if (usedNames.has(safeName)) {
      safeName = `${safeName}-${Math.random().toString(36).slice(2, 6)}`;
    }
    usedNames.add(safeName);
    const safeFilename = `${safeName}.pdf`;

    const yearDir = path.join(DEST_ROOT, String(year), "inovajuntos");
    fs.mkdirSync(yearDir, { recursive: true });
    const dest = path.join(yearDir, safeFilename);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(file, dest);
    }

    const publicPath = `/resources/${year}/inovajuntos/${safeFilename}`;
    const title = baseName;
    const description = `Documento do Inovajuntos: ${baseName}`;
    const slug = safeName.slice(0, 80);

    const product = await prisma.product.upsert({
      where: { clientId_slug: { clientId: client.id, slug } },
      update: {
        name: title,
        description,
        year,
        path: `/produtos/${slug}`,
        fileUrl: publicPath,
        hub: "COOPERACAO_INTERNACIONAL",
        projectId: project?.id || null,
        isVisiblePublic: true,
        isVisibleClient: true,
        isVisibleTimeline: false,
        isVisibleShare: false,
      },
      create: {
        clientId: client.id,
        name: title,
        slug,
        description,
        year,
        path: `/produtos/${slug}`,
        fileUrl: publicPath,
        hub: "COOPERACAO_INTERNACIONAL",
        projectId: project?.id || null,
        isVisiblePublic: true,
        isVisibleClient: true,
        isVisibleTimeline: false,
        isVisibleShare: false,
      },
    });

    products.push({
      title,
      year,
      sourcePath: file,
      publicPath,
      slug,
      client: "Inovajuntos",
      productId: product.id,
    });
  }

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(products, null, 2));
  console.log(`Importados ${products.length} PDFs. JSON salvo em ${OUTPUT_JSON}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
