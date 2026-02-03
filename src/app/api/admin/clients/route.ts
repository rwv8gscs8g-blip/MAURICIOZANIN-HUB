import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { verifyAccess } from "@/lib/auth-guard";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }
    const clients = await prisma.clientOrganization.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return NextResponse.json({ clients });
  } catch (error) {
    console.error("admin clients list error", error);
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Faça login para enviar a logo." }, { status: 401 });
    }
    const formData = await request.formData();
    const clientId = String(formData.get("clientId") || "").trim();
    const file = formData.get("file");

    if (!clientId || !(file instanceof File)) {
      return NextResponse.json({ error: "Selecione uma imagem (PNG, JPG ou WebP)." }, { status: 400 });
    }

    const client = await prisma.clientOrganization.findUnique({
      where: { id: clientId },
      select: { id: true, slug: true },
    });
    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const canEditClient = isAdmin || (await verifyAccess({ resource: "client", id: client.id, minRole: "VIEWER" }));
    if (!canEditClient) {
      return NextResponse.json({ error: "Sem permissão para alterar a logo deste cliente." }, { status: 403 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.length === 0) {
      return NextResponse.json({ error: "Arquivo vazio ou inválido." }, { status: 400 });
    }
    const ext = file.type.includes("png")
      ? "png"
      : file.type.includes("webp")
      ? "webp"
      : "jpg";
    const fileName = `logo.${ext}`;
    const relativeDirFs = path.join("clients", client.slug);
    const relativeDirUrl = path.posix.join("clients", client.slug);
    const outputDir = path.join(process.cwd(), "public", relativeDirFs);
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(path.join(outputDir, fileName), bytes);

    const logoUrl = `/${relativeDirUrl}/${fileName}`;
    await prisma.clientOrganization.update({
      where: { id: client.id },
      data: { logoUrl },
    });

    revalidatePath(`/clientes/${client.slug}`);

    return NextResponse.json({ ok: true, logoUrl });
  } catch (error) {
    console.error("admin client logo error", error);
    const message = error instanceof Error ? error.message : "Erro ao atualizar logo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
