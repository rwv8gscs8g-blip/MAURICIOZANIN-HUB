/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const inputs = process.argv.slice(2);
if (inputs.length === 0) {
  console.error("Uso: node scripts/merge-timeline-json.js <a.json> <b.json> ...");
  process.exit(1);
}

const events = [];
for (const file of inputs) {
  if (!fs.existsSync(file)) continue;
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  if (Array.isArray(data.eventos)) events.push(...data.eventos);
}

const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const keyOf = (event) => {
  const date = event.data || "";
  const title = normalize(event.titulo || "");
  const url = normalize(event.url || "");
  return url ? `${date}|${url}` : `${date}|${title}`;
};

const seen = new Set();
const merged = [];

for (const ev of events) {
  const key = keyOf(ev);
  if (seen.has(key)) continue;
  seen.add(key);
  merged.push(ev);
}

const output = path.join(__dirname, "..", "data", "timeline-import", "ai-merged.json");
fs.writeFileSync(output, JSON.stringify({ meta: { sources: inputs }, eventos: merged }, null, 2));
console.log(`Merged ${merged.length} eventos -> ${output}`);
