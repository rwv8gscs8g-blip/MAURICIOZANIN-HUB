/* eslint-disable no-console */
/**
 * Verifica se o admin existe na base de PRODUÇÃO.
 * Uso: DATABASE_URL="$DATABASE_URL_PRODUCTION" node scripts/check-admin-production.js
 *      Ou: DATABASE_URL="postgresql://..." node scripts/check-admin-production.js
 */
const { PrismaClient } = require("@prisma/client");

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
  console.log("📋 Verificando base:", dbName.substring(0, 50) + "...");
  console.log("");

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true, name: true, passwordHash: true, lockedUntil: true },
  });

  if (admins.length === 0) {
    console.log("❌ Nenhum usuário ADMIN encontrado nesta base.");
    console.log("   Crie com: ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/create-admin.js");
    return;
  }

  for (const u of admins) {
    const temSenha = !!u.passwordHash;
    const bloqueado = u.lockedUntil && new Date(u.lockedUntil) > new Date();
    console.log(`   ${u.email}`);
    console.log(`      Nome: ${u.name || "(vazio)"}`);
    console.log(`      Senha configurada: ${temSenha ? "sim" : "não"}`);
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
