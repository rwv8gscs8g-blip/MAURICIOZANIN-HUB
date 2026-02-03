import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolvePrefeitoMandato } from "@/lib/diagnostico/prefeito-mandato";
import { getSession } from "@/lib/auth";
import { verifyAccess } from "@/lib/auth-guard";

export async function GET(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const accessTarget = await prisma.diagnostico.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        clientOrganizationId: true,
        respondentId: true,
        consultantId: true,
      },
    });

    if (!accessTarget) {
      return NextResponse.json({ error: "Diagnóstico não encontrado" }, { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const isRespondent = accessTarget.respondentId === session.user.id;
    const isConsultant = accessTarget.consultantId === session.user.id;
    const hasClientAccess = accessTarget.clientOrganizationId
      ? await verifyAccess({
        resource: "client",
        id: accessTarget.clientOrganizationId,
        minRole: "VIEWER",
      })
      : false;

    if (!(isAdmin || isRespondent || isConsultant || hasClientAccess)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const diagnostico = await prisma.diagnostico.findUnique({
      where: { id: params.id },
      include: {
        municipio: true,
        eixos: true,
        analises: true,
        perguntas: true,
        prefeitoMandato: true,
      },
    });

    if (!diagnostico) {
      return NextResponse.json({ error: "Diagnóstico não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ diagnostico });
  } catch (error) {
    console.error("diagnostico fetch error", error);
    return NextResponse.json({ error: "Erro ao buscar diagnóstico" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = params.id;
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const accessTarget = await prisma.diagnostico.findUnique({
      where: { id: id },
      select: {
        id: true,
        clientOrganizationId: true,
        respondentId: true,
        consultantId: true,
      },
    });

    if (!accessTarget) {
      return NextResponse.json({ error: "Diagnóstico não encontrado" }, { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const isRespondent = accessTarget.respondentId === session.user.id;
    const isConsultant = accessTarget.consultantId === session.user.id;
    const hasClientAccess = accessTarget.clientOrganizationId
      ? await verifyAccess({
        resource: "client",
        id: accessTarget.clientOrganizationId,
        minRole: "EDITOR",
      })
      : false;

    if (!(isAdmin || isRespondent || isConsultant || hasClientAccess)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const {
      municipioIbgeId,
      cnpj,
      respondentName,
      respondentEmail,
      respondentPhone,
      consentLgpd,
      status,
      eixoRespostas = [],
      perguntasChave,
      dataDiagnostico,
    } = body;

    const diagnosticoDate = dataDiagnostico ? new Date(dataDiagnostico) : new Date();

    const diagnostico = await prisma.$transaction(async (tx) => {
      const existingCount = await tx.diagnosticoVersion.count({
        where: { diagnosticoId: params.id },
      });
      const mandato = await resolvePrefeitoMandato({
        client: tx,
        municipioIbgeId,
        dataDiagnostico: diagnosticoDate,
      });
      const record = await tx.diagnostico.update({
        where: { id: params.id },
        data: {
          municipioIbgeId,
          cnpj,
          respondentName,
          respondentEmail,
          respondentPhone,
          consentLgpd: !!consentLgpd,
          status: status || undefined,
          dataDiagnostico: diagnosticoDate,
          prefeitoMandatoId: mandato?.id,
        },
      });

      await tx.diagnosticoVersion.create({
        data: {
          diagnosticoId: record.id,
          versionNumber: existingCount + 1,
          createdByRole: body.role || "MUNICIPIO",
          snapshot: {
            municipioIbgeId,
            cnpj,
            respondentName,
            respondentEmail,
            respondentPhone,
            consentLgpd: !!consentLgpd,
            status: status || record.status,
            dataDiagnostico: diagnosticoDate,
            prefeitoMandatoId: mandato?.id ?? record.prefeitoMandatoId,
            eixoRespostas,
            perguntasChave,
          },
        },
      });

      if (eixoRespostas.length > 0) {
        await tx.eixoResposta.deleteMany({
          where: { diagnosticoId: record.id },
        });
        await tx.eixoResposta.createMany({
          data: eixoRespostas.map((item: any) => ({
            diagnosticoId: record.id,
            eixoKey: item.eixoKey,
            positivoParte1: item.positivoParte1 || null,
            positivoParte2: item.positivoParte2 || null,
            positivoNota: item.positivoNota ?? null,
            positivoNotaConsultor: item.positivoNotaConsultor ?? null,
            negativoParte1: item.negativoParte1 || null,
            negativoParte2: item.negativoParte2 || null,
            negativoNota: item.negativoNota ?? null,
            negativoNotaConsultor: item.negativoNotaConsultor ?? null,
            solucaoParte1: item.solucaoParte1 || null,
            solucaoParte2: item.solucaoParte2 || null,
            solucaoNota: item.solucaoNota ?? null,
            solucaoNotaConsultor: item.solucaoNotaConsultor ?? null,
            solucaoSebraeDescs: item.solucaoSebraeDescs || null,
            solucaoDescricao: item.solucaoDescricao || null,
          })),
        });
      }

      if (perguntasChave) {
        await tx.perguntasChaveResposta.upsert({
          where: { diagnosticoId: record.id },
          update: {
            ...perguntasChave,
          },
          create: {
            diagnosticoId: record.id,
            ...perguntasChave,
          },
        });
      }

      return record;
    });

    return NextResponse.json({ id: diagnostico.id });
  } catch (error) {
    console.error("diagnostico update error", error);
    return NextResponse.json({ error: "Erro ao atualizar diagnóstico" }, { status: 500 });
  }
}
