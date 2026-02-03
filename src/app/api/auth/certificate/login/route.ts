import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCertificate } from "@/lib/certificate";
import { login } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const certFile = formData.get("certificate") as File | null;
    const password = String(formData.get("password") || "");

    if (!certFile || !password) {
      return NextResponse.json(
        { success: false, error: "Arquivo e senha são obrigatórios." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await certFile.arrayBuffer());
    const certInfo = parseCertificate(buffer, password);
    const now = new Date();
    if (now < certInfo.validFrom || now > certInfo.validTo) {
      return NextResponse.json(
        { success: false, error: "Certificado expirado ou ainda não válido." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findFirst({
      where: { certificateThumbprint: certInfo.thumbprint },
      include: {
        hubAccesses: { select: { hub: true } },
        projectAccesses: { select: { projectId: true } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Certificado não autorizado." },
        { status: 401 },
      );
    }

    await login({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        clientOrganizationId: user.clientOrganizationId,
        hubAccesses: user.hubAccesses?.map((h) => h.hub) || [],
        projectAccesses: user.projectAccesses?.map((p) => p.projectId) || [],
      },
      sessionMinutes: 60,
    });

    await logAudit({
      entity: "User",
      entityId: user.id,
      action: "LOGIN_CERTIFICATE",
      performedBy: user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao fazer login." },
      { status: 500 },
    );
  }
}
