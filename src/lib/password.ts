/**
 * Utilitários de senha com suporte a senhas longas (>72 bytes).
 * bcrypt limita a 72 bytes; fazemos pré-hash SHA-256 para normalizar qualquer tamanho.
 */
import { createHash } from "crypto";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 10;

/** Normaliza a senha para bcrypt (SHA-256 em hex). Evita truncamento em senhas longas. */
export function prepareForBcrypt(plain: string): string {
  return createHash("sha256").update(plain, "utf8").digest("hex");
}

/** Hash para armazenar no banco (pré-hash + bcrypt). */
export async function hashPassword(plain: string): Promise<string> {
  const prepared = prepareForBcrypt(plain);
  return bcrypt.hash(prepared, BCRYPT_ROUNDS);
}

/**
 * Verifica senha contra hash. Suporta:
 * - hash novo: bcrypt(prepareForBcrypt(plain))
 * - hash legado: bcrypt(plain) para compatibilidade com usuários existentes
 */
export async function verifyPassword(plain: string, storedHash: string): Promise<boolean> {
  const prepared = prepareForBcrypt(plain);
  // Novo formato (senhas longas)
  if (await bcrypt.compare(prepared, storedHash)) return true;
  // Legado (senhas antigas sem pré-hash)
  return bcrypt.compare(plain, storedHash);
}
