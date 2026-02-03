/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const INPUT_PATH = path.join(__dirname, "..", "data", "timeline-import", "ai-merged.json");
const OUTPUT_PATH = path.join(__dirname, "..", "src", "data", "timeline-ai.ts");

const raw = JSON.parse(fs.readFileSync(INPUT_PATH, "utf8"));

const typeMap = {
  "publicação": "PUBLICATION",
  "publicacao": "PUBLICATION",
  "relatório": "DOC",
  "relatorio": "DOC",
  "notícia": "NEWS",
  "noticia": "NEWS",
  "evento": "PROJECT",
  "projeto": "PROJECT",
  "formação": "DOC",
  "formacao": "DOC",
  "portaria": "DOC",
  "vídeo": "VIDEO",
  "video": "VIDEO",
};

const axisMap = (value = "") => {
  const v = value.toLowerCase();
  if (v.includes("coopera")) return "Cooperação Internacional";
  if (v.includes("inovajuntos")) return "Inovajuntos";
  if (v.includes("compras")) return "Compras Governamentais";
  if (v.includes("suporte")) return "Suporte a Municípios";
  if (v.includes("formação") || v.includes("formacao")) return "Suporte a Municípios";
  return "Outros";
};

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

const slugify = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase();

const events = (raw.eventos || [])
  .filter((event) => {
    const obs = String(event.observacoes || "").toLowerCase();
    const pessoa = String(event.pessoa_mencionada || "").toLowerCase();
    if (obs.includes("homônimo") || pessoa.includes("homonimo") || pessoa.includes("homônimo")) return false;
    return true;
  })
  .map((event) => {
    const fallbackText = `${event.titulo || ""} ${event.descricao || ""} ${event.observacoes || ""}`;
    const date = normalizeDate(event.data, fallbackText);
    const tipo = String(event.tipo || "").toLowerCase();
    const type = typeMap[tipo] || "PROJECT";
    const axis = axisMap(event.eixo || "");
    const id = `${slugify(event.titulo || "evento")}-${date}`;
    const descriptionParts = [event.descricao];
    if (event.fonte) descriptionParts.push(`Fonte: ${event.fonte}.`);
    if (event.trecho) descriptionParts.push(`Trecho: ${event.trecho}`);
    if (!event.data) descriptionParts.push("Data aproximada (não disponível na fonte).");
    return {
      id,
      date,
      title: event.titulo || "Evento",
      description: descriptionParts.filter(Boolean).join(" "),
      type,
      category: event.tipo || undefined,
      url: event.url || undefined,
      source: "historico",
      axis,
      tags: [event.eixo, event.tipo].filter(Boolean),
    };
  });

const output = `import type { TimelineEventItem } from "./inovajuntos-timeline";\n\nexport const aiTimelineEvents: TimelineEventItem[] = ${JSON.stringify(
  events,
  null,
  2
)};\n`;

fs.writeFileSync(OUTPUT_PATH, output, "utf8");
console.log(`Gerado ${OUTPUT_PATH} com ${events.length} eventos.`);
