/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const fromLabel = "Compras Governamentais";
  const toLabel = "Compras Governamentais e Governança";

  const updatedTimeline = await prisma.contentItem.updateMany({
    where: { axis: fromLabel },
    data: { axis: toLabel },
  });

  console.log(`ContentItem.axis atualizados: ${updatedTimeline.count}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
