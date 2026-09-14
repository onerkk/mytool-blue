"""Development-only independent numeric fixtures: pyswisseph 2.10.3.2.
Run from project root. Explicit Moshier, no downloaded ephemeris or Swiss code
distributed in the runtime. UTC Julian days; tropical apparent positions.
"""
import json
from pathlib import Path
import swisseph as swe

assert swe.version == '2.10.03'
keys = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto']
bodies = [swe.SUN,swe.MOON,swe.MERCURY,swe.VENUS,swe.MARS,swe.JUPITER,swe.SATURN,swe.URANUS,swe.NEPTUNE,swe.PLUTO]
locations = [(25.03,121.56), (51.5074,-.1278),(-33.8688,151.2093),(40.7128,-74.006),(28.61,77.21),(65,25),(-65,-70),(70,20),(-75,150)]
dates = [(y,m,17,13.37) for y in range(1900,2101,5) for m in [2,5,8,11]]
dates += [(1983,8,25,6+55/60),(2000,1,1,12),(2026,9,14,4)]
cases=[]
for i,(y,m,d,h) in enumerate(dates):
    jd=swe.julday(y,m,d,h); lat,lon=locations[i%len(locations)]
    case={'jd':jd,'latitude':lat,'longitude':lon,'planets':{},'houses':{}}
    for key,body in zip(keys,bodies):
        result,flags=swe.calc_ut(jd,body,swe.FLG_MOSEPH|swe.FLG_SPEED)
        assert flags&swe.FLG_MOSEPH
        case['planets'][key]=list(result[:2])+[result[3]]
    case['node']=swe.calc_ut(jd,swe.MEAN_NODE,swe.FLG_MOSEPH|swe.FLG_SPEED)[0][0]
    for method in ['P','W','E','O']:
        try:
            cusps,angles=swe.houses_ex(jd,lat,lon,method.encode())
            case['houses'][method]={'cusps':list(cusps),'asc':angles[0],'mc':angles[1]}
        except swe.Error:
            case['houses'][method]={'error':'undefined at polar latitude'}
    cases.append(case)
timing=[]
for y,m,d,h in [(1983,8,25,6+55/60),(1955,2,24,15.5),(2000,1,1,12),(1970,12,31,23.5),(2004,2,29,0.5)]:
    birth=swe.julday(y,m,d,h); reference=swe.julday(2026,9,14,4)
    target=swe.calc_ut(birth,swe.SUN,swe.FLG_MOSEPH)[0][0]
    lo=swe.julday(2026,m,min(d,28) if m==2 else d,0)-4;hi=lo+9
    def error(jd): return (swe.calc_ut(jd,swe.SUN,swe.FLG_MOSEPH)[0][0]-target+180)%360-180
    assert error(lo)<0 and error(hi)>0
    for _ in range(44):
        mid=(lo+hi)/2
        if error(mid)>0: hi=mid
        else: lo=mid
    prog=birth+(reference-birth)/365.24219
    timing.append({'birthJD':birth,'referenceJD':reference,'returnJD':(lo+hi)/2,'progressJD':prog,'progressed':{key:swe.calc_ut(prog,body,swe.FLG_MOSEPH)[0][0] for key,body in zip(keys,bodies)}})
Path('tests/fixtures/western-swiss-20260914.json').write_text(json.dumps({'source':'Swiss Ephemeris 2.10.03 / Moshier','cases':cases,'timing':timing},ensure_ascii=False,indent=2)+'\n')
print('Generated',len(cases),'independent Western references')
