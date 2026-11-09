import json,swisseph as swe,datetime as dt,math
D=json.load(open('/tmp/wv.json'))
F=swe.FLG_MOSEPH|swe.FLG_SPEED
ids={'Sun':swe.SUN,'Moon':swe.MOON,'Mercury':swe.MERCURY,'Venus':swe.VENUS,'Mars':swe.MARS,'Jupiter':swe.JUPITER,'Saturn':swe.SATURN,'Uranus':swe.URANUS,'Neptune':swe.NEPTUNE,'Pluto':swe.PLUTO}
dd=lambda a,b:abs((a-b+180)%360-180)
mx={};cnt={};bad={}
def rec(k,v,info=None,tol=None):
    mx[k]=max(mx.get(k,0),v);cnt[k]=cnt.get(k,0)+1
    if tol is not None and v>tol: bad.setdefault(k,[]).append(info)
order=['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];yrs=[7,20,6,10,7,18,16,19,17]
swe.set_sid_mode(swe.SIDM_LAHIRI)
n=0
for r in D:
    t=dt.datetime.fromisoformat(r['utc'].replace('Z','+00:00'));jd=swe.julday(t.year,t.month,t.day,t.hour+t.minute/60)
    if 'w' in r:
        n+=1
        for k,i in ids.items():
            x=swe.calc_ut(jd,i,F)[0]; p=r['w']['planets'][k]
            rec('W '+k,dd(p[0],x[0])*3600,(r['utc'],k),30 if k=='Pluto' else 5)
            if (x[3]<0)!=bool(p[1]) and abs(x[3])>0.002: rec('W retro '+k,1,(r['utc'],k),0)
        if 'NorthNode' in r['w']['planets']:
            nn=r['w']['planets']['NorthNode'][0]
            rec('W node vs mean',dd(nn,swe.calc_ut(jd,swe.MEAN_NODE,F)[0][0])*3600); rec('W node vs true',dd(nn,swe.calc_ut(jd,swe.TRUE_NODE,F)[0][0])*3600)
        cusps,ascmc=swe.houses(jd,r['lat'],r['lon'],b'P'); h=r['w']['houses']
        if h.get('cusps'):
            for i in range(12): rec('W cusp',dd(h['cusps'][i],cusps[i])*3600,(r['utc'],r['lat'],r['lon'],i+1),20)
            # house of each planet
            for k,i in ids.items():
                lon=swe.calc_ut(jd,i,F)[0][0]
                hs=[j+1 for j in range(12) if (lon-cusps[j])%360<(cusps[(j+1)%12]-cusps[j])%360][0]
                if hs!=r['w']['planets'][k][2]:
                    near=min(dd(lon,c) for c in cusps)
                    if near>0.01: rec('W house mismatch',1,(r['utc'],k,hs,r['w']['planets'][k][2]),0)
        a=h.get('angles') or {}
        for nm,ref in (('asc',ascmc[0]),('mc',ascmc[1])):
            v=a.get(nm) or a.get(nm.upper()) or a.get('ascendant' if nm=='asc' else 'midheaven')
            if isinstance(v,dict): v=v.get('longitude')
            if v is not None: rec('W '+nm,dd(v,ref)*3600,(r['utc'],r['lat'],r['lon']),20)
            else: rec('W %s missing key %s'%(nm,list(a.keys())[:6]),0)
    if 'v' in r:
        v=r['v'];aya=swe.get_ayanamsa_ut(jd)
        if v.get('aya') is not None: rec('V ayanamsa',abs(v['aya']-aya)*3600,(r['utc'],),5)
        FS=F|swe.FLG_SIDEREAL
        for k in ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn']:
            x=swe.calc_ut(jd,ids[k],FS)[0][0]; rec('V '+k,dd(v['planets'][k]['longitude'],x)*3600,(r['utc'],k),8)
        ra=v['planets']['Rahu']['longitude']
        rec('V rahu vs mean',dd(ra,swe.calc_ut(jd,swe.MEAN_NODE,FS)[0][0])*3600); rec('V rahu vs true',dd(ra,swe.calc_ut(jd,swe.TRUE_NODE,FS)[0][0])*3600)
        rec('V ketu opp',dd(v['planets']['Ketu']['longitude'],(ra+180)%360)*3600,(r['utc'],),1)
        asc=swe.houses_ex(jd,r['lat'],r['lon'],b'W',swe.FLG_SIDEREAL)[1][0]
        rec('V lagna',dd(v['lagna']['longitude'],asc)*3600,(r['utc'],r['lat'],r['lon']),25)
        mo=swe.calc_ut(jd,swe.MOON,FS)[0][0]; ni=int(mo//(360/27)); frac=(mo%(360/27))/(360/27)
        mn=v['planets']['Moon']['nakshatra']
        if abs(frac-0.5)<0.499 and mn['index']!=ni: rec('V moon nakshatra',1,(r['utc'],mn['index'],ni),0)
        # dasha
n2=0
for r in D:
    pass
print('western charts',n,'total',len(D), 'errs',sum(1 for r in D if 'werr' in r),sum(1 for r in D if 'verr' in r), [r.get('werr') or r.get('verr') for r in D if 'werr' in r or 'verr' in r][:3])
for k in sorted(mx): print('%-28s n=%5d max=%.2f'%(k,cnt[k],mx[k]), ('BAD %d e.g. %s'%(len(bad[k]),bad[k][:2])) if k in bad else '')
