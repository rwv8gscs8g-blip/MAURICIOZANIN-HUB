/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const input = process.argv[2];
const output = process.argv[3];

if (!input || !output) {
  console.error("Uso: node scripts/rtf-to-json.js <entrada.rtf> <saida.json>");
  process.exit(1);
}

const raw = fs.readFileSync(input, "utf8");
// Remover markup RTF básico
const text = raw
  .replace(/\\'([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
  .replace(/\\par[d]?/g, "\n")
  .replace(/\\tab/g, "\t")
  .replace(/\\[a-zA-Z]+-?\d* ?/g, "")
  .replace(/[{}]/g, "")
  .replace(/\u(-?\d+)\?/g, (_, code) => String.fromCharCode(Number(code)))
  .replace(/\r\n/g, "\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

// Extrair primeiro bloco JSON
let start = text.indexOf("{");
let depth = 0;
let end = -1;
for (let i = start; i < text.length; i++) {
  const ch = text[i];
  if (ch === "{") depth++;
  if (ch === "}") depth--;
  if (depth === 0 && i > start) {
    end = i;
    break;
  }
}

if (start === -1 || end === -1) {
  console.error("Nenhum bloco JSON encontrado.");
  process.exit(1);
}

const jsonText = text.slice(start, end + 1).trim();

try {
  const obj = JSON.parse(jsonText);
  fs.writeFileSync(output, JSON.stringify(obj, null, 2));
  console.log(`JSON extraído para ${output}`);
} catch (error) {
  console.error("Falha ao parsear JSON:", error.message);
  fs.writeFileSync(output, jsonText);
  process.exit(1);
}
