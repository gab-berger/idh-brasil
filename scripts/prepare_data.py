"""Converts the official sources into the JSON files the app reads, and writes the check report.

Usage: npm run data   (or .venv/bin/python scripts/prepare_data.py, from the repository root).
Needs mapshaper installed (npm install). Raw inputs are read from data/raw, which is never committed;
outputs are written to data/ready.
"""
import json, subprocess, tempfile, zipfile
from pathlib import Path
import pandas as pd
from babel import Locale

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / 'data' / 'raw'
READY = ROOT / 'data' / 'ready'
READY.mkdir(exist_ok=True)
# Date the sources were consulted. Change it only when everything is downloaded again: the report must be reproducible.
ACCESS_DATE = '2026-10-14'
log = []


def check(ok, message):
    log.append(('OK   ' if ok else 'FAIL ') + message)
    return ok


def write_json(name, data, **kwargs):
    with open(READY / name, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, **kwargs)


# State names as they appear in the Atlas file, with their codes.
STATES = {'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM', 'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF',
          'Espírito Santo': 'ES', 'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso do Sul': 'MS', 'Mato Grosso': 'MT', 'Minas Gerais': 'MG',
          'Paraíba': 'PB', 'Paraná': 'PR', 'Pará': 'PA', 'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
          'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC', 'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO',
          'Brasil': 'BR'}

# ---------- 1. State HDI (Atlas) ----------
# The column names below are the Atlas file's own (in Portuguese); they are input data, not code names.
atlas = pd.read_excel(RAW / 'atlas_data.xlsx')
atlas = atlas.loc[:, ~atlas.columns.astype(str).str.startswith('Unnamed')]
atlas = atlas[atlas['Territorialidades'].isin(STATES)]
long = atlas.melt(id_vars='Territorialidades', var_name='col', value_name='v')
long[['ind', 'year']] = long['col'].str.extract(r'^(IDHM(?: \w+)?) (\d{4})$')
long['year'] = long['year'].astype(int)
long['v'] = pd.to_numeric(long['v'])
t = long.pivot_table(index=['Territorialidades', 'year'], columns='ind', values='v').reset_index()
t.columns = ['name', 'year', 'idhm', 'education', 'longevity', 'income']
t['code'] = t['name'].map(STATES)
t['source'] = t['year'].map(lambda y: 'Censo' if y <= 2010 else 'PNAD Contínua')
years_expected = [1991, 2000, 2010] + list(range(2012, 2025))
cols = ['idhm', 'education', 'longevity', 'income']
check(t['code'].nunique() == 28, f"Atlas: 27 states + Brazil ({t['code'].nunique()} territories)")
check(sorted(t['year'].unique()) == years_expected, f"Atlas: years 1991, 2000, 2010 and 2012-2024 ({t['year'].nunique()} years)")
check(len(t) == 28 * len(years_expected), f"Atlas: one row per territory and year ({len(t)} rows)")
check(t[cols].notna().all().all(), "Atlas: no missing values")
check(t[cols].ge(0).all().all() and t[cols].le(1).all().all(), "Atlas: all values between 0 and 1")
diff = ((t.education * t.longevity * t.income) ** (1 / 3) - t.idhm).abs().max()
check(diff <= 0.001, f"Atlas: IDHM = geometric mean of the components (max difference {diff:.4f}, rounding)")
reference = {('BR', 2012): .744, ('BR', 2024): .805, ('PR', 1991): .507, ('PR', 2010): .749, ('DF', 2024): .866,
             ('SP', 2024): .838, ('MA', 2024): .745, ('PA', 2024): .758, ('PB', 2024): .760}
for (code, year), expected in reference.items():
    real = t[(t.code == code) & (t.year == year)].idhm.item()
    check(abs(real - expected) < 0.0005, f"Atlas: {code} {year} = {real:.3f} (published: {expected:.3f})")
n800 = int((t[(t.year == 2024) & (t.code != 'BR')].idhm >= 0.8).sum())
check(n800 == 10, f"Atlas: {n800} states in 'very high' in 2024 (published: 10)")
t = t.sort_values(['code', 'year'])
state_rows = [{k: (round(float(r[k]), 3) if k in cols else r[k]) for k in ['code', 'name', 'year', 'source'] + cols}
              for r in t.to_dict('records')]
for r in state_rows:
    r['year'] = int(r['year'])
write_json('idhm_states.json', state_rows, separators=(',', ':'))

