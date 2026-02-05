import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
import { consumeAuthToken } from "@/lib/auth-tokens";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = String(body.token || "");
    const password = String(body.password || "");

    if (!token || password.length < 8) {
      return NextResponse.json(
        { error: "Token inválido ou senha fraca." },
        { status: 400 }
      );
    }

    const record = await consumeAuthToken({ token, type: "PASSWORD_RESET" });
    if (!record) {
      return NextResponse.json({ error: "Token inválido ou expirado." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    await prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
    });

    await logAudit({
      entity: "User",
      entityId: record.userId,
      action: "PASSWORD_RESET",
      performedBy: record.userId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("password reset error", error);
    return NextResponse.json({ error: "Erro ao redefinir senha" }, { status: 500 });
  }
}
