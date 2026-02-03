import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { extractRequestInfo } from "@/lib/classroom";
import { logAudit } from "@/lib/audit";

const PRIVILEGED_ROLES = ["ADMIN", "SUPERCONSULTOR", "CONSULTOR"] as const;

/**
 * Registra um marco (T0, T1, T2) criando um snapshot da versão atual do diagnóstico.
 * Só consultor/admin ou quem tem acesso ao diagnóstico pode chamar.
 */
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { ipAddress, userAgent, requestId } = extractRequestInfo(request);
    const session = await getSession();
    const body = await request.json().catch(() => ({}));
    const label = body.label as string | undefined;

    const diagnostico = await prisma.diagnostico.findUnique({
      where: { id },
      include: {
        eixos: true,
        analises: true,
        perguntas: true,
      },
    });

    if (!diagnostico) {
      return NextResponse.json({ error: "Diagnóstico não encontrado" }, { status: 404 });
    }

    const isPrivileged = session?.user && PRIVILEGED_ROLES.includes(session.user.role as (typeof PRIVILEGED_ROLES)[number]);
    const isConsultant = diagnostico.consultantId === session?.user?.id;
    if (!isPrivileged && !isConsultant) {
      await logAudit({
        entity: "Diagnostico",
        entityId: id,
        action: "MARCO_DENIED",
        ipAddress,
        userAgent,
        requestId,
        data: { reason: "not_privileged" },
      });
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const existingCount = await prisma.diagnosticoVersion.count({
      where: { diagnosticoId: id },
    });

    const eixoRespostas = diagnostico.eixos.map((e) => ({
      eixoKey: e.eixoKey,
      positivoParte1: e.positivoParte1,
      positivoParte2: e.positivoParte2,
      positivoNota: e.positivoNota,
      positivoNotaConsultor: e.positivoNotaConsultor,
      negativoParte1: e.negativoParte1,
      negativoParte2: e.negativoParte2,
      negativoNota: e.negativoNota,
      negativoNotaConsultor: e.negativoNotaConsultor,
      solucaoParte1: e.solucaoParte1,
      solucaoParte2: e.solucaoParte2,
      solucaoNota: e.solucaoNota,
      solucaoNotaConsultor: e.solucaoNotaConsultor,
    }));

    const analises = diagnostico.analises.map((a) => ({
      eixoKey: a.eixoKey,
      positivoParte3: a.positivoParte3,
      negativoParte3: a.negativoParte3,
      solucaoParte3: a.solucaoParte3,
    }));

    const perguntasChave = diagnostico.perguntas
      ? {
          pcaPacPncp: diagnostico.perguntas.pcaPacPncp,
          integracaoPlanejamento: diagnostico.perguntas.integracaoPlanejamento,
          sebraeSolucoes: diagnostico.perguntas.sebraeSolucoes,
          sistemasUtilizados: diagnostico.perguntas.sistemasUtilizados,
          tramitacaoEletronicaNota: diagnostico.perguntas.tramitacaoEletronicaNota,
          tramitacaoEletronicaComentario: diagnostico.perguntas.tramitacaoEletronicaComentario,
          salaEmpreendedor: diagnostico.perguntas.salaEmpreendedor,
          estrategiasFornecedores: diagnostico.perguntas.estrategiasFornecedores,
          beneficiosLc123: diagnostico.perguntas.beneficiosLc123,
          integracaoSustentabilidade: diagnostico.perguntas.integracaoSustentabilidade,
          consultorAnalise: diagnostico.perguntas.consultorAnalise,
        }
      : undefined;

    await prisma.diagnosticoVersion.create({
      data: {
        diagnosticoId: id,
        versionNumber: existingCount + 1,
        createdByRole: isPrivileged ? "CONSULTOR" : "MUNICIPIO",
        snapshot: {
          municipioIbgeId: diagnostico.municipioIbgeId,
          cnpj: diagnostico.cnpj,
          respondentName: diagnostico.respondentName,
          respondentEmail: diagnostico.respondentEmail,
          respondentPhone: diagnostico.respondentPhone,
          consentLgpd: diagnostico.consentLgpd,
          status: diagnostico.status,
          dataDiagnostico: diagnostico.dataDiagnostico?.toISOString?.() ?? null,
          prefeitoMandatoId: diagnostico.prefeitoMandatoId,
          cicloGestaoInicio: diagnostico.cicloGestaoInicio,
          cicloGestaoFim: diagnostico.cicloGestaoFim,
          classroomSessionId: diagnostico.classroomSessionId,
          eixoRespostas,
          analises,
          perguntasChave,
          marcoLabel: label ?? `T${existingCount}`,
        },
      },
    });

    await logAudit({
      entity: "Diagnostico",
      entityId: id,
      action: "MARCO_CREATED",
      performedBy: session?.user?.id ?? null,
      ipAddress,
      userAgent,
      requestId,
      data: { versionNumber: existingCount + 1, label: label ?? `T${existingCount}` },
    });

    return NextResponse.json({
      id,
      versionNumber: existingCount + 1,
      label: label ?? `T${existingCount}`,
    });
  } catch (error) {
    console.error("diagnostico marco error", error);
    return NextResponse.json({ error: "Erro ao registrar marco" }, { status: 500 });
  }
}
