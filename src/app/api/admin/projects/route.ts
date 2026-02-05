import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAuthError, getAuthErrorMessage } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAuth(["ADMIN"]);
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: true },
    });
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("admin projects list error", error);
    const status = isAuthError(error) ? 403 : 500;
    const message = isAuthError(error) ? getAuthErrorMessage(error) : "Erro ao carregar projetos.";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth(["ADMIN"]);
    const body = await request.json();
    const name = String(body.name || "").trim();
    const slug = String(body.slug || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const clientId = String(body.clientId || "");
    const hub = body.hub;
    const description = body.description || null;

    if (!name || !slug || !clientId || !hub) {
      return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        slug,
        description,
        clientId,
        hub,
      },
      include: { client: true },
    });

    return NextResponse.json({ ok: true, project });
  } catch (error) {
    console.error("admin projects create error", error);
    return NextResponse.json({ error: "Erro ao criar projeto." }, { status: 500 });
  }
}
