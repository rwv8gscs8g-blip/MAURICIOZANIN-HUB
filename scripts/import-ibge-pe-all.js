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

const IBGE_BASE = "https://servicodados.ibge.gov.br/api/v1/localidades";
const UF = "PE";

const fetchJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`IBGE erro ${res.status} - ${url}`);
  return res.json();
};

const run = async () => {
  const municipios = await fetchJson(`${IBGE_BASE}/estados/${UF}/municipios`);
  if (!Array.isArray(municipios) || municipios.length === 0) {
    throw new Error("Lista de municipios vazia.");
  }

  for (const item of municipios) {
    const ibgeId = String(item.id);
    const nome = item.nome;
    await prisma.municipio.upsert({
      where: { ibgeId },
      create: {
        ibgeId,
        nome,
        uf: UF,
        fontes: {
          ibgeList: `${IBGE_BASE}/estados/${UF}/municipios`,
        },
      },
      update: {
        nome,
        uf: UF,
      },
    });
    console.log(`✔ Municipio: ${nome} (${ibgeId})`);
  }

  console.log(`Importacao concluida: ${municipios.length} municipios.`);
};

run()
  .catch((error) => {
    console.error("Erro ao importar municipios:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
