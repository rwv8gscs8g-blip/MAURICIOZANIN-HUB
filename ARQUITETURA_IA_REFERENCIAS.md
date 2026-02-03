# Referencias de Arquitetura (IA) - Cidade Empreendedora

Este documento consolida as consideracoes integrais das IAs consultadas para
preservar contexto de arquitetura, seguranca, compliance e estrategia de MVP.
Nao e um plano de implementacao; e base de consulta para decisoes.

Data de consolidacao: 2026-02-01

---

## 1) Antigravity (v2.0 - Deep Dive)

### Seguranca e permissoes
- Modelo hibrido RBAC + ACL (ResourceAccess).
- Anti-IDOR: checagem de propriedade antes de responder requests.
- "Deny by default" em rotas e APIs.
- Heranca de acesso: Cliente -> Unidade -> Turma -> Diagnostico.

### Auditoria e LGPD
- AuditLog append-only (imutavel).
- Separacao de dados pessoais vs dados publicos.
- Consentimento registrado, retencao e anonimizacao.

### Sala de aula
- Token magico + sala.
- Conflitos de respostas com mediacao do consultor.
- Upgrade de identidade (anonimo -> conta real).

### Maturidade
- Pontuacao ponderada + perguntas knockout.
- Versionamento por ciclo (4 anos).

### Relatorios
- Radar, ranking, plano de acao.
- PDF com layout consistente.

### Decisoes criticas listadas
- WebSockets vs Polling.
- PDF server-side vs client-side.
- Autenticacao gov.br agora ou fase 2.

---

## 2) Claude Opus (Compliance e Governanca)

### Principios
- Isolamento forte de tenants.
- Rastreabilidade total (audit trails).
- Minimização de dados (LGPD).
- Soft-delete para compliance.

### Modelo de dados (conceitual)
- Tenants, Users, Municipios, Salas, Diagnosticos, Respostas, Produtos.
- Separacao de dados pessoais e publicos.
- Logs imutaveis e particionados por tempo.

### LGPD / Compliance
- RIPD, DPO, termos de uso e politicas.
- Retencao minima 5 anos (auditoria publica).
- Exportacao e anonimização para titulares.

### Seguranca
- RLS ou isolamento por tenant rigoroso.
- Trilhas de auditoria para todas as alteracoes.
- Monitoramento e alertas de acesso indevido.

---

## 3) Gemini (Pragmatismo MVP)

### Simplificacoes recomendadas
- Formularios hardcoded no MVP (sem Form Builder).
- Polling com avisos de conflito (sem WebSockets).
- Relatorios HTML print-friendly (sem PDF server-side no MVP).
- RLS preferivel; alternativa MVP com checagem rigorosa na app.

### Roadmap MVP (3-4 meses)
- M1: Fundacao + Eixo 5 hardcoded.
- M2: Maturidade + recomendacao.
- M3: Relatorio + ranking basico.
- M4: Refinos + testes de campo.

### Riscos observados
- Conectividade fraca em sala -> autosave + localStorage.
- Fraude de respostas -> evidencias para niveis avancados.
- LGPD -> minimizar dados (ex.: hash de CPF).

---

## 4) Perplexity (Compliance + Benchmarks)

### LGPD
- Base legal clara (politica publica).
- Minimização e retencao limitada.
- Consentimento granular quando necessario.
- Direitos do titular (acesso, revogacao, exportacao).

### Auditoria
- Logs append-only com hash para nao-repudio.
- Recomendacao de ISO 27001/27701.
- Auditorias regulares (NAT/TCU).

### Benchmarks
- Modelos de maturidade em compras publicas (MGIC).
- Metricas comparativas e autoavaliacao.

---

## 5) Decisoes aprovadas para MVP

- Formularios hardcoded (TS).
- Sala de aula com token magico + codigo curto.
- Conflitos com avisos + mediacao consultor.
- Relatorios HTML print-friendly.
- RBAC + ACL com deny-by-default.
- Auditoria append-only basica, expandir depois.

---

## 6) Pendencias e proximos passos

- Consolidar modelo de dados final do diagnostico.
- Definir criterios de maturidade e knockout.
- Estruturar plano de acao e recomendacao de produtos.
- Definir estrategia de logs imutaveis e retenção.

