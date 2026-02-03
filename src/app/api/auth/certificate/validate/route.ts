import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCertificate } from "@/lib/certificate";

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
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({
      success: true,
      certInfo,
      canLogin: Boolean(user),
      message: user ? "Certificado válido e autorizado." : "Certificado válido, mas não autorizado.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao validar certificado." },
      { status: 500 },
    );
  }
}
