import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { encrypt, decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type LoginOptions = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: string;
    avatarUrl?: string | null;
    clientOrganizationId?: string | null;
    clientAccessApproved?: boolean | null;
    hubAccesses?: string[];
    projectAccesses?: string[];
  };
  sessionMinutes?: number;
};

export async function login({ user, sessionMinutes = 60 }: LoginOptions) {
  const expires = new Date(Date.now() + sessionMinutes * 60 * 1000);
  const sessionId = uuidv4();
  const session = await encrypt({ user, sessionId, expires }, `${sessionMinutes}m`);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      currentSessionId: sessionId,
      lastLogin: new Date(),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
}

export async function logout() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (sessionCookie) {
    const payload = await decrypt(sessionCookie);
    if (payload?.user?.id) {
      await prisma.user.update({
        where: { id: payload.user.id },
        data: { currentSessionId: null },
      });
    }
  }

  cookieStore.set("session", "", {
    expires: new Date(0),
    path: "/",
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;

  const payload = await decrypt(session);
  if (!payload?.user) return null;

  if (payload.expires && new Date(payload.expires) < new Date()) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.user.id },
    select: { currentSessionId: true },
  });

  if (user?.currentSessionId && user.currentSessionId !== payload.sessionId) {
    return null;
  }

  return payload;
}

export async function requireAuth(allowedRoles: string[] = []) {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Acesso negado: faça login.");
  }
  if (allowedRoles.length > 0 && !allowedRoles.includes(session.user.role)) {
    throw new Error("Acesso negado: perfil sem permissão.");
  }
  return session;
}

export async function requireHubAccess(hub: string, allowedRoles: string[] = []) {
  const session = await requireAuth(allowedRoles);
  if (session.user.role === "ADMIN") return session;
  const hubs = session.user.hubAccesses || [];
  if (hubs.includes(hub)) return session;
  const resource = await prisma.resourceAccess.findFirst({
    where: { userId: session.user.id, hubAxis: hub as any },
    select: { id: true },
  });
  if (!resource) throw new Error("Acesso negado: hub não autorizado.");
  return session;
}
