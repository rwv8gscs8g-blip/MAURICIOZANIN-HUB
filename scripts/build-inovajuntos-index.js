/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const input = path.join(__dirname, "..", "data", "inovajuntos-products.json");
const output = path.join(__dirname, "..", "data", "inovajuntos-products-by-year.json");

const items = JSON.parse(fs.readFileSync(input, "utf8"));
const grouped = {};
for (const item of items) {
  const year = String(item.year || "Sem ano");
  grouped[year] = grouped[year] || [];
  grouped[year].push(item);
}

fs.writeFileSync(output, JSON.stringify(grouped, null, 2));
console.log(`Indice gerado em ${output}`);
