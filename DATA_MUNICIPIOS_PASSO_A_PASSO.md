# Rotina de Download de Municípios (Por Região)

Objetivo: baixar arquivos JSON de municípios por UF em ordem controlada (Paraíba → Nordeste → Norte → Centro-Oeste → Sul → Sudeste), com fallback de fontes oficiais, para rodar fora do Codex e economizar créditos.

## 1) Pré-requisitos

- Node.js 18+
- Python 3 (para fallback da malha IBGE)
- `dbfread` instalado:

```bash
python3 -m pip install dbfread
```

## 2) Script de download

O script está em:

```bash
scripts/baixar-municipios-por-regiao.js
```

Ele tenta, para cada UF, na ordem:

1. IBGE Malha 2023 (geoftp, ZIP + DBF)
2. Receita Federal CSV
3. IBGE API (Localidades)

## 3) Executar

```bash
node scripts/baixar-municipios-por-regiao.js
```

## 4) Saída gerada

Arquivos JSON por UF em:

```
data/municipios/municipios_<UF>.json
```

Estrutura:

```json
{
  "uf": "PE",
  "fonte": "IBGE API",
  "total": 185,
  "municipios": [
    { "ibgeId": "2600054", "nome": "Abreu e Lima", "uf": "PE", "fonte": "IBGE API" }
  ]
}
```

## 5) Observações

- Se uma fonte falhar, o script tenta a próxima.
- Se todas falharem para uma UF, a UF é registrada no log.
- Você pode rodar novamente a qualquer momento.

## 6) Próximos passos (importação)

Após gerar os arquivos JSON, podemos criar um script para:
- importar tudo no banco,
- comparar e atualizar municípios existentes,
- registrar a fonte e data de coleta.
