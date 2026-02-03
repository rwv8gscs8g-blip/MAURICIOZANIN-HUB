import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

type ResolveMandatoArgs = {
  client?: any;
  municipioIbgeId: string;
  dataDiagnostico: Date;
};

export async function resolvePrefeitoMandato({
  client,
  municipioIbgeId,
  dataDiagnostico,
}: ResolveMandatoArgs) {
  const db = client ?? prisma;
  return db.prefeitoMandato.findFirst({
    where: {
      municipioIbgeId,
      inicioMandato: { lte: dataDiagnostico },
      OR: [{ fimMandato: null }, { fimMandato: { gte: dataDiagnostico } }],
    },
    orderBy: { inicioMandato: "desc" },
  });
}
