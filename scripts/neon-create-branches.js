#!/usr/bin/env node
/**
 * Cria os branches "preview" e "dev" no projeto Neon (a partir do branch padrão).
 * Usa NEON_API_KEY do ambiente (ex.: carregado de .env.local).
 *
 * Uso:
 *   source scripts/carregar-env.sh   # ou export NEON_API_KEY=...
 *   node scripts/neon-create-branches.js
 *
 * Opcional: NEON_PROJECT_ID para fixar o projeto (senão usa o primeiro da lista).
 */

const NEON_API_BASE = "https://console.neon.tech/api/v2";

async function neonFetch(path, options = {}) {
  const key = process.env.NEON_API_KEY;
  if (!key || key.length < 20) {
    console.error("❌ NEON_API_KEY não definido ou inválido. Defina em .env.local e rode: source scripts/carregar-env.sh");
    process.exit(1);
  }
  const url = `${NEON_API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Neon API ${res.status}: ${text}`);
  }
  return res.json();
}

async function main() {
  console.log("🔐 Usando NEON_API_KEY do ambiente...\n");

  // 1) Listar projetos
  const projectsRes = await neonFetch("/projects");
  const projects = projectsRes.projects || [];
  if (projects.length === 0) {
    console.error("❌ Nenhum projeto encontrado na conta Neon.");
    process.exit(1);
  }

  const projectId = process.env.NEON_PROJECT_ID || projects[0].id;
  const project = projects.find((p) => p.id === projectId) || projects[0];
  console.log(`📁 Projeto: ${project.name} (${project.id})\n`);

  // 2) Listar branches para obter o branch padrão (parent)
  const branchesRes = await neonFetch(`/projects/${project.id}/branches`);
  const branches = branchesRes.branches || [];
  const defaultBranch = branches.find((b) => b.name === "main" || b.name === "production") ||
    branches.find((b) => b.primary === true) ||
    branches[0];
  if (!defaultBranch) {
    console.error("❌ Nenhum branch encontrado no projeto.");
    process.exit(1);
  }
  console.log(`🌿 Branch padrão (produção): ${defaultBranch.name} (${defaultBranch.id})\n`);

  const toCreate = [
    { name: "preview", env: "Vercel Preview" },
    { name: "dev", env: "Local (.env.local)" },
  ];

  const created = [];

  for (const { name, env } of toCreate) {
    if (branches.some((b) => b.name === name)) {
      console.log(`⏭️  Branch "${name}" já existe; pulando.`);
      const existing = branches.find((b) => b.name === name);
      if (existing) created.push({ name, branch: existing, env });
      continue;
    }

    const body = {
      branch: { name, parent_id: defaultBranch.id },
      endpoints: [{ type: "read_write" }],
    };
    const createRes = await neonFetch(`/projects/${project.id}/branches`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    const branch = createRes.branch;
    const endpoints = createRes.endpoints || [];
    const host = endpoints[0]?.host || endpoints[0]?.proxy_host;
    console.log(`✅ Branch "${name}" criado: ${branch.id}${host ? ` (${host})` : ""}`);
    created.push({ name, branch, host, env });
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 Próximos passos");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("1. Abra o Neon Console → projeto → Branches.");
  console.log("2. Para cada branch (preview, dev), abra o branch e copie a Connection string.");
  console.log("3. Vercel → Settings → Environment Variables:");
  console.log("   - Preview:  DATABASE_URL = connection string do branch preview");
  console.log("   - Production: DATABASE_URL = connection string do branch production (main)");
  console.log("4. No .env.local (dev): DATABASE_URL = connection string do branch dev");
  console.log("\nVer guia completo: docs/BASES_DEV_PREVIEW_PROD.md");
  console.log("Como obter o token: docs/NEON_TOKEN_E_BRANCHES.md\n");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
