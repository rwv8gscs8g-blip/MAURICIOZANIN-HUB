import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractRequestInfo } from "@/lib/classroom";
import { logAudit } from "@/lib/audit";
import { requireApiAuth } from "@/lib/api-guard";

const PRIVILEGED_ROLES = ["ADMIN", "SUPERCONSULTOR", "CONSULTOR"] as const;

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    const diagnosticoId = params.id;
    if (!diagnosticoId) {
      return NextResponse.json({ error: "ID do diagnóstico é obrigatório." }, { status: 400 });
    }

    const { ipAddress, userAgent, requestId } = extractRequestInfo(request);
    const auth = await requireApiAuth(request, {
      allowedRoles: [...PRIVILEGED_ROLES],
      audit: { entity: "Diagnostico", action: "ACCESS_DENIED", data: { op: "CONSULTOR_UPDATE", diagnosticoId } },
    });
    if (!auth.ok) return auth.response;

    const body = await request.json().catch(() => ({}));
    const analises = Array.isArray(body.analises) ? body.analises : [];
    const perguntasChave = body.perguntasChave && typeof body.perguntasChave === "object" ? body.perguntasChave : undefined;
    const status = typeof body.status === "string" ? body.status : undefined;
    const eixoRespostas = Array.isArray(body.eixoRespostas) ? body.eixoRespostas : [];

    const diagnostico = await prisma.$transaction(async (tx) => {
      const existingCount = await tx.diagnosticoVersion.count({
        where: { diagnosticoId },
      });
      if (analises.length > 0) {
        await tx.eixoAnaliseConsultor.deleteMany({
          where: { diagnosticoId },
        });
        await tx.eixoAnaliseConsultor.createMany({
          data: analises.map((item: any) => ({
            diagnosticoId,
            eixoKey: item.eixoKey,
            positivoParte3: item.positivoParte3 || null,
            negativoParte3: item.negativoParte3 || null,
            solucaoParte3: item.solucaoParte3 || null,
          })),
        });
      }

      if (perguntasChave) {
        await tx.perguntasChaveResposta.upsert({
          where: { diagnosticoId },
          update: {
            ...perguntasChave,
          },
          create: {
            diagnosticoId,
            ...perguntasChave,
          },
        });
      }

      if (eixoRespostas.length > 0) {
        await Promise.all(
          eixoRespostas.map((item: any) =>
            tx.eixoResposta.updateMany({
              where: { diagnosticoId, eixoKey: item.eixoKey },
              data: {
                positivoNotaConsultor: item.positivoNotaConsultor ?? null,
                negativoNotaConsultor: item.negativoNotaConsultor ?? null,
                solucaoNotaConsultor: item.solucaoNotaConsultor ?? null,
              },
            })
          )
        );
      }

      const record = await tx.diagnostico.update({
        where: { id: diagnosticoId },
        data: {
          status: status || "IN_REVIEW",
          finalizedAt: status === "FINALIZED" ? new Date() : undefined,
        },
      });

      await tx.diagnosticoVersion.create({
        data: {
          diagnosticoId,
          versionNumber: existingCount + 1,
          createdByRole: "CONSULTOR",
          snapshot: {
            status: record.status,
            analises,
            eixoRespostas,
            perguntasChave,
          },
        },
      });

      return record;
    });

    await logAudit({
      entity: "Diagnostico",
      entityId: diagnostico.id,
      action: "CONSULTOR_UPDATE",
      ipAddress,
      userAgent,
      requestId,
      data: { status: diagnostico.status, classroomSessionId: diagnostico.classroomSessionId || null },
    });

    return NextResponse.json({ id: diagnostico.id, status: diagnostico.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    const cause = error instanceof Error && error.cause instanceof Error ? error.cause.message : null;
    console.error("diagnostico consultor error", error);
    return NextResponse.json(
      {
        error: "Erro ao atualizar análise",
        ...(process.env.NODE_ENV === "development" && { detail: message, cause }),
      },
      { status: 500 }
    );
  }
}
