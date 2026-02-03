import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const loadDatabaseUrlFromEnvFiles = () => {
  if (process.env.DATABASE_URL) return;
  const root = process.cwd();
  const candidates = [".env.local", ".env"];
  for (const filename of candidates) {
    const filePath = path.join(root, filename);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, "utf8");
    const match = content.match(/DATABASE_URL=\"([^\"]+)\"/);
    if (match?.[1]) {
      process.env.DATABASE_URL = match[1];
      break;
    }
  }
};

loadDatabaseUrlFromEnvFiles();

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
