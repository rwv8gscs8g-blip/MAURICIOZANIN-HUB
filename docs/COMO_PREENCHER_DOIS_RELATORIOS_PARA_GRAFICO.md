# Como preencher dois relatórios (T0 e T1) para ver o gráfico da Radiografia

O gráfico da **Radiografia dos diagnósticos** mostra a evolução da **nota geral** do município ao longo dos marcos **T0, T1, T2, T3, T4…**. Cada ponto no gráfico é uma **versão** (marco) registrada a partir do estado atual do diagnóstico no banco.

Para ver o gráfico com **dois pontos** (T0 e T1), siga os passos abaixo.

---

## Pré-requisito

- Usuário **logado** com perfil de **consultor** (ou ADMIN/SUPERCONSULTOR), para poder usar o botão **"Registrar marco (T0/T1/T2)"** na página da Radiografia.

---

## Passo 1 — Escolher um município e criar o primeiro diagnóstico (T0)

1. Acesse a listagem de diagnósticos:
   - **URL:** `http://localhost:3000/diagnostico?client=sebrae&unit=sebrae-nacional`
2. Faça login se necessário.
3. Na tabela **"Municípios de Pernambuco — Criar, editar e ajustar"**, escolha um município (por exemplo **Aliança** ou **Abreu e Lima**).
4. Clique em **"Criar"** (ou **"Editar"** se já existir diagnóstico).
   - O wizard do diagnóstico abre (Etapa 1 – Identificação, etc.).
5. Preencha pelo menos:
   - **Etapa 1:** Nome do responsável (obrigatório).
   - Avance até uma etapa que tenha **notas** (por exemplo uma etapa de eixos com campos "Nota positivo", "Nota negativo", "Nota solução").
   - Atribua **algumas notas** (por exemplo 2, 3 ou 4 em alguns itens) para que a **nota geral** não fique zerada — assim o gráfico mostra um valor no T0.
6. O formulário faz **autosave**. Aguarde o indicador "Autosave: salvo" ou avance um passo para forçar o salvamento.
7. **Não feche** o wizard ainda; você vai registrar o marco em seguida.

---

## Passo 2 — Registrar o marco T0 na Radiografia

1. Abra a **Radiografia** desse município:
   - Clique no botão **"Radiografia"** (verde, ícone de gráfico) na mesma linha do município na tabela,  
   **ou**
   - Acesse diretamente: `http://localhost:3000/diagnostico/municipio/[IBGE_ID]`  
     (substitua `[IBGE_ID]` pelo código IBGE do município, ex.: Aliança = `2600706`).
2. Na página da Radiografia, no topo, clique em **"Registrar marco (T0/T1/T2)"**.
   - Isso grava o estado **atual** do diagnóstico no banco como a versão **T0** (primeiro marco).
3. Você deve ver:
   - Na seção **"Relatórios por versão"**: o botão **T0** com a data de hoje.
   - Na seção **"Radiografia dos diagnósticos"**: se houver notas no snapshot, o **gráfico** pode continuar vazio até haver mais de um ponto; ao criar T1, o gráfico passa a mostrar a linha T0 → T1.

---

## Passo 3 — Alterar o diagnóstico e registrar o marco T1

1. Na própria página da Radiografia, clique em **"Preencher / editar diagnóstico"** (ou volte pela listagem e clique em **"Editar"** no mesmo município).
2. No wizard, **altere algo que mude a nota geral**, por exemplo:
   - Avance até uma etapa de eixos e **aumente ou diminua** algumas notas (ex.: de 3 para 5 ou 7),  
   **ou**
   - Preencha mais eixos com notas.
3. Aguarde o **autosave** ("Autosave: salvo").
4. Volte à **Radiografia** do município (botão **"Radiografia"** na tabela ou link **"Ver diagnóstico"** e depois use o menu/breadcrumb, ou acesse de novo `http://localhost:3000/diagnostico/municipio/[IBGE_ID]`).
5. Clique de novo em **"Registrar marco (T0/T1/T2)"**.
   - Isso grava o estado **atual** como a versão **T1** (segundo marco).
6. Agora você deve ver:
   - **Dois** botões na seção "Relatórios por versão": **T0** e **T1**.
   - O **gráfico de linha** na Radiografia com dois pontos (T0 e T1) e a evolução da nota geral.
   - Clicando em **T0** ou **T1**, o relatório completo daquela versão aparece abaixo.

---

## Resumo rápido

| Etapa | Ação |
|-------|------|
| 1 | Listagem → escolher município → **Criar** (ou Editar). |
| 2 | Preencher wizard (nome, etapas, **notas** em pelo menos um eixo) e deixar salvar (autosave). |
| 3 | Ir à **Radiografia** do município → **Registrar marco (T0/T1/T2)** → cria **T0**. |
| 4 | **Preencher / editar diagnóstico** de novo → alterar notas (ou mais eixos) → salvar. |
| 5 | Voltar à **Radiografia** → **Registrar marco (T0/T1/T2)** de novo → cria **T1**. |
| 6 | Gráfico com dois pontos (T0 e T1) e relatórios completos ao clicar em cada versão. |

---

## Códigos IBGE (exemplos – Pernambuco)

- **Abreu e Lima:** `2600054`
- **Aliança:** `2600706`
- **Recife:** `2611606`

URL direta da Radiografia (ex.: Aliança):  
`http://localhost:3000/diagnostico/municipio/2600706`
