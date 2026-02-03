/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const IBGE_API_BASE = "https://servicodados.ibge.gov.br/api/v1/localidades";
const RECEITA_CSV =
  "https://www.gov.br/receitafederal/dados/municipios.csv/@@download/file/municipios.csv";

const REGION_ORDER = [
  { name: "Paraiba", ufs: ["PB"] },
  { name: "Nordeste", ufs: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"] },
  { name: "Norte", ufs: ["AC", "AP", "AM", "PA", "RO", "RR", "TO"] },
  { name: "Centro-Oeste", ufs: ["DF", "GO", "MT", "MS"] },
  { name: "Sul", ufs: ["PR", "RS", "SC"] },
  { name: "Sudeste", ufs: ["ES", "MG", "RJ", "SP"] },
];

const DATA_DIR = path.resolve(__dirname, "..", "data", "municipios");
const TMP_DIR = path.resolve(__dirname, "..", ".tmp", "municipios");

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

const extractMunicipiosFromIbgeApi = async (uf) => {
  const res = await fetch(`${IBGE_API_BASE}/estados/${uf}/municipios`);
  if (!res.ok) throw new Error(`IBGE API ${res.status}`);
  const data = await res.json();
  return data.map((item) => ({
    ibgeId: String(item.id),
    nome: item.nome,
    uf,
    fonte: "IBGE API",
  }));
};

const extractMunicipiosFromReceitaCsv = async (uf, cache) => {
  if (!cache.receitaCsv) {
    const buffer = await fetchBuffer(RECEITA_CSV);
    cache.receitaCsv = buffer.toString("latin1");
  }
  const rows = parseCsv(cache.receitaCsv, ";");
  const filtered = rows.filter((row) => String(row.UF || row.uf || "").toUpperCase() === uf);
  if (!filtered.length) throw new Error(`Receita CSV sem municipios ${uf}`);
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
      uf,
      fonte: "Receita Federal CSV",
    }))
    .filter((row) => row.ibgeId && row.nome);
};

const extractMunicipiosFromIbgeMalha = async (uf) => {
  const zipUrl = `https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/malhas_municipais/municipio_2023/UFs/${uf}/${uf}_Municipios_2023.zip`;
  fs.mkdirSync(TMP_DIR, { recursive: true });
  const zipPath = path.join(TMP_DIR, `${uf}_Municipios_2023.zip`);
  fs.writeFileSync(zipPath, await fetchBuffer(zipUrl));

  try {
    execFileSync("python3", ["-c", "import dbfread"], { stdio: "ignore" });
  } catch {
    throw new Error("dbfread nao instalado para ler a malha IBGE.");
  }

  const script = `
import zipfile, json
from pathlib import Path
from dbfread import DBF

zip_path = Path("${zipPath}")
with zipfile.ZipFile(zip_path, "r") as zf:
    dbf_name = [n for n in zf.namelist() if n.lower().endswith(".dbf")]
    if not dbf_name:
        raise SystemExit("DBF nao encontrado no zip")
    dbf_path = Path("${TMP_DIR}") / "malha_${uf}.dbf"
    with zf.open(dbf_name[0]) as dbf_file, open(dbf_path, "wb") as out:
        out.write(dbf_file.read())

rows = []
for record in DBF(str(dbf_path), load=True, encoding="latin1"):
    rows.append({
        "ibgeId": str(record.get("CD_MUN") or record.get("CD_MUN_7") or record.get("CD_MUN_IBGE") or "").strip(),
        "nome": str(record.get("NM_MUN") or record.get("NM_MUNICIP") or "").strip(),
        "uf": "${uf}",
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
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const cache = {};
  for (const region of REGION_ORDER) {
    console.log(`\n=== ${region.name} ===`);
    for (const uf of region.ufs) {
      let municipios = [];
      let fonte = null;
      for (const source of SOURCE_CHAIN) {
        try {
          municipios = await source.fn(uf, cache);
          fonte = source.name;
          if (municipios.length) break;
        } catch (error) {
          console.warn(`Falha ${source.name} (${uf}): ${error.message}`);
        }
      }
      if (!municipios.length) {
        console.error(`Nenhuma fonte retornou municipios para ${uf}.`);
        continue;
      }
      const outputPath = path.join(DATA_DIR, `municipios_${uf}.json`);
      fs.writeFileSync(
        outputPath,
        JSON.stringify({ uf, fonte, total: municipios.length, municipios }, null, 2)
      );
      console.log(`Salvo ${outputPath} (${municipios.length})`);
    }
  }
};

run().catch((error) => {
  console.error("Erro geral:", error);
  process.exitCode = 1;
});
