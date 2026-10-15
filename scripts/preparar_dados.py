"""Converte as bases oficiais em JSON para o Dash IDH e gera o relatório de checagem.
Uso: npm run dados   (ou .venv/bin/python scripts/preparar_dados.py, a partir da raiz do repositório)
Precisa do mapshaper instalado (npm install)."""
import json, subprocess, tempfile, zipfile
from pathlib import Path
import pandas as pd
from babel import Locale

RAIZ = Path(__file__).resolve().parent.parent
BRUTOS = RAIZ / 'dados' / 'brutos'
SAIDA = RAIZ / 'dados' / 'prontos'; SAIDA.mkdir(exist_ok=True)
DATA_ACESSO = '2026-10-14'  # data da consulta às fontes; só mudar ao baixar tudo de novo (o relatório precisa ser reproduzível)
log = []
def checa(ok, msg):
    log.append(('OK  ' if ok else 'FALHA ') + msg)
    return ok
def grava_json(nome, dados, **kw):
    with open(SAIDA / nome, 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, **kw)

UFS = {'Acre':'AC','Alagoas':'AL','Amapá':'AP','Amazonas':'AM','Bahia':'BA','Ceará':'CE','Distrito Federal':'DF',
 'Espírito Santo':'ES','Goiás':'GO','Maranhão':'MA','Mato Grosso do Sul':'MS','Mato Grosso':'MT','Minas Gerais':'MG',
 'Paraíba':'PB','Paraná':'PR','Pará':'PA','Pernambuco':'PE','Piauí':'PI','Rio de Janeiro':'RJ','Rio Grande do Norte':'RN',
 'Rio Grande do Sul':'RS','Rondônia':'RO','Roraima':'RR','Santa Catarina':'SC','São Paulo':'SP','Sergipe':'SE','Tocantins':'TO',
 'Brasil':'BR'}

# ---------- 1. IDHM por UF (Atlas) ----------
w = pd.read_excel(BRUTOS / 'atlas_data.xlsx')
w = w.loc[:, ~w.columns.astype(str).str.startswith('Unnamed')]
w = w[w['Territorialidades'].isin(UFS)]
lg = w.melt(id_vars='Territorialidades', var_name='col', value_name='v')
lg[['ind', 'ano']] = lg['col'].str.extract(r'^(IDHM(?: \w+)?) (\d{4})$')
lg['ano'] = lg['ano'].astype(int); lg['v'] = pd.to_numeric(lg['v'])
t = lg.pivot_table(index=['Territorialidades', 'ano'], columns='ind', values='v').reset_index()
t.columns = ['nome', 'ano', 'idhm', 'educacao', 'longevidade', 'renda']
t['uf'] = t['nome'].map(UFS)
t['fonte'] = t['ano'].map(lambda a: 'Censo' if a <= 2010 else 'PNAD Contínua')
anos_esp = [1991, 2000, 2010] + list(range(2012, 2025))
checa(t['uf'].nunique() == 28, f"Atlas: 27 UFs + Brasil ({t['uf'].nunique()} territórios)")
checa(sorted(t['ano'].unique()) == anos_esp, f"Atlas: anos 1991, 2000, 2010 e 2012-2024 ({t['ano'].nunique()} anos)")
checa(len(t) == 28 * len(anos_esp), f"Atlas: uma linha por território e ano ({len(t)} linhas)")
cols = ['idhm', 'educacao', 'longevidade', 'renda']
checa(t[cols].notna().all().all(), "Atlas: nenhum valor faltando")
checa(t[cols].ge(0).all().all() and t[cols].le(1).all().all(), "Atlas: todos os valores entre 0 e 1")
dif = ((t.educacao * t.longevidade * t.renda) ** (1/3) - t.idhm).abs().max()
checa(dif <= 0.001, f"Atlas: IDHM = média geométrica dos subíndices (diferença máx. {dif:.4f}, arredondamento)")
ref = {('BR', 2012): .744, ('BR', 2024): .805, ('PR', 1991): .507, ('PR', 2010): .749, ('DF', 2024): .866,
       ('SP', 2024): .838, ('MA', 2024): .745, ('PA', 2024): .758, ('PB', 2024): .760}