# ---------- 1b. Regional averages (simple) ----------
# As for the continents (block 4): each state weighs the same. Computed from the published values in
# idhm_states.json (3 decimals), so anyone can redo the arithmetic from the file.
REGIONS = {'N': ('Norte', ['AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO']),
           'NE': ('Nordeste', ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE']),
           'SE': ('Sudeste', ['ES', 'MG', 'RJ', 'SP']),
           'S': ('Sul', ['PR', 'RS', 'SC']),
           'CO': ('Centro-Oeste', ['DF', 'GO', 'MS', 'MT'])}
REGION_OF_STATE = {state: region for region, (_, states) in REGIONS.items() for state in states}
check(sorted(REGION_OF_STATE) == sorted(set(STATES.values()) - {'BR'}) and len(REGION_OF_STATE) == 27,
      f"Regions: the 5 regions cover the 27 states, each once ({len(REGION_OF_STATE)} states)")
published = pd.DataFrame(state_rows)
region_rows, outside = [], 0
for region, (name, states) in REGIONS.items():
    for y in years_expected:
        sub = published[(published.year == y) & published.code.isin(states)]
        d = {'region': region, 'name': name, 'year': y}
        for c in cols:
            d[c] = round(float(sub[c].mean()), 3)
            outside += not (sub[c].min() <= d[c] <= sub[c].max())
        d['n_states'] = int(len(sub))
        region_rows.append(d)
write_json('regions.json', region_rows, separators=(',', ':'))
check(len(region_rows) == 5 * len(years_expected) and all(r['n_states'] == len(REGIONS[r['region']][1]) for r in region_rows),
      f"Regions: every state of a region is in every year ({len(region_rows)} rows)")
check(outside == 0, f"Regions: each average is between the lowest and the highest state of its region ({outside} outside)")
for region, (name, _) in REGIONS.items():
    start, end = [r['idhm'] for r in region_rows if r['region'] == region and r['year'] in (1991, 2024)]
    log.append(f"     {name} average: IDHM 1991 = {start:.3f}, 2024 = {end:.3f}")

# ---------- 2. Country HDI (HDR 2025) ----------
h = pd.read_csv(RAW / 'HDR25_Composite_indices_complete_time_series.csv', encoding='latin-1')
countries = h[h.iso3.str.fullmatch(r'[A-Z]{3}')].copy()
check(len(countries) == 195, f"HDR: {len(countries)} countries")
YEARS = range(1990, 2024)
# Countries with a series in the comparison chart. To add one, put its ISO3 code here and run again.
COMPARED = ['BRA', 'RUS', 'IND', 'CHN', 'ZAF', 'USA', 'ARG']
indicators = {'hdi': 'hdi', 'le': 'life_expectancy', 'eys': 'expected_schooling', 'mys': 'mean_schooling', 'gnipc': 'income_pc'}
country_rows = []
for _, r in countries[countries.iso3.isin(COMPARED)].iterrows():
    for y in YEARS:
        if pd.isna(r[f'hdi_{y}']):
            continue
        d = {'iso3': r.iso3, 'year': y}
        for k, key in indicators.items():
            v = r.get(f'{k}_{y}')
            d[key] = None if pd.isna(v) else round(float(v), 0 if k == 'gnipc' else 3)
        country_rows.append(d)
write_json('hdi_countries.json', country_rows, separators=(',', ':'))
br = countries[countries.iso3 == 'BRA'].iloc[0]
check(br.hdi_2023 == 0.786 and br.hdi_rank_2023 == 84,
      f"HDR: Brazil 2023 = {br.hdi_2023}, position {int(br.hdi_rank_2023)} (published: 0.786 and 84th)")
for c in COMPARED:
    n = int(countries[countries.iso3 == c][[f'hdi_{y}' for y in YEARS]].isna().sum(axis=1).item())
    check(n == 0, f"HDR: {c} with a full series 1990-2023 ({n} years missing)")

# ---------- 3. Names and groups ----------
m = pd.read_csv(RAW / 'UNSD — Methodology.csv', sep=';', dtype=str, encoding='utf-8-sig', keep_default_na=False, na_values=[''])  # 'NA' = Namibia
m = m.rename(columns={'ISO-alpha3 Code': 'iso3', 'ISO-alpha2 Code': 'iso2', 'Region Name': 'reg', 'Sub-region Name': 'sub'})
p = countries[['iso3', 'country', 'hdi_rank_2023']].merge(m[['iso3', 'iso2', 'reg', 'sub']], on='iso3', how='left')
check(p.reg.notna().all(), f"M49: region found for {p.reg.notna().sum()} of {len(p)} countries")
GROUP_OF_REGION = {'Africa': 'africa', 'Asia': 'asia', 'Europe': 'europe', 'Oceania': 'oceania'}


def world_group(row):
    if row['sub'] == 'Latin America and the Caribbean':
        return 'latin_america_caribbean'
    if row['sub'] == 'Northern America':
        return 'north_america'
    return GROUP_OF_REGION.get(row['reg'])


p['region'] = p.apply(world_group, axis=1)
terr = Locale('pt', 'BR').territories
p['name_pt'] = p.apply(lambda r: terr.get(r.iso2, r.country) if isinstance(r.iso2, str) else r.country, axis=1)
NAME_FIXES = {'COD': 'República Democrática do Congo', 'COG': 'República do Congo', 'HKG': 'Hong Kong', 'MMR': 'Mianmar', 'MDA': 'Moldávia', 'BHR': 'Bahrein'}
p['name_pt'] = p.apply(lambda r: NAME_FIXES.get(r.iso3, r.name_pt), axis=1)
no_pt = p[~p.iso2.isin(list(terr))].iso3.tolist()
check(len(no_pt) <= 5, f"Portuguese names: {len(p) - len(no_pt)} of {len(p)} (no translation: {', '.join(no_pt) or 'none'})")
hdi = countries.set_index('iso3')
p['series_from_1990'] = p.iso3.map(lambda c: bool(hdi.loc[c, [f'hdi_{y}' for y in range(1990, 2024)]].notna().all()))
p['series_from_2000'] = p.iso3.map(lambda c: bool(hdi.loc[c, [f'hdi_{y}' for y in range(2000, 2024)]].notna().all()))
BRICS = ['BRA', 'RUS', 'IND', 'CHN', 'ZAF']
p['original_brics'] = p.iso3.isin(BRICS)
p['position_2023'] = pd.Series([None if pd.isna(v) else int(v) for v in p.hdi_rank_2023], dtype=object)
p['hdi_2023'] = pd.Series([None if pd.isna(v) else round(float(v), 3) for v in p.iso3.map(hdi['hdi_2023'])], dtype=object)
out = p[['iso3', 'name_pt', 'region', 'original_brics', 'series_from_1990', 'series_from_2000', 'position_2023', 'hdi_2023']]
write_json('countries.json', out.to_dict('records'), separators=(',', ':'))

# ---------- 4. Averages (simple) ----------
averages = []


def average(group, isos, start):
    for y in range(start, 2024):
        vals = hdi.loc[isos, f'hdi_{y}']
        averages.append({'group': group, 'year': y, 'hdi': round(float(vals.mean()), 3), 'n_countries': int(vals.notna().sum())})


panel = p[p.series_from_2000]
average('world', panel.iso3.tolist(), 2000)
for g in ['africa', 'latin_america_caribbean', 'asia', 'europe', 'oceania']:
    average(g, panel[panel.region == g].iso3.tolist(), 2000)
average('brics', BRICS, 1990)
write_json('averages.json', averages, separators=(',', ':'))
check(len(panel) == 170, f"Averages: {len(panel)} countries in the 2000-2023 panel")
for g in ['world', 'africa', 'latin_america_caribbean', 'asia', 'europe', 'oceania', 'brics']:
    r = [x for x in averages if x['group'] == g and x['year'] == 2023][0]
    log.append(f"     average {g} 2023 = {r['hdi']:.3f} ({r['n_countries']} countries)")

# ---------- 4b. Ranking of every country in each year ----------
# Each year's position comes from that year's raw HDI, among the countries with data. Ties share the position (1224).
RANK_YEARS = list(range(1990, 2024))


def positions_of_year(year):
    values = sorted(((r[f'hdi_{year}'], r.iso3) for _, r in countries.iterrows() if pd.notna(r[f'hdi_{year}'])), reverse=True)
    pos, res = 0, {}
    for i, (v, iso) in enumerate(values):
        if i == 0 or v < values[i - 1][0]:
            pos = i + 1
        res[iso] = pos
    return res


positions_by_year = {y: positions_of_year(y) for y in RANK_YEARS}
name_of = dict(zip(p.iso3, p.name_pt))
ranking_countries = []
for _, r in countries.iterrows():
    hdi_values = [None if pd.isna(r[f'hdi_{y}']) else round(float(r[f'hdi_{y}']), 3) for y in RANK_YEARS]
    if all(v is None for v in hdi_values):
        continue
    ranking_countries.append({'iso3': r.iso3, 'name': name_of[r.iso3], 'hdi': hdi_values,
                              'position': [positions_by_year[y].get(r.iso3) for y in RANK_YEARS]})
write_json('ranking_years.json', {'years': RANK_YEARS, 'countries': ranking_countries}, separators=(',', ':'))
official = {r.iso3: int(r.hdi_rank_2023) for _, r in countries.iterrows() if pd.notna(r.hdi_rank_2023)}
calc = positions_by_year[2023]
diverging = [iso for iso, pos in official.items() if calc.get(iso) != pos]
check(set(calc) == set(official) and not diverging,
      f"Ranking 2023 recalculated = official HDR positions ({len(official)} countries; diverging: {diverging or 'none'})")
check(len(official) == 193, f"HDR: {len(official)} countries with a 2023 position (expected 193)")
log.append(f"     ranking by year: {len(positions_by_year[1990])} countries in 1990, {len(calc)} in 2023")

# ---------- 5. Sources ----------
# Shown to the public on the Informações page: the edition says what the site uses, the license is in plain words.
sources = [
    {'id': 'atlas', 'name': 'Atlas do Desenvolvimento Humano no Brasil (PNUD, Ipea e FJP)',
     'edition': 'IDHM dos estados e do Brasil: Censos de 1991, 2000 e 2010 e PNAD Contínua de 2012 a 2024, na série revisada do Radar IDHM (maio de 2026)',
     'url': 'https://www.atlasbrasil.org.br/', 'license': 'uso permitido, com citação da fonte', 'access_date': ACCESS_DATE},
    {'id': 'hdr', 'name': 'Relatório de Desenvolvimento Humano 2025 (PNUD)', 'edition': 'IDH global dos países, série histórica de 1990 a 2023',
     'url': 'https://hdr.undp.org/data-center/documentation-and-downloads',
     'license': 'CC BY 3.0 IGO; dados alterados: médias e posições calculadas por este site', 'access_date': ACCESS_DATE},
    {'id': 'm49', 'name': 'Classificação M49 (Divisão de Estatística da ONU)', 'edition': 'Regiões dos países, usadas nas médias dos continentes',
     'url': 'https://unstats.un.org/unsd/methodology/m49/overview/', 'license': 'sem restrição, com citação da fonte', 'access_date': ACCESS_DATE},
    {'id': 'ibge', 'name': 'Malha territorial das UFs (IBGE)', 'edition': 'Mapa dos estados de 2024, simplificado',
     'url': 'https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/malhas_municipais/municipio_2024/Brasil/',
     'license': 'arquivo público, com citação da fonte', 'access_date': ACCESS_DATE},
]
write_json('sources.json', sources, indent=1)

# ---------- 6. Map: IBGE -> TopoJSON (mapshaper) ----------
MAPSHAPER = ROOT / 'node_modules' / '.bin' / 'mapshaper'
if not MAPSHAPER.exists():
    raise SystemExit('mapshaper not found: run `npm install` before `npm run data`.')
with tempfile.TemporaryDirectory() as tmp:
    with zipfile.ZipFile(RAW / 'BR_UF_2024.zip') as z:
        z.extractall(tmp)
    subprocess.run([str(MAPSHAPER), '-i', f'{tmp}/BR_UF_2024.shp', 'encoding=utf8',
                    '-filter-islands', 'min-area=20km2', '-simplify', '1.5%', 'keep-shapes',
                    '-rename-fields', 'code=CD_UF,state=SIGLA_UF,name=NM_UF', '-filter-fields', 'code,state,name',
                    '-rename-layers', 'states', '-o', 'format=topojson', 'quantization=20000',  # 20000 reproduces the approved map (115 KB)
                    str(READY / 'br_states.topojson')], check=True)
topo = json.loads((READY / 'br_states.topojson').read_text(encoding='utf-8'))
geoms = topo['objects']['states']['geometries']
check(len(geoms) == 27, f"Map: 27 states ({len(geoms)} geometries)")
check({g['properties']['state'] for g in geoms} == set(STATES.values()) - {'BR'}, "Map: codes equal the Atlas abbreviations")
check(all(len(g['properties']['code']) == 2 for g in geoms), "Map: state IBGE codes have 2 digits")
# The first digit of the IBGE state code is the region: 1 North, 2 Northeast, 3 Southeast, 4 South, 5 Centre-West.
DIGIT_TO_REGION = {'1': 'N', '2': 'NE', '3': 'SE', '4': 'S', '5': 'CO'}
check(all(DIGIT_TO_REGION.get(g['properties']['code'][0]) == REGION_OF_STATE[g['properties']['state']] for g in geoms),
      "Regions: each state's region matches its IBGE code in the map")
size = (READY / 'br_states.topojson').stat().st_size
check(size <= 150_000, f"Map: {size / 1000:.0f} KB (limit 150 KB)")

# ---------- 7. Report ----------
failures = sum(line.startswith('FAIL') for line in log)
text = f"Data check report — {ACCESS_DATE}\n{len(log)} lines, {failures} failure(s)\n\n" + '\n'.join(log) + '\n'
(READY / 'checks.txt').write_text(text, encoding='utf-8')
print(text)
