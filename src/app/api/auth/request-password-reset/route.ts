import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
import { prisma } from "@/lib/prisma";
import { createAuthToken } from "@/lib/auth-tokens";
import { sendEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "").toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: "Informe o e-mail." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    const { token, expiresAt } = await createAuthToken({
      userId: user.id,
      type: "PASSWORD_RESET",
      ttlMinutes: 30,
    });

    const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
    const link = `${baseUrl}/auth/reset?token=${token}`;

    const sendResult = await sendEmail({
      to: user.email,
      subject: "Redefinição de senha",
      html: `<p>Olá ${user.name},</p>
      <p>Use o link para redefinir sua senha:</p>
      <p><a href="${link}">${link}</a></p>
      <p>O link expira em ${expiresAt.toLocaleString("pt-BR")}.</p>`,
      text: `Olá ${user.name},\n\nRedefina sua senha: ${link}\n\nExpira em ${expiresAt.toLocaleString(
        "pt-BR"
      )}.`,
    });

    await logAudit({
      entity: "User",
      entityId: user.id,
      action: "PASSWORD_RESET_REQUESTED",
      performedBy: user.id,
    });

    return NextResponse.json({ ok: true, simulated: sendResult.simulated });
  } catch (error: any) {
    console.error("password reset request error", error);
    const msg =
      String(error?.message || "").toLowerCase().includes("resend") ||
      String(error?.message || "").includes("email")
        ? "Não foi possível enviar o e-mail. Tente novamente mais tarde ou use o login por certificado."
        : "Erro ao solicitar reset";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
