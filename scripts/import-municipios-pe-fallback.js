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

const IBGE_API_BASE = "https://servicodados.ibge.gov.br/api/v1/localidades";
const IBGE_MALHA_PE_ZIP =
  "https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/malhas_municipais/municipio_2023/UFs/PE/PE_Municipios_2023.zip";
const RECEITA_CSV =
  "https://www.gov.br/receitafederal/dados/municipios.csv/@@download/file/municipios.csv";

const fetchBuffer = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const parseCsv = (content, delimiter = ";") => {
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const header = lines[0].split(delimiter).map((item) => item.replace(/^"|"$/g, "").trim());
  return lines.slice(1).map((line) => {
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
    const row = {};
    header.forEach((key, idx) => {
      row[key] = (cols[idx] || "").trim();
    });
    return row;
  });
};

const extractMunicipiosFromIbgeApi = async () => {
  const res = await fetch(`${IBGE_API_BASE}/estados/PE/municipios`);
  if (!res.ok) throw new Error(`IBGE API ${res.status}`);
  const data = await res.json();
  return data.map((item) => ({
    ibgeId: String(item.id),
    nome: item.nome,
    uf: "PE",
    fonte: "IBGE API",
  }));
};

const extractMunicipiosFromReceitaCsv = async () => {
  const buffer = await fetchBuffer(RECEITA_CSV);
  const content = buffer.toString("latin1");
  const rows = parseCsv(content, ";");
  const filtered = rows.filter((row) => String(row.UF || row.uf || "").toUpperCase() === "PE");
  if (!filtered.length) throw new Error("Receita CSV sem municipios de PE");
  return filtered
    .map((row) => ({
      ibgeId: String(
        row["Código Município Completo"] ||
          row["Código Município"] ||
          row.CODIGO_MUNICIPIO ||
          row.codigo_municipio ||
          row.id ||
          ""
      ).trim(),
      nome: String(row["Nome Município"] || row.NOME_MUNICIPIO || row.nome || "").trim(),
      uf: "PE",
      fonte: "Receita Federal CSV",
    }))
    .filter((row) => row.ibgeId && row.nome);
};

const extractMunicipiosFromIbgeMalha = async () => {
  const tmpDir = path.resolve(__dirname, "..", ".tmp", "ibge-malha-pe");
  fs.mkdirSync(tmpDir, { recursive: true });
  const zipPath = path.join(tmpDir, "PE_Municipios_2023.zip");
  fs.writeFileSync(zipPath, await fetchBuffer(IBGE_MALHA_PE_ZIP));

  const { execFileSync } = require("child_process");
  try {
    execFileSync("python3", ["-c", "import dbfread"], { stdio: "ignore" });
  } catch {
    throw new Error("dbfread nao instalado para ler a malha IBGE.");
  }

  const script = `
import zipfile, json, sys
from pathlib import Path
from dbfread import DBF

zip_path = Path("${zipPath}")
with zipfile.ZipFile(zip_path, "r") as zf:
    dbf_name = [n for n in zf.namelist() if n.lower().endswith(".dbf")]
    if not dbf_name:
        raise SystemExit("DBF nao encontrado no zip")
    dbf_path = Path("${tmpDir}") / "malha.dbf"
    with zf.open(dbf_name[0]) as dbf_file, open(dbf_path, "wb") as out:
        out.write(dbf_file.read())

rows = []
for record in DBF(str(dbf_path), load=True, encoding="latin1"):
    rows.append({
        "ibgeId": str(record.get("CD_MUN") or record.get("CD_MUN_7") or record.get("CD_MUN_IBGE") or "").strip(),
        "nome": str(record.get("NM_MUN") or record.get("NM_MUNICIP") or "").strip(),
        "uf": "PE",
        "fonte": "IBGE Malha 2023"
    })

print(json.dumps([r for r in rows if r["ibgeId"] and r["nome"]]))
`;
  const output = execFileSync("python3", ["-c", script], { encoding: "utf8" });
  const parsed = JSON.parse(output);
  if (!parsed.length) throw new Error("Malha IBGE sem municipios");
  return parsed;
};

const SOURCE_CHAIN = [
  { name: "IBGE Malha 2023", fn: extractMunicipiosFromIbgeMalha },
  { name: "Receita Federal CSV", fn: extractMunicipiosFromReceitaCsv },
  { name: "IBGE API", fn: extractMunicipiosFromIbgeApi },
];

const run = async () => {
  let municipios = [];
  for (const source of SOURCE_CHAIN) {
    try {
      console.log(`Tentando fonte: ${source.name}`);
      municipios = await source.fn();
      if (municipios.length) {
        console.log(`Fonte escolhida: ${source.name} (${municipios.length} municipios)`);
        break;
      }
    } catch (error) {
      console.warn(`Falha em ${source.name}: ${error.message}`);
    }
  }

  if (!municipios.length) {
    throw new Error("Nenhuma fonte retornou municipios.");
  }

  for (const municipio of municipios) {
    await prisma.municipio.upsert({
      where: { ibgeId: municipio.ibgeId },
      create: {
        ibgeId: municipio.ibgeId,
        nome: municipio.nome,
        uf: municipio.uf,
        fontes: { origemMunicipios: municipio.fonte },
      },
      update: {
        nome: municipio.nome,
        uf: municipio.uf,
        fontes: { origemMunicipios: municipio.fonte },
      },
    });
  }

  console.log("Importacao de municipios concluida.");
};

run()
  .catch((error) => {
    console.error("Erro ao importar municipios:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
