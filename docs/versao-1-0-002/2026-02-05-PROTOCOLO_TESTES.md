# Protocolo de Testes da Plataforma

## 1) Verificar conexão com o banco (Neon)

```bash
./scripts/check-neon.sh
```

Esperado: retorna `1`.

## 2) Sincronizar schema (Prisma)

```bash
npx prisma db push
```

## 3) Importar municípios (JSON baixados)

```bash
node scripts/import-municipios-json.js
```

## 4) Importar prefeitos PE 2024 (TSE)

```bash
node scripts/import-prefeitos-pe-2024.js
```

## 5) Rodar aplicação local

```bash
npm run dev
```

## 6) Validar UI principal

- `http://localhost:3002/diagnostico`
- Selecionar PE
- Verificar lista de municípios e status
- Iniciar diagnóstico e validar blocos (cores e layout)
