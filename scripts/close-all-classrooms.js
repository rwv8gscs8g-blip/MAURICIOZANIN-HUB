/* eslint-disable no-console */
// Fecha todas as salas (classroomSession) para permitir novos testes de criação.

const fs = require("fs");
const path = require("path");

const loadEnv = () => {
  if (process.env.DATABASE_URL) return;
  const envPath = path.resolve(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const [key, ...rest] = trimmed.split("=");
    if (!key || rest.length === 0) return;
    const value = rest.join("=").replace(/^"|"$/g, "");
    if (!process.env[key]) process.env[key] = value;
  });
};

loadEnv();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Fechando todas as salas (classroomSession)...");

  const result = await prisma.classroomSession.updateMany({
    where: {},
    data: {
      status: "ENCERRADA",
    },
  });

  console.log(`Salas atualizadas: ${result.count}`);
}

main()
  .catch((error) => {
    console.error("Erro ao fechar salas:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

