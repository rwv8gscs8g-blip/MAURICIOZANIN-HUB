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
  const items = await prisma.contentItem.findMany({
    where: {
      channels: {
        some: { channel: { key: "timeline" }, isVisible: true },
      },
    },
    orderBy: [{ eventDate: "asc" }, { publishDate: "asc" }, { createdAt: "asc" }],
  });

  const outDir = path.join(__dirname, "..", "data", "timeline-backups");
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const outPath = path.join(outDir, `timeline-backup-${stamp}.json`);
  fs.writeFileSync(outPath, JSON.stringify(items, null, 2), "utf8");
  console.log(`Backup salvo em ${outPath} (${items.length} itens).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
