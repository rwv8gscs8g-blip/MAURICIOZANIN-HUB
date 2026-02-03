import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { extractRequestInfo } from "@/lib/classroom";
import { logAudit } from "@/lib/audit";

type RequireApiAuthOptions = {
  allowedRoles?: string[];
  audit?: {
    entity?: string;
    action?: string;
    data?: Record<string, any>;
  };
};

type RequireApiAuthResult =
  | { ok: true; session: any }
  | { ok: false; response: NextResponse };

async function auditDenied(
  request: NextRequest,
  {
    reason,
    requiredRoles,
    session,
    audit,
  }: {
    reason: "UNAUTHENTICATED" | "FORBIDDEN";
    requiredRoles?: string[];
    session?: any | null;
    audit?: RequireApiAuthOptions["audit"];
  }
) {
  const { ipAddress, userAgent, requestId } = extractRequestInfo(request);
  const path = new URL(request.url).pathname;

  await logAudit({
    entity: audit?.entity || "Access",
    entityId: requestId,
    action: audit?.action || "DENY",
    performedBy: session?.user?.id || null,
    userId: session?.user?.id || null,
    ipAddress,
    userAgent,
    requestId,
    data: {
      reason,
      path,
      method: request.method,
      requiredRoles: requiredRoles || [],
      ...(audit?.data || {}),
    },
  });
}

export async function requireApiAuth(
  request: NextRequest,
  options: RequireApiAuthOptions = {}
): Promise<RequireApiAuthResult> {
  const session = await getSession();
  const requiredRoles = options.allowedRoles || [];

  if (!session?.user) {
    await auditDenied(request, {
      reason: "UNAUTHENTICATED",
      requiredRoles,
      session: null,
      audit: options.audit,
    });
    return {
      ok: false,
      response: NextResponse.json({ error: "Não autorizado" }, { status: 401 }),
    };
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(session.user.role)) {
    await auditDenied(request, {
      reason: "FORBIDDEN",
      requiredRoles,
      session,
      audit: options.audit,
    });
    return {
      ok: false,
      response: NextResponse.json({ error: "Acesso negado" }, { status: 403 }),
    };
  }

  return { ok: true, session };
}

