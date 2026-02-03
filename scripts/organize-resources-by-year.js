/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const input = process.argv[2];
if (!input) {
  console.error("Uso: node scripts/organize-resources-by-year.js <arquivo.json>");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(input, "utf8"));
const root = path.join(__dirname, "..", "public", "resources");

for (const item of data) {
  if (!item.year || !item.localPath) continue;
  const yearDir = path.join(root, String(item.year));
  fs.mkdirSync(yearDir, { recursive: true });
  const abs = path.isAbsolute(item.localPath)
    ? item.localPath
    : path.join(__dirname, "..", item.localPath);
  if (!fs.existsSync(abs)) {
    console.warn(`Arquivo não encontrado: ${abs}`);
    continue;
  }
  const filename = path.basename(abs);
  const dest = path.join(yearDir, filename);
  if (abs !== dest) {
    fs.copyFileSync(abs, dest);
    console.log(`Copiado: ${filename} -> ${dest}`);
  }
}

console.log("Organização finalizada.");
