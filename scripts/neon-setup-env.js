#!/usr/bin/env node
/**
 * Obtém as connection strings dos branches Neon (production, preview, dev)
 * e configura:
 *   - .env.local: DATABASE_URL do branch dev
 *   - Vercel (se VERCEL_TOKEN): DATABASE_URL para Preview e Production
 *
 * Uso: source scripts/carregar-env.sh && node scripts/neon-setup-env.js
 */

const fs = require("fs");
const path = require("path");

const NEON_API_BASE = "https://console.neon.tech/api/v2";
const VERCEL_API_BASE = "https://api.vercel.com";

async function neonFetch(path, options = {}) {
  const key = process.env.NEON_API_KEY;
  if (!key || key.length < 20) {
    throw new Error("NEON_API_KEY não definido ou inválido. Defina em .env.local.");
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

async function getConnectionUri(projectId, branchId, databaseName, roleName) {
  const params = new URLSearchParams({
    branch_id: branchId,
    database_name: databaseName,
    role_name: roleName,
  });
  const res = await neonFetch(`/projects/${projectId}/connection_uri?${params}`);
  return res.connection_uri || res.uri || null;
}

async function main() {
  console.log("🔐 Neon: obtendo connection strings dos branches...\n");

  const orgId = process.env.NEON_ORG_ID || "";
  const projectsPath = orgId ? `/projects?org_id=${encodeURIComponent(orgId)}` : "/projects";
  const projectsRes = await neonFetch(projectsPath);
  const projects = projectsRes.projects || [];
  if (projects.length === 0) {
    if (orgId) throw new Error("Nenhum projeto encontrado. Verifique NEON_ORG_ID.");
    throw new Error("Nenhum projeto Neon encontrado. Se usar organização, defina NEON_ORG_ID no .env.local (Neon Console → Settings → Organization ID).");
  }
  const projectId = process.env.NEON_PROJECT_ID || projects[0].id;
  const project = projects.find((p) => p.id === projectId) || projects[0];
  console.log(`📁 Projeto: ${project.name} (${project.id})`);

  const branchesRes = await neonFetch(`/projects/${projectId}/branches`);
  const branches = branchesRes.branches || [];
  const mainBranch = branches.find((b) => b.name === "main" || b.name === "production" || b.default) || branches[0];
  if (!mainBranch) throw new Error("Nenhum branch encontrado.");

  const dbRes = await neonFetch(`/projects/${projectId}/branches/${mainBranch.id}/databases`);
  const databases = dbRes.databases || [];
  const databaseName = (databases[0]?.name || databases.find((d) => d.name === "neondb")?.name) || "neondb";
  const roleName = databases[0]?.owner_name || "neondb_owner";

  const branchNames = [
    { key: "production", prefer: ["main", "production"] },
    { key: "preview", prefer: ["preview"] },
    { key: "dev", prefer: ["dev"] },
  ];

  const uris = {};
  for (const { key, prefer } of branchNames) {
    const branch = branches.find((b) => prefer.includes(b.name));
    if (!branch) {
      console.log(`⏭️  Branch "${prefer[0]}" não encontrado; pulando.`);
      continue;
    }
    const uri = await getConnectionUri(projectId, branch.id, databaseName, roleName);
    if (uri) {
      uris[key] = uri;
      console.log(`✅ ${key}: ${branch.name} (${branch.id})`);
    }
  }

  if (!uris.dev && !uris.preview && !uris.production) {
    throw new Error("Nenhuma connection string obtida.");
  }

  const rootDir = path.resolve(__dirname, "..");
  const envPath = path.join(rootDir, ".env.local");

  if (uris.dev) {
    let envContent = "";
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8");
      if (envContent.includes("DATABASE_URL=")) {
        envContent = envContent.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${uris.dev}"`);
      } else {
        envContent = envContent.trimEnd() + "\nDATABASE_URL=\"" + uris.dev + "\"\n";
      }
    } else {
      envContent = `DATABASE_URL="${uris.dev}"\n`;
    }
    fs.writeFileSync(envPath, envContent, "utf8");
    console.log("\n✅ .env.local atualizado com DATABASE_URL do branch dev.");
  }

  if (process.env.VERCEL_TOKEN && (uris.preview || uris.production)) {
    let projectIdVercel = process.env.VERCEL_PROJECT_ID;
    if (!projectIdVercel) {
      try {
        const p = JSON.parse(fs.readFileSync(path.join(rootDir, ".vercel/project.json"), "utf8"));
        projectIdVercel = p.projectId;
      } catch {
        projectIdVercel = null;
      }
    }
    const teamQ = process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : "";
    if (projectIdVercel) {
      const listRes = await fetch(
        `${VERCEL_API_BASE}/v9/projects/${projectIdVercel}/env${teamQ}`,
        { headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` } }
      );
      const list = listRes.ok ? await listRes.json() : {};
      const envs = list.envs || list || [];
      for (const target of ["preview", "production"]) {
        const uri = target === "preview" ? uris.preview : uris.production;
        if (!uri) continue;
        const existing = Array.isArray(envs) && envs.find((e) => e.key === "DATABASE_URL" && (e.target || []).includes(target));
        const url = existing
          ? `${VERCEL_API_BASE}/v9/projects/${projectIdVercel}/env/${existing.id}${teamQ}`
          : `${VERCEL_API_BASE}/v10/projects/${projectIdVercel}/env${teamQ}`;
        const body = existing
          ? { value: uri, type: "encrypted", target: [target] }
          : { key: "DATABASE_URL", value: uri, type: "encrypted", target: [target] };
        const r = await fetch(url, {
          method: existing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          },
          body: JSON.stringify(body),
        });
        if (r.ok) {
          console.log(`✅ Vercel: DATABASE_URL definido para ${target}.`);
        } else {
          console.warn(`⚠️  Vercel ${target}: ${r.status} ${await r.text()}`);
        }
      }
    } else {
      console.log("\n⚠️  Projeto Vercel não encontrado (.vercel/project.json); configure DATABASE_URL manualmente.");
    }
  } else {
    console.log("\n📋 Configure na Vercel (Settings → Environment Variables):");
    if (uris.preview) console.log("   Preview:    DATABASE_URL =", uris.preview.substring(0, 50) + "...");
    if (uris.production) console.log("   Production: DATABASE_URL =", uris.production.substring(0, 50) + "...");
  }

  console.log("\n✅ Concluído.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
