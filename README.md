# Dash IDH

Site com o IDH e o IDHM do Brasil: os 27 estados de 1991 a 2024 e a evolução do Brasil no IDH global de 1990 a 2023, comparada com médias regionais, o BRICS e alguns países.

A especificação e o plano de implementação ficam num repositório privado de apoio, fora deste repositório.

## Como rodar

Pré-requisitos: Node 22.17 ou mais novo e Python 3.

```sh
npm install
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt   # só para gerar os dados
npm run dados      # lê dados/brutos e gera dados/prontos (com checagem.txt)
npm run dev        # site local
npm run build      # gera build/ (recusa seguir se a checagem tiver FALHA)
npm run test       # testes de unidade e ponta a ponta
```

## Dados

`dados/prontos/` é o que o site publica, e fica no git. Fontes e licenças estão em `dados/prontos/fontes.json`.

`dados/brutos/` não fica no git (ver `.gitignore`). Para gerar `dados/prontos/` de novo, coloque lá estes arquivos oficiais, sem edição:

- `atlas_data.xlsx`: Atlas do Desenvolvimento Humano no Brasil (PNUD, Ipea e FJP), IDHM por UF
- `HDR25_Composite_indices_complete_time_series.csv`: Human Development Report 2025 (PNUD), série composta
- `UNSD — Methodology.csv`: classificação M49 da ONU
- `BR_UF_2024.zip`: malha territorial das UFs 2024 (IBGE)

As URLs de origem estão em `dados/prontos/fontes.json`.
