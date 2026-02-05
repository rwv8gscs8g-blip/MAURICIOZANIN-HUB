/* eslint-disable no-console */
/**
 * Vincula um certificado digital (.pfx) ao usuário pelo e-mail.
 * Uso: USER_EMAIL=... CERT_FILE=.certs/cert.pfx CERT_PASSWORD=... ENV=dev|preview|production node scripts/link-certificate-admin.js
 *
 * ENV define o banco:
 *   dev     -> DATABASE_URL
 *   preview -> DATABASE_URL_PREVIEW
 *   production -> DATABASE_URL_PRODUCTION
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const forge = require("node-forge");

// Carregar .env.local e escolher banco por ENV
function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf8");
  const env = {};
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    let trimmed = lines[i].replace(/\r$/, "").trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (!val && i + 1 < lines.length) {
      const next = lines[i + 1].replace(/\r$/, "").trim();
      if (next && !next.startsWith("#") && !/^[A-Za-z_][A-Za-z0-9_]*\s*=/.test(next)) {
        val = next;
        i++;
      }
    }
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    env[key] = val.trim();
  }
  return env;
}
Object.assign(process.env, loadEnvLocal());
const env = (process.env.ENV || "dev").toLowerCase();
const dbUrl =
  env === "production"
    ? process.env.DATABASE_URL_PRODUCTION
    : env === "preview"
      ? process.env.DATABASE_URL_PREVIEW
      : process.env.DATABASE_URL;

if (!dbUrl || dbUrl.length < 20) {
  console.error(`DATABASE_URL para ENV=${env} não encontrado ou inválido no .env.local`);
  process.exit(1);
}
process.env.DATABASE_URL = dbUrl;

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function parseCertificate(buffer, password) {
  const p12Der = forge.util.createBuffer(buffer.toString("binary"));
  const p12Asn1 = forge.asn1.fromDer(p12Der);
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

  const bags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag];
  if (!bags || !bags.length) {
    throw new Error("Nenhum certificado encontrado no arquivo.");
  }

  const cert = bags[0].cert;
  if (!cert) {
    throw new Error("Certificado inválido no arquivo.");
  }

  const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
  const thumbprint = crypto
    .createHash("sha256")
    .update(Buffer.from(certDer, "binary"))
    .digest("hex");

  return {
    thumbprint,
    validFrom: cert.validity.notBefore,
    validTo: cert.validity.notAfter,
  };
}

async function main() {
  const email = process.env.USER_EMAIL || process.env.ADMIN_EMAIL;
  const certPath = process.env.CERT_FILE;
  const certPassword = process.env.CERT_PASSWORD;

  if (!email || !certPath || !certPassword) {
    console.error("Defina USER_EMAIL, CERT_FILE e CERT_PASSWORD.");
    console.error("ENV=dev|preview|production (default: dev)");
    console.error(
      "Exemplo: USER_EMAIL=user@mail.com CERT_FILE=.certs/cert.pfx CERT_PASSWORD=xxx ENV=production npm run admin:link-cert"
    );
    process.exit(1);
  }

  // Resolver caminho: absoluto, relativo à raiz, ou em .certs/
  const root = path.join(__dirname, "..");
  let absPath = path.isAbsolute(certPath) ? certPath : path.join(root, certPath);
  if (!fs.existsSync(absPath)) {
    absPath = path.join(root, ".certs", path.basename(certPath));
  }
  if (!fs.existsSync(absPath)) {
    console.error("Arquivo não encontrado. Tente: .certs/seu-certificado.pfx");
    process.exit(1);
  }

  const buffer = fs.readFileSync(absPath);
  const certInfo = parseCertificate(buffer, certPassword);
  const now = new Date();
  if (now < certInfo.validFrom || now > certInfo.validTo) {
    console.error(
      "Certificado fora da validade:",
      certInfo.validFrom.toISOString(),
      "–",
      certInfo.validTo.toISOString()
    );
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) {
    console.error("Usuário não encontrado:", email);
    process.exit(1);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { certificateThumbprint: certInfo.thumbprint },
  });

  console.log("Certificado vinculado com sucesso.");
  console.log("  Ambiente:", env);
  console.log("  Usuário:", user.email);
  console.log("  Thumbprint:", certInfo.thumbprint);
  console.log("");
  console.log("Use a aba Certificado na tela de login para entrar.");
}

main()
  .catch((e) => {
    console.error("Erro:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
