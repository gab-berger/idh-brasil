# IDH Brasil

Site com o IDH e o IDHM do Brasil: os 27 estados de 1991 a 2024 e a evolução do Brasil no IDH global de 1990 a 2023, comparada com as médias dos continentes, o BRICS e alguns países. O texto do site está em português; o código, em inglês.

Endereço: https://gab-berger.github.io/idh-brasil/

A especificação e o plano de implementação ficam em um repositório privado de apoio, fora deste.

## Publicação

O site é publicado no GitHub Pages pelo workflow `.github/workflows/deploy.yml`. A cada push no `main`, ele roda a checagem de tipos e os testes, gera o site com `BASE_PATH=/idh-brasil` (o nome do repositório) e publica. Em pull requests, só roda os testes.

## Como rodar

Requisitos: Node 22.17 ou mais novo, e Python 3.

```sh
npm install
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt   # só para gerar os dados
npm run data       # lê data/raw e escreve data/ready (com checks.txt)
npm run dev        # site local
npm run build      # gera build/ (recusa continuar se o checks.txt tiver uma linha FAIL)
npm run test       # testes unitários e de ponta a ponta
```

## Dados

`data/ready/` é o que o site publica, e está no git. As fontes e as licenças estão em `data/ready/sources.json`.

`data/raw/` não entra no git (veja `.gitignore`). Para gerar `data/ready/` de novo, coloque lá estes arquivos oficiais, sem alterações:

- `atlas_data.xlsx`: Atlas do Desenvolvimento Humano no Brasil (PNUD, Ipea e FJP), IDHM dos estados
- `HDR25_Composite_indices_complete_time_series.csv`: Relatório de Desenvolvimento Humano 2025 (PNUD), série composta
- `UNSD — Methodology.csv`: classificação M49 da ONU
- `BR_UF_2024.zip`: malha territorial dos estados, 2024 (IBGE)

As URLs das fontes estão em `data/ready/sources.json`.
