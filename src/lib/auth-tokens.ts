import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import type { AuthTokenType } from "@prisma/client";

export function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createAuthToken({
  userId,
  type,
  ttlMinutes = 30,
}: {
  userId: string;
  type: AuthTokenType;
  ttlMinutes?: number;
}) {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  await prisma.authToken.create({
    data: {
      userId,
      type,
      tokenHash,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function consumeAuthToken({
  token,
  type,
}: {
  token: string;
  type: AuthTokenType;
}) {
  const tokenHash = hashToken(token);
  let record;
  try {
    record = await prisma.authToken.findFirst({
      where: { tokenHash, type },
      include: {
        user: {
          include: {
            hubAccesses: { select: { hub: true } },
            projectAccesses: { select: { projectId: true } },
          },
        },
      },
    });
  } catch (err: any) {
    if (err?.code === "P2021" && String(err?.message || "").includes("UserProjectAccess")) {
      record = await prisma.authToken.findFirst({
        where: { tokenHash, type },
        include: {
          user: {
            include: {
              hubAccesses: { select: { hub: true } },
            },
          },
        },
      });
    } else {
      throw err;
    }
  }

  if (!record) return null;
  if (record.usedAt) return null;
  if (new Date(record.expiresAt) < new Date()) return null;

  await prisma.authToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return record;
}
