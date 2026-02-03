/* eslint-disable no-console */
// Faxina de diagnóstico: manter apenas o primeiro diagnóstico (mais antigo)
// para cada um dos 7 municípios do piloto (PE) e excluir os demais.
//
// Municípios (PE) considerados:
// - 2600054 – Abreu e Lima
// - 2600708 – Aliança
// - 2605202 – Escada
// - 2607653 – Itambé
// - 2609006 – Macaparana
// - 2609402 – Moreno
// - 2609600 – Olinda

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

const MUNICIPIOS_PE7 = [
  "2600054", // Abreu e Lima
  "2600708", // Aliança
  "2605202", // Escada
  "2607653", // Itambé
  "2609006", // Macaparana
  "2609402", // Moreno
  "2609600", // Olinda
];

async function main() {
  console.log("Iniciando limpeza de diagnósticos para os 7 municípios PE...");

  let totalRemoved = 0;

  for (const ibgeId of MUNICIPIOS_PE7) {
    const diagnosticos = await prisma.diagnostico.findMany({
      where: { municipioIbgeId: ibgeId },
      orderBy: { createdAt: "asc" },
      select: { id: true, createdAt: true, status: true },
    });

    if (diagnosticos.length <= 1) {
      console.log(`- ${ibgeId}: ${diagnosticos.length} diagnóstico(s) encontrado(s). Nenhuma exclusão necessária.`);
      continue;
    }

    const [toKeep, ...toRemove] = diagnosticos;
    const idsToRemove = toRemove.map((d) => d.id);

    await prisma.diagnostico.deleteMany({
      where: { id: { in: idsToRemove } },
    });

    totalRemoved += idsToRemove.length;
    console.log(
      `- ${ibgeId}: mantendo diagnóstico ${toKeep.id} (criado em ${toKeep.createdAt.toISOString()}), ` +
        `removidos ${idsToRemove.length} diagnósticos extras.`
    );
  }

  console.log(`\nLimpeza concluída. Diagnósticos removidos: ${totalRemoved}.`);
}

main()
  .catch((error) => {
    console.error("Erro na limpeza de diagnósticos PE7:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

