/* eslint-disable no-console */
const fs = require("fs");

const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile || !outputFile) {
  console.error("Uso: node scripts/extract-json-from-text.js <entrada.txt> <saida.json>");
  process.exit(1);
}

const text = fs.readFileSync(inputFile, "utf8");

const start = text.indexOf("{");
const end = text.lastIndexOf("}");
if (start === -1 || end === -1 || end <= start) {
  console.error("Nenhum bloco JSON encontrado.");
  process.exit(1);
}

let jsonText = text.slice(start, end + 1).trim();
jsonText = jsonText.replace(/^\ufeff/, "");
jsonText = jsonText.replace(/,\s*([}\]])/g, "$1");

try {
  const obj = JSON.parse(jsonText);
  fs.writeFileSync(outputFile, JSON.stringify(obj, null, 2));
  console.log(`JSON extraído para ${outputFile}`);
} catch (error) {
  console.error("Falha ao parsear JSON.", error.message);
  fs.writeFileSync(outputFile, jsonText);
  process.exit(1);
}
