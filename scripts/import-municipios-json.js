/* eslint-disable no-console */
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

const DATA_DIR = path.resolve(__dirname, "..", "data", "municipios");

const run = async () => {
  if (!fs.existsSync(DATA_DIR)) {
    throw new Error(`Diretorio nao encontrado: ${DATA_DIR}`);
  }
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((file) => file.startsWith("municipios_") && file.endsWith(".json"));

  if (!files.length) {
    throw new Error("Nenhum arquivo de municipios encontrado.");
  }

  let total = 0;
  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const payload = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const municipios = payload.municipios || [];
    const fonte = payload.fonte || "Import JSON";
    for (const municipio of municipios) {
      await prisma.municipio.upsert({
        where: { ibgeId: String(municipio.ibgeId) },
        create: {
          ibgeId: String(municipio.ibgeId),
          nome: municipio.nome,
          uf: municipio.uf,
          fontes: { origemMunicipios: fonte },
        },
        update: {
          nome: municipio.nome,
          uf: municipio.uf,
          fontes: { origemMunicipios: fonte },
        },
      });
      total += 1;
    }
    console.log(`Importado ${municipios.length} municipios de ${file}`);
  }

  console.log(`Importacao concluida. Total de registros processados: ${total}`);
};

run()
  .catch((error) => {
    console.error("Erro ao importar municipios:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
