/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..", "public", "resources");

function listPdfs(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listPdfs(full));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")) {
      results.push(full);
    }
  }
  return results;
}

function generateCover(pdfPath) {
  const coverPath = pdfPath.replace(/\.pdf$/i, "-cover.jpg");
  if (fs.existsSync(coverPath)) return false;
  const command = [
    "sips",
    "-s format jpeg",
    "-s formatOptions 70",
    "-Z 1400",
    `"${pdfPath}"`,
    "--out",
    `"${coverPath}"`,
  ].join(" ");
  execSync(command, { stdio: "ignore" });
  return true;
}

function main() {
  if (!fs.existsSync(ROOT)) {
    console.log(`Diretório não encontrado: ${ROOT}`);
    return;
  }
  const pdfs = listPdfs(ROOT);
  let created = 0;
  pdfs.forEach((pdf) => {
    try {
      if (generateCover(pdf)) created += 1;
    } catch (error) {
      console.error(`Falha ao gerar capa: ${pdf}`, error.message);
    }
  });
  console.log(`Capas geradas: ${created} de ${pdfs.length}`);
}

main();
