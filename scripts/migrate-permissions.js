const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      clientOrganizationId: true,
    },
  });

  const hubAccesses = await prisma.userHubAccess.findMany({
    select: { userId: true, hub: true },
  });

  const projectAccesses = await prisma.userProjectAccess.findMany({
    select: { userId: true, projectId: true },
  });

  const clientAccessRows = users
    .filter((u) => u.clientOrganizationId)
    .map((u) => ({
      userId: u.id,
      role: "OWNER",
      clientId: u.clientOrganizationId,
    }));

  const hubRows = hubAccesses.map((row) => ({
    userId: row.userId,
    role: "MEMBER",
    hubAxis: row.hub,
  }));

  const projectRows = projectAccesses.map((row) => ({
    userId: row.userId,
    role: "MEMBER",
    projectId: row.projectId,
  }));

  const rows = [...clientAccessRows, ...hubRows, ...projectRows];

  if (rows.length === 0) {
    console.log("Nenhuma permissão para migrar.");
    return;
  }

  const result = await prisma.resourceAccess.createMany({
    data: rows,
    skipDuplicates: true,
  });

  console.log(`Permissões migradas: ${result.count}`);
}

main()
  .catch((err) => {
    console.error("Erro ao migrar permissões:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
