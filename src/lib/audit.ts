import { prisma } from "@/lib/prisma";

export async function logAudit({
  entity,
  entityId,
  action,
  data,
  performedBy,
  userId,
  clientOrganizationId,
  clientUnitId,
  ipAddress,
  userAgent,
  requestId,
}: {
  entity: string;
  entityId: string;
  action: string;
  data?: Record<string, any>;
  performedBy?: string | null;
  userId?: string | null;
  clientOrganizationId?: string | null;
  clientUnitId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
}) {
  try {
    const resolvedUserId = userId || performedBy || undefined;
    await prisma.auditLog.create({
      data: {
        entity,
        entityId,
        action,
        data,
        performedBy: performedBy || undefined,
        userId: resolvedUserId,
        clientOrganizationId: clientOrganizationId || undefined,
        clientUnitId: clientUnitId || undefined,
        ipAddress: ipAddress || undefined,
        userAgent: userAgent || undefined,
        requestId: requestId || undefined,
      },
    });
  } catch (error) {
    console.warn("[audit] falha ao registrar evento", error);
  }
}
