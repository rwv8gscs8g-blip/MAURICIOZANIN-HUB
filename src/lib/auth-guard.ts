import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type ResourceType = "client" | "unit" | "project" | "hub";
type AccessRole = "OWNER" | "EDITOR" | "VIEWER" | "MEMBER";

const roleRank: Record<AccessRole, number> = {
  OWNER: 4,
  EDITOR: 3,
  VIEWER: 2,
  MEMBER: 1,
};

const ensureRole = (role?: AccessRole | null) => role && roleRank[role];

async function resolveClient(idOrSlug: string) {
  return prisma.clientOrganization.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    select: { id: true },
  });
}

async function resolveUnit(idOrSlug: string) {
  return prisma.clientUnit.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    select: { id: true, clientId: true },
  });
}

async function resolveProject(idOrSlug: string) {
  return prisma.project.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    select: { id: true, clientId: true },
  });
}

export async function verifyAccess({
  resource,
  id,
  minRole = "VIEWER",
}: {
  resource: ResourceType;
  id: string;
  minRole?: AccessRole;
}) {
  const session = await getSession();
  if (!session?.user) return false;

  if (session.user.role === "ADMIN") return true;
  if (session.user.role === "CLIENTE" && session.user.clientAccessApproved === false) {
    return false;
  }

  const userId = session.user.id;
  let clientId: string | null = null;
  let unitId: string | null = null;
  let projectId: string | null = null;
  let hubAxis: string | null = null;

  if (resource === "client") {
    const record = await resolveClient(id);
    clientId = record?.id || null;
  }

  if (resource === "unit") {
    const record = await resolveUnit(id);
    unitId = record?.id || null;
    clientId = record?.clientId || null;
  }

  if (resource === "project") {
    const record = await resolveProject(id);
    projectId = record?.id || null;
    clientId = record?.clientId || null;
  }

  if (resource === "hub") {
    hubAxis = id;
  }

  const conditions: any[] = [];
  if (clientId) conditions.push({ userId, clientId });
  if (unitId) conditions.push({ userId, clientUnitId: unitId });
  if (projectId) conditions.push({ userId, projectId });
  if (hubAxis) conditions.push({ userId, hubAxis });

  if (conditions.length === 0) return false;

  const accesses = await prisma.resourceAccess.findMany({
    where: { OR: conditions },
    select: { role: true },
  });

  const requiredRank = roleRank[minRole];
  const hasAccess = accesses.some((access) => {
    const rank = ensureRole(access.role);
    return rank && rank >= requiredRank;
  });
  if (hasAccess) return true;

  // Legacy fallback during double-write
  if (resource === "client" && clientId && session.user.clientOrganizationId === clientId) {
    return true;
  }
  if (resource === "unit" && clientId && session.user.clientOrganizationId === clientId) {
    return true;
  }
  if (resource === "hub" && hubAxis && session.user.hubAccesses?.includes(hubAxis)) {
    return true;
  }
  if (resource === "project" && projectId && session.user.projectAccesses?.includes(projectId)) {
    return true;
  }

  return false;
}
