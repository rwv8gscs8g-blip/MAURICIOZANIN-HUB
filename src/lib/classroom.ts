import { createHash, randomBytes, timingSafeEqual, randomUUID } from "crypto";

export function generateRoomCode(): string {
  // Código curto e fácil de digitar (sem caracteres ambíguos)
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

export function generateMagicToken(): string {
  // Token “mágico” para uso em sala (não salvar em plain)
  // 12 bytes -> 24 hex chars
  return randomBytes(12).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function verifyToken(token: string, storedHash: string): boolean {
  try {
    const given = Buffer.from(hashToken(token), "hex");
    const stored = Buffer.from(storedHash, "hex");
    if (given.length !== stored.length) return false;
    return timingSafeEqual(given, stored);
  } catch {
    return false;
  }
}

export function generateRequestId(): string {
  try {
    return randomUUID();
  } catch {
    return randomBytes(16).toString("hex");
  }
}

export function extractRequestInfo(request: Request): {
  ipAddress: string | null;
  userAgent: string | null;
  requestId: string;
} {
  const headers = request.headers;
  const forwardedFor = headers.get("x-forwarded-for");
  const ipAddress =
    (forwardedFor ? forwardedFor.split(",")[0]?.trim() : null) ||
    headers.get("x-real-ip") ||
    null;
  const userAgent = headers.get("user-agent") || null;
  const requestId = headers.get("x-request-id") || generateRequestId();
  return { ipAddress, userAgent, requestId };
}

export function canJoinSession(status: string): boolean {
  return status === "PREPARACAO" || status === "ATIVA";
}

