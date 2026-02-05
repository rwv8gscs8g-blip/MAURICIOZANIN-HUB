/* eslint-disable no-console */
/**
 * Vincula um certificado digital (.pfx) ao usuário pelo e-mail.
 * Uso: USER_EMAIL=... CERT_FILE=/path/to/cert.pfx CERT_PASSWORD=... node scripts/link-certificate-admin.js
 * Produção: DATABASE_URL=$DATABASE_URL_PRODUCTION
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const forge = require("node-forge");
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
    console.error(
      "Exemplo: USER_EMAIL=user@mail.com CERT_FILE=./cert.pfx CERT_PASSWORD=xxx node scripts/link-certificate-admin.js"
    );
    process.exit(1);
  }

  const absPath = path.resolve(certPath);
  if (!fs.existsSync(absPath)) {
    console.error("Arquivo não encontrado:", absPath);
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
  console.log("  Usuário:", user.email);
  console.log("  Thumbprint:", certInfo.thumbprint);
  console.log("");
  console.log("Agora use a aba Certificado na tela de login para entrar.");
}

main()
  .catch((e) => {
    console.error("Erro:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
