/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const inputPaths = [
  path.join(__dirname, "..", "data", "timeline-import", "ai-merged.json"),
  path.join(__dirname, "..", "data", "timeline-import", "kimi.json"),
  path.join(__dirname, "..", "data", "timeline-import", "perplexity.json"),
  path.join(__dirname, "..", "data", "timeline-import", "chatgpt.json"),
  path.join(__dirname, "..", "data", "timeline-import", "mauricio_zanin_timeline.json"),
];

const outputDir = path.join(__dirname, "..", "data", "timeline-import");
const validatedPath = path.join(outputDir, "validated.json");
const stagingPath = path.join(outputDir, "staging.json");
const referencesPath = path.join(outputDir, "references.json");

const officialDomains = new Set([
  "cnm.org.br",
  "www.cnm.org.br",
  "old.cnm.org.br",
  "sebrae.com.br",
  "ap.agenciasebrae.com.br",
  "www.tcees.tc.br",
  "www.fopeme.pr.gov.br",
  "www.serpro.gov.br",
  "www.gov.br",
  "www2.camara.leg.br",
  "www1.tce.pr.gov.br",
  "atricon.org.br",
]);

const normalizeDate = (data, fallbackText) => {
  if (!data) {
    const match = String(fallbackText || "").match(/(19|20)\d{2}/);
    if (match) return `${match[0]}-01-01`;
    return "1900-01-01";
  }
  const value = String(data).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (/^\d{4}-\d{2}$/.test(value)) return `${value}-01`;
  if (/^\d{4}$/.test(value)) return `${value}-01-01`;
  const interval = value.match(/(19|20)\d{2}/g);
  if (interval && interval.length) return `${interval[0]}-01-01`;
  return "1900-01-01";
};

const loadItems = () => {
  const items = [];
  for (const p of inputPaths) {
    if (!fs.existsSync(p)) continue;
    const raw = JSON.parse(fs.readFileSync(p, "utf8"));
    if (Array.isArray(raw)) {
      items.push(...raw);
    } else if (raw && Array.isArray(raw.eventos)) {
      items.push(...raw.eventos);
    }
  }
  return items;
};

const isOfficialUrl = (url) => {
  try {
    const domain = new URL(url).hostname;
    return officialDomains.has(domain) || domain.endsWith(".gov.br");
  } catch (error) {
    return false;
  }
};

const dedupeKey = (item) => {
  const title = String(item.titulo || "").trim().toLowerCase();
  const date = String(item.data || "").trim().toLowerCase();
  const url = String(item.url || "").trim().toLowerCase();
  return [title, date, url].join("|");
};

const main = () => {
  const items = loadItems();
  const seen = new Set();
  const validated = [];
  const staging = [];
  const references = [];

  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const obs = String(item.observacoes || "").toLowerCase();
    const pessoa = String(item.pessoa_mencionada || "").toLowerCase();
    if (obs.includes("homônimo") || pessoa.includes("homonimo") || pessoa.includes("homônimo")) {
      continue;
    }

    const key = dedupeKey(item);
    if (seen.has(key)) continue;
    seen.add(key);

    const fallbackText = `${item.titulo || ""} ${item.descricao || ""} ${item.observacoes || ""}`;
    const date = normalizeDate(item.data, fallbackText);
    const url = item.url || null;

    const normalized = {
      data: date,
      titulo: item.titulo || "Evento",
      descricao: item.descricao || null,
      tipo: item.tipo || null,
      eixo: item.eixo || null,
      fonte: item.fonte || null,
      url,
      observacoes: item.observacoes || null,
      pessoa_mencionada: item.pessoa_mencionada || null,
    };

    if (url && isOfficialUrl(url)) {
      validated.push(normalized);
      references.push({
        url,
        fonte: item.fonte || null,
        acesso_em: new Date().toISOString().slice(0, 10),
      });
    } else {
      staging.push(normalized);
    }
  }

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(validatedPath, JSON.stringify({ eventos: validated }, null, 2), "utf8");
  fs.writeFileSync(stagingPath, JSON.stringify({ eventos: staging }, null, 2), "utf8");
  fs.writeFileSync(referencesPath, JSON.stringify(references, null, 2), "utf8");
  console.log(`Validos: ${validated.length}. Pendentes: ${staging.length}.`);
  console.log(`Arquivos: ${validatedPath}, ${stagingPath}, ${referencesPath}`);
};

main();
