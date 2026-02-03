/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const UPLOADS_DIR = path.join(process.cwd(), "data", "uploads");
const CONVERTED_DIR = path.join(UPLOADS_DIR, "converted");

const EIXOS = [
  { key: "governanca", title: "Governança e Planejamento das Contratações" },
  { key: "capacitacao", title: "Capacitação e Gestão de Pessoas" },
  { key: "riscos", title: "Gestão de Riscos e Controle Interno" },
  { key: "digitalizacao", title: "Digitalização e Sistemas" },
  { key: "sustentabilidade", title: "Sustentabilidade e Inclusão Econômica" },
  { key: "mpe", title: "Integração com MPE e Desenvolvimento Local" },
  { key: "lei14133", title: "Aderência à Lei 14.133/2021" },
];

const UF = "PE";
const IBGE_URL = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${UF}/municipios`;

const normalizeText = (value) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const cleanText = (value) =>
  value
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();

const splitList = (value) => {
  const cleaned = cleanText(value);
  if (!cleaned) return [];
  const bySemicolon = cleaned.split(/;|•|\n/).map((item) => item.trim()).filter(Boolean);
  if (bySemicolon.length > 1) return bySemicolon;
  const byComma = cleaned.split(",").map((item) => item.trim()).filter(Boolean);
  return byComma.length > 1 ? byComma : [cleaned];
};

const hasMeaningfulContent = (value) => {
  const cleaned = cleanText(value || "");
  if (!cleaned) return false;
  const normalized = normalizeText(cleaned);
  if (normalized.includes("nao houve tempo")) return false;
  return true;
};

const computeNota = ({ parte1, parte2, parte3 }) => {
  const hasParte1 = Array.isArray(parte1) && parte1.filter(Boolean).length > 0;
  const hasParte2 = hasMeaningfulContent(parte2);
  const hasParte3 = hasMeaningfulContent(parte3);

  if (!hasParte1 && !hasParte2 && !hasParte3) return 0;
  if (hasParte1 && hasParte2 && hasParte3) return 8;
  if (hasParte1 && hasParte2) return 7;
  if (hasParte1 || hasParte2 || hasParte3) return 6;
  return 0;
};

const extractBetween = (text, start, endMarkers) => {
  const startIdx = text.indexOf(start);
  if (startIdx === -1) return "";
  const afterStart = text.slice(startIdx + start.length);
  let endIdx = afterStart.length;
  for (const marker of endMarkers) {
    const idx = afterStart.indexOf(marker);
    if (idx !== -1 && idx < endIdx) endIdx = idx;
  }
  return afterStart.slice(0, endIdx);
};

const extractPart = (block, label) => {
  const regex = new RegExp(`${label}\\s*:?(?:\\s*\\(an[aá]lise\\))?`, "i");
  const match = regex.exec(block);
  if (!match) return "";
  const after = block.slice(match.index + match[0].length);
  const nextPartIdxs = ["Parte 1", "Parte 2", "Parte 3"]
    .filter((p) => p.toLowerCase() !== label.toLowerCase())
    .map((p) => {
      const idx = after.search(new RegExp(`${p}\\s*:`, "i"));
      return idx === -1 ? null : idx;
    })
    .filter((idx) => idx !== null);
  const endIdx = nextPartIdxs.length ? Math.min(...nextPartIdxs) : after.length;
  return cleanText(after.slice(0, endIdx));
};

const extractBlock = (text, blockTitle, nextTitles) =>
  extractBetween(text, blockTitle, nextTitles);

const parseEixo = (sectionText, eixoTitle, nextTitles) => {
  const eixoText = extractBetween(sectionText, eixoTitle, nextTitles);
  if (!eixoText) return null;

  const positivosText = extractBlock(eixoText, "Aspectos Positivos", [
    "Aspectos Negativos",
    "Alternativas de Solução",
    ...nextTitles,
  ]);
  const negativosText = extractBlock(eixoText, "Aspectos Negativos", [
    "Alternativas de Solução",
    ...nextTitles,
  ]);
  const solucaoText = extractBlock(eixoText, "Alternativas de Solução", [
    ...nextTitles,
  ]);

  const positivoParte1 = splitList(extractPart(positivosText, "Parte 1"));
  const positivoParte2 = extractPart(positivosText, "Parte 2");
  const positivoParte3 = extractPart(positivosText, "Parte 3");

  const negativoParte1 = splitList(extractPart(negativosText, "Parte 1"));
  const negativoParte2 = extractPart(negativosText, "Parte 2");
  const negativoParte3 = extractPart(negativosText, "Parte 3");

  const solucaoParte1 = splitList(extractPart(solucaoText, "Parte 1"));
  const solucaoParte2 = extractPart(solucaoText, "Parte 2");
  const solucaoParte3 = extractPart(solucaoText, "Parte 3");

  const positivoNota = computeNota({
    parte1: positivoParte1,
    parte2: positivoParte2,
    parte3: positivoParte3,
  });
  const negativoNota = computeNota({
    parte1: negativoParte1,
    parte2: negativoParte2,
    parte3: negativoParte3,
  });
  const solucaoNota = computeNota({
    parte1: solucaoParte1,
    parte2: solucaoParte2,
    parte3: solucaoParte3,
  });

  return {
    resposta: {
      positivoParte1,
      positivoParte2: positivoParte2 || null,
      positivoNota,
      positivoNotaConsultor: hasMeaningfulContent(positivoParte3) ? positivoNota : null,
      negativoParte1,
      negativoParte2: negativoParte2 || null,
      negativoNota,
      negativoNotaConsultor: hasMeaningfulContent(negativoParte3) ? negativoNota : null,
      solucaoParte1,
      solucaoParte2: solucaoParte2 || null,
      solucaoNota,
      solucaoNotaConsultor: hasMeaningfulContent(solucaoParte3) ? solucaoNota : null,
      solucaoSebraeDescs: Array.from({ length: 10 }).map(() => ""),
      solucaoDescricao: "",
    },
    analise: {
      positivoParte3: positivoParte3 || null,
      negativoParte3: negativoParte3 || null,
      solucaoParte3: solucaoParte3 || null,
    },
  };
};

const parsePerguntasChave = (sectionText) => {
  const perguntasText = extractBetween(sectionText, "PERGUNTAS CHAVES", [
    "Contexto do Município",
    "Assinatura",
    "Atenção",
  ]);
  if (!perguntasText) return null;

  const consultorAnalise = extractPart(perguntasText, "Parte 3");
  const content = perguntasText
    .replace(/Parte 3[^\n]*\n?/gi, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const answers = {
    pcaPacPncp: null,
    integracaoPlanejamento: null,
    sebraeSolucoes: [],
    sistemasUtilizados: [],
    tramitacaoEletronicaNota: 0,
    tramitacaoEletronicaComentario: null,
    salaEmpreendedor: null,
    estrategiasFornecedores: null,
    beneficiosLc123: null,
    integracaoSustentabilidade: null,
    consultorAnalise: consultorAnalise || null,
  };

  for (const line of content) {
    const lower = normalizeText(line);
    if (lower.includes("pca") || lower.includes("pncp")) {
      answers.pcaPacPncp = line;
    } else if (lower.includes("integracao entre o setor de planejamento")) {
      answers.integracaoPlanejamento = line;
    } else if (lower.includes("quais sistemas")) {
      answers.sistemasUtilizados.push(line);
    } else if (lower.includes("sala do empreendedor")) {
      answers.salaEmpreendedor = line;
    } else if (lower.includes("fornecedores")) {
      answers.estrategiasFornecedores = line;
    } else if (lower.includes("beneficios da lei complementar")) {
      answers.beneficiosLc123 = line;
    } else if (lower.includes("integracao das politicas")) {
      answers.integracaoSustentabilidade = line;
    } else if (lower.includes("sebrae")) {
      answers.sebraeSolucoes.push(line);
    }
  }

  return answers;
};

const parseRespondents = (sectionLines) => {
  const startIdx = sectionLines.findIndex((line) => normalizeText(line) === "nome");
  if (startIdx === -1) return [];
  let endIdx = sectionLines.findIndex((line, idx) =>
    idx > startIdx && normalizeText(line).includes("formulario")
  );
  if (endIdx === -1) endIdx = sectionLines.length;
  const candidateLines = sectionLines
    .slice(startIdx, endIdx)
    .map((line) => line.trim())
    .filter(Boolean);

  const respondents = [];
  let current = { name: "", email: "", phone: "" };
  for (const line of candidateLines) {
    if (normalizeText(line) === "nome" || normalizeText(line) === "email" || normalizeText(line) === "telefone") {
      continue;
    }
    if (line.includes("@")) {
      current.email = line;
      continue;
    }
    if (/\d{8,}/.test(line.replace(/\D/g, ""))) {
      current.phone = line;
      continue;
    }
    if (!current.name) {
      current.name = line;
      continue;
    }
    respondents.push(current);
    current = { name: line, email: "", phone: "" };
  }
  if (current.name || current.email || current.phone) respondents.push(current);
  return respondents.filter((r) => r.name);
};

const cleanFilenameMunicipio = (fallbackName) => {
  if (!fallbackName) return "";
  return cleanText(
    fallbackName
      .replace(/diagnostico|diagnóstico|compras|governamentais|pernambuco|prefeitura|assinado/gi, "")
      .replace(/\bpe\b/gi, "")
      .replace(/[()]/g, " ")
      .replace(/[/_-]+/g, " ")
  );
};

const detectMunicipioName = (text, fallbackName) => {
  const patterns = [
    /Nome do Município:\s*([^\n]+)/i,
    /MUNICIPIO DE\s+([^\n]+)/i,
    /Munic[ií]pio de\s+([^\n]+)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) return cleanText(match[1]);
  }
  if (fallbackName) return cleanFilenameMunicipio(fallbackName);
  return "";
};

async function getIbgeMap() {
  const response = await fetch(IBGE_URL);
  if (!response.ok) {
    throw new Error(`Falha ao consultar IBGE: ${response.status}`);
  }
  const data = await response.json();
  const map = new Map();
  for (const item of data) {
    map.set(normalizeText(item.nome), String(item.id));
  }
  return map;
}

function convertToTxt(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".txt") return filePath;
  if (!fs.existsSync(CONVERTED_DIR)) fs.mkdirSync(CONVERTED_DIR, { recursive: true });
  const base = path.basename(filePath, ext).replace(/[^a-z0-9]+/gi, "_");
  const output = path.join(CONVERTED_DIR, `${base}.txt`);
  if (ext === ".pdf") {
    const pythonCode = [
      "from pdfminer.high_level import extract_text",
      "import sys",
      "text = extract_text(sys.argv[1]) or ''",
      "with open(sys.argv[2], 'w', encoding='utf-8') as f:",
      "    f.write(text)",
    ].join("\n");
    execFileSync("python3", ["-c", pythonCode, filePath, output]);
    return output;
  }
  execFileSync("textutil", ["-convert", "txt", "-output", output, filePath]);
  return output;
}

async function main() {
  const ibgeMap = await getIbgeMap();
  const entries = fs.readdirSync(UPLOADS_DIR);
  const candidates = entries.filter((name) => {
    if (name.startsWith(".")) return false;
    const normalizedName = normalizeText(name);
    if (normalizedName.includes("compilado")) return false;
    const ext = path.extname(name).toLowerCase();
    return [".pdf", ".docx", ".rtf"].includes(ext);
  });

  let created = 0;
  let skipped = 0;

  for (const file of candidates) {
    const fullPath = path.join(UPLOADS_DIR, file);
    let txtPath;
    try {
      txtPath = convertToTxt(fullPath);
    } catch (error) {
      console.warn(`Falha ao converter ${file}: ${error.message}`);
      skipped += 1;
      continue;
    }

    const text = fs.readFileSync(txtPath, "utf-8").replace(/\r/g, "");
    let municipioNome = detectMunicipioName(text, path.basename(file, path.extname(file)));
    municipioNome = cleanText(
      municipioNome
        .replace(/\b[-/ ]?pe\b/gi, " ")
        .replace(/\s+/g, " ")
        .trim()
    );
    const municipioKey = normalizeText(municipioNome)
      .replace(/[^a-z\s]/g, "")
      .replace(/\bpe\b/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!municipioKey) {
      console.warn(`Município não identificado em ${file}`);
      skipped += 1;
      continue;
    }

    const ibgeId = ibgeMap.get(municipioKey);
    if (!ibgeId) {
      console.warn(`IBGE não encontrado para ${municipioNome}`);
      skipped += 1;
      continue;
    }

    const sectionLines = text.split("\n");
    const respondents = parseRespondents(sectionLines);
    const respondentName = respondents.map((r) => r.name).join(" | ") || municipioNome;
    const respondentEmail = respondents.map((r) => r.email).filter(Boolean).join(" | ") || null;
    const respondentPhone = respondents.map((r) => r.phone).filter(Boolean).join(" | ") || null;

    const eixosData = [];
    const analisesData = [];
    let hasConsultor = false;

    for (let idx = 0; idx < EIXOS.length; idx++) {
      const eixo = EIXOS[idx];
      const nextTitles = EIXOS.slice(idx + 1).map((item) => item.title).concat(["PERGUNTAS CHAVES"]);
      const parsed = parseEixo(text, eixo.title, nextTitles);
      if (!parsed) continue;
      eixosData.push({
        eixoKey: eixo.key,
        ...parsed.resposta,
      });
      analisesData.push({
        eixoKey: eixo.key,
        ...parsed.analise,
      });
      if (parsed.analise.positivoParte3 || parsed.analise.negativoParte3 || parsed.analise.solucaoParte3) {
        hasConsultor = true;
      }
    }

    if (eixosData.length === 0) {
      console.warn(`Nenhum eixo identificado em ${file}`);
      skipped += 1;
      continue;
    }

    const perguntas = parsePerguntasChave(text);
    const status = hasConsultor ? "FINALIZED" : "SUBMITTED";

    await prisma.diagnostico.deleteMany({
      where: { municipioIbgeId: ibgeId },
    });

    const diagnostico = await prisma.diagnostico.create({
      data: {
        municipio: {
          connectOrCreate: {
            where: { ibgeId },
            create: {
              ibgeId,
              nome: municipioNome,
              uf: UF,
            },
          },
        },
        cnpj: "",
        respondentName,
        respondentEmail,
        respondentPhone,
        status,
        consentLgpd: true,
        submittedAt: status !== "DRAFT" ? new Date() : null,
        finalizedAt: status === "FINALIZED" ? new Date() : null,
        eixos: {
          create: eixosData,
        },
        analises: {
          create: analisesData,
        },
        perguntas: perguntas
          ? {
              create: perguntas,
            }
          : undefined,
      },
    });

    await prisma.diagnosticoVersion.create({
      data: {
        diagnosticoId: diagnostico.id,
        versionNumber: 1,
        createdByRole: hasConsultor ? "CONSULTOR" : "MUNICIPIO",
        snapshot: {
          municipioIbgeId: ibgeId,
          municipioNome,
          respondentName,
          respondentEmail,
          respondentPhone,
          status,
          eixoRespostas: eixosData,
          perguntasChave: perguntas,
        },
      },
    });

    created += 1;
  }

  console.log(`Importação concluída. Criados: ${created}, Ignorados: ${skipped}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
