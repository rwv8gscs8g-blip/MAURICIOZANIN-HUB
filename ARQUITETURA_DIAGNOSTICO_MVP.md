# Arquitetura do Diagnostico (MVP)

Este documento registra as decisoes aprovadas para o MVP do diagnostico
Cidade Empreendedora (Eixo 5 - Compras), com foco em seguranca, simplicidade
operacional e evolucao segura.

## Decisoes de MVP

1) Formularios hardcoded em TypeScript
- Motivo: reduzir risco operacional e garantir versionamento por Git.
- Evolucao: Form Builder e Schema Registry na Fase 2.

2) Sala de aula com token magico + codigo curto
- Motivo: reduzir friccao em ambientes presenciais.
- Evolucao: upgrade de identidade (anonimo -> conta real).

3) Conflitos por polling (sem WebSockets)
- Motivo: reduzir complexidade e garantir estabilidade em redes ruins.
- Evolucao: WebSockets na Fase 2 se necessario.

4) Relatorio HTML print-friendly
- Motivo: custo menor e iteracao rapida.
- Evolucao: PDF server-side na Fase 2.

5) Seguranca com RBAC + ACL
- Motivo: permitir multi-cliente e isolamento rigoroso.
- Regra: deny-by-default em rotas e APIs.

6) Auditoria append-only
- Motivo: compliance e rastreabilidade.
- Evolucao: enriquecimento de logs (hash, particionamento).

## Proximos passos do MVP

- Implementar tabelas de sala e participantes.
- Vincular diagnostico a sala e ciclo de gestao.
- Garantir logs minimos de auditoria.
- Manter diagnostico atual funcionando enquanto evolui.


---

## Versão V1.0.002 – 2026-02-05

> Resuma aqui, manualmente, as principais mudanças de arquitetura introduzidas nesta versão.

- [TODO] Comentário de arquitetura para V1.0.002.

