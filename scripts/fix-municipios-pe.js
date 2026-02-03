#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const fixEncoding = (value) => {
  if (!value || typeof value !== "string") return value;
  if (value.includes("Ã") || value.includes("Â") || value.includes("�")) {
    return Buffer.from(value, "latin1").toString("utf8");
  }
  return value;
};

const normalize = (value) => {
  if (!value || typeof value !== "string") return value;
  const fixed = fixEncoding(value);
  return fixed.normalize("NFC").replace(/\s+/g, " ").trim();
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withRetry = async (fn, attempts = 5, delayMs = 1500) => {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const message = String(error?.message || "");
      const retryable = message.includes("Can't reach database server") || message.includes("ECONN");
      if (!retryable || attempt === attempts) throw error;
      console.log(`Neon indisponível. Tentando novamente (${attempt}/${attempts})...`);
      await sleep(delayMs * attempt);
    }
  }
  throw lastError;
};

async function main() {
  const filePath = path.join(process.cwd(), "data", "municipios", "municipios_PE.json");
  if (!fs.existsSync(filePath)) {
    throw new Error("Arquivo municipios_PE.json não encontrado.");
  }

  const payload = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const origem = payload.fonte || "IBGE";
  const municipios = payload.municipios || [];
  const map = new Map(municipios.map((m) => [String(m.ibgeId), m]));

  const existing = await withRetry(() =>
    prisma.municipio.findMany({
      where: { uf: "PE" },
      select: { ibgeId: true, fontes: true },
    })
  );

  let updated = 0;
  let created = 0;

  for (const item of municipios) {
    const ibgeId = String(item.ibgeId);
    const nome = normalize(item.nome);
    const uf = item.uf || "PE";

    const current = existing.find((m) => m.ibgeId === ibgeId);
    const fontes = {
      ...(current?.fontes || {}),
      origemMunicipios: origem,
    };

    if (current) {
      await withRetry(() =>
        prisma.municipio.update({
          where: { ibgeId },
          data: { nome, uf, fontes },
        })
      );
      updated += 1;
    } else {
      await withRetry(() =>
        prisma.municipio.create({
          data: {
            ibgeId,
            nome,
            uf,
            fontes,
          },
        })
      );
      created += 1;
    }
  }

  const missing = existing.filter((m) => !map.has(m.ibgeId));
  console.log(`Atualizados: ${updated} | Criados: ${created}`);
  if (missing.length) {
    console.log(`Atenção: ${missing.length} municípios no banco não estão no arquivo PE.`);
  }
}

main()
  .catch((error) => {
    console.error("Falha ao corrigir municípios PE", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
