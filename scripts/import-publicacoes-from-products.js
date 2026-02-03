/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const productsPath = path.join(__dirname, "..", "data", "inovajuntos-products.json");
const outputPath = path.join(__dirname, "..", "src", "data", "publicacoes.json");

const publications = [
  {
    id: "fgv-tese-2014",
    date: "2014-01-01",
    title: "Tese de MBA (FGV) – Compras Governamentais e MPE",
    description:
      "Dissertação de MBA em Políticas Públicas (FGV) sobre o impacto das contratações públicas e a participação das MPE no Comprasnet (2006–2014).",
    category: "Artigo Técnico",
    year: 2014,
    link: "/publicacoes/zanin-fgv",
    file: "/resources/2014/zanin-fgv-final.pdf",
    type: "publication",
  },
];

if (fs.existsSync(productsPath)) {
  const products = JSON.parse(fs.readFileSync(productsPath, "utf8"));
  for (const item of products) {
    const year = item.year || 2020;
    publications.push({
      id: `inovajuntos-${item.slug}`,
      date: `${year}-01-01`,
      title: item.title,
      description: `Documento do Inovajuntos (${item.year || "sem ano"}).`,
      category: "Projeto Internacional",
      year,
      link: `/produtos/${item.slug}`,
      file: item.publicPath,
      type: "publication",
    });
  }
}

fs.writeFileSync(outputPath, JSON.stringify(publications, null, 2));
console.log(`Publicações atualizadas em ${outputPath} (${publications.length} itens).`);
