"""Fresh independent Swiss/Moshier reference; QA only, never part of web runtime."""
import argparse, datetime as dt, json
import swisseph as swe

p=argparse.ArgumentParser();p.add_argument('input');p.add_argument('output');args=p.parse_args()
with open(args.input,encoding='utf8') as f:data=json.load(f)
planets={name:getattr(swe,name.upper()) for name in ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto']}
planets.update(Rahu=swe.MEAN_NODE,Ketu=swe.MEAN_NODE)
def jd(s):return dt.datetime.fromisoformat(s.replace('Z','+00:00')).timestamp()/86400+2440587.5
def calc(key,date,flags):return (swe.calc_ut(jd(date),planets[key],flags)[0][0]+(180 if key=='Ketu' else 0))%360
cases=[]
for row in data['cases']:
    out={'utc':row['utc'],'tropical':{k:calc(k,row['utc'],swe.FLG_MOSEPH) for k in row['tropical']},'sidereal':{}}
    for mode,values in row['sidereal'].items():
        swe.set_sid_mode(swe.SIDM_LAHIRI if mode=='lahiri' else swe.SIDM_RAMAN)
        out['sidereal'][mode]={k:calc(k,row['utc'],swe.FLG_MOSEPH|swe.FLG_SIDEREAL) for k in values}
    cases.append(out)
houses=[]
for row in data['houses']:
    cusps,_=swe.houses_ex(jd(row['utc']),row['latitude'],row['longitude'],row['system'].encode('ascii'),0)
    houses.append({**{k:v for k,v in row.items() if k!='cusps'},'cusps':list(cusps)})
result={'source':'Swiss Ephemeris, independently recalculated with Moshier','swissVersion':swe.version,'wrapperVersion':swe.__version__,'toleranceDegrees':1/60,'caseScope':'15 dates 1900–2100; two sidereal profiles; five houses, four latitudes, three dates. Event predictions are not validated.','cases':cases,'houses':houses}
with open(args.output,'w',encoding='utf8') as f:json.dump(result,f,ensure_ascii=False,indent=2)
