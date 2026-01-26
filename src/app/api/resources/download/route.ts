import { NextRequest, NextResponse } from "next/server";

// TODO: Implementar registro no banco de dados usando Prisma
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resourceId, userId, ipAddress, userAgent } = body;

    // Aqui você implementaria o registro no banco:
    // const download = await prisma.resourceDownload.create({
    //   data: {
    //     resourceId,
    //     userId: userId || null,
    //     ipAddress: request.headers.get('x-forwarded-for') || null,
    //     userAgent: request.headers.get('user-agent') || null,
    //   }
    // });

    // Por enquanto, apenas retornamos sucesso
    return NextResponse.json(
      { success: true, message: "Download registrado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao registrar download:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao registrar download" },
      { status: 500 }
    );
  }
}
