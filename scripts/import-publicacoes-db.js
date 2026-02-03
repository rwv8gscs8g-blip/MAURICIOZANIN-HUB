/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const input = path.join(__dirname, "..", "src", "data", "publicacoes.json");

async function main() {
  const data = JSON.parse(fs.readFileSync(input, "utf8"));
  for (const item of data) {
    const date = item.date ? new Date(item.date) : new Date("1900-01-01");
    const category =
      item.category === "Cartilha Sebrae"
        ? "CARTILHA_SEBRAE"
        : item.category === "Artigo Técnico"
        ? "ARTIGO_TECNICO"
        : item.category === "Projeto Internacional"
        ? "PROJETO_INTERNACIONAL"
        : "OUTRO";

    const existing = await prisma.publication.findFirst({
      where: { title: item.title },
      select: { id: true },
    });

    const hub =
      item.hub === "COOPERACAO_INTERNACIONAL"
        ? "COOPERACAO_INTERNACIONAL"
        : item.hub === "COMPRAS_GOVERNAMENTAIS"
        ? "COMPRAS_GOVERNAMENTAIS"
        : item.hub === "SUPORTE_MUNICIPIOS"
        ? "SUPORTE_MUNICIPIOS"
        : item.category === "Projeto Internacional"
        ? "COOPERACAO_INTERNACIONAL"
        : null;

    if (existing) {
      await prisma.publication.update({
        where: { id: existing.id },
        data: {
          description: item.description || null,
          category,
          link: item.link || item.file || null,
          dateOriginal: date,
          year: item.year || date.getFullYear(),
          hub,
          isPublic: false,
          approved: false,
          isActive: true,
        },
      });
    } else {
      await prisma.publication.create({
        data: {
          title: item.title,
          description: item.description || null,
          category,
          link: item.link || item.file || null,
          dateOriginal: date,
          year: item.year || date.getFullYear(),
          hub,
          isPublic: false,
          approved: false,
          isActive: true,
        },
      });
    }
  }

  console.log(`Publicações importadas: ${data.length}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
