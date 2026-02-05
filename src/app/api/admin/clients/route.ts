import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { verifyAccess } from "@/lib/auth-guard";
import { uploadFile } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAuth(["ADMIN"]);
    const clients = await prisma.clientOrganization.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return NextResponse.json({ clients });
  } catch (error) {
    console.error("admin clients list error", error);
    const msg =
      error instanceof Error && error.message.includes("login")
        ? "Sessão expirada ou inexistente. Faça login novamente."
        : error instanceof Error && error.message.includes("permissão")
          ? "Apenas administradores podem acessar esta lista. Faça login como Admin."
          : "Sessão expirada ou sem permissão. Faça login como Admin.";
    return NextResponse.json({ error: msg }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth(["ADMIN", "VIEWER", "EDITOR", "OWNER"]); // Permissive initially, refined by verifyAccess

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
    const canEditClient = isAdmin || (await verifyAccess({ resource: "client", id: client.id, minRole: "EDITOR" }));

    if (!canEditClient) {
      return NextResponse.json({ error: "Sem permissão para alterar a logo deste cliente." }, { status: 403 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.length === 0) {
      return NextResponse.json({ error: "Arquivo vazio ou inválido." }, { status: 400 });
    }

    const ext = file.type.includes("png") ? "png" : file.type.includes("webp") ? "webp" : "jpg";
    const fileName = `logo-${Date.now()}.${ext}`;
    const contentType = file.type || `image/${ext}`;

    // Upload to R2
    const logoUrl = await uploadFile(bytes, fileName, contentType, `clients/${client.slug}`);

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
