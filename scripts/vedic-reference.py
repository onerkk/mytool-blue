"""Development only: numeric reference data, not a runtime Swiss dependency.
Requires pyswisseph 2.10.3.2. No ephemeris files: explicitly select Moshier.
Run from project root. Runtime uses MIT Astronomy Engine and interpolated
mean ayanamsa samples; no Swiss implementation is distributed in this site.
"""
import json
from pathlib import Path
import swisseph as swe

assert swe.version == '2.10.03'
rows = []
for year in range(1899, 2103):
    for month in range(1, 13):
        jd = swe.julday(year, month, 1, 0)
        row = [jd]
        for mode in [swe.SIDM_LAHIRI, swe.SIDM_RAMAN]:
            swe.set_sid_mode(mode)
            row.append(round(swe.get_ayanamsa_ut(jd), 11))
        row.append(round(swe.deltat_ex(jd,swe.FLG_MOSEPH)*86400,9))
        rows.append(row)
data = {'source': 'Swiss Ephemeris 2.10.03 numeric mean ayanamsa samples',
        'modes': ['Lahiri (SIDM 1)', 'Raman (SIDM 3)'], 'columns':['JD UT','mean Lahiri degrees','mean Raman degrees','Delta T seconds / Moshier'], 'rows': rows}
Path('JS/vedic-ayanamsa.js').write_text(
    '/* Generated numeric data; see scripts/vedic-reference.py. */\n'
    '(function(r){r.JYVedicAyanamsa='+json.dumps(data,separators=(',',':'))+';})(typeof globalThis!=="undefined"?globalThis:this);\n')

cases = []
locations = [(23.31,120.31),(51.5074,-0.1278),(-33.8688,151.2093),
             (40.7128,-74.006),(28.6139,77.209),(65,25),(-60,-70)]
dates = [(y,m,17,13.37) for y in range(1900,2101,5) for m in [2,5,8,11]]
dates += [(1983,8,25,6+55/60),(2000,1,1,12),(2026,9,13,4.5)]
for i,(y,m,d,h) in enumerate(dates):
    jd = swe.julday(y,m,d,h)
    lat,lon = locations[i%len(locations)]
    item = {'jd':jd, 'latitude':lat, 'longitude':lon, 'tropical':{}, 'sidereal':{}}
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    item['meanAyanamsa'] = swe.get_ayanamsa_ut(jd)
    item['ayanamsa'] = swe.get_ayanamsa_ex_ut(jd,swe.FLG_MOSEPH)[1]
    for name,body in [('Sun',swe.SUN),('Moon',swe.MOON),('Mercury',swe.MERCURY),
                      ('Venus',swe.VENUS),('Mars',swe.MARS),('Jupiter',swe.JUPITER),
                      ('Saturn',swe.SATURN),('Rahu',swe.MEAN_NODE),('TrueNode',swe.TRUE_NODE)]:
        for field,extra in [('tropical',0),('sidereal',swe.FLG_SIDEREAL)]:
            xx, flags = swe.calc_ut(jd,body,swe.FLG_MOSEPH|swe.FLG_SPEED|extra)
            item[field][name] = [xx[0],xx[1],xx[3]]
    item['ascendant'] = swe.houses_ex(jd,lat,lon,b'W',swe.FLG_SIDEREAL)[1][0]
    cases.append(item)
out = {'source':'Swiss Ephemeris 2.10.03 / Moshier; geocentric, apparent, Lahiri',
       'cases':cases}
Path('tests/fixtures/vedic-swiss-20260913.json').write_text(json.dumps(out,indent=2)+'\n')
print('Generated',len(rows),'ayanamsa samples and',len(cases),'independent charts.')

extra = {'polar':[], 'raman':[]}
swe.set_sid_mode(swe.SIDM_LAHIRI)
for lat in [-89,-80,-70,70,80,89]:
    for hour in range(0,24,2):
        jd = swe.julday(2026,9,13,hour)
        extra['polar'].append({'jd':jd,'latitude':lat,'longitude':0,
            'ascendant':swe.houses_ex(jd,lat,0,b'W',swe.FLG_SIDEREAL)[1][0]})
swe.set_sid_mode(swe.SIDM_RAMAN)
for year in [1900,1950,1983,2000,2026,2100]:
    jd = swe.julday(year,8,25,6+55/60)
    extra['raman'].append({'jd':jd,'latitude':23.31,'longitude':120.31,
        'ayanamsa':swe.get_ayanamsa_ex_ut(jd,swe.FLG_MOSEPH)[1],
        'Moon':swe.calc_ut(jd,swe.MOON,swe.FLG_MOSEPH|swe.FLG_SIDEREAL)[0][0],
        'ascendant':swe.houses_ex(jd,23.31,120.31,b'W',swe.FLG_SIDEREAL)[1][0]})
Path('tests/fixtures/vedic-swiss-extra-20260913.json').write_text(json.dumps(extra,indent=2)+'\n')
