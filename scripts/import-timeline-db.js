/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const envPath = path.join(__dirname, "..", ".env.local");
if (!process.env.DATABASE_URL && fs.existsSync(envPath)) {
  const envText = fs.readFileSync(envPath, "utf8");
  const match = envText.match(/^DATABASE_URL="([^"]+)"$/m);
  if (match) {
    process.env.DATABASE_URL = match[1];
  }
}

const prisma = new PrismaClient();
const input =
  process.argv[2] ||
  path.join(__dirname, "..", "data", "timeline-import", "ai-merged.json");

const typeMap = {
  "publicação": "PUBLICATION",
  "publicacao": "PUBLICATION",
  "relatório": "DOCUMENT",
  "relatorio": "DOCUMENT",
  "notícia": "NEWS",
  "noticia": "NEWS",
  "evento": "EVENT",
  "projeto": "EVENT",
  "formação": "DOCUMENT",
  "formacao": "DOCUMENT",
  "portaria": "DOCUMENT",
  "vídeo": "MEDIA",
  "video": "MEDIA",
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

const hubMap = (value = "") => {
  const v = value.toLowerCase();
  if (v.includes("coopera") || v.includes("inovajuntos")) return "COOPERACAO_INTERNACIONAL";
  if (v.includes("compras")) return "COMPRAS_GOVERNAMENTAIS";
  if (v.includes("suporte") || v.includes("formação") || v.includes("formacao"))
    return "SUPORTE_MUNICIPIOS";
  if (v.includes("software") || v.includes("sistema") || v.includes("plataforma"))
    return "DESENVOLVIMENTO_SOFTWARE";
  return null;
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

async function main() {
  const raw = JSON.parse(fs.readFileSync(input, "utf8"));
  const events = raw.eventos || [];
  const channel = await prisma.contentChannel.findFirst({ where: { key: "timeline" } });
  if (!channel) {
    console.error("Canal timeline nao encontrado. Execute a migracao de canais.");
    process.exit(1);
  }

  for (const event of events) {
    const obs = String(event.observacoes || "").toLowerCase();
    const pessoa = String(event.pessoa_mencionada || "").toLowerCase();
    if (obs.includes("homônimo") || pessoa.includes("homonimo") || pessoa.includes("homônimo")) {
      continue;
    }

    const fallbackText = `${event.titulo || ""} ${event.descricao || ""} ${event.observacoes || ""}`;
    const date = normalizeDate(event.data, fallbackText);
    const tipo = String(event.tipo || "").toLowerCase();
    const type = typeMap[tipo] || "PROJECT";
    const axis = axisMap(event.eixo || "");
    const hub = hubMap(event.eixo || "");

    await prisma.contentItem.create({
      data: {
        type,
        title: event.titulo || "Evento",
        summary: event.descricao || null,
        eventDate: new Date(date),
        axis,
        hub,
        sourceName: event.fonte || null,
        sourceUrl: event.url || null,
        status: "PENDING",
        isPublic: false,
        channels: {
          create: {
            channelId: channel.id,
            isVisible: true,
            metadata: { tags: [event.eixo, event.tipo].filter(Boolean) },
          },
        },
      },
    });
  }

  console.log(`Importados ${events.length} itens para ContentItem (timeline interna pendente).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
