import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");
    const userType = body.userType === "CLIENTE" ? "CLIENTE" : "PADRAO";
    const clientOrganizationId = body.clientOrganizationId || null;
    let hubs = Array.isArray(body.hubs) ? body.hubs : [];

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nome e e-mail são obrigatórios." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 8 caracteres." },
        { status: 400 }
      );
    }

    if (userType === "CLIENTE" && !clientOrganizationId) {
      return NextResponse.json(
        { error: "Selecione o cliente para acesso dedicado." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Já existe um usuário com este e-mail." },
        { status: 400 }
      );
    }

    if (userType === "CLIENTE" && hubs.length === 0) {
      hubs = [
        "COOPERACAO_INTERNACIONAL",
        "COMPRAS_GOVERNAMENTAIS",
        "SUPORTE_MUNICIPIOS",
        "DESENVOLVIMENTO_SOFTWARE",
      ];
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const role = userType === "CLIENTE" ? "CLIENTE" : "CONSULTOR";
    const clientAccessApproved = userType !== "CLIENTE";

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        passwordHash,
        clientOrganizationId,
        clientAccessApproved,
        hubAccesses: hubs.length
          ? {
              createMany: {
                data: hubs.map((hub: string) => ({ hub })),
              },
            }
          : undefined,
      },
    });

    const resourceRows = [];
    if (clientOrganizationId) {
      resourceRows.push({
        userId: user.id,
        role: "OWNER",
        clientId: clientOrganizationId,
      });
    }
    resourceRows.push(
      ...hubs.map((hub: string) => ({
        userId: user.id,
        role: "MEMBER",
        hubAxis: hub,
      }))
    );
    if (resourceRows.length) {
      await prisma.resourceAccess.createMany({
        data: resourceRows,
        skipDuplicates: true,
      });
    }

    await prisma.lead.create({
      data: {
        name,
        email,
        interestArea: hubs.join(", "),
        source: "cadastro",
      },
    });

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (error) {
    console.error("register request error", error);
    return NextResponse.json({ error: "Erro ao registrar solicitação" }, { status: 500 });
  }
}
