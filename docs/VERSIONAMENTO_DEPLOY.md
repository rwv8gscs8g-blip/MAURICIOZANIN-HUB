# Versionamento e Deploy – Guia para IAs

> **Propósito:** Toda nova bateria de mudanças em **DEV** já queima uma nova versão (incremento de PATCH).  
> Preview e Production **não** incrementam versão; eles apenas refletem a versão testada e queimada em DEV.

## 1. Formato da versão

- **Arquivo:** `.version` (raiz do projeto)  
- **Formato:** `V{MAJOR}.{MINOR}.{PATCH}` — ex.: `V1.0.000`, `V1.0.001`  
- **PATCH:** sempre 3 dígitos; identifica o “conjunto” de mudanças de código.

O rodapé lê a versão via:

- `scripts/pre-build.js` → gera `.env.build` com `NEXT_PUBLIC_VERSION`  
- `src/lib/version.ts` → `getVersionInfo()` → `VersionFooter`.

## 2. Regra central

1. **DEV é o único lugar que queima versão.**  
   - A cada nova bateria de mudanças/correções significativa, incremente o PATCH em DEV.
   - Isso grava a nova versão em `.version` e passa a valer para DEV, Preview e Production.
2. **Preview e Production nunca mudam a versão.**  
   - Eles apenas leem `.version` (via `pre-build.js` e variáveis NEXT_PUBLIC_*).
3. **Mesmo código = mesma versão.**  
   - Se DEV, Preview e Production mostram `Deploy: V1.0.038`, todos estão rodando o mesmo conjunto de funcionalidades, diferenciadas apenas pelo `Build` (SHA do commit) e pelo ambiente (DEV/PREVIEW/PROD).

## 3. Como queimar nova versão em DEV

Quando uma nova bateria de mudanças estiver pronta para testes:

```bash
cd /Users/macbookpro/Projetos/MAURICIOZANIN-HUB

# Ver versão atual
node scripts/version-manager.js get

# Queimar nova versão (incrementar PATCH: V1.0.037 → V1.0.038)
node scripts/version-manager.js increment patch
# ou: npm run version:increment
```

Depois disso (via comando manual acima **ou** automaticamente pelo `deploy-full.sh`, ver abaixo):

- `.version` é atualizado (ex.: `V1.0.038`).
- O rodapé em DEV já mostra `Deploy: V1.0.038` com o `Build` do commit atual.
- O próximo deploy de Preview/Production deve usar essa versão, **sem** voltar a incrementá-la.

## 4. Comportamento dos scripts

### 4.1 `scripts/pre-build.js`

- **Não incrementa** versão em nenhuma condição.  
- Sempre:

```text
→ lê versão atual via: node scripts/version-manager.js get
→ calcula BUILD (SHA do commit, se possível)
→ escreve .env.build / .env.local.build com:
   NEXT_PUBLIC_VERSION
   NEXT_PUBLIC_BUILD
   NEXT_PUBLIC_BUILD_DATE
   NEXT_PUBLIC_ENVIRONMENT
   NEXT_PUBLIC_GIT_SHA
```

### 4.2 `scripts/deploy-preview.sh` (npm run deploy:preview)

- Assume que a versão já foi queimada em DEV.  
- Fluxo simplificado:

```text
→ mostra versão atual (node scripts/version-manager.js get)
→ export NODE_ENV=production, VERCEL_ENV=preview
→ node scripts/pre-build.js           # usa versão atual, sem incrementar
→ carrega .env.build
→ npm run build
→ vercel build
→ vercel deploy --prebuilt (Preview)
```

O Preview exibirá no rodapé:

- `Deploy: Vx.y.zzz` (mesma de DEV)
- `PREVIEW`
- `Build: <sha do commit>`

### 4.3 `scripts/deploy-production.sh` (npm run deploy:prod)

- Exige:
  - `.release/preview.json` (Preview feito para este commit)
  - `.release/qa.json` (QA aprovado para este commit)
- Não incrementa nem lê `.version` diretamente; usa os valores do Preview:

```text
→ lê .release/preview.json (version, build, gitSha)
→ exporta NEXT_PUBLIC_VERSION / NEXT_PUBLIC_BUILD a partir do Preview
→ export NODE_ENV=production, VERCEL_ENV=production
→ vercel deploy --prebuilt --prod
```

Production exibirá **a mesma versão** e **mesmo build** do Preview aprovado.

### 4.4 `scripts/deploy-full.sh` (npm run deploy:full)

- **Incrementa** a versão (PATCH) **uma vez no início**, em DEV, para marcar a bateria de mudanças:

```text
→ node scripts/version-manager.js increment patch   # queima nova versão em DEV
→ mostra a versão do deploy
→ executa fluxo Preview (como no deploy-preview.sh)
→ executa fluxo Production (como no deploy-production.sh), usando mesma versão/build do Preview
```

- Resultado: com um único comando você:
  - queima a nova versão em DEV,
  - faz deploy para Preview,
  - promove para Produção com a **mesma** versão e build.

## 5. Commit do `.version`

Após um ciclo de deploy (Preview e eventualmente Production):

1. **Sempre** inclua `.version` no commit relacionado àquela bateria de mudanças.  
2. Isso garante que:
   - O histórico Git reflita a versão que realmente foi usada em produção.
   - O próximo ciclo comece do número correto (`increment patch` parte da base certa).

## 6. Resumo para outras IAs (checklist)

1. Antes de mexer com deploy, **leia este arquivo**.  
2. Para queimar nova versão em DEV:

```bash
node scripts/version-manager.js increment patch
```

3. **Não** faça `pre-build.js` ou scripts de deploy incrementarem versão.  
4. Preview e Production devem sempre refletir a última versão queimada em DEV (mesmo `Deploy: Vx.y.zzz`), mudando apenas:
   - o `Build` (SHA do commit),
   - e o ambiente (DEV / PREVIEW / PROD). 
