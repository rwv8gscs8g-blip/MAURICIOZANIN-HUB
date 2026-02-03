import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCnpj } from "@/lib/cnpj";
import { requireApiAuth } from "@/lib/api-guard";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cnpj = searchParams.get("cnpj");

  if (!cnpj) {
    return NextResponse.json({ error: "CNPJ não informado" }, { status: 400 });
  }

  try {
    const normalized = normalizeCnpj(cnpj);
    const mapping = await prisma.cnpjMunicipio.findUnique({
      where: { cnpj: normalized },
      select: {
        cnpj: true,
        validatedByAdmin: true,
        municipio: { select: { ibgeId: true, nome: true, uf: true } },
      },
    });

    if (!mapping) {
      return NextResponse.json({ mapping: null });
    }

    return NextResponse.json({
      mapping: {
        cnpj: mapping.cnpj,
        validatedByAdmin: mapping.validatedByAdmin,
        municipio: mapping.municipio,
      },
    });
  } catch (error) {
    console.error("lookup cnpj error", error);
    return NextResponse.json({ error: "Erro ao buscar CNPJ" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiAuth(request, {
      allowedRoles: ["ADMIN", "SUPERCONSULTOR", "CONSULTOR"],
      audit: { entity: "CnpjMunicipio", action: "ACCESS_DENIED", data: { op: "UPSERT" } },
    });
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const { cnpj, municipioIbgeId } = body;

    if (!cnpj || !municipioIbgeId) {
      return NextResponse.json(
        { error: "CNPJ e município são obrigatórios" },
        { status: 400 }
      );
    }

    const normalized = normalizeCnpj(cnpj);
    const mapping = await prisma.cnpjMunicipio.upsert({
      where: { cnpj: normalized },
      update: { municipioIbgeId, validatedByAdmin: false },
      create: { cnpj: normalized, municipioIbgeId, validatedByAdmin: false },
    });

    return NextResponse.json({ mapping });
  } catch (error) {
    console.error("save cnpj error", error);
    return NextResponse.json({ error: "Erro ao salvar CNPJ" }, { status: 500 });
  }
}
