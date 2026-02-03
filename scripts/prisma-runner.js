/**
 * Prisma runner que força o carregamento de .env/.env.local,
 * mesmo quando o shell tem DATABASE_URL="" (vazio), evitando P1012.
 *
 * Uso:
 *   node scripts/prisma-runner.js validate
 *   node scripts/prisma-runner.js generate
 *   node scripts/prisma-runner.js db push
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, "utf8");
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function loadEnv() {
  const root = process.cwd();
  // Precedência: .env.local sobrescreve .env
  const env = {
    ...parseEnvFile(path.join(root, ".env")),
    ...parseEnvFile(path.join(root, ".env.local")),
  };

  // Só preenche quando a env atual está ausente/vazia.
  // Mantém override explícito do shell/CI (ex.: DATABASE_URL por ambiente).
  for (const [k, v] of Object.entries(env)) {
    const current = process.env[k];
    if (current === undefined || current === null || String(current).trim() === "") {
      process.env[k] = v;
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: node scripts/prisma-runner.js <prisma args...>");
    process.exit(1);
  }

  loadEnv();

  const prismaBin = path.join(
    process.cwd(),
    "node_modules",
    ".bin",
    process.platform === "win32" ? "prisma.cmd" : "prisma"
  );

  const result = spawnSync(prismaBin, args, {
    stdio: "inherit",
    env: process.env,
  });

  process.exit(result.status ?? 1);
}

main();

