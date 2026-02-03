import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolvePrefeitoMandato } from "@/lib/diagnostico/prefeito-mandato";
import { extractRequestInfo, verifyToken, canJoinSession } from "@/lib/classroom";
import { logAudit } from "@/lib/audit";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const includeEixos = searchParams.get("includeEixos") === "1";
    const municipioUf = searchParams.get("municipioUf");
    const updatedAtFrom = searchParams.get("updatedAtFrom"); // ISO date or date string (inclusive start)
    const updatedAtTo = searchParams.get("updatedAtTo"); // ISO date or date string (inclusive end)
    const submittedFromRoomOnly = searchParams.get("submittedFromRoomOnly") === "1"; // somente diagnósticos que tiveram sala e foram enviados
    const isPrivileged =
      !!session?.user &&
      ["ADMIN", "SUPERCONSULTOR", "CONSULTOR"].includes(session.user.role);

    // Deny-by-default: sem sessão, só liberamos o modo "estado" (municipioUf),
    // e sempre com payload sanitizado (sem PII e sem textos).
    if (!isPrivileged && !municipioUf) {
      const { ipAddress, userAgent, requestId } = extractRequestInfo(request);
      await logAudit({
        entity: "Diagnostico",
        entityId: requestId,
        action: "ACCESS_DENIED",
        performedBy: session?.user?.id || null,
        userId: session?.user?.id || null,
        ipAddress,
        userAgent,
        requestId,
        data: { op: "LIST", reason: "UNAUTHENTICATED_PUBLIC_LIST_BLOCKED" },
      });
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Para acesso público (com municipioUf), nunca expomos diagnósticos em rascunho/revisão.
    const publicStatusFilter = { in: ["SUBMITTED", "FINALIZED"] as any[] };

    const buildDateFilter = () => {
      const cond: { gte?: Date; lte?: Date } = {};
      if (updatedAtFrom) {
        const d = new Date(updatedAtFrom);
        if (!Number.isNaN(d.getTime())) {
          const start = new Date(d);
          start.setUTCHours(0, 0, 0, 0);
          cond.gte = start;
        }
      }
      if (updatedAtTo) {
        const d = new Date(updatedAtTo);
        if (!Number.isNaN(d.getTime())) {
          const end = new Date(d);
          end.setUTCHours(23, 59, 59, 999);
          cond.lte = end;
        }
      }
      return Object.keys(cond).length ? cond : undefined;
    };
    const dateFilter = buildDateFilter();

    const diagnosticos = isPrivileged
      ? await prisma.diagnostico.findMany({
          where: {
            ...(status ? { status: status as any } : {}),
            ...(municipioUf ? { municipio: { uf: municipioUf } } : {}),
            ...(dateFilter ? { updatedAt: dateFilter as any } : {}),
            ...(submittedFromRoomOnly ? { classroomSessionId: { not: null } } : {}),
          },
          orderBy: { updatedAt: "desc" },
          take: 1000,
          include: {
            eixos: includeEixos,
            _count: { select: { versions: true } },
          },
        })
      : await prisma.diagnostico.findMany({
          where: {
            status: publicStatusFilter as any,
            ...(municipioUf ? { municipio: { uf: municipioUf } } : {}),
          },
          orderBy: { updatedAt: "desc" },
          take: 2000,
          select: {
            id: true,
            municipioIbgeId: true,
            status: true,
            updatedAt: true,
            _count: { select: { versions: true } },
            eixos: includeEixos
              ? {
                  select: {
                    eixoKey: true,
                    positivoNota: true,
                    positivoNotaConsultor: true,
                    negativoNota: true,
                    negativoNotaConsultor: true,
                    solucaoNota: true,
                    solucaoNotaConsultor: true,
                  },
                }
              : false,
          },
        });

    return NextResponse.json({ diagnosticos });
  } catch (error) {
    console.error("diagnostico list error", error);
    return NextResponse.json(
      { error: "Erro ao listar diagnósticos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { ipAddress, userAgent, requestId } = extractRequestInfo(request);
    const body = await request.json();
    const {
      id,
      municipioIbgeId,
      cnpj,
      respondentName,
      respondentEmail,
      respondentPhone,
      consentLgpd,
      status,
      eixoRespostas = [],
      perguntasChave,
      consultantId,
      dataDiagnostico,
      cicloGestaoInicio,
      cicloGestaoFim,
      classroomCode,
      classroomToken,
      classroomSessionId,
      baseVersionNumber,
    } = body;

    const diagnosticoDate = dataDiagnostico ? new Date(dataDiagnostico) : new Date();

    let classroomSessionToLink:
      | {
          id: string;
          status: string;
          expiresAt: Date | null;
          cicloGestaoInicio: number | null;
          cicloGestaoFim: number | null;
        }
      | null = null;

    // MVP: sala pode ser acessada só por código; token opcional
    if (classroomCode) {
      const classroom = await prisma.classroomSession.findUnique({
        where: { code: String(classroomCode).trim().toUpperCase() },
        select: { id: true, tokenHash: true, status: true, expiresAt: true, cicloGestaoInicio: true, cicloGestaoFim: true, municipioIbgeId: true },
      });

      if (!classroom) {
        return NextResponse.json({ error: "Sala não encontrada" }, { status: 404 });
      }
      if (classroom.expiresAt && classroom.expiresAt.getTime() < Date.now()) {
        return NextResponse.json({ error: "Sala expirada" }, { status: 410 });
      }
      if (!canJoinSession(classroom.status)) {
        return NextResponse.json({ error: "Sala indisponível" }, { status: 409 });
      }
      if (classroom.tokenHash && classroomToken && !verifyToken(String(classroomToken), classroom.tokenHash)) {
        return NextResponse.json({ error: "Token inválido" }, { status: 403 });
      }

      classroomSessionToLink = {
        id: classroom.id,
        status: classroom.status,
        expiresAt: classroom.expiresAt,
        cicloGestaoInicio: classroom.cicloGestaoInicio ?? null,
        cicloGestaoFim: classroom.cicloGestaoFim ?? null,
      };
    }

    // Novo fluxo: sala via classroomSessionId (sem código/token visível)
    if (!classroomSessionToLink && classroomSessionId && typeof classroomSessionId === "string") {
      const classroom = await prisma.classroomSession.findUnique({
        where: { id: classroomSessionId.trim() },
        select: { id: true, status: true, expiresAt: true, cicloGestaoInicio: true, cicloGestaoFim: true, municipioIbgeId: true },
      });
      if (!classroom) {
        return NextResponse.json({ error: "Sala não encontrada" }, { status: 404 });
      }
      if (classroom.expiresAt && classroom.expiresAt.getTime() < Date.now()) {
        // Considera enviado ao expirar: bloqueia edição e marca SUBMITTED (best-effort).
        if (id) {
          await prisma.diagnostico.update({
            where: { id },
            data: { status: "SUBMITTED", submittedAt: new Date() },
          }).catch(() => null);
        }
        return NextResponse.json({ error: "Prazo encerrado. O diagnóstico foi considerado enviado." }, { status: 410 });
      }
      if (!canJoinSession(classroom.status)) {
        return NextResponse.json({ error: "Sala indisponível" }, { status: 409 });
      }
      classroomSessionToLink = {
        id: classroom.id,
        status: classroom.status,
        expiresAt: classroom.expiresAt,
        cicloGestaoInicio: classroom.cicloGestaoInicio ?? null,
        cicloGestaoFim: classroom.cicloGestaoFim ?? null,
      };
    }

    const createVersion = body.createVersion === true || body.registrarMarco === true;
    const municipioFromClassroom = classroomSessionToLink
      ? (await prisma.classroomSession.findUnique({
          where: { id: classroomSessionToLink.id },
          select: { municipioIbgeId: true },
        }))?.municipioIbgeId ?? null
      : null;
    const municipioIbgeIdToUse = (municipioIbgeId || municipioFromClassroom || "").trim();
    if (!municipioIbgeIdToUse) {
      return NextResponse.json(
        { error: "Informe o município (municipioIbgeId) ou associe a sala a um município ao criar a sala." },
        { status: 400 }
      );
    }

    const diagnostico = await prisma.$transaction(async (tx) => {
      let recordId = id;
      if (classroomSessionToLink && !recordId) {
        const existingByRoom = await tx.diagnostico.findFirst({
          where: { classroomSessionId: classroomSessionToLink.id },
          select: { id: true },
        });
        if (existingByRoom) recordId = existingByRoom.id;
      }

      const existingCount = recordId
        ? await tx.diagnosticoVersion.count({ where: { diagnosticoId: recordId } })
        : 0;
      const mandato = await resolvePrefeitoMandato({
        client: tx,
        municipioIbgeId: municipioIbgeIdToUse,
        dataDiagnostico: diagnosticoDate,
      });
      const record = recordId
        ? await tx.diagnostico.update({
            where: { id: recordId },
            data: {
              municipioIbgeId: municipioIbgeIdToUse,
              cnpj,
              respondentName,
              respondentEmail,
              respondentPhone,
              consentLgpd: !!consentLgpd,
              status: status || undefined,
              consultantId: consultantId || undefined,
              dataDiagnostico: diagnosticoDate,
              prefeitoMandatoId: mandato?.id,
              cicloGestaoInicio:
                typeof cicloGestaoInicio === "number"
                  ? cicloGestaoInicio
                  : classroomSessionToLink?.cicloGestaoInicio ?? undefined,
              cicloGestaoFim:
                typeof cicloGestaoFim === "number"
                  ? cicloGestaoFim
                  : classroomSessionToLink?.cicloGestaoFim ?? undefined,
              classroomSessionId: classroomSessionToLink?.id ?? undefined,
            },
          })
        : await tx.diagnostico.create({
            data: {
              municipioIbgeId: municipioIbgeIdToUse,
              cnpj,
              respondentName,
              respondentEmail,
              respondentPhone,
              consentLgpd: !!consentLgpd,
              status: status || "DRAFT",
              consultantId: consultantId || undefined,
              dataDiagnostico: diagnosticoDate,
              prefeitoMandatoId: mandato?.id,
              cicloGestaoInicio:
                typeof cicloGestaoInicio === "number"
                  ? cicloGestaoInicio
                  : classroomSessionToLink?.cicloGestaoInicio ?? undefined,
              cicloGestaoFim:
                typeof cicloGestaoFim === "number"
                  ? cicloGestaoFim
                  : classroomSessionToLink?.cicloGestaoFim ?? undefined,
              classroomSessionId: classroomSessionToLink?.id ?? undefined,
            },
          });

      if (createVersion) {
        await tx.diagnosticoVersion.create({
          data: {
            diagnosticoId: record.id,
            versionNumber: existingCount + 1,
            createdByRole: body.role || "MUNICIPIO",
            snapshot: {
              municipioIbgeId: municipioIbgeIdToUse,
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
              cicloGestaoInicio:
                typeof cicloGestaoInicio === "number"
                  ? cicloGestaoInicio
                  : classroomSessionToLink?.cicloGestaoInicio ?? record.cicloGestaoInicio ?? null,
              cicloGestaoFim:
                typeof cicloGestaoFim === "number"
                  ? cicloGestaoFim
                  : classroomSessionToLink?.cicloGestaoFim ?? record.cicloGestaoFim ?? null,
              classroomSessionId: classroomSessionToLink?.id ?? record.classroomSessionId ?? null,
            },
          },
        });
      }

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

      return { record, versionNumber: createVersion ? existingCount + 1 : existingCount, versionCreated: createVersion };
    });

    await logAudit({
      entity: "Diagnostico",
      entityId: diagnostico.record.id,
      action: id ? "UPDATE" : "CREATE",
      performedBy: consultantId || null,
      userId: consultantId || null,
      ipAddress,
      userAgent,
      requestId,
      data: {
        status: diagnostico.record.status,
        classroomSessionId: diagnostico.record.classroomSessionId || null,
        versionCreated: diagnostico.versionCreated,
      },
    });

    return NextResponse.json({
      id: diagnostico.record.id,
      versionNumber: diagnostico.versionNumber,
      versionCreated: diagnostico.versionCreated,
    });
  } catch (error) {
    console.error("diagnostico create error", error);
    return NextResponse.json(
      { error: "Erro ao salvar diagnóstico" },
      { status: 500 }
    );
  }
}
