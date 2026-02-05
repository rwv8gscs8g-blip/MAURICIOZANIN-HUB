# Versionamento e Deploy – Guia para IAs

> **Propósito:** Garantir que Preview e Production usem a mesma versão (mesmo código). O incremento automático nos 3 últimos dígitos permite rastrear qual build está em cada ambiente.

## Regras Obrigatórias

### 1. Formato da Versão

- **Arquivo:** `.version` (raiz do projeto)
- **Formato:** `V{MAJOR}.{MINOR}.{PATCH}` — ex: `V1.0.000`, `V1.0.001`
- **Incremento:** Sempre nos 3 últimos dígitos (PATCH)

### 2. Quando Incrementar

| Script              | Incrementa? | Motivo                                                    |
|---------------------|------------|-----------------------------------------------------------|
| `deploy-full.sh`    | Sim        | Uma vez no início; mesma versão para Preview e Production |
| `deploy-preview.sh` | Sim        | Cada deploy de Preview tem versão própria                 |
| `deploy-production.sh` | Não     | Usa a versão do Preview promovido (mesmo build)           |

### 3. Garantia: Mesmo Código = Mesma Versão

No `deploy-full.sh`:

1. Incrementa versão **uma única vez** no início
2. Build Preview usa essa versão
3. Build Production usa **a mesma versão**
4. Ambos os ambientes exibem a mesma `NEXT_PUBLIC_VERSION`

Assim, se Preview e Production mostram `V1.0.042`, é o mesmo build em ambos.

### 4. Fluxo Técnico

```
deploy-full.sh:
  → version-manager.js increment patch   # Ex: V1.0.000 → V1.0.001
  → pre-build.js (lê .version)
  → npm run build
  → vercel build
  → deploy Preview
  → [confirmação]
  → pre-build.js (lê .version, SEM incrementar)
  → vercel build --prod
  → deploy Production
```

### 5. Arquivos Envolvidos

| Arquivo                   | Função                                        |
|---------------------------|-----------------------------------------------|
| `.version`                | Versão atual (ex: `V1.0.001`)                 |
| `scripts/version-manager.js` | Ler/incrementar versão                     |
| `scripts/pre-build.js`    | Gera `.env.build` com `NEXT_PUBLIC_VERSION`   |

### 6. Comandos Manuais

```bash
# Ver versão atual
node scripts/version-manager.js get

# Incrementar patch (V1.0.001 → V1.0.002)
node scripts/version-manager.js increment patch

# Incrementar minor (V1.0.002 → V1.1.000)
node scripts/version-manager.js increment minor
```

### 7. Commit do `.version`

Após deploy, commite o `.version` atualizado para que:

- O histórico reflita a versão em produção
- O próximo deploy incremente a partir da base correta

---

## Para Outras IAs

1. **Não** remova o incremento de versão dos scripts de deploy.
2. **Não** faça o pre-build incrementar a versão; o incremento ocorre nos scripts de deploy.
3. Mantenha o formato `V{MAJOR}.{MINOR}.{PATCH}` com PATCH em 3 dígitos.
4. `deploy-production.sh` não deve incrementar; ele promove o build do Preview.
