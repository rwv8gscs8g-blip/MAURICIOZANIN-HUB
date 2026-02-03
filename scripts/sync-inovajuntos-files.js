/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const SOURCE_DIR = "/Users/macbookpro/Downloads/Produtos Inovajuntos";
const DEST_ROOT = path.join(__dirname, "..", "public", "resources");
const OUTPUT_JSON = path.join(__dirname, "..", "data", "inovajuntos-products.json");

const slugify = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase();

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

function main() {
  const files = listPdfs(SOURCE_DIR);
  if (!files.length) {
    console.log("Nenhum PDF encontrado.");
    return;
  }

  const products = [];
  const usedNames = new Set();

  for (const file of files) {
    const stats = fs.statSync(file);
    const year = new Date(stats.mtime).getFullYear();
    const filename = path.basename(file);
    const baseName = filename.replace(/\.pdf$/i, "");
    let safeName = slugify(baseName);
    if (usedNames.has(safeName)) {
      safeName = `${safeName}-${Math.random().toString(36).slice(2, 6)}`;
    }
    usedNames.add(safeName);
    const safeFilename = `${safeName}.pdf`;

    const yearDir = path.join(DEST_ROOT, String(year), "inovajuntos");
    fs.mkdirSync(yearDir, { recursive: true });
    const dest = path.join(yearDir, safeFilename);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(file, dest);
    }

    const publicPath = `/resources/${year}/inovajuntos/${safeFilename}`;
    const title = baseName;
    const slug = safeName.slice(0, 80);

    products.push({
      title,
      year,
      sourcePath: file,
      publicPath,
      slug,
      client: "Inovajuntos",
    });
  }

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(products, null, 2));
  console.log(`Arquivos sincronizados: ${products.length} PDFs. JSON salvo em ${OUTPUT_JSON}`);
}

main();
