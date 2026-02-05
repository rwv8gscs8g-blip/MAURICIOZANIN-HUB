#!/usr/bin/env node
/**
 * Sincroniza DATABASE_URL_PREVIEW e DATABASE_URL_PRODUCTION do .env.local
 * para a Vercel (Environment Variables: Preview e Production).
 *
 * Uso: source scripts/carregar-env.sh && node scripts/vercel-sync-database-urls.js
 * Ou: node scripts/vercel-sync-database-urls.js  (o script carrega .env.local)
 */

const fs = require("fs");
const path = require("path");

const VERCEL_API_BASE = "https://api.vercel.com";
const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env.local");

function loadEnvLocal() {
  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local não encontrado em " + envPath);
  }
  const content = fs.readFileSync(envPath, "utf8");
  const env = {};
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    let trimmed = lines[i].replace(/\r$/, "").trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    // Valor na linha seguinte (URLs têm "=" em ?sslmode=require, não exigiramos ausência de "=")
    if (!val && i + 1 < lines.length) {
      const next = lines[i + 1].replace(/\r$/, "").trim();
      const looksLikeKey = /^[A-Za-z_][A-Za-z0-9_]*\s*=/.test(next);
      if (next && !next.startsWith("#") && !looksLikeKey) {
        val = next;
        i++;
      }
    }
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    val = val.replace(/\s+$/, "").replace(/^\s+/, "");
    env[key] = val;
  }
  return env;
}

async function main() {
  const env = loadEnvLocal();
  const token = env.VERCEL_TOKEN || process.env.VERCEL_TOKEN;
  const previewUrl = (env.DATABASE_URL_PREVIEW || "").trim();
  const productionUrl = (env.DATABASE_URL_PRODUCTION || "").trim();

  const hasPreview = previewUrl.length > 10;
  const hasProduction = productionUrl.length > 10;
  const dbKeys = Object.keys(env).filter((k) => k.includes("DATABASE"));
  console.log("   Chaves lidas do .env.local:", dbKeys.join(", ") || "(nenhuma)");
  console.log("   Tamanhos: PREVIEW=" + (env.DATABASE_URL_PREVIEW || "").length + ", PRODUCTION=" + (env.DATABASE_URL_PRODUCTION || "").length);
  if (!hasPreview && !hasProduction) {
    console.error("❌ Nenhum valor em DATABASE_URL_PREVIEW ou DATABASE_URL_PRODUCTION no .env.local.");
    process.exit(1);
  }

  if (!token) {
    console.error("❌ VERCEL_TOKEN não encontrado no .env.local");
    process.exit(1);
  }

  let projectId = env.VERCEL_PROJECT_ID || process.env.VERCEL_PROJECT_ID;
  if (!projectId) {
    try {
      const p = JSON.parse(fs.readFileSync(path.join(rootDir, ".vercel/project.json"), "utf8"));
      projectId = p.projectId;
    } catch {
      console.error("❌ Projeto Vercel não encontrado (.vercel/project.json)");
      process.exit(1);
    }
  }

  const teamId = env.VERCEL_TEAM_ID || process.env.VERCEL_TEAM_ID || (() => {
    try {
      const p = JSON.parse(fs.readFileSync(path.join(rootDir, ".vercel/project.json"), "utf8"));
      return p.orgId || "";
    } catch {
      return "";
    }
  })();
  const teamQ = teamId ? `?teamId=${teamId}` : "";

  console.log("📤 Sincronizando DATABASE_URL para a Vercel...\n");

  const listRes = await fetch(
    `${VERCEL_API_BASE}/v9/projects/${projectId}/env${teamQ}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!listRes.ok) {
    console.error("❌ Falha ao listar env da Vercel:", listRes.status, await listRes.text());
    process.exit(1);
  }
  const list = await listRes.json();
  const envs = list.envs || list || [];

  for (const target of ["preview", "production"]) {
    const value = target === "preview" ? previewUrl : productionUrl;
    if (!value || value.length < 10) {
      console.log(`⏭️  DATABASE_URL_${target.toUpperCase()} vazio ou curto no .env.local; pulando.`);
      continue;
    }
    const existing = Array.isArray(envs) && envs.find((e) => e.key === "DATABASE_URL" && (e.target || []).includes(target));
    const url = existing
      ? `${VERCEL_API_BASE}/v9/projects/${projectId}/env/${existing.id}${teamQ}`
      : `${VERCEL_API_BASE}/v10/projects/${projectId}/env${teamQ}`;
    const body = existing
      ? { value, type: "encrypted", target: [target] }
      : { key: "DATABASE_URL", value, type: "encrypted", target: [target] };
    const r = await fetch(url, {
      method: existing ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (r.ok) {
      console.log(`✅ Vercel: DATABASE_URL definido para ${target}.`);
    } else {
      console.error(`❌ Vercel ${target}:`, r.status, await r.text());
    }
  }

  console.log("\n✅ Concluído.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
