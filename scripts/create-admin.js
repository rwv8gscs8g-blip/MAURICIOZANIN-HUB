/* eslint-disable no-console */
/**
 * Cria ou atualiza o usuário admin.
 * Produção: DATABASE_URL=... (branch production do Neon)
 * --reset-password: atualiza a senha mesmo se o usuário já existir
 */
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

/** Pré-hash para senhas longas (bcrypt limita 72 bytes). */
function prepareForBcrypt(plain) {
  return crypto.createHash("sha256").update(plain, "utf8").digest("hex");
}

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Administrador";

  if (!email || !password) {
    console.error("Defina ADMIN_EMAIL e ADMIN_PASSWORD.");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  const resetPassword = process.argv.includes("--reset-password");

  if (existing) {
    if (resetPassword) {
      const passwordHash = await bcrypt.hash(prepareForBcrypt(password), 10);
      await prisma.user.update({
        where: { email },
        data: { passwordHash, name },
      });
      console.log("Senha do admin atualizada com sucesso.");
    } else {
      console.log("Usuário admin já existe. Use --reset-password para redefinir a senha.");
    }
    return;
  }

  const passwordHash = await bcrypt.hash(prepareForBcrypt(password), 10);
  await prisma.user.create({
    data: {
      name,
      email,
      role: "ADMIN",
      passwordHash,
    },
  });

  console.log("Usuário admin criado com sucesso.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
