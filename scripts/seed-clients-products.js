/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const UF_LIST = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

async function upsertClient({ name, slug, description }) {
  return prisma.clientOrganization.upsert({
    where: { slug },
    update: { name, description },
    create: { name, slug, description },
  });
}

async function upsertUnit(clientId, { name, slug, uf }) {
  return prisma.clientUnit.upsert({
    where: { clientId_slug: { clientId, slug } },
    update: { name, uf },
    create: { clientId, name, slug, uf },
  });
}

async function upsertProduct(clientId, clientUnitId, data) {
  return prisma.product.upsert({
    where: { clientId_slug: { clientId, slug: data.slug } },
    update: data,
    create: { ...data, clientId, clientUnitId },
  });
}

async function ensureDefaultProjects(clientId) {
  const defaults = [
    {
      name: "Cooperação Internacional",
      slug: "cooperacao-internacional",
      hub: "COOPERACAO_INTERNACIONAL",
    },
    {
      name: "Compras Governamentais e Governança",
      slug: "compras-governamentais-governanca",
      hub: "COMPRAS_GOVERNAMENTAIS",
    },
    {
      name: "Suporte aos Municípios",
      slug: "suporte-aos-municipios",
      hub: "SUPORTE_MUNICIPIOS",
    },
    {
      name: "Desenvolvimento de Software",
      slug: "desenvolvimento-software",
      hub: "DESENVOLVIMENTO_SOFTWARE",
    },
  ];

  const projects = {};
  for (const project of defaults) {
    const created = await prisma.project.upsert({
      where: { clientId_slug: { clientId, slug: project.slug } },
      update: { name: project.name, hub: project.hub },
      create: {
        clientId,
        name: project.name,
        slug: project.slug,
        hub: project.hub,
      },
    });
    projects[project.hub] = created;
  }
  return projects;
}

async function main() {
  const sebrae = await upsertClient({
    name: "Sebrae",
    slug: "sebrae",
    description: "Serviço Brasileiro de Apoio às Micro e Pequenas Empresas.",
  });

  const cnm = await upsertClient({
    name: "CNM",
    slug: "cnm",
    description: "Confederação Nacional de Municípios.",
  });

  const ce = await upsertClient({
    name: "Comissão Europeia",
    slug: "comissao-europeia",
    description: "Instituição da União Europeia.",
  });

  const sebraeProjects = await ensureDefaultProjects(sebrae.id);
  await ensureDefaultProjects(cnm.id);
  await ensureDefaultProjects(ce.id);

  const sebraeNacional = await upsertUnit(sebrae.id, {
    name: "Sebrae Nacional",
    slug: "sebrae-nacional",
  });

  for (const uf of UF_LIST) {
    await upsertUnit(sebrae.id, {
      name: `Sebrae ${uf}`,
      slug: `sebrae-${uf.toLowerCase()}`,
      uf,
    });
  }

  await upsertProduct(sebrae.id, sebraeNacional.id, {
    name: "Diagnóstico de Maturidade em Compras Governamentais",
    slug: "diagnostico-compras-municipios",
    description:
      "Wizard de diagnóstico para municípios, com devolutiva técnica e relatórios.",
    path: "/diagnostico",
    year: 2026,
    hub: "COMPRAS_GOVERNAMENTAIS",
    projectId: sebraeProjects.COMPRAS_GOVERNAMENTAIS?.id || null,
    isVisiblePublic: true,
    isVisibleClient: true,
  });

  console.log("Seed de clientes e produtos concluído.");
  console.log(`Clientes: ${[sebrae.name, cnm.name, ce.name].join(", ")}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
