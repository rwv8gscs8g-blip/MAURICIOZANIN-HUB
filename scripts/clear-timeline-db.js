/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const envPath = path.join(__dirname, "..", ".env.local");
if (!process.env.DATABASE_URL && fs.existsSync(envPath)) {
  const envText = fs.readFileSync(envPath, "utf8");
  const match = envText.match(/^DATABASE_URL="([^"]+)"$/m);
  if (match) {
    process.env.DATABASE_URL = match[1];
  }
}

const prisma = new PrismaClient();

async function main() {
  const channel = await prisma.contentChannel.findFirst({ where: { key: "timeline" } });
  if (!channel) {
    console.log("Canal timeline nao encontrado.");
    return;
  }
  const result = await prisma.contentItemChannel.deleteMany({
    where: { channelId: channel.id },
  });
  console.log(`Timeline limpa. Vinculos removidos: ${result.count}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
