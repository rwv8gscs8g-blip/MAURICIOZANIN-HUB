/* eslint-disable no-console */
/**
 * Verifica se o admin existe na base.
 * Uso: ENV=dev|preview|production npm run admin:check
 */
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

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

const env = (process.env.ENV || "production").toLowerCase();
const dbUrl =
  env === "production"
    ? process.env.DATABASE_URL_PRODUCTION
    : env === "preview"
      ? process.env.DATABASE_URL_PREVIEW
      : process.env.DATABASE_URL;

if (dbUrl && dbUrl.length > 20) process.env.DATABASE_URL = dbUrl;

const prisma = new PrismaClient();

async function main() {
  const url = process.env.DATABASE_URL || "";
  if (!url || url.length < 20) {
    console.error("❌ DATABASE_URL não definida ou muito curta.");
    console.error("   Rode: source scripts/carregar-env.sh");
    console.error("   Depois: export DATABASE_URL=\"$DATABASE_URL_PRODUCTION\"");
    process.exit(1);
  }

  const dbName = url.includes("neon.tech") ? url.match(/\/neondb[^?]*/)?.[0] || "Neon" : "DB";
  console.log("📋 Verificando base:", env, "-", dbName.substring(0, 50) + "...");
  console.log("");

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true, name: true, passwordHash: true, lockedUntil: true, certificateThumbprint: true },
  });

  if (admins.length === 0) {
    console.log("❌ Nenhum usuário ADMIN encontrado nesta base.");
    console.log("   Crie com: ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/create-admin.js");
    return;
  }

  for (const u of admins) {
    const temSenha = !!u.passwordHash;
    const temCert = !!u.certificateThumbprint;
    const bloqueado = u.lockedUntil && new Date(u.lockedUntil) > new Date();
    console.log(`   ${u.email}`);
    console.log(`      Nome: ${u.name || "(vazio)"}`);
    console.log(`      Senha configurada: ${temSenha ? "sim" : "não"}`);
    console.log(`      Certificado vinculado: ${temCert ? "sim" : "não"}`);
    console.log(`      Bloqueado: ${bloqueado ? "sim" : "não"}`);
    console.log("");
  }
}

main()
  .catch((e) => {
    console.error("Erro:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
