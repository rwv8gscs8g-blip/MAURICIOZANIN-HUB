/* eslint-disable no-console */
const fs = require("fs");

const input = process.argv[2];
const output = process.argv[3];
if (!input || !output) {
  console.error("Uso: node scripts/fix-json-text.js <entrada.txt> <saida.json>");
  process.exit(1);
}

let text = fs.readFileSync(input, "utf8");
text = text.replace(/\u2028/g, "\n");

let result = "";
let inString = false;
let escaped = false;
for (let i = 0; i < text.length; i++) {
  const ch = text[i];
  if (escaped) {
    result += ch;
    escaped = false;
    continue;
  }
  if (ch === "\\") {
    result += ch;
    escaped = true;
    continue;
  }
  if (ch === '"') {
    inString = !inString;
    result += ch;
    continue;
  }
  if (inString && (ch === "\n" || ch === "\r")) {
    continue;
  }
  result += ch;
}

// trim leading junk before first '{'
const start = result.indexOf('{');
const end = result.lastIndexOf('}');
if (start === -1 || end === -1 || end <= start) {
  console.error("JSON não identificado");
  process.exit(1);
}
let jsonText = result.slice(start, end + 1).trim();
jsonText = jsonText.replace(/,\s*([}\]])/g, "$1");

try {
  const obj = JSON.parse(jsonText);
  fs.writeFileSync(output, JSON.stringify(obj, null, 2));
  console.log(`JSON corrigido em ${output}`);
} catch (error) {
  console.error("Falha ao parsear JSON:", error.message);
  fs.writeFileSync(output, jsonText);
  process.exit(1);
}
