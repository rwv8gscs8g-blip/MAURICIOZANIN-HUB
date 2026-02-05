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
      type: "MAGIC_LINK",
      ttlMinutes: 30,
    });

    const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
    const link = `${baseUrl}/auth/magic?token=${token}`;

    const sendResult = await sendEmail({
      to: user.email,
      subject: "Seu acesso rápido ao portal",
      html: `<p>Olá ${user.name},</p>
      <p>Clique no link para entrar:</p>
      <p><a href="${link}">${link}</a></p>
      <p>O link expira em ${expiresAt.toLocaleString("pt-BR")}.</p>`,
      text: `Olá ${user.name},\n\nAcesse: ${link}\n\nExpira em ${expiresAt.toLocaleString(
        "pt-BR"
      )}.`,
    });

    await logAudit({
      entity: "User",
      entityId: user.id,
      action: "MAGIC_LINK_REQUESTED",
      performedBy: user.id,
    });

    return NextResponse.json({ ok: true, simulated: sendResult.simulated });
  } catch (error) {
    console.error("magic link request error", error);
    return NextResponse.json({ error: "Erro ao solicitar link" }, { status: 500 });
  }
}
