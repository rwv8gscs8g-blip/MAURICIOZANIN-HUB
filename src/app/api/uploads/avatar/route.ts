import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { randomUUID } from "crypto";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(["ADMIN", "SUPERCONSULTOR", "CONSULTOR", "MUNICIPIO"]);
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Arquivo inválido." }, { status: 400 });
    }

    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Formato não suportado." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const filename = `${randomUUID()}.${ext}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");

    await mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    const avatarUrl = `/uploads/avatars/${filename}`;

    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl },
    });

    await logAudit({
      entity: "User",
      entityId: session.user.id,
      action: "USER_AVATAR_UPDATED",
      performedBy: session.user.id,
      data: { avatarUrl },
    });

    return NextResponse.json({ ok: true, avatarUrl });
  } catch (error) {
    console.error("avatar upload error", error);
    return NextResponse.json({ error: "Erro ao enviar avatar" }, { status: 500 });
  }
}
