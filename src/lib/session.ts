import { SignJWT, jwtVerify } from "jose";


function getKey() {
  const SECRET_KEY = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!SECRET_KEY && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET não configurado para produção.");
  }
  return new TextEncoder().encode(
    SECRET_KEY || `dev-temp-${process.env.NODE_ENV || "development"}`
  );
}

export async function encrypt(payload: any, expiresIn: string = "1h") {
  const key = getKey();
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}

export async function decrypt(input: string): Promise<any | null> {
  const key = getKey();
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}
