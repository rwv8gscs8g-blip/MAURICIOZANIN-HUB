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

const normalize = (value) =>
  (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const stripTitle = (value) =>
  normalize(value)
    .replace(/\(pernambuco\)/g, "")
    .replace(/\(pe\)/g, "")
    .replace(/\s+/g, " ")
    .trim();

const run = async () => {
  const jsonPath = path.resolve(
    __dirname,
    "..",
    "data",
    "uploads",
    "palette-and-sources.json"
  );

  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Arquivo nao encontrado: ${jsonPath}`);
  }

  const payload = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const municipios = payload.ibge_municipios_pe || [];
  const wikiRefs = payload.wikipedia_references || [];
  const prefeitos = payload.prefeitos_pe || [];

  const wikiByName = new Map();
  wikiRefs.forEach((ref) => {
    const title = stripTitle(ref.title || "");
    if (!title || title === "pernambuco") return;
    wikiByName.set(title, ref);
  });

  const prefeitoByName = new Map();
  prefeitos.forEach((item) => {
    const name = normalize(item.municipio || "");
    if (!name) return;
    prefeitoByName.set(name, item);
  });

  for (const municipio of municipios) {
    const ibgeId = String(municipio.ibge_id || "");
    if (!ibgeId) continue;

    const nome = municipio.name || "";
    const uf = "PE";
    const populacao = municipio.population ?? null;
    const areaKm2 = municipio.area_km2 ?? null;
    const densidade =
      municipio.density ??
      (populacao && areaKm2
        ? Number((populacao / areaKm2).toFixed(2))
        : null);

    const wikiRef = wikiByName.get(stripTitle(nome));
    const prefeitoRef = prefeitoByName.get(normalize(nome));

    const fontes = {
      ibge: {
        url: municipio.source_url || null,
        accessedAt: municipio.accessed_at || null,
      },
      wikipedia: wikiRef
        ? { url: wikiRef.url || null, accessedAt: wikiRef.accessed_at || null }
        : null,
      prefeitura: prefeitoRef || null,
    };

    await prisma.municipio.upsert({
      where: { ibgeId },
      create: {
        ibgeId,
        nome,
        uf,
        populacao,
        areaKm2,
        densidade,
        idhm: municipio.idhm ?? null,
        pibPerCapita: municipio.pib_per_capita ?? null,
        fontes,
      },
      update: {
        nome,
        uf,
        populacao,
        areaKm2,
        densidade,
        idhm: municipio.idhm ?? null,
        pibPerCapita: municipio.pib_per_capita ?? null,
        fontes,
      },
    });

    console.log(`✔ Municipio atualizado: ${nome} (${ibgeId})`);
  }

  console.log("Importacao concluida.");
};

run()
  .catch((error) => {
    console.error("Erro ao importar municipios:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
