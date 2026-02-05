import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Diagnóstico de autenticação (apenas para troubleshooting).
 * Retorna informações não sensíveis sobre a configuração.
 * Acesse: /api/auth/diagnose?token=XXX (token = AUTH_DIAGNOSE_TOKEN do .env)
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    const expected = process.env.AUTH_DIAGNOSE_TOKEN;
    if (!expected || token !== expected) {
      return NextResponse.json(
        { error: "Defina AUTH_DIAGNOSE_TOKEN no .env e passe ?token=valor" },
        { status: 401 }
      );
    }

    const authSecretSet = Boolean(
      process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
    );
    const dbUrlSet = Boolean(
      process.env.DATABASE_URL && process.env.DATABASE_URL.length > 20
    );

    let dbConnected = false;
    let userExists = false;
    let hasPassword = false;
    let hasCertificate = false;
    let dbError = "";

    if (dbUrlSet) {
      try {
        const { prisma } = await import("@/lib/prisma");
        const user = await prisma.user.findUnique({
          where: { email: "mauriciozanin@gmail.com" },
          select: {
            id: true,
            passwordHash: true,
            certificateThumbprint: true,
          },
        });
        dbConnected = true;
        if (user) {
          userExists = true;
          hasPassword = Boolean(user.passwordHash);
          hasCertificate = Boolean(user.certificateThumbprint);
        }
      } catch (e: any) {
        dbError = e?.message || String(e);
      }
    }

    return NextResponse.json({
      ok: true,
      env: process.env.VERCEL ? "vercel" : "local",
      authSecretSet,
      dbUrlSet,
      dbConnected,
      dbError: dbError || undefined,
      user: userExists
        ? { hasPassword, hasCertificate }
        : { error: "Usuário mauriciozanin@gmail.com não encontrado na base" },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Erro no diagnóstico" },
      { status: 500 }
    );
  }
}
