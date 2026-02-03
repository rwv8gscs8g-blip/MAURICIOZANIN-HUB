/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { execFileSync } = require("child_process");

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

const CKAN_BASE = "https://dadosabertos.tse.jus.br/api/3/action/package_show?id=";
const TMP_DIR = path.resolve(__dirname, "..", ".tmp", "tse-prefeitos");

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });

const fetchJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${url}`);
  return res.json();
};

const downloadFile = async (url, dest) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(arrayBuffer));
};

const getResourceUrl = async (packageId, matcher) => {
  const data = await fetchJson(`${CKAN_BASE}${packageId}`);
  const resources = data?.result?.resources || [];
  const resource = resources.find(matcher);
  if (!resource?.url) {
    throw new Error(`Recurso nao encontrado em ${packageId}`);
  }
  return { url: resource.url, name: resource.name || resource.id, resource };
};

const parseCsvLine = (line, delimiter = ";") => {
  const cols = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === "\"") {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === delimiter && !inQuotes) {
      cols.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  cols.push(current);
  return cols.map((item) => item.trim());
};

const buildColumnIndex = (header) => {
  const idx = {};
  header.forEach((col, i) => {
    idx[col.toUpperCase()] = i;
  });
  return idx;
};

const resolveIndex = (idx, keys) => {
  for (const key of keys) {
    if (idx[key] !== undefined) return idx[key];
  }
  return -1;
};

const run = async () => {
  ensureDir(TMP_DIR);

  const candidatosResource = await getResourceUrl("candidatos-2024", (resource) => {
    const name = String(resource.name || "").toLowerCase();
    const format = String(resource.format || "").toLowerCase();
    return name.includes("candidatos") && format.includes("csv");
  });

  const fotosResource = await getResourceUrl("candidatos-2024", (resource) => {
    const name = String(resource.name || "").toLowerCase();
    const format = String(resource.format || "").toLowerCase();
    return name.includes("pe") && name.includes("fotos") && format.includes("zip");
  }).catch(() => null);

  const candidatosZipPath = path.join(TMP_DIR, "candidatos_2024.zip");
  console.log(`Baixando candidatos: ${candidatosResource.url}`);
  await downloadFile(candidatosResource.url, candidatosZipPath);

  const candidatosPath = path.join(TMP_DIR, "consulta_cand_2024_PE.csv");
  try {
    execFileSync("unzip", ["-o", "-p", candidatosZipPath, "consulta_cand_2024_PE.csv"], {
      stdio: ["ignore", fs.openSync(candidatosPath, "w"), "ignore"],
    });
  } catch (error) {
    throw new Error("Nao foi possivel extrair consulta_cand_2024_PE.csv do zip.");
  }

  let fotoMap = new Map();
  let fotoPublicDir = null;
  if (fotosResource?.url) {
    try {
      const zipPath = path.join(TMP_DIR, "fotos_pe.zip");
      console.log(`Baixando fotos: ${fotosResource.url}`);
      await downloadFile(fotosResource.url, zipPath);

      const extractDir = path.join(TMP_DIR, "fotos_pe");
      ensureDir(extractDir);
      execFileSync("unzip", ["-o", zipPath, "-d", extractDir], { stdio: "ignore" });

      fotoPublicDir = path.resolve(__dirname, "..", "public", "prefeitos", "pe-2024");
      ensureDir(fotoPublicDir);

      const files = fs.readdirSync(extractDir);
      files.forEach((file) => {
        const match = file.match(/(\\d{8,})/);
        if (!match) return;
        const sqcand = match[1];
        const srcPath = path.join(extractDir, file);
        const destFile = `${sqcand}${path.extname(file).toLowerCase() || ".jpg"}`;
        const destPath = path.join(fotoPublicDir, destFile);
        fs.copyFileSync(srcPath, destPath);
        fotoMap.set(sqcand, `/prefeitos/pe-2024/${destFile}`);
      });
    } catch (error) {
      console.warn(`Falha ao processar fotos PE: ${error.message}`);
      fotoMap = new Map();
      fotoPublicDir = null;
    }
  }

  const normalize = (value) =>
    String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\\u0300-\\u036f]/g, "")
      .replace(/[-_]+/g, " ")
      .replace(/\\s+/g, " ")
      .trim();

  const municipiosIbge = await (async () => {
    const res = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados/PE/municipios");
    if (!res.ok) throw new Error(`IBGE API ${res.status}`);
    return res.json();
  })();

  const municipioByName = new Map(
    municipiosIbge.map((m) => [normalize(m.nome), String(m.id)])
  );

  const stream = fs.createReadStream(candidatosPath, { encoding: "latin1" });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let header = null;
  let colIndex = null;
  const prefeitos = new Map();
  const unmatched = new Set();

  for await (const line of rl) {
    if (!line) continue;
    if (!header) {
      header = parseCsvLine(line, ";");
      colIndex = buildColumnIndex(header);
      continue;
    }
    const cols = parseCsvLine(line, ";");

    const ufIdx = resolveIndex(colIndex, ["SG_UF"]);
    const cargoIdx = resolveIndex(colIndex, ["DS_CARGO"]);
    const sitIdx = resolveIndex(colIndex, ["DS_SIT_TOT_TURNO"]);
    const sqIdx = resolveIndex(colIndex, ["SQ_CANDIDATO"]);
    const nomeIdx = resolveIndex(colIndex, ["NM_URNA_CANDIDATO", "NM_CANDIDATO"]);
    const partidoSiglaIdx = resolveIndex(colIndex, ["SG_PARTIDO"]);
    const partidoNomeIdx = resolveIndex(colIndex, ["NM_PARTIDO"]);
    const municipioIdx = resolveIndex(colIndex, ["NM_UE"]);

    const uf = ufIdx >= 0 ? cols[ufIdx] : "";
    if (uf !== "PE") continue;

    const cargo = cargoIdx >= 0 ? cols[cargoIdx].toUpperCase() : "";
    if (!cargo.includes("PREFEIT")) continue;

    const situacao = sitIdx >= 0 ? cols[sitIdx].toUpperCase() : "";
    if (!situacao.includes("ELEITO")) continue;

    const municipioNome = municipioIdx >= 0 ? cols[municipioIdx] : "";
    const municipioIbgeId = municipioByName.get(normalize(municipioNome));
    if (!municipioIbgeId) {
      if (municipioNome) unmatched.add(municipioNome);
      continue;
    }

    const sqcand = sqIdx >= 0 ? cols[sqIdx] : null;
    const nome = nomeIdx >= 0 ? cols[nomeIdx] : "";
    const partidoSigla = partidoSiglaIdx >= 0 ? cols[partidoSiglaIdx] : "";
    const partidoNome = partidoNomeIdx >= 0 ? cols[partidoNomeIdx] : "";

    if (!prefeitos.has(municipioIbgeId)) {
      prefeitos.set(municipioIbgeId, {
        municipioIbgeId,
        prefeitoNome: nome,
        partidoSigla,
        partidoNome,
        sqcand,
      });
    }
  }

  const inicioMandato = new Date("2025-01-01T00:00:00.000Z");
  const fimMandato = new Date("2028-12-31T23:59:59.000Z");
  const accessedAt = new Date().toISOString().slice(0, 10);

  await prisma.prefeitoMandato.deleteMany({
    where: { municipio: { uf: "PE" }, eleicaoAno: 2024 },
  });

  for (const prefeito of prefeitos.values()) {
    await prisma.prefeitoMandato.create({
      data: {
        municipioIbgeId: prefeito.municipioIbgeId,
        prefeitoNome: prefeito.prefeitoNome,
        partidoSigla: prefeito.partidoSigla || null,
        partidoNome: prefeito.partidoNome || null,
        eleicaoAno: 2024,
        inicioMandato,
        fimMandato,
        fotoUrl: prefeito.sqcand ? fotoMap.get(prefeito.sqcand) || null : null,
        fonte: {
          candidatos: {
            url: candidatosResource.url,
            accessedAt,
          },
          fotos: fotosResource?.url
            ? { url: fotosResource.url, accessedAt }
            : null,
        },
      },
    });
  }

  console.log(`Importacao concluida: ${prefeitos.size} prefeitos PE.`);
  if (!fotoPublicDir) {
    console.warn("Fotos nao foram importadas. URLs permanecem null.");
  }
  if (unmatched.size) {
    const unmatchedPath = path.resolve(__dirname, "..", "data", "municipios", "tse_pe_unmatched.json");
    fs.writeFileSync(unmatchedPath, JSON.stringify([...unmatched].sort(), null, 2));
    console.warn(`Municipios nao mapeados: ${unmatched.size}. Lista em ${unmatchedPath}`);
  }
};

run()
  .catch((error) => {
    console.error("Erro ao importar prefeitos:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
