# Dash IDH

Site com o IDH e o IDHM do Brasil: os 27 estados de 1991 a 2024 e a evolução do Brasil no IDH global de 1990 a 2023, comparada com médias regionais, o BRICS e alguns países.

A especificação está em [PLANO.md](PLANO.md). O plano de implementação está em `IMPLEMENTACAO.md`.

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

Os arquivos em `dados/brutos/` são oficiais e não são editados. Fontes e licenças estão em [PLANO.md](PLANO.md) e em `dados/prontos/fontes.json`.