for (uf, a), esperado in ref.items():
    real = t[(t.uf == uf) & (t.ano == a)].idhm.item()
    checa(abs(real - esperado) < 0.0005, f"Atlas: {uf} {a} = {real:.3f} (pesquisas: {esperado:.3f})")
n800 = int((t[(t.ano == 2024) & (t.uf != 'BR')].idhm >= 0.8).sum())
checa(n800 == 10, f"Atlas: {n800} UFs em 'muito alto' em 2024 (pesquisas: 10)")
t = t.sort_values(['uf', 'ano'])
reg_uf = [{k: (round(float(r[k]), 3) if k in cols else r[k]) for k in ['uf', 'nome', 'ano', 'fonte'] + cols}
          for r in t.to_dict('records')]
for r in reg_uf: r['ano'] = int(r['ano'])
grava_json('idhm_uf.json', reg_uf, separators=(',', ':'))

# ---------- 1b. Médias das regiões (simples) ----------
# Como as médias dos continentes (bloco 4): cada estado pesa igual. Calculadas com os valores publicados
# em idhm_uf.json (3 casas), para que qualquer um refaça a conta a partir do arquivo.
REGIOES = {'N': ('Norte', ['AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO']),
           'NE': ('Nordeste', ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE']),
           'SE': ('Sudeste', ['ES', 'MG', 'RJ', 'SP']),
           'S': ('Sul', ['PR', 'RS', 'SC']),
           'CO': ('Centro-Oeste', ['DF', 'GO', 'MS', 'MT'])}
REGIAO_DA_UF = {u: sigla for sigla, (_, ufs) in REGIOES.items() for u in ufs}
checa(sorted(REGIAO_DA_UF) == sorted(set(UFS.values()) - {'BR'}) and len(REGIAO_DA_UF) == 27,
      f"Regiões: as 5 regiões cobrem as 27 UFs, cada uma uma vez ({len(REGIAO_DA_UF)} UFs)")
pub = pd.DataFrame(reg_uf)
reg_regioes, fora = [], 0
for sigla, (nome, ufs) in REGIOES.items():
    for a in anos_esp:
        sub = pub[(pub.ano == a) & pub.uf.isin(ufs)]
        d = {'regiao': sigla, 'nome': nome, 'ano': a}
        for c in cols:
            d[c] = round(float(sub[c].mean()), 3)
            fora += not (sub[c].min() <= d[c] <= sub[c].max())
        d['n_estados'] = int(len(sub))
        reg_regioes.append(d)
grava_json('regioes.json', reg_regioes, separators=(',', ':'))
checa(len(reg_regioes) == 5 * len(anos_esp) and all(r['n_estados'] == len(REGIOES[r['regiao']][1]) for r in reg_regioes),
      f"Regiões: todas as UFs da região entram em todos os anos ({len(reg_regioes)} linhas)")
checa(fora == 0, f"Regiões: cada média fica entre o menor e o maior estado da região ({fora} fora)")
for sigla, (nome, _) in REGIOES.items():
    ini, fim = [r['idhm'] for r in reg_regioes if r['regiao'] == sigla and r['ano'] in (1991, 2024)]
    log.append(f"     média {nome}: IDHM 1991 = {ini:.3f}, 2024 = {fim:.3f}")

# ---------- 2. IDH dos países (HDR 2025) ----------
h = pd.read_csv(BRUTOS / 'HDR25_Composite_indices_complete_time_series.csv', encoding='latin-1')
paises = h[h.iso3.str.fullmatch(r'[A-Z]{3}')].copy()
checa(len(paises) == 195, f"HDR: {len(paises)} países")
ANOS = range(1990, 2024)
# Países com série no gráfico de comparação; para incluir outro, acrescente o código ISO3 aqui e rode de novo.
COMPARAR = ['BRA', 'RUS', 'IND', 'CHN', 'ZAF', 'USA', 'ARG']
ind = {'hdi': 'idh', 'le': 'esperanca_vida', 'eys': 'anos_esperados', 'mys': 'media_anos_estudo', 'gnipc': 'renda_pc'}
reg_p = []
for _, r in paises[paises.iso3.isin(COMPARAR)].iterrows():
    for a in ANOS:
        if pd.isna(r[f'hdi_{a}']): continue
        d = {'iso3': r.iso3, 'ano': a}
        for k, nk in ind.items():
            v = r.get(f'{k}_{a}')
            d[nk] = None if pd.isna(v) else round(float(v), 0 if k == 'gnipc' else 3)
        reg_p.append(d)
grava_json('idh_paises.json', reg_p, separators=(',', ':'))
br = paises[paises.iso3 == 'BRA'].iloc[0]
checa(br.hdi_2023 == 0.786 and br.hdi_rank_2023 == 84, f"HDR: Brasil 2023 = {br.hdi_2023}, posição {int(br.hdi_rank_2023)} (pesquisas: 0,786 e 84º)")
for c in ['BRA', 'RUS', 'IND', 'CHN', 'ZAF', 'USA', 'ARG']:
    n = int(paises[paises.iso3 == c][[f'hdi_{a}' for a in ANOS]].isna().sum(axis=1).item())
    checa(n == 0, f"HDR: {c} com série completa 1990-2023 ({n} anos faltando)")

# ---------- 3. Regiões, nomes e grupos ----------
m = pd.read_csv(BRUTOS / 'UNSD — Methodology.csv', sep=';', dtype=str, encoding='utf-8-sig', keep_default_na=False, na_values=[''])  # 'NA' = Namíbia
m = m.rename(columns={'ISO-alpha3 Code': 'iso3', 'ISO-alpha2 Code': 'iso2', 'Region Name': 'reg', 'Sub-region Name': 'sub'})
p = paises[['iso3', 'country', 'hdi_rank_2023']].merge(m[['iso3', 'iso2', 'reg', 'sub']], on='iso3', how='left')
checa(p.reg.notna().all(), f"M49: região encontrada para {p.reg.notna().sum()} de {len(p)} países")
REG = {'Africa': 'africa', 'Asia': 'asia', 'Europe': 'europa', 'Oceania': 'oceania'}
def regiao(r):
    if r['sub'] == 'Latin America and the Caribbean': return 'america_latina_caribe'
    if r['sub'] == 'Northern America': return 'america_norte'
    return REG.get(r['reg'])
p['regiao'] = p.apply(regiao, axis=1)
terr = Locale('pt', 'BR').territories
p['nome_pt'] = p.apply(lambda r: terr.get(r.iso2, r.country) if isinstance(r.iso2, str) else r.country, axis=1)
AJUSTES = {'COD': 'República Democrática do Congo', 'COG': 'República do Congo', 'HKG': 'Hong Kong', 'MMR': 'Mianmar', 'MDA': 'Moldávia', 'BHR': 'Bahrein'}
p['nome_pt'] = p.apply(lambda r: AJUSTES.get(r.iso3, r.nome_pt), axis=1)
sem_pt = p[~p.iso2.isin(list(terr))].iso3.tolist()
checa(len(sem_pt) <= 5, f"Nomes em português: {len(p) - len(sem_pt)} de {len(p)} (sem tradução: {', '.join(sem_pt) or 'nenhum'})")
hdi = paises.set_index('iso3')
p['serie_desde_1990'] = p.iso3.map(lambda c: bool(hdi.loc[c, [f'hdi_{a}' for a in range(1990, 2024)]].notna().all()))
p['serie_desde_2000'] = p.iso3.map(lambda c: bool(hdi.loc[c, [f'hdi_{a}' for a in range(2000, 2024)]].notna().all()))
BRICS = ['BRA', 'RUS', 'IND', 'CHN', 'ZAF']
p['brics_original'] = p.iso3.isin(BRICS)
p['posicao_2023'] = pd.Series([None if pd.isna(v) else int(v) for v in p.hdi_rank_2023], dtype=object)
p['idh_2023'] = pd.Series([None if pd.isna(v) else round(float(v), 3) for v in p.iso3.map(hdi['hdi_2023'])], dtype=object)
out = p[['iso3', 'nome_pt', 'regiao', 'brics_original', 'serie_desde_1990', 'serie_desde_2000', 'posicao_2023', 'idh_2023']]
grava_json('paises.json', out.to_dict('records'), separators=(',', ':'))

# ---------- 4. Médias (simples) ----------
medias = []
def media(grupo, isos, inicio):
    for a in range(inicio, 2024):
        vals = hdi.loc[isos, f'hdi_{a}']
        medias.append({'grupo': grupo, 'ano': a, 'idh': round(float(vals.mean()), 3), 'n_paises': int(vals.notna().sum())})
painel = p[p.serie_desde_2000]
media('mundo', painel.iso3.tolist(), 2000)
for g in ['africa', 'america_latina_caribe', 'asia', 'europa', 'oceania']:
    media(g, painel[painel.regiao == g].iso3.tolist(), 2000)
media('brics', BRICS, 1990)
grava_json('medias.json', medias, separators=(',', ':'))
checa(len(painel) == 170, f"Médias: {len(painel)} países no painel 2000-2023")
for g in ['mundo', 'africa', 'america_latina_caribe', 'asia', 'europa', 'oceania', 'brics']:
    r = [x for x in medias if x['grupo'] == g and x['ano'] == 2023][0]
    log.append(f"     média {g} 2023 = {r['idh']:.3f} ({r['n_paises']} países)")

# ---------- 4b. Ranking de todos os países em cada ano ----------
# A posição de cada ano sai do IDH bruto daquele ano, entre os países com dado (empatados dividem a posição: 1224).
ANOS_RANK = list(range(1990, 2024))
def posicoes_do_ano(a):
    valores = sorted(((r[f'hdi_{a}'], r.iso3) for _, r in paises.iterrows() if pd.notna(r[f'hdi_{a}'])), reverse=True)
    pos, res = 0, {}
    for i, (v, iso) in enumerate(valores):
        if i == 0 or v < valores[i - 1][0]: pos = i + 1
        res[iso] = pos
    return res
pos_por_ano = {a: posicoes_do_ano(a) for a in ANOS_RANK}
nome_de = dict(zip(p.iso3, p.nome_pt))
ranking_paises = []
for _, r in paises.iterrows():
    idh = [None if pd.isna(r[f'hdi_{a}']) else round(float(r[f'hdi_{a}']), 3) for a in ANOS_RANK]
    if all(v is None for v in idh): continue
    ranking_paises.append({'iso3': r.iso3, 'nome': nome_de[r.iso3], 'idh': idh,
                           'posicao': [pos_por_ano[a].get(r.iso3) for a in ANOS_RANK]})
grava_json('ranking_anos.json', {'anos': ANOS_RANK, 'paises': ranking_paises}, separators=(',', ':'))
oficial = {r.iso3: int(r.hdi_rank_2023) for _, r in paises.iterrows() if pd.notna(r.hdi_rank_2023)}
calc = pos_por_ano[2023]
divergentes = [iso for iso, pos in oficial.items() if calc.get(iso) != pos]
checa(set(calc) == set(oficial) and not divergentes,
      f"Ranking 2023 recalculado = posições oficiais do HDR ({len(oficial)} países; divergentes: {divergentes or 'nenhum'})")
checa(len(oficial) == 193, f"HDR: {len(oficial)} países com posição em 2023 (esperados 193)")
log.append(f"     ranking por ano: {len(pos_por_ano[1990])} países em 1990, {len(calc)} em 2023")

# ---------- 5. Fontes ----------
fontes = [
 {'id': 'atlas', 'nome': 'Atlas do Desenvolvimento Humano no Brasil (PNUD, Ipea e FJP)', 'edicao': 'Censos 1991, 2000 e 2010; PNAD Contínua de 2012 a 2024, na série revisada do Radar IDHM (maio de 2026)',
  'url': 'https://www.atlasbrasil.org.br/', 'licenca': 'uso confirmado em 14/10/2026; citar o Atlas', 'data_acesso': DATA_ACESSO},
 {'id': 'hdr', 'nome': 'Human Development Report 2025 (PNUD)', 'edicao': 'Série composta 1990-2023',
  'url': 'https://hdr.undp.org/data-center/documentation-and-downloads', 'licenca': 'CC BY 3.0 IGO', 'data_acesso': DATA_ACESSO},
 {'id': 'm49', 'nome': 'Classificação M49 (Divisão de Estatística da ONU)', 'edicao': 'versão baixada em ' + DATA_ACESSO,
  'url': 'https://unstats.un.org/unsd/methodology/m49/overview/', 'licenca': 'sem restrição; citar a UNSD', 'data_acesso': DATA_ACESSO},
 {'id': 'ibge', 'nome': 'Malha territorial das UFs (IBGE)', 'edicao': '2024, simplificada',
  'url': 'https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/malhas_municipais/municipio_2024/Brasil/', 'licenca': 'arquivo público; citar o IBGE', 'data_acesso': DATA_ACESSO},
]
grava_json('fontes.json', fontes, indent=1)

# ---------- 6. Malha do mapa: IBGE -> TopoJSON (mapshaper) ----------
MAPSHAPER = RAIZ / 'node_modules' / '.bin' / 'mapshaper'
if not MAPSHAPER.exists():
    raise SystemExit('mapshaper não encontrado: rode `npm install` antes de `npm run dados`.')
with tempfile.TemporaryDirectory() as tmp:
    with zipfile.ZipFile(BRUTOS / 'BR_UF_2024.zip') as z:
        z.extractall(tmp)
    subprocess.run([str(MAPSHAPER), '-i', f'{tmp}/BR_UF_2024.shp', 'encoding=utf8',
                    '-filter-islands', 'min-area=20km2', '-simplify', '1.5%', 'keep-shapes',
                    '-rename-fields', 'cod=CD_UF,uf=SIGLA_UF,nome=NM_UF', '-filter-fields', 'cod,uf,nome',
                    '-rename-layers', 'estados', '-o', 'format=topojson', 'quantization=20000',  # 20000 reproduz a malha aprovada (115 KB)
                    str(SAIDA / 'br_uf.topojson')], check=True)
mapa = json.loads((SAIDA / 'br_uf.topojson').read_text(encoding='utf-8'))
geoms = mapa['objects']['estados']['geometries']
checa(len(geoms) == 27, f"Malha: 27 UFs ({len(geoms)} geometrias)")
checa({g['properties']['uf'] for g in geoms} == set(UFS.values()) - {'BR'}, "Malha: siglas iguais às do Atlas")
checa(all(len(g['properties']['cod']) == 2 for g in geoms), "Malha: códigos de UF com 2 dígitos")
# O 1º dígito do código IBGE da UF é a região: 1 Norte, 2 Nordeste, 3 Sudeste, 4 Sul, 5 Centro-Oeste.
DIGITO_REGIAO = {'1': 'N', '2': 'NE', '3': 'SE', '4': 'S', '5': 'CO'}
checa(all(DIGITO_REGIAO.get(g['properties']['cod'][0]) == REGIAO_DA_UF[g['properties']['uf']] for g in geoms),
      "Regiões: a região de cada UF confere com o código IBGE da malha")
tam = (SAIDA / 'br_uf.topojson').stat().st_size
checa(tam <= 150_000, f"Malha: {tam / 1000:.0f} KB (limite 150 KB)")

# ---------- 7. Relatório ----------
falhas = sum(l.startswith('FALHA') for l in log)
txt = f"Relatório de checagem — {DATA_ACESSO}\n{len(log)} linhas, {falhas} falha(s)\n\n" + '\n'.join(log) + '\n'
(SAIDA / 'checagem.txt').write_text(txt, encoding='utf-8')
print(txt)
