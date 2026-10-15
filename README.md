# Dash IDH

A site with the IDH and the IDHM of Brazil: the 27 states from 1991 to 2024, and Brazil's evolution in the global HDI from 1990 to 2023, compared with regional averages, the BRICS and some countries. The copy on the site is in Portuguese; the code is in English.

The specification and the implementation plan are kept in a private support repository, outside this one.

## Running it

Requirements: Node 22.17 or newer, and Python 3.

```sh
npm install
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt   # only to generate the data
npm run data       # reads data/raw and writes data/ready (with checks.txt)
npm run dev        # local site
npm run build      # writes build/ (refuses to continue if checks.txt has a FAIL line)
npm run test       # unit and end-to-end tests
```

## Data

`data/ready/` is what the site publishes, and it is tracked in git. The sources and licenses are in `data/ready/sources.json`.

`data/raw/` is not tracked in git (see `.gitignore`). To generate `data/ready/` again, put these official files there, unedited:

- `atlas_data.xlsx`: Atlas do Desenvolvimento Humano no Brasil (UNDP, Ipea and FJP), state IDHM
- `HDR25_Composite_indices_complete_time_series.csv`: Human Development Report 2025 (UNDP), composite series
- `UNSD — Methodology.csv`: UN M49 classification
- `BR_UF_2024.zip`: territorial map of the states, 2024 (IBGE)

The source URLs are in `data/ready/sources.json`.
